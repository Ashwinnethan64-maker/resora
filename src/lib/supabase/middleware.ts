import { NextResponse, type NextRequest } from 'next/server';

/**
 * Session verification & route protection middleware
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get('resora_session')?.value);
  const isExplicitlyLoggedOut = Boolean(request.cookies.get('resora_logged_out')?.value);

  // Check if this request is returning from an external OAuth provider redirect
  // Firebase Auth redirect URLs often contain apiKey, state, mode, or oauth parameters
  const isOAuthCallback =
    request.nextUrl.searchParams.has('apiKey') ||
    request.nextUrl.searchParams.has('state') ||
    request.nextUrl.searchParams.has('mode') ||
    request.nextUrl.searchParams.has('oobCode');

  // Protect private application routes (/app and subpaths)
  if (pathname.startsWith('/app')) {
    // If returning from OAuth redirect, allow request through to client-side AppLayout guard
    // so Firebase getRedirectResult / onAuthStateChanged can restore the session and set cookies
    if (isOAuthCallback) {
      return response;
    }

    if (!hasSession || isExplicitlyLoggedOut) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and navigating to /auth, redirect to /app (unless logging out)
  if (pathname === '/auth' && hasSession && !isExplicitlyLoggedOut && !isOAuthCallback) {
    const from = request.nextUrl.searchParams.get('from') || '/app';
    const url = request.nextUrl.clone();
    url.pathname = from;
    url.searchParams.delete('from');
    return NextResponse.redirect(url);
  }

  return response;
}
