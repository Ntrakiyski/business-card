import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /my-card route
  if (request.nextUrl.pathname.startsWith('/my-card')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Debug - Middleware /my-card check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      usernameExists: !!(profile && profile.username),
      shouldRedirect: !profile || !profile.username
    });

    if (!profile || !profile.username) {
      console.log('Debug - Redirecting to onboarding because:', { 
        noProfile: !profile, 
        noUsername: profile && !profile.username 
      });
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Protect onboarding route - redirect if already has username
  if (user && request.nextUrl.pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Debug - Onboarding route check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      usernameExists: !!(profile && profile.username),
      shouldRedirectToMyCard: !!(profile && profile.username)
    });

    if (profile?.username) {
      console.log('Debug - Redirecting from onboarding to my-card');
      return NextResponse.redirect(new URL('/my-card', request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    // Check if they've completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', user.id)
      .maybeSingle();

    console.log('Debug - Auth pages check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      usernameExists: !!(profile && profile.username),
      shouldRedirectToOnboarding: !profile || !profile.username,
      shouldRedirectToMyCard: profile && profile.username
    });

    if (!profile || !profile.username) {
      console.log('Debug - Redirecting to onboarding from auth pages');
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    console.log('Debug - Redirecting to my-card from auth pages');
    return NextResponse.redirect(new URL('/my-card', request.url));
  }

  // Require authentication for onboarding
  if (!user && request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/my-card/:path*', '/login', '/signup', '/onboarding'],
};
