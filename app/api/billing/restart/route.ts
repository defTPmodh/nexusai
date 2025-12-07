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

    // Get subscription to restart (cancelled, expired, or scheduled to cancel)
    let subscription = null;
    if (currentUser.team_id) {
      // Team subscription - check for cancelled/expired or scheduled to cancel
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('team_id', currentUser.team_id)
        .or('status.in.(cancelled,expired),cancel_at_period_end.eq.true')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscription = subData;
    } else {
      // Individual subscription - check for cancelled/expired or scheduled to cancel
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*, plan:plans(*)')
        .eq('user_id', currentUser.id)
        .or('status.in.(cancelled,expired),cancel_at_period_end.eq.true')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      subscription = subData;
    }

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found to restart' }, { status: 404 });
    }

    // Restart subscription by setting status back to active and removing cancel flag
    const newPeriodEnd = new Date();
    newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1); // Add 1 month

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        cancel_at_period_end: false,
        current_period_start: new Date().toISOString(),
        current_period_end: newPeriodEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If team subscription, update team plan
    if (currentUser.team_id && subscription.plan_id) {
      await supabase
        .from('teams')
        .update({ plan_id: subscription.plan_id })
        .eq('id', currentUser.team_id);

      // Update all team members' plans
      const { data: teamMembers } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', currentUser.team_id);

      if (teamMembers && teamMembers.length > 0) {
        const userIds = teamMembers.map(m => m.user_id);
        await supabase
          .from('users')
          .update({ plan_id: subscription.plan_id })
          .in('id', userIds);
      }
    } else if (subscription.plan_id) {
      // Individual subscription - update user plan
      await supabase
        .from('users')
        .update({ plan_id: subscription.plan_id })
        .eq('id', currentUser.id);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Subscription restarted successfully',
      subscription: {
        id: subscription.id,
        status: 'active',
        currentPeriodEnd: newPeriodEnd.toISOString(),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

