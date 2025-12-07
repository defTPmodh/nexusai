import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// Force dynamic rendering since we use cookies (getSession)
export const dynamic = 'force-dynamic';

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
      .select('id, team_id, email, name, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or team owner (only owners/admins can view billing)
    let isAdmin = currentUser.role === 'admin';
    
    // If not admin, check if user is a team owner
    if (!isAdmin && currentUser.team_id) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', currentUser.team_id)
        .eq('user_id', currentUser.id)
        .single();
      
      isAdmin = teamMember?.role === 'owner';
    }

    // If user is not admin/owner and is on a team, deny access
    if (!isAdmin && currentUser.team_id) {
      return NextResponse.json({ 
        error: 'Access denied. Only team owners and admins can view billing information.',
        accessDenied: true
      }, { status: 403 });
    }

    // Get subscription (team or individual)
    let subscription = null;
    let plan = null;
    let team = null;

    if (currentUser.team_id) {
      // Get team subscription
      const { data: teamData } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          plan:plans (
            id,
            name,
            display_name,
            price_per_user_monthly,
            currency
          )
        `)
        .eq('id', currentUser.team_id)
        .single();

      if (teamData) {
        team = teamData;
        plan = teamData.plan;

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('team_id', currentUser.team_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        subscription = subData;

        // Check if subscription should be canceled (period ended and cancel_at_period_end is true)
        if (subData && subData.cancel_at_period_end && subData.current_period_end) {
          const periodEnd = new Date(subData.current_period_end);
          const now = new Date();
          
          if (now >= periodEnd) {
            // Period has ended, cancel the subscription
            await supabase
              .from('subscriptions')
              .update({
                status: 'cancelled',
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subData.id);

            // Get free plan
            const { data: freePlan } = await supabase
              .from('plans')
              .select('id')
              .eq('name', 'free')
              .single();

            if (freePlan) {
              // Revert team plan to free
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

              // Update plan to free
              plan = { ...plan, id: freePlan.id, name: 'free', display_name: 'Free Plan', price_per_user_monthly: null, currency: 'AED' };
            }

            subscription = null; // Subscription is now cancelled
          }
        }
      }
    } else {
      // Get individual subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plans (
            id,
            name,
            display_name,
            price_per_user_monthly,
            currency
          )
        `)
        .eq('user_id', currentUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subData) {
        subscription = subData;
        plan = subData.plan;

        // Check if subscription should be canceled (period ended and cancel_at_period_end is true)
        if (subData.cancel_at_period_end && subData.current_period_end) {
          const periodEnd = new Date(subData.current_period_end);
          const now = new Date();
          
          if (now >= periodEnd) {
            // Period has ended, cancel the subscription
            await supabase
              .from('subscriptions')
              .update({
                status: 'cancelled',
                cancel_at_period_end: false,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subData.id);

            // Get free plan and update user
            const { data: freePlan } = await supabase
              .from('plans')
              .select('id')
              .eq('name', 'free')
              .single();

            if (freePlan) {
              await supabase
                .from('users')
                .update({ plan_id: freePlan.id })
                .eq('id', currentUser.id);

              plan = { ...plan, id: freePlan.id, name: 'free', display_name: 'Free Plan', price_per_user_monthly: null, currency: 'AED' };
            }

            subscription = null; // Subscription is now cancelled
          }
        }
      }
    }

    // Get team member count if team subscription
    let memberCount = 1;
    if (currentUser.team_id) {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', currentUser.team_id);
      memberCount = count || 1;
    }

    // Calculate next billing amount
    let nextBillingAmount = 0;
    if (subscription && plan && plan.price_per_user_monthly) {
      nextBillingAmount = Number(plan.price_per_user_monthly) * memberCount;
    }

    // Get billing history (past invoices/subscriptions)
    const { data: billingHistory } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        current_period_start,
        current_period_end,
        created_at,
        plan:plans (
          display_name,
          price_per_user_monthly,
          currency
        )
      `)
      .or(`user_id.eq.${currentUser.id},team_id.eq.${(currentUser as any).team_id || 'null'}`)
      .order('created_at', { ascending: false })
      .limit(12);

    return NextResponse.json({
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
      plan: plan ? {
        name: plan.name,
        displayName: plan.display_name,
        pricePerUser: plan.price_per_user_monthly,
        currency: plan.currency,
      } : null,
      team: team ? {
        id: team.id,
        name: team.name,
        memberCount,
      } : null,
      nextBilling: subscription && subscription.current_period_end ? {
        date: subscription.current_period_end,
        amount: nextBillingAmount,
        currency: plan?.currency || 'AED',
      } : null,
      billingHistory: billingHistory || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

