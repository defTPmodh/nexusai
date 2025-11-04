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

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!currentUser.team_id) {
      return NextResponse.json({ team: null });
    }

    // Get team with plan info
    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        member_count,
        max_members,
        created_at,
        plan:plans (
          id,
          name,
          display_name,
          price_per_user_monthly,
          currency,
          token_limit,
          features
        ),
        owner:users!teams_owner_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', currentUser.team_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, planId } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a team
    if ((currentUser as any).team_id) {
      return NextResponse.json({ error: 'User already belongs to a team' }, { status: 400 });
    }

    // Get plan (default to premium if not specified)
    const planName = planId || 'premium';
    const { data: plan } = await supabase
      .from('plans')
      .select('id, max_team_members')
      .eq('name', planName)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name,
        plan_id: plan.id,
        owner_id: currentUser.id,
        max_members: plan.max_team_members,
      })
      .select()
      .single();

    if (teamError || !team) {
      return NextResponse.json({ error: teamError?.message || 'Failed to create team' }, { status: 500 });
    }

    // Add user as owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: currentUser.id,
        role: 'owner',
      });

    if (memberError) {
      // Rollback team creation
      await supabase.from('teams').delete().eq('id', team.id);
      return NextResponse.json({ error: 'Failed to add owner to team' }, { status: 500 });
    }

    // Update user's team_id
    await supabase
      .from('users')
      .update({ team_id: team.id })
      .eq('id', currentUser.id);

    // Create subscription
    await supabase
      .from('subscriptions')
      .insert({
        team_id: team.id,
        plan_id: plan.id,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

    return NextResponse.json({ team });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

