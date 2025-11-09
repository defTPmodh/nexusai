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
    const { data: user } = await supabase
      .from('users')
      .select('id, role, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

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
      return NextResponse.json({ error: 'Admin access required. Team owners automatically have admin access.' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

