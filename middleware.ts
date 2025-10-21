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

  let user = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;
  } catch (error) {
    // If there's an auth error, continue without user
    console.warn('Auth error in middleware (likely expired session):', error);
    user = null;
  }

  // Protect /my-card route
  if (request.nextUrl.pathname.startsWith('/my-card')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Debug - Middleware /my-card check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      onboardingCompleted: !!(profile && profile.onboarding_completed)
    });

    if (!profile || !profile.onboarding_completed) {
      console.log('Debug - Redirecting to onboarding because:', { 
        noProfile: !profile, 
        notCompleted: profile && !profile.onboarding_completed 
      });
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Protect /home route
  if (request.nextUrl.pathname.startsWith('/home')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!profile || !profile.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Protect /create-card routes
  if (request.nextUrl.pathname.startsWith('/create-card')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect onboarding route - redirect if already completed onboarding
  if (user && request.nextUrl.pathname.startsWith('/onboarding')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Debug - Onboarding route check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      onboardingCompleted: !!(profile && profile.onboarding_completed),
      shouldRedirectToHome: !!(profile && profile.onboarding_completed)
    });

    if (profile?.onboarding_completed) {
      console.log('Debug - Redirecting from onboarding to home');
      return NextResponse.redirect(new URL('/home', request.url));
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
      .select('id, username, onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    console.log('Debug - Auth pages check:', { 
      userId: user?.id, 
      profile, 
      pathname: request.nextUrl.pathname,
      profileExists: !!profile,
      onboardingCompleted: !!(profile && profile.onboarding_completed),
      shouldRedirectToOnboarding: !profile || !profile.onboarding_completed,
      shouldRedirectToHome: profile && profile.onboarding_completed
    });

    if (!profile || !profile.onboarding_completed) {
      console.log('Debug - Redirecting to onboarding from auth pages');
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    console.log('Debug - Redirecting to home from auth pages');
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Require authentication for onboarding
  if (!user && request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/my-card/:path*', '/home', '/create-card/:path*', '/login', '/signup', '/onboarding'],
};
