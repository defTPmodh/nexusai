import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { executeWorkflow } from '@/lib/agents/workflow-engine';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, input } = body;

    if (!agentId || !input) {
      return NextResponse.json({ error: 'agentId and input are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.is_active) {
      return NextResponse.json({ error: 'Agent is not active' }, { status: 400 });
    }

    // Create execution record
    const { data: execution, error: execError } = await supabase
      .from('agent_executions')
      .insert({
        agent_id: agentId,
        user_id: user.id,
        input_data: input,
        status: 'running',
      })
      .select()
      .single();

    if (execError || !execution) {
      return NextResponse.json({ error: 'Failed to create execution' }, { status: 500 });
    }

    const startTime = Date.now();

    try {
      // Execute workflow
      const { output, trace } = await executeWorkflow(agent.workflow_config, input, user.id);

      const executionTime = Date.now() - startTime;

      // Calculate total cost from trace (sum up LLM node costs)
      let totalCost = 0;
      let totalTokens = 0;

      for (const nodeTrace of Object.values(trace)) {
        if ((nodeTrace as any).result?.tokens) {
          totalTokens += (nodeTrace as any).result.tokens;
        }
        // Cost calculation would need model info - simplified for MVP
      }

      // Update execution
      await supabase
        .from('agent_executions')
        .update({
          status: 'completed',
          output_data: output,
          execution_trace: trace,
          execution_time_ms: executionTime,
          tokens_used: totalTokens,
          cost: totalCost,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      return NextResponse.json({
        executionId: execution.id,
        output,
        trace,
        executionTime,
        cost: totalCost,
        tokens: totalTokens,
      });
    } catch (error: any) {
      // Update execution with error
      await supabase
        .from('agent_executions')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', execution.id);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

