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

    if (!currentUser.team_id) {
      return NextResponse.json({ error: 'You are not a member of any team' }, { status: 400 });
    }

    // Get team member record
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role, team_id')
      .eq('team_id', currentUser.team_id)
      .eq('user_id', currentUser.id)
      .single();

    if (!teamMember) {
      return NextResponse.json({ error: 'Team member record not found' }, { status: 404 });
    }

    // Don't allow owner to leave (they need to transfer ownership or delete team)
    if (teamMember.role === 'owner') {
      return NextResponse.json({ 
        error: 'Team owners cannot leave the team. Please transfer ownership or cancel the subscription.',
      }, { status: 400 });
    }

    // Remove user from team
    const { error: removeError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamMember.team_id)
      .eq('user_id', currentUser.id);

    if (removeError) {
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }

    // Update user's team_id to null
    const { error: updateError } = await supabase
      .from('users')
      .update({ team_id: null })
      .eq('id', currentUser.id);

    if (updateError) {
      console.error('Failed to update user team_id:', updateError);
      // Don't fail the request, member was already removed
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully left the team'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

