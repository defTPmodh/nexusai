import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';


// Force dynamic rendering since we use cookies (getSession)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const session = await getSession();
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Invalid invitation token' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('classroom_invitations')
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        team_id,
        team:teams (
          id,
          name,
          plan:plans (
            display_name
          )
        )
      `)
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation has already been used or expired' }, { status: 400 });
    }

    if (new Date(invitation.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('classroom_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // If user is logged in, check if email matches
    if (session?.user) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('id, email, team_id')
        .eq('auth0_id', session.user.sub)
        .single();

      if (currentUser && currentUser.email.toLowerCase() === invitation.email.toLowerCase()) {
        // User can accept immediately
        return NextResponse.json({
          invitation,
          canAccept: true,
          userEmail: currentUser.email,
        });
      }
    }

    return NextResponse.json({
      invitation,
      canAccept: false,
      requiresLogin: !session?.user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = params;

    const supabase = getSupabaseAdmin();

    // Get invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('classroom_invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Get or create current user
    let { data: currentUser } = await supabase
      .from('users')
      .select('id, email, team_id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    // If user doesn't exist, create them
    if (!currentUser) {
      // Check if user with email already exists (shouldn't happen, but safety check)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email, team_id, role')
        .eq('email', session.user.email || '')
        .single();

      if (existingUser) {
        // Update auth0_id if missing
        await supabase
          .from('users')
          .update({ auth0_id: session.user.sub })
          .eq('id', existingUser.id);
        currentUser = existingUser;
      } else {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            auth0_id: session.user.sub,
            email: session.user.email || '',
            name: session.user.name || null,
            role: invitation.role || 'student', // Default role from invite
          })
          .select('id, email, team_id, role')
          .single();

        if (createError || !newUser) {
          console.error('Failed to create user:', createError);
          return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
        }

        currentUser = newUser;
      }
    }

    // Verify email matches
    if (currentUser.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({ error: 'Invitation email does not match your account' }, { status: 403 });
    }

    // Check if already expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('classroom_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Check if user already belongs to a team
    if ((currentUser as any).team_id && (currentUser as any).team_id !== invitation.team_id) {
      return NextResponse.json({ error: 'You already belong to another team' }, { status: 400 });
    }

    // Add user to team
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: currentUser.id,
        role: 'member',
      });

    if (memberError) {
      // Check if already a member
      if (memberError.code === '23505') {
        // Update invitation status
        await supabase
          .from('classroom_invitations')
          .update({ status: 'accepted', accepted_at: new Date().toISOString() })
          .eq('id', invitation.id);

        return NextResponse.json({ error: 'You are already a team member' }, { status: 400 });
      }
      return NextResponse.json({ error: memberError.message }, { status: 500 });
    }

    // Update user's team_id
    await supabase
      .from('users')
      .update({ team_id: invitation.team_id, role: currentUser.role === 'admin' ? currentUser.role : invitation.role })
      .eq('id', currentUser.id);

    // Update invitation status
    await supabase
      .from('classroom_invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return NextResponse.json({ success: true, teamId: invitation.team_id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

