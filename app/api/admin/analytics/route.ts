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

    // Get user and check if admin or teacher (allow teachers to see analytics too)
    const { data: user } = await supabase
      .from('users')
      .select('id, role, team_id')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Allow admin, teacher, or team owners only (not team admins)
    const canViewAnalytics = user.role === 'admin' || user.role === 'teacher';
    
    if (!canViewAnalytics) {
      // Check if user is team owner (not admin)
      if (user.team_id) {
        const { data: teamMember } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', user.team_id)
          .eq('user_id', user.id)
          .single();
        
        if (!teamMember || teamMember.role !== 'owner') {
          return NextResponse.json({ error: 'Access denied. Only team owners can view analytics.' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    // Calculate date range
    const now = new Date();
    let periodStart: Date;

    switch (period) {
      case 'today':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last7days':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        return NextResponse.json(
          await getAnalytics(periodStart, lastMonthEnd, supabase, user.role === 'admin' ? undefined : user.id, user.team_id)
        );
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    const periodEnd = new Date();

    // Pass user and team info to filter analytics appropriately
    const analytics = await getAnalytics(periodStart, periodEnd, supabase, user.role === 'admin' ? undefined : user.id, user.team_id);

    return NextResponse.json(analytics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getAnalytics(periodStart: Date, periodEnd: Date, supabase: any, userId?: string, teamId?: string) {
  // Build query - if admin (no userId), show all; if team admin, show team; if user, show user only
  let query = supabase
    .from('llm_requests')
    .select(`
      id,
      cost,
      input_tokens,
      output_tokens,
      status,
      created_at,
      user_id,
      users:users!llm_requests_user_id_fkey (
        email
      )
    `)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())
    .eq('status', 'success');

  // If team_id provided and not admin, filter by team members
  if (teamId && userId) {
    const { data: teamMembers } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
    
    const teamUserIds = (teamMembers || []).map((m: any) => m.user_id);
    if (teamUserIds.length > 0) {
      query = query.in('user_id', teamUserIds);
    } else {
      // No team members, return empty
      return {
        summary: {
          totalCost: 0,
          totalRequests: 0,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          totalTokens: 0,
        },
        userBreakdown: [],
        timeSeries: [],
      };
    }
  } else if (userId && !teamId) {
    // Filter by user only (individual user, not in team)
    query = query.eq('user_id', userId);
  }
  // If admin (no userId), show all requests (no filter)

  const { data: requests, error } = await query;

  if (error) {
    console.error('Analytics query error:', error);
    // Return empty data instead of throwing
    return {
      summary: {
        totalCost: 0,
        totalRequests: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalTokens: 0,
      },
      userBreakdown: [],
      timeSeries: [],
    };
  }

  // Aggregate totals
  const totals = (requests || []).reduce(
    (acc: any, req: any) => ({
      totalCost: acc.totalCost + Number(req.cost || 0),
      totalRequests: acc.totalRequests + 1,
      totalInputTokens: acc.totalInputTokens + Number(req.input_tokens || 0),
      totalOutputTokens: acc.totalOutputTokens + Number(req.output_tokens || 0),
      totalTokens: acc.totalTokens + Number(req.input_tokens || 0) + Number(req.output_tokens || 0),
    }),
    {
      totalCost: 0,
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
    }
  );

  // User breakdown
  const userMap: Record<string, any> = {};
  (requests || []).forEach((req: any) => {
    const email = req.users?.email || 'Unknown';
    if (!userMap[email]) {
      userMap[email] = {
        user_email: email,
        total_cost: 0,
        total_requests: 0,
        total_tokens: 0,
      };
    }
    userMap[email].total_cost += Number(req.cost || 0);
    userMap[email].total_requests += 1;
    userMap[email].total_tokens += Number(req.input_tokens || 0) + Number(req.output_tokens || 0);
  });

  const userBreakdown = Object.values(userMap);

  // Group by date for time series
  const dailyBreakdown: Record<string, any> = {};
  (requests || []).forEach((req: any) => {
    const date = new Date(req.created_at).toISOString().split('T')[0];
    if (!dailyBreakdown[date]) {
      dailyBreakdown[date] = {
        date,
        cost: 0,
        requests: 0,
        tokens: 0,
      };
    }
    dailyBreakdown[date].cost += Number(req.cost || 0);
    dailyBreakdown[date].requests += 1;
    dailyBreakdown[date].tokens += Number(req.input_tokens || 0) + Number(req.output_tokens || 0);
  });

  // Always return data structure, even if empty
  return {
    summary: totals,
    userBreakdown: userBreakdown || [],
    timeSeries: Object.values(dailyBreakdown).sort((a: any, b: any) => a.date.localeCompare(b.date)),
  };
}

