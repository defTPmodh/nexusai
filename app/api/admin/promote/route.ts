import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';


// Force dynamic rendering since we use cookies (getSession)
export const dynamic = 'force-dynamic';

// Quick endpoint to promote user to admin for testing
// In production, this should be protected and only accessible by existing admins
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const auth0Id = session.user.sub;

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, role, email')
      .eq('auth0_id', auth0Id)
      .single();

    // If user doesn't exist, create them as admin
    if (userError || !user) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: auth0Id,
          email: session.user.email || '',
          name: session.user.name || null,
          role: 'admin', // Always create as admin via this endpoint
        })
        .select()
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: createError?.message || 'Failed to create user' }, { status: 500 });
      }

      return NextResponse.json({ 
        message: 'User created as admin',
        user: newUser 
      });
    }

    // Update existing user role to admin
    const { data: updated, error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Successfully promoted to admin',
      user: updated 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support GET for easy browser access
export async function GET(request: NextRequest) {
  return POST(request);
}

