import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase SSR session synchronization & route protection middleware
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use supabase.auth.getSession() in middleware as it is insecure (unverified token).
  // Always use getUser() to securely validate the JWT against Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect private application routes (/app and subpaths)
  if (pathname.startsWith('/app')) {
    // Check both Supabase Auth user and legacy fallback cookie (for offline resilience)
    const hasLegacySession = request.cookies.get('resora_session')?.value;
    const isExplicitlyLoggedOut = request.cookies.get('resora_logged_out')?.value;

    if (!user && !hasLegacySession) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    if (isExplicitlyLoggedOut && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and navigating to /auth, redirect to /app
  if (pathname === '/auth' && user) {
    const from = request.nextUrl.searchParams.get('from') || '/app';
    const url = request.nextUrl.clone();
    url.pathname = from;
    url.searchParams.delete('from');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
