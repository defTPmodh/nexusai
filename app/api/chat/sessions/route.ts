import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

// GET /api/chat/sessions - List all chat sessions for the user
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user with role
    let { data: user } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: session.user.sub,
          email: session.user.email || '',
          name: session.user.name || null,
          role: 'employee',
        })
        .select('id, role')
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      user = newUser;
    }

    const isAdmin = user.role === 'admin';

    // Get all sessions - admins see all, others see only their own
    let query = supabase
      .from('chat_sessions')
      .select(`
        id,
        title,
        model_id,
        created_at,
        updated_at,
        user_id,
        users:user_id (
          id,
          email,
          name
        ),
        llm_models:model_id (
          display_name
        )
      `)
      .order('updated_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: sessions, error: sessionsError } = await query;

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Get message counts for each session
    const sessionsWithCounts = await Promise.all(
      (sessions || []).map(async (session) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

        // Get first message for preview
        const { data: firstMessage } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .single();

        return {
          ...session,
          message_count: count || 0,
          preview: firstMessage?.content?.substring(0, 100) || null,
          model_name: (session.llm_models as any)?.display_name || null,
          user_email: (session.users as any)?.email || null,
          user_name: (session.users as any)?.name || null,
          is_own_session: session.user_id === user.id,
        };
      })
    );

    return NextResponse.json({ 
      sessions: sessionsWithCounts,
      isAdmin,
      total_count: sessionsWithCounts.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/chat/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

