import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';


// Force dynamic rendering since we use cookies (getSession)
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planName = 'premium', teamName } = body;

    const supabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, team_id, email, name')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get plan
    const { data: plan } = await supabase
      .from('plans')
      .select('id, name, max_team_members')
      .eq('name', planName)
      .single();

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // If user already has a team, upgrade the team's plan
    if ((currentUser as any).team_id) {
      const { data: team } = await supabase
        .from('teams')
        .select('id, name')
        .eq('id', (currentUser as any).team_id)
        .single();

      if (team) {
        // Update team plan
        await supabase
          .from('teams')
          .update({ plan_id: plan.id })
          .eq('id', team.id);

        // Update subscription
        await supabase
          .from('subscriptions')
          .update({
            plan_id: plan.id,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('team_id', team.id);

        return NextResponse.json({
          success: true,
          team,
          plan: plan.name,
          message: 'Team plan upgraded successfully',
        });
      }
    }

    // Create new team for premium plan
    const teamNameToUse = teamName || `${(currentUser as any).name || (currentUser as any).email}'s Team`;

    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamNameToUse,
        plan_id: plan.id,
        owner_id: (currentUser as any).id,
        max_members: plan.max_team_members,
      })
      .select()
      .single();

    if (teamError || !team || !team.id) {
      return NextResponse.json({ error: teamError?.message || 'Failed to create team' }, { status: 500 });
    }

    const teamId = team.id;

    // Add user as owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: (currentUser as any).id,
        role: 'owner',
      });

    if (memberError) {
      // If FK fails, double-check the team exists and retry once
      if (memberError.code === '23503') {
        const { data: existingTeam } = await supabase
          .from('teams')
          .select('id')
          .eq('id', teamId)
          .single();

        if (existingTeam?.id) {
          const { error: retryError } = await supabase
            .from('team_members')
            .insert({
              team_id: existingTeam.id,
              user_id: (currentUser as any).id,
              role: 'owner',
            });

          if (!retryError) {
            // continue below
          } else {
            await supabase.from('teams').delete().eq('id', teamId);
            return NextResponse.json({ error: retryError.message || 'Failed to add owner to team' }, { status: 500 });
          }
        } else {
          await supabase.from('teams').delete().eq('id', teamId);
          return NextResponse.json({ error: 'Team creation did not persist. Please retry.' }, { status: 500 });
        }
      } else {
        await supabase.from('teams').delete().eq('id', teamId);
        return NextResponse.json({ error: memberError.message || 'Failed to add owner to team' }, { status: 500 });
      }
    }

    // Update user's team_id and set role to admin (team owners are admins)
    await supabase
      .from('users')
      .update({ team_id: teamId, role: 'admin' })
      .eq('id', (currentUser as any).id);

    // Create subscription
    await supabase
      .from('subscriptions')
      .insert({
        team_id: teamId,
        plan_id: plan.id,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    return NextResponse.json({
      success: true,
      team,
      plan: plan.name,
      message: 'Premium plan activated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

