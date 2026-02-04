import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, role = 'student', teamId } = body;

    if (!email || !teamId) {
      return NextResponse.json({ error: 'Email and teamId are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get current user
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is team owner/admin (only owners/admins can invite)
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember || (teamMember.role !== 'owner' && teamMember.role !== 'admin')) {
      return NextResponse.json({ error: 'Only classroom owners or admins can invite members' }, { status: 403 });
    }

    const allowedRoles = new Set(['teacher', 'student', 'guardian']);
    if (!allowedRoles.has(role)) {
      return NextResponse.json({ error: 'Invalid invitation role' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', existingUser.id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }
    }

    // Check team member limit
    const { data: team } = await supabase
      .from('teams')
      .select('max_members, member_count')
      .eq('id', teamId)
      .single();

    if (team && team.max_members && team.member_count >= team.max_members) {
      return NextResponse.json({ error: 'Team has reached maximum member limit' }, { status: 400 });
    }

    // Create invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('classroom_invitations')
      .insert({
        team_id: teamId,
        email,
        invited_by: currentUser.id,
        role,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: inviteError?.message || 'Failed to create invitation' }, { status: 500 });
    }

    // TODO: Send invitation email
    // For now, return the invitation token
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.token}`;

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expires_at,
        inviteUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

