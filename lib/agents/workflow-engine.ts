import { WorkflowConfig, WorkflowNode } from '@/types';
import { callLLM, LLMConfig } from '@/lib/llm/providers';
import { queryDocuments } from '@/lib/rag/document-processing';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export interface WorkflowExecutionContext {
  input: Record<string, any>;
  variables: Record<string, any>;
  nodeResults: Record<string, any>;
}

export async function executeWorkflow(
  workflow: WorkflowConfig,
  input: Record<string, any>,
  userId: string
): Promise<{ output: Record<string, any>; trace: Record<string, any> }> {
  const context: WorkflowExecutionContext = {
    input,
    variables: { ...input },
    nodeResults: {},
  };

  const trace: Record<string, any> = {};

  // Find start node
  const startNode = workflow.nodes.find((n) => n.type === 'start');
  if (!startNode) {
    throw new Error('Workflow must have a start node');
  }

  // Execute nodes in topological order (simplified - assumes linear workflow for MVP)
  const executed = new Set<string>();
  let currentNodeId: string | null = startNode.id;

  while (currentNodeId) {
    if (executed.has(currentNodeId)) {
      // Check for end node
      const node = workflow.nodes.find((n) => n.id === currentNodeId);
      if (node?.type === 'end') {
        break;
      }
      throw new Error(`Circular dependency detected at node ${currentNodeId}`);
    }

    executed.add(currentNodeId);
    const node = workflow.nodes.find((n) => n.id === currentNodeId);

    if (!node) {
      throw new Error(`Node ${currentNodeId} not found`);
    }

    const startTime = Date.now();
    let result: any;

    try {
      switch (node.type) {
        case 'llm': {
          const modelConfig = node.data.model as LLMConfig;
          const prompt = resolveTemplate(node.data.prompt, context.variables);

          const messages = [
            ...(node.data.systemPrompt
              ? [{ role: 'system' as const, content: resolveTemplate(node.data.systemPrompt, context.variables) }]
              : []),
            { role: 'user' as const, content: prompt },
          ];

          const llmResponse = await callLLM(modelConfig, messages);
          result = {
            content: llmResponse.content,
            tokens: llmResponse.inputTokens + llmResponse.outputTokens,
            model: llmResponse.model,
          };

          // Store result in variables
          context.variables[node.data.outputVariable || 'llm_response'] = llmResponse.content;
          break;
        }

        case 'rag': {
          const query = resolveTemplate(node.data.query, context.variables);
          const chunks = await queryDocuments(query, userId, node.data.limit || 5);

          result = {
            chunks: chunks.map((c) => c.content),
            count: chunks.length,
          };

          // Store result in variables
          context.variables[node.data.outputVariable || 'rag_results'] = chunks;
          break;
        }

        case 'api': {
          // For MVP, API nodes are placeholders
          // In production, would make actual HTTP requests
          result = {
            url: node.data.url,
            method: node.data.method || 'GET',
            status: 'placeholder',
          };
          context.variables[node.data.outputVariable || 'api_response'] = result;
          break;
        }

        case 'conditional': {
          const condition = resolveTemplate(node.data.condition, context.variables);
          // Simple evaluation (in production, use a safe evaluator)
          const conditionResult = evaluateCondition(condition, context.variables);
          result = { conditionResult };

          // Determine next node based on condition
          const nextEdge = workflow.edges.find(
            (e) => e.source === currentNodeId && e.sourceHandle === (conditionResult ? 'true' : 'false')
          );
          if (nextEdge) {
            currentNodeId = nextEdge.target;
            continue;
          }
          break;
        }

        case 'start':
        case 'end':
          result = { type: node.type };
          break;

        default:
          throw new Error(`Unknown node type: ${(node as any).type}`);
      }

      context.nodeResults[currentNodeId] = result;
      trace[currentNodeId] = {
        node: node.id,
        type: node.type,
        result,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      trace[currentNodeId] = {
        node: node.id,
        type: node.type,
        error: error.message,
        executionTime: Date.now() - startTime,
      };
      throw error;
    }

    // Find next node
    const nextEdge = workflow.edges.find((e) => e.source === currentNodeId);
    currentNodeId = nextEdge?.target || null;
  }

  // Find end node output
  const endNode = workflow.nodes.find((n) => n.type === 'end');
  let output: Record<string, any> = {};

  if (endNode?.data.outputMapping) {
    for (const [key, source] of Object.entries(endNode.data.outputMapping)) {
      output[key] = context.variables[source as string];
    }
  } else {
    // Default: return all variables
    output = context.variables;
  }

  return { output, trace };
}

function resolveTemplate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

function evaluateCondition(condition: string, variables: Record<string, any>): boolean {
  // Simple condition evaluation (replace with safe evaluator in production)
  // For MVP, support simple comparisons like "{{var}} > 5"
  try {
    const resolved = resolveTemplate(condition, variables);
    // Very basic evaluation - in production use a proper expression parser
    if (resolved.includes('>')) {
      const [left, right] = resolved.split('>').map((s) => s.trim());
      return Number(left) > Number(right);
    }
    if (resolved.includes('<')) {
      const [left, right] = resolved.split('<').map((s) => s.trim());
      return Number(left) < Number(right);
    }
    if (resolved.includes('==')) {
      const [left, right] = resolved.split('==').map((s) => s.trim());
      return String(left) === String(right);
    }
    return Boolean(resolved);
  } catch {
    return false;
  }
}

