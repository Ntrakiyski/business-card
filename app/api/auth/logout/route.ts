import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      return NextResponse.json({ error: 'Could not log out' }, { status: 500 });
    }

    // Return a response that redirects to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}