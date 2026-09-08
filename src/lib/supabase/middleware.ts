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

  // Protect private application routes (/app and subpaths)
  if (pathname.startsWith('/app')) {
    if (!hasSession || isExplicitlyLoggedOut) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated and navigating to /auth, redirect to /app
  if (pathname === '/auth' && hasSession && !isExplicitlyLoggedOut) {
    const from = request.nextUrl.searchParams.get('from') || '/app';
    const url = request.nextUrl.clone();
    url.pathname = from;
    url.searchParams.delete('from');
    return NextResponse.redirect(url);
  }

  return response;
}
