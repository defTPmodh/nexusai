import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

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

    // Filter to only return active models
    const availableModels = (models || [])
      .map((m: any) => m.llm_models)
      .filter((m: any) => m && m.is_active);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Models API - User role:', user.role);
      console.log('Models API - Found permissions:', models?.length || 0);
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

