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
    const auth0Id = session.user.sub;

    // Get user basic info first
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, plan_id, team_id')
      .eq('auth0_id', auth0Id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ used: 0, limit: 100000, plan: 'free', unlimited: false });
    }

    // Get user's individual plan if exists
    let userPlan = null;
    if (user.plan_id) {
      const { data: planData } = await supabase
        .from('plans')
        .select('id, name, token_limit')
        .eq('id', user.plan_id)
        .single();
      userPlan = planData;
    }

    // Get team plan if user is on a team
    let teamPlan = null;
    let isOwner = false;
    if (user.team_id) {
      // Get team info
      const { data: teamData } = await supabase
        .from('teams')
        .select('plan_id, plan:plans(id, name, token_limit)')
        .eq('id', user.team_id)
        .single();
      
      if (teamData?.plan) {
        teamPlan = teamData.plan;
      }

      // Check if user is team owner
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', user.team_id)
        .eq('user_id', user.id)
        .single();
      
      isOwner = teamMember?.role === 'owner';
    }

    // Determine plan (team plan takes precedence)
    const plan = (Array.isArray(teamPlan) ? teamPlan[0] : teamPlan) || (Array.isArray(userPlan) ? userPlan[0] : userPlan);
    const planName = plan?.name || 'free';
    
    // Calculate token limit:
    // - Premium plan members get 1,000,000 credits each
    // - Team owners get 1,000,000 credits (regardless of plan)
    // - Otherwise use plan limit or default to 100,000 (free)
    let tokenLimit = 100000; // Default to free plan limit

    if (planName === 'premium') {
      tokenLimit = 1000000; // Premium members get 1M credits
    } else if (isOwner) {
      tokenLimit = 1000000; // Owners get 1M credits regardless of plan
    } else if (plan?.token_limit !== null) {
      tokenLimit = plan.token_limit || 100000;
    }

    // Get total tokens used (individual usage only - each member has their own limit)
    const { data: requests } = await supabase
      .from('llm_requests')
      .select('input_tokens, output_tokens')
      .eq('user_id', user.id)
      .eq('status', 'success');

    const totalTokens = (requests || []).reduce((sum, req) => {
      return sum + (Number(req.input_tokens) || 0) + (Number(req.output_tokens) || 0);
    }, 0);

    const limit = tokenLimit === null ? null : tokenLimit; // null means unlimited

    return NextResponse.json({
      used: totalTokens,
      limit: limit,
      percentage: limit === null ? 0 : (totalTokens / limit) * 100,
      plan: planName,
      unlimited: limit === null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

