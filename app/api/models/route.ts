import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { ALLOWED_MODEL_IDS, ALLOWED_MODELS } from '@/lib/llm/providers';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

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

    // Get models available for this role
    const { data: models, error } = await supabase
      .from('model_permissions')
      .select(
        `
        can_use,
        llm_models (*)
      `
      )
      .eq('role', user.role)
      .eq('can_use', true);

    if (error) {
      console.error('Models API - Permission query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter to only return active models within the allowed OpenRouter set
    const allowedIds = new Set(ALLOWED_MODEL_IDS);
    const availableModels = (models || [])
      .map((m: any) => m.llm_models)
      .filter((m: any) => m && m.is_active && allowedIds.has(m.model_name))
      .map((model: any) => ({
        ...model,
        provider: ALLOWED_MODELS[model.model_name]?.provider || model.provider,
        display_name: ALLOWED_MODELS[model.model_name]?.display || model.display_name,
      }));

    // If Supabase doesn't yet have the allowlisted models, return a safe fallback payload
    const fallbackModels = ALLOWED_MODEL_IDS.map((id) => ({
      id,
      provider: ALLOWED_MODELS[id]?.provider || 'openai',
      model_name: id,
      display_name: ALLOWED_MODELS[id]?.display || id,
      cost_per_1k_input_tokens: 0,
      cost_per_1k_output_tokens: 0,
      max_tokens: null,
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    const responseModels = availableModels.length > 0 ? availableModels : fallbackModels;

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Models API - User role:', user.role);
      console.log('Models API - Found permissions:', models?.length || 0);
      console.log('Models API - Available models:', responseModels.length);
      console.log('Models API - Model IDs:', responseModels.map((m: any) => ({ id: m.id, name: m.display_name, provider: m.provider })));

      // Check if Minimax exists in database
      const { data: minimaxCheck } = await supabase
        .from('llm_models')
        .select('*')
        .eq('provider', 'minimax');
      console.log('Models API - Minimax models in DB:', minimaxCheck);
    }

    // Ensure we always return an array
    return NextResponse.json(Array.isArray(responseModels) ? responseModels : []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

