import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const from = searchParams.get('from') || searchParams.get('next') || '/app';
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('[Auth Callback] Provider error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Validate redirect destination to avoid open redirect vulnerabilities
      const isRelative = from.startsWith('/') && !from.startsWith('//');
      const finalUrl = isRelative ? `${origin}${from}` : `${origin}/app`;
      const response = NextResponse.redirect(finalUrl);

      // Clear any previous logged-out marker
      response.cookies.delete('resora_logged_out');
      return response;
    } else {
      console.error('[Auth Callback] Code exchange failed:', exchangeError.message);
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('Failed to complete Google authentication. Please try again.')}`);
    }
  }

  // No code found, return to auth
  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('Authentication code missing or expired.')}`);
}
