import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { callLLM, calculateCost } from '@/lib/llm/providers';
import { LLMConfig } from '@/lib/llm/providers';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, modelIds } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user
    let { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: session.user.sub,
          email: session.user.email || '',
          name: session.user.name || null,
          role: 'employee',
        })
        .select('id, role')
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    }

    // Get all active models
    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .eq('is_active', true);

    if (modelsError || !models || models.length === 0) {
      return NextResponse.json({ error: 'No models available' }, { status: 404 });
    }

    // Check permissions for each model
    const { data: permissions } = await supabase
      .from('model_permissions')
      .select('model_id, can_use')
      .eq('role', user.role)
      .eq('can_use', true);

    const allowedModelIds = new Set((permissions || []).map((p: any) => p.model_id));
    let availableModels = models.filter((m: any) => allowedModelIds.has(m.id));

    // Filter by requested modelIds if provided
    if (modelIds && Array.isArray(modelIds) && modelIds.length > 0) {
      const requestedIds = new Set(modelIds);
      availableModels = availableModels.filter((m: any) => requestedIds.has(m.id));
    }

    if (availableModels.length === 0) {
      return NextResponse.json({ error: 'No models available for your role' }, { status: 403 });
    }

    // Detect and redact PII (admins bypass guardrails)
    let redactedText = message;
    let detectedTypes: string[] = [];

    if (user.role !== 'admin') {
      // Get guardrail config for non-admin users
      const { getGuardrailConfig } = await import('@/lib/guardrails/pii-detection');
      const guardrail = await getGuardrailConfig();

      if (guardrail.enabled) {
        const { redactPII } = await import('@/lib/guardrails/pii-detection');
        const result = redactPII(message, guardrail.allowlist_patterns, guardrail.pii_types);
        redactedText = result.redactedText;
        detectedTypes = result.detectedTypes;

        // Handle different actions
        if (guardrail.action === 'block' && detectedTypes.length > 0) {
          return NextResponse.json({
            error: 'PII detected. Request blocked by guardrails.',
            piiTypes: detectedTypes,
            action: 'blocked',
          }, { status: 403 });
        }
      }
    }

    // Prepare messages for LLM
    const conversationMessages = [{ role: 'user' as const, content: redactedText }];

    // Call all models in parallel
    const startTime = Date.now();
    const responses = await Promise.allSettled(
      availableModels.map(async (model: any) => {
        const llmConfig: LLMConfig = {
          provider: model.provider,
          model: model.model_name,
        };

        try {
          const llmResponse = await callLLM(llmConfig, conversationMessages);
          const inputTokens = llmResponse.inputTokens;
          const outputTokens = llmResponse.outputTokens;
          const cost = calculateCost(model, inputTokens, outputTokens);

          // Log request
          await supabase.from('llm_requests').insert({
            user_id: user.id,
            model_id: model.id,
            prompt: redactedText,
            response: llmResponse.content,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost,
            pii_detected: detectedTypes.length > 0,
            pii_types: detectedTypes.length > 0 ? detectedTypes : null,
            latency_ms: Date.now() - startTime,
            status: 'success',
          });

          return {
            modelId: model.id,
            modelName: model.display_name,
            provider: model.provider,
            content: llmResponse.content,
            inputTokens,
            outputTokens,
            cost,
            success: true,
          };
        } catch (error: any) {
          // Log error
          await supabase.from('llm_requests').insert({
            user_id: user.id,
            model_id: model.id,
            prompt: redactedText,
            response: null,
            input_tokens: 0,
            output_tokens: 0,
            cost: 0,
            pii_detected: detectedTypes.length > 0,
            pii_types: detectedTypes.length > 0 ? detectedTypes : null,
            latency_ms: Date.now() - startTime,
            status: 'error',
            error_message: error.message,
          });

          return {
            modelId: model.id,
            modelName: model.display_name,
            provider: model.provider,
            content: `Error: ${error.message}`,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            success: false,
            error: error.message,
          };
        }
      })
    );

    const results = responses.map((result, idx) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          modelId: availableModels[idx].id,
          modelName: availableModels[idx].display_name,
          provider: availableModels[idx].provider,
          content: `Error: ${result.reason?.message || 'Unknown error'}`,
          inputTokens: 0,
          outputTokens: 0,
          cost: 0,
          success: false,
          error: result.reason?.message || 'Unknown error',
        };
      }
    });

    return NextResponse.json({
      results,
      piiDetected: detectedTypes.length > 0,
      piiTypes: detectedTypes,
      totalCost: results.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: results.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

