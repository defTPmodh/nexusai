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

    // Get or create user (allow any authenticated user to upload)
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
          role: 'student',
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Check if OPENAI_API_KEY is set (required for RAG)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'RAG features are not configured. OPENAI_API_KEY environment variable is required for document processing.',
        hint: 'Please set OPENAI_API_KEY in your environment variables to enable document upload and RAG features.'
      }, { status: 503 });
    }

    // Dynamically import processPDF to avoid initialization errors
    const { processPDF } = await import('@/lib/rag/document-processing');
    const buffer = Buffer.from(await file.arrayBuffer());
    const documentId = await processPDF(buffer, file.name, user.id);

    return NextResponse.json({ documentId, filename: file.name });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to upload document',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

