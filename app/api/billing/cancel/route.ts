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

    // Get active subscription
    let subscription = null;
    if (currentUser.team_id) {
      // Team subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('team_id', currentUser.team_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscription = subData;
    } else {
      // Individual subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscription = subData;
    }

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Get free plan (100k token limit)
    const { data: freePlan } = await supabase
      .from('plans')
      .select('id, name, display_name, token_limit')
      .eq('name', 'free')
      .single();

    if (!freePlan) {
      return NextResponse.json({ error: 'Free plan not found' }, { status: 500 });
    }

    // Cancel subscription (set cancel_at_period_end to true)
    // Status remains 'active' until period ends, but plan is reverted immediately
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Immediately revert plan to free (100k limit) for both team and individual subscriptions
    if (currentUser.team_id) {
      // Team subscription - revert team plan and all team members' plans
      await supabase
        .from('teams')
        .update({ plan_id: freePlan.id })
        .eq('id', currentUser.team_id);

      // Revert all team members' plans to free
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', currentUser.team_id);

      if (teamMembers && teamMembers.length > 0) {
        const userIds = teamMembers.map(m => m.user_id);
        await supabase
          .from('users')
          .update({ plan_id: freePlan.id })
          .in('id', userIds);
      }
    } else {
      // Individual subscription - revert user plan to free
      await supabase
        .from('users')
        .update({ plan_id: freePlan.id })
        .eq('id', currentUser.id);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription cancelled. Plan reverted to free (100k token limit).',
      cancelAtPeriodEnd: true,
      planReverted: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

