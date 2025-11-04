import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// Diagnostic endpoint to check if Minimax model exists and has permissions
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Check if minimax provider constraint allows it
    let constraintCheck = null;
    try {
      const { data } = await supabase.rpc('check_provider_constraint', {});
      constraintCheck = data;
    } catch {
      constraintCheck = null;
    }
    
    // Get all models
    const { data: allModels, error: modelsError } = await supabase
      .from('llm_models')
      .select('*')
      .order('created_at', { ascending: false });

    // Get Minimax model specifically
    const { data: minimaxModel, error: minimaxError } = await supabase
      .from('llm_models')
      .select('*')
      .eq('provider', 'minimax')
      .eq('model_name', 'minimax-m2:free')
      .single();

    // Get permissions for Minimax
    let minimaxPermissions = null;
    if (minimaxModel) {
      const { data: perms } = await supabase
        .from('model_permissions')
        .select('*')
        .eq('model_id', minimaxModel.id);
      minimaxPermissions = perms;
    }

    // Get user role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('auth0_id', session.user.sub)
      .single();

    return NextResponse.json({
      allModels: allModels || [],
      minimaxModel: minimaxModel || null,
      minimaxError: minimaxError?.message || null,
      minimaxPermissions: minimaxPermissions || [],
      userRole: user?.role || null,
      checkModelAvailable: user ? await checkModelAvailable(supabase, user.role, minimaxModel?.id) : null,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

async function checkModelAvailable(supabase: any, role: string, modelId: string | undefined) {
  if (!modelId) return false;
  
  const { data } = await supabase
    .from('model_permissions')
    .select('can_use')
    .eq('model_id', modelId)
    .eq('role', role)
    .single();
  
  return data?.can_use || false;
}

