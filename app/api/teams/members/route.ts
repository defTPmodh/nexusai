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

    // Verify user is team member
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember) {
      return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
    }

    // Get all team members
    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        joined_at,
        user:users (
          id,
          email,
          name,
          role
        )
      `)
      .eq('team_id', teamId)
      .order('joined_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ members: members || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const memberId = searchParams.get('memberId');

    if (!teamId || !memberId) {
      return NextResponse.json({ error: 'teamId and memberId are required' }, { status: 400 });
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

    // Check if user is team owner (only owners can remove members)
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember || teamMember.role !== 'owner') {
      return NextResponse.json({ error: 'Only team owners can remove members' }, { status: 403 });
    }

    // Get member to remove with user_id
    const { data: memberToRemove } = await supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .single();

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (memberToRemove.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove team owner' }, { status: 400 });
    }

    // Remove member from team
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('team_id', teamId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Reset user profile: remove team_id, set role to employee, remove plan_id, cancel subscriptions
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        team_id: null,
        role: 'employee', // Remove admin privileges
        plan_id: null // Reset to free plan
      })
      .eq('id', memberToRemove.user_id);

    if (updateError) {
      console.error('Failed to reset user profile:', updateError);
      // Continue even if profile reset fails
    }

    // Cancel any active subscriptions for this user
    await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancel_at_period_end: false
      })
      .eq('user_id', memberToRemove.user_id)
      .eq('status', 'active');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const memberId = searchParams.get('memberId');

    if (!teamId || !memberId) {
      return NextResponse.json({ error: 'teamId and memberId are required' }, { status: 400 });
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

    // Check if user is team owner (only owners can promote members)
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember || teamMember.role !== 'owner') {
      return NextResponse.json({ error: 'Only team owners can promote members' }, { status: 403 });
    }

    // Get member to promote with user_id
    const { data: memberToPromote } = await supabase
      .from('team_members')
      .select('role, user_id')
      .eq('id', memberId)
      .eq('team_id', teamId)
      .single();

    if (!memberToPromote) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (memberToPromote.role === 'owner') {
      return NextResponse.json({ error: 'Team owner already has admin privileges' }, { status: 400 });
    }

    // Promote member to admin by updating their user role
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', memberToPromote.user_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Member promoted to admin successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

