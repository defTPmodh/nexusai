import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

const DEFAULT_MODELS = [
  {
    provider: 'google',
    model_name: 'gemini-2.0-flash-exp:free',
    display_name: 'Google Gemini 2.0 Flash Exp (Free)',
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 8192,
  },
  {
    provider: 'deepseek',
    model_name: 'deepseek-v3.1',
    display_name: 'DeepSeek V3.1',
    cost_per_1k_input_tokens: 0.00014,
    cost_per_1k_output_tokens: 0.00056,
    max_tokens: 16384,
  },
  {
    provider: 'deepseek',
    model_name: 'deepseek-chat-v3-0324:free',
    display_name: 'DeepSeek Chat V3.0324 (Free)',
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 32768,
  },
  {
    provider: 'openai',
    model_name: 'gpt-oss-20b',
    display_name: 'OpenAI GPT-OSS-20B',
    cost_per_1k_input_tokens: 0.0005,
    cost_per_1k_output_tokens: 0.0015,
    max_tokens: 4096,
  },
  {
    provider: 'openai',
    model_name: 'gpt-oss-20b:free',
    display_name: 'OpenAI GPT-OSS-20B (Free)',
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 4096,
  },
  {
    provider: 'minimax',
    model_name: 'minimax-m2:free',
    display_name: 'Minimax M2',
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 32768,
  },
  {
    provider: 'xai',
    model_name: 'grok-4.1-fast:free',
    display_name: 'xAI Grok-4.1 Fast (Free)',
    cost_per_1k_input_tokens: 0,
    cost_per_1k_output_tokens: 0,
    max_tokens: 32768,
  },
] as const;

async function ensureDefaultModels(supabase: ReturnType<typeof getSupabaseAdmin>) {
  for (const model of DEFAULT_MODELS) {
    const { data: existingRows, error: existingError } = await supabase
      .from('llm_models')
      .select('id, is_active')
      .eq('provider', model.provider)
      .eq('model_name', model.model_name)
      .limit(1);

    if (existingError) {
      console.error('Models API - Error checking model:', model.model_name, existingError.message);
      continue;
    }

    const existing = existingRows?.[0];
    let modelId = existing?.id;

    if (!existing) {
      const { data: inserted, error: insertError } = await supabase
        .from('llm_models')
        .insert({
          ...model,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Models API - Failed to insert model:', model.model_name, insertError.message);
        continue;
      }

      modelId = inserted?.id;
      if (process.env.NODE_ENV === 'development') {
        console.log('Models API - Inserted missing model:', model.model_name);
      }
    } else if (!existing.is_active) {
      const { error: activateError } = await supabase
        .from('llm_models')
        .update({ is_active: true })
        .eq('id', modelId);

      if (activateError) {
        console.error('Models API - Failed to activate model:', model.model_name, activateError.message);
      } else if (process.env.NODE_ENV === 'development') {
        console.log('Models API - Reactivated model:', model.model_name);
      }
    }

    if (!modelId) continue;

    // Ensure permissions for all roles
    for (const role of ['employee', 'manager', 'admin']) {
      const { error: permissionError } = await supabase
        .from('model_permissions')
        .upsert(
          { model_id: modelId, role, can_use: true },
          { onConflict: 'model_id,role' }
        );

      if (permissionError) {
        console.error('Models API - Failed to upsert permission:', model.model_name, role, permissionError.message);
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Self-heal: ensure key models exist (older databases might be missing new providers)
    await ensureDefaultModels(supabase);

    // Get user role, create if doesn't exist
    let { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      // User doesn't exist yet - create it
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: session.user.sub,
          email: session.user.email || '',
          name: session.user.name || null,
          role: 'employee',
        })
        .select('role')
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      user = newUser;
    }

    // Get model IDs this role can use (avoid relying on PostgREST relationships)
    const { data: permissions, error: permissionsError } = await supabase
      .from('model_permissions')
      .select('model_id')
      .eq('role', user.role)
      .eq('can_use', true);

    if (permissionsError) {
      console.error('Models API - Permission query error:', permissionsError);
      return NextResponse.json({ error: permissionsError.message }, { status: 500 });
    }

    const allowedModelIds = (permissions || []).map((p: any) => p.model_id).filter(Boolean);

    if (allowedModelIds.length === 0) {
      return NextResponse.json([]);
    }

    // Pull the actual models by ID so we always respect is_active
    const { data: models, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .in('id', allowedModelIds)
      .eq('is_active', true);

    if (modelsError) {
      console.error('Models API - Model fetch error:', modelsError);
      return NextResponse.json({ error: modelsError.message }, { status: 500 });
    }

    const availableModels = Array.isArray(models) ? models : [];

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Models API - User role:', user.role);
      console.log('Models API - Allowed model IDs:', allowedModelIds);
      console.log('Models API - Available models:', availableModels.length);
      console.log('Models API - Model IDs:', availableModels.map((m: any) => ({ id: m.id, name: m.display_name, provider: m.provider })));
      
      // Check if Minimax exists in database
      const { data: minimaxCheck } = await supabase
        .from('llm_models')
        .select('*')
        .eq('provider', 'minimax');
      console.log('Models API - Minimax models in DB:', minimaxCheck);
    }

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(availableModels) ? availableModels : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

