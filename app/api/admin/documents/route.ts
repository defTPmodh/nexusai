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

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, team_id')
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
        .select('id, role, team_id')
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ 
          error: 'Failed to create user account',
          details: createError?.message 
        }, { status: 500 });
      }
      user = newUser;
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

    // Admins and team owners can see all documents, regular users see only their own
    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Get documents error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

