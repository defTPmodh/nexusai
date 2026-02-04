import { getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const auth0Id = session.user.sub;

    // Try to get existing user
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth0_id', auth0Id)
      .single();

    // If user doesn't exist, create it
    if (error || !user) {
      // Check if this is the first user - make them admin
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          auth0_id: auth0Id,
          email: session.user.email || '',
          name: session.user.name || null,
          role: (count || 0) === 0 ? 'admin' : 'student', // First user is admin
        })
        .select()
        .single();

      if (createError || !newUser) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      user = newUser;
    }

    return NextResponse.json(user);
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

    const supabase = getSupabaseAdmin();
    const auth0Id = session.user.sub;

    const body = await request.json();
    const { name, phone, company, department, position, bio, avatar_url } = body;

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('auth0_id', auth0Id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        name: name || null,
        phone: phone || null,
        company: company || null,
        department: department || null,
        position: position || null,
        bio: bio || null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError || !updatedUser) {
      return NextResponse.json({ error: updateError?.message || 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

