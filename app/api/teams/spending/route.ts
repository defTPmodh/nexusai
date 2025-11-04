import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is team owner (only owners can view spending)
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember || teamMember.role !== 'owner') {
      return NextResponse.json({ error: 'Only team owners can view spending breakdown' }, { status: 403 });
    }

    // Get all team members with their plan details
    const { data: members } = await supabase
      .from('team_members')
      .select(`
        user_id,
        role,
        users:users!team_members_user_id_fkey (
          id,
          email,
          name,
          plan_id,
          plan:plans (
            id,
            name,
            display_name,
            token_limit
          )
        )
      `)
      .eq('team_id', teamId);

    if (!members || members.length === 0) {
      return NextResponse.json({ spending: [] });
    }

    const memberIds = members.map((m: any) => m.user_id);

    // Get all requests for team members
    const { data: requests } = await supabase
      .from('llm_requests')
      .select('user_id, cost, input_tokens, output_tokens, created_at')
      .in('user_id', memberIds)
      .eq('status', 'success')
      .order('created_at', { ascending: false });

    // Aggregate spending by user
    const spendingMap: Record<string, any> = {};

    members.forEach((member: any) => {
      const userId = member.user_id;
      const user = member.users;
      const isOwner = member.role === 'owner';
      const planName = user?.plan?.name || 'free';
      const planTokenLimit = user?.plan?.token_limit;
      
      // Calculate credit limit:
      // - Owners always get 250k credits (regardless of plan)
      // - Premium plan members get 250k credits
      // - Free plan members get 25k credits (or plan's token_limit if set)
      let creditLimit = 25000; // Default to free plan limit
      if (isOwner) {
        creditLimit = 250000; // Owners get 250k regardless of plan
      } else if (planName === 'premium') {
        creditLimit = 250000; // Premium members get 250k
      } else if (planTokenLimit !== null && planTokenLimit !== undefined) {
        creditLimit = planTokenLimit; // Use plan's token limit if set
      }
      
      spendingMap[userId] = {
        userId,
        email: user?.email || 'Unknown',
        name: user?.name || null,
        role: member.role,
        plan: user?.plan?.display_name || 'Free',
        isPremium: planName === 'premium',
        isOwner,
        totalCost: 0,
        totalTokens: 0,
        totalRequests: 0,
        creditLimit,
        recentActivity: [] as any[],
      };
    });

    // Aggregate spending
    (requests || []).forEach((req: any) => {
      const userId = req.user_id;
      if (spendingMap[userId]) {
        spendingMap[userId].totalCost += Number(req.cost || 0);
        spendingMap[userId].totalTokens += Number(req.input_tokens || 0) + Number(req.output_tokens || 0);
        spendingMap[userId].totalRequests += 1;
        
        // Store recent activity (last 10)
        if (spendingMap[userId].recentActivity.length < 10) {
          spendingMap[userId].recentActivity.push({
            date: req.created_at,
            cost: Number(req.cost || 0),
            tokens: Number(req.input_tokens || 0) + Number(req.output_tokens || 0),
          });
        }
      }
    });

    // Calculate usage percentage
    Object.values(spendingMap).forEach((member: any) => {
      member.usagePercentage = member.creditLimit > 0 
        ? (member.totalTokens / member.creditLimit) * 100 
        : 0;
      member.remainingCredits = Math.max(0, member.creditLimit - member.totalTokens);
    });

    // Sort by total cost (descending)
    const spending = Object.values(spendingMap).sort((a: any, b: any) => 
      b.totalCost - a.totalCost
    );

    return NextResponse.json({ spending });
  } catch (error: any) {
    console.error('Team spending API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

