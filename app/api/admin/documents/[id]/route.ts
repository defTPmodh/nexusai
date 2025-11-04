import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';

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

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth0_id', session.user.sub)
      .single();

    // If user doesn't exist, create them
    if (userError || !user) {
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
        return NextResponse.json({ 
          error: 'Failed to create user account',
          details: createError?.message 
        }, { status: 500 });
      }
      user = newUser;
    }

    // Check if document exists and user has permission
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Admins can delete any document, users can only delete their own
    if (user.role !== 'admin' && document.user_id !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own documents' }, { status: 403 });
    }

    // Delete document (cascades to chunks)
    const { error } = await supabase.from('documents').delete().eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

