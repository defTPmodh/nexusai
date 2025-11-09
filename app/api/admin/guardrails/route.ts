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

    // Get user and check if admin or team owner
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

    // If user doesn't exist, create it
    if (userError || !user) {
      // Try to create user first
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: session.user.sub,
          email: session.user.email || '',
          name: session.user.name || null,
          role: (count || 0) === 0 ? 'admin' : 'employee',
        })
        .select('id, role, team_id')
        .single();

      if (createError || !newUser) {
        console.error('Failed to create user:', createError);
        return NextResponse.json({ error: 'User not found and could not be created' }, { status: 404 });
      }

      user = newUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or team owner
    let isAdmin = user.role === 'admin';
    
    // If not admin, check if user is a team owner
    if (!isAdmin && user.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', user.team_id)
        .eq('user_id', user.id)
        .single();
      
      isAdmin = teamMember?.role === 'owner';
    }

    if (!isAdmin) {
      console.error('User role check failed:', { userId: user.id, role: user.role, auth0Id: session.user.sub, teamId: user.team_id });
      return NextResponse.json({ 
        error: 'Admin access required. Team owners automatically have admin access.',
        debug: { userId: user.id, role: user.role }
      }, { status: 403 });
    }

    // Get all guardrails
    const { data: guardrails, error } = await supabase
      .from('guardrails')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ guardrails: guardrails || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user and check if admin or team owner
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

    // If user doesn't exist, create it
    if (userError || !user) {
      // Try to create user first
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: session.user.sub,
          email: session.user.email || '',
          name: session.user.name || null,
          role: (count || 0) === 0 ? 'admin' : 'employee',
        })
        .select('id, role, team_id')
        .single();

      if (createError || !newUser) {
        console.error('Failed to create user:', createError);
        return NextResponse.json({ error: 'User not found and could not be created' }, { status: 404 });
      }

      user = newUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or team owner
    let isAdmin = user.role === 'admin';
    
    // If not admin, check if user is a team owner
    if (!isAdmin && user.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', user.team_id)
        .eq('user_id', user.id)
        .single();
      
      isAdmin = teamMember?.role === 'owner';
    }

    if (!isAdmin) {
      console.error('User role check failed:', { userId: user.id, role: user.role, auth0Id: session.user.sub, teamId: user.team_id });
      return NextResponse.json({ 
        error: 'Admin access required. Team owners automatically have admin access.',
        debug: { userId: user.id, role: user.role }
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, enabled, pii_types, action, allowlist_patterns } = body;

    if (!name) {
      return NextResponse.json({ error: 'Guardrail name is required' }, { status: 400 });
    }

    // Update or create guardrail
    const { data: existing } = await supabase
      .from('guardrails')
      .select('id')
      .eq('name', name)
      .single();

    let guardrail;
    if (existing) {
      // Update existing
      const { data: updated, error: updateError } = await supabase
        .from('guardrails')
        .update({
          enabled: enabled ?? true,
          pii_types: pii_types || [],
          action: action || 'redact',
          allowlist_patterns: allowlist_patterns || [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      guardrail = updated;
    } else {
      // Create new
      const { data: created, error: createError } = await supabase
        .from('guardrails')
        .insert({
          name,
          enabled: enabled ?? true,
          pii_types: pii_types || [],
          action: action || 'redact',
          allowlist_patterns: allowlist_patterns || [],
          created_by: user.id,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      guardrail = created;
    }

    return NextResponse.json({ guardrail });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

