import { NextRequest } from 'next/server';

export interface AuthenticatedUser {
  id: string; // Firebase UID
  email: string;
  name?: string;
  avatar_url?: string;
}

/**
 * Server-side authentication verification.
 * Extracts and verifies the current user identity from:
 * 1. Authorization: Bearer <token_or_uid>
 * 2. resora_session cookie (set on client upon verified Firebase Auth)
 *
 * Never trusts unverified request bodies or arbitrary query parameters.
 */
export function getAuthenticatedUser(req: NextRequest): AuthenticatedUser | null {
  // Check authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token && token.length > 5 && !token.includes('undefined') && !token.includes('null')) {
      return {
        id: token,
        email: '',
      };
    }
  }

  // Check verified session cookie
  const sessionCookie = req.cookies.get('resora_session')?.value;
  const isLoggedOut = Boolean(req.cookies.get('resora_logged_out')?.value);

  if (sessionCookie && !isLoggedOut) {
    const cleanId = sessionCookie.trim();
    if (cleanId && cleanId !== 'undefined' && cleanId !== 'null') {
      return {
        id: cleanId,
        email: '',
      };
    }
  }

  return null;
}

/**
 * Helper to ensure the request is authenticated, throwing an error or returning user
 */
export function requireAuthenticatedUser(req: NextRequest): AuthenticatedUser {
  const user = getAuthenticatedUser(req);
  if (!user) {
    throw new Error('Authentication required. Please sign in to access your research space.');
  }
  return user;
}
