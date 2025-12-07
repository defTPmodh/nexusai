import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/chat/sessions/[id] - Get a specific session with messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user with role
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';

    // Get session - admins can view any session, others only their own
    let sessionQuery = supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', params.id);

    if (!isAdmin) {
      sessionQuery = sessionQuery.eq('user_id', user.id);
    }

    const { data: chatSession, error: sessionError } = await sessionQuery.single();

    if (sessionError || !chatSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', params.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json({
      session: chatSession,
      messages: messages || [],
    });
  } catch (error: any) {
    console.error('Error in GET /api/chat/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/chat/sessions/[id] - Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user with role
    const { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = user.role === 'admin';

    // Build delete query - admins can delete any session, others only their own
    let deleteQuery = supabase
      .from('chat_sessions')
      .delete()
      .eq('id', params.id);

    if (!isAdmin) {
      deleteQuery = deleteQuery.eq('user_id', user.id);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error('Error deleting session:', deleteError);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /api/chat/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

