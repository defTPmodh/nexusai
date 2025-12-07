import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { callLLM, calculateCost } from '@/lib/llm/providers';
import { LLMConfig } from '@/lib/llm/providers';
// Note: queryDocuments is imported dynamically when RAG is enabled to avoid initialization errors

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId, modelId, useRAG = false } = body;

    if (!message || !modelId) {
      return NextResponse.json({ error: 'Missing message or modelId' }, { status: 400 });
    }

    // Initialize Supabase admin client
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch (supabaseError: any) {
      console.error('Failed to initialize Supabase client:', supabaseError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: process.env.NODE_ENV === 'development' ? supabaseError.message : undefined
      }, { status: 500 });
    }

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    // If user doesn't exist, create them
    if (userError || !user) {
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
        console.error('Failed to create user:', createError);
        return NextResponse.json({ 
          error: 'Failed to create user account',
          details: createError?.message 
        }, { status: 500 });
      }
      user = newUser;
    }

    // Get model
    const { data: model, error: modelError } = await supabase
      .from('llm_models')
      .select('*')
      .eq('id', modelId)
      .single();

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Check permission
    const { data: permission } = await supabase
      .from('model_permissions')
      .select('can_use')
      .eq('model_id', modelId)
      .eq('role', user.role)
      .single();

    if (!permission?.can_use) {
      return NextResponse.json({ error: 'Access denied to this model' }, { status: 403 });
    }

    // Get or create chat session
    let chatSessionId = sessionId;
    let isNewSession = false;
    if (!chatSessionId) {
      // Create title from first 50 characters of message
      const title = message.substring(0, 50).trim() || 'New Chat';
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          model_id: modelId,
          title: title,
        })
        .select()
        .single();

      if (sessionError || !newSession) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }
      chatSessionId = newSession.id;
      isNewSession = true;
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', chatSessionId)
      .order('created_at', { ascending: true });

    // Detect and redact PII (admins bypass guardrails)
    let redactedText = message;
    let detectedTypes: string[] = [];

    if (user.role !== 'admin') {
      try {
        // Get guardrail config for non-admin users
        const guardrailModule = await import('@/lib/guardrails/pii-detection').catch((err) => {
          console.error('Failed to import guardrail module:', err);
          return null;
        });

        if (guardrailModule) {
          const { getGuardrailConfig, redactPII } = guardrailModule;
          const guardrail = await getGuardrailConfig().catch((err) => {
            console.error('Failed to get guardrail config:', err);
            return null;
          });

          if (guardrail && guardrail.enabled) {
            try {
              // Debug logging
              console.log('[GUARDRAIL] Config loaded:', {
                enabled: guardrail.enabled,
                pii_types: guardrail.pii_types,
                action: guardrail.action,
                allowlist_count: guardrail.allowlist_patterns?.length || 0,
                userRole: user.role,
                messagePreview: message.substring(0, 50)
              });
              
              const result = redactPII(message, guardrail.allowlist_patterns || [], guardrail.pii_types || []);
              redactedText = result.redactedText;
              detectedTypes = result.detectedTypes || [];

              // Log if PII was detected
              if (detectedTypes.length > 0) {
                console.log(`[GUARDRAIL] ✅ PII detected for user ${user.id}:`, detectedTypes, `Action: ${guardrail.action}`);
                console.log(`[GUARDRAIL] Original message (first 100 chars):`, message.substring(0, 100));
                console.log(`[GUARDRAIL] Redacted message (first 100 chars):`, redactedText.substring(0, 100));
              } else {
                console.log(`[GUARDRAIL] ❌ No PII detected in message (first 100 chars):`, message.substring(0, 100));
              }

              // Handle different actions
              if (guardrail.action === 'block' && detectedTypes.length > 0) {
                return NextResponse.json({
                  error: `PII detected. Request blocked by guardrails. Detected types: ${detectedTypes.join(', ')}`,
                  piiTypes: detectedTypes,
                  action: 'blocked',
                  originalMessage: message,
                  redactedMessage: redactedText,
                }, { status: 403 });
              } else if (guardrail.action === 'warn' && detectedTypes.length > 0) {
                // Continue but add warning (handled in response)
                console.log(`⚠️ Guardrail WARNING: PII detected (${detectedTypes.join(', ')}) but allowing request`);
              }
            } catch (redactError: any) {
              console.error('PII redaction failed:', redactError);
              // Continue with original message if redaction fails
            }
          }
        }
      } catch (guardrailError: any) {
        // If guardrail check fails, log but continue (fail open for availability)
        console.error('Guardrail check failed, continuing without PII detection:', guardrailError);
        // Continue with original message
      }
    }

    // Save user message
    const { data: userMessage, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: chatSessionId,
        role: 'user',
        content: redactedText,
        pii_detected: detectedTypes.length > 0,
        pii_types: detectedTypes.length > 0 ? detectedTypes : null,
      })
      .select()
      .single();

    if (messageError) {
      console.error('Failed to save user message:', messageError);
      // Continue anyway - don't block the request
    }

    // Prepare messages for LLM
    const conversationMessages = (messages || []).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // If RAG is enabled, query documents and add context
    let ragContext = '';
    if (useRAG) {
      try {
        // Dynamically import RAG module only when needed to avoid initialization errors
        const { queryDocuments } = await import('@/lib/rag/document-processing');
        const ragResults = await queryDocuments(redactedText, user.id, 5, 0.7);
        if (ragResults.length > 0) {
          ragContext = '\n\nRelevant context from uploaded documents:\n' +
            ragResults.map((r, i) => `[${i + 1}] ${r.content}`).join('\n\n') +
            '\n\nPlease use this context to provide a more accurate and grounded response.';
        }
      } catch (ragError: any) {
        console.error('RAG query failed:', ragError);
        // Continue without RAG context if query fails (e.g., missing API key)
      }
    }

    conversationMessages.push({ 
      role: 'user', 
      content: redactedText + ragContext 
    });

    // Call LLM
    const startTime = Date.now();
    const llmConfig: LLMConfig = {
      provider: model.provider,
      model: model.model_name,
    };

    let llmResponse;
    let inputTokens = 0;
    let outputTokens = 0;
    let cost = 0;
    let errorMessage = null;

    try {
      llmResponse = await callLLM(llmConfig, conversationMessages);
      inputTokens = llmResponse.inputTokens;
      outputTokens = llmResponse.outputTokens;
      cost = calculateCost(model, inputTokens, outputTokens);
    } catch (error: any) {
      errorMessage = error.message || 'Unknown LLM error';
      console.error('LLM Error:', error);
      // Don't throw - return error to user instead
    } finally {
      const latency = Date.now() - startTime;

      // Log request
      await supabase.from('llm_requests').insert({
        user_id: user.id,
        model_id: modelId,
        session_id: chatSessionId,
        prompt: redactedText,
        response: llmResponse?.content || null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost,
        pii_detected: detectedTypes.length > 0,
        pii_types: detectedTypes.length > 0 ? detectedTypes : null,
        latency_ms: latency,
        status: errorMessage ? 'error' : 'success',
        error_message: errorMessage,
      });
    }

    if (errorMessage || !llmResponse) {
      console.error('Chat message error:', errorMessage);
      return NextResponse.json({ 
        error: errorMessage || 'Failed to get LLM response',
        model: model.display_name,
        provider: model.provider,
        hint: 'Check OpenRouter model IDs at https://openrouter.ai/models'
      }, { status: 500 });
    }

    // Save assistant message
    await supabase.from('chat_messages').insert({
      session_id: chatSessionId,
      role: 'assistant',
      content: llmResponse.content,
    });

    // Update session
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatSessionId);

    return NextResponse.json({
      message: llmResponse.content,
      sessionId: chatSessionId,
      piiDetected: detectedTypes.length > 0,
      piiTypes: detectedTypes,
      originalMessage: message !== redactedText ? message : undefined,
      redactedMessage: message !== redactedText ? redactedText : undefined,
      cost,
      tokens: inputTokens + outputTokens,
    });
  } catch (error: any) {
    console.error('Chat message API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

