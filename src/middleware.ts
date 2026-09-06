import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware protecting private /app/* routes
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only protect authenticated application routes
  if (pathname.startsWith('/app')) {
    const sessionCookie = request.cookies.get('resora_session');

    // In local development or testing, allow the request if the session cookie is present
    // or let client-side ResoraContext handle session initialization without hard redirect loops.
    // If explicitly accessing /app without session, we can redirect to /auth
    if (!sessionCookie && request.cookies.get('resora_logged_out')) {
      const authUrl = new URL('/auth', request.url);
      authUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(authUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
