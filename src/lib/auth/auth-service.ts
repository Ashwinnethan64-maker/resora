/**
 * RESORA Authentication Service
 * Production Supabase Auth with Google OAuth and resilient local session fallback.
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token?: string;
}

const LOCAL_STORAGE_USER_KEY = 'resora_auth_user_v1';
const LOCAL_STORAGE_SESSION_KEY = 'resora_auth_session_v1';

export const AuthService = {
  /**
   * Helper to map Supabase User to AuthUser
   */
  mapSupabaseUser(user: User): AuthUser {
    const meta = user.user_metadata || {};
    const fullName =
      meta.full_name ||
      meta.name ||
      (meta.first_name ? `${meta.first_name} ${meta.last_name || ''}`.trim() : '') ||
      user.email?.split('@')[0] ||
      'Researcher';

    return {
      id: user.id,
      email: user.email || '',
      name: fullName,
      avatar_url: meta.avatar_url || meta.picture || '',
      created_at: user.created_at,
    };
  },

  /**
   * Get current authenticated user (synchronous cached read)
   */
  getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // invalid JSON
      }
    }
    return null;
  },

  /**
   * Asynchronously get authenticated user from Supabase with local cache update
   */
  async fetchUser(): Promise<AuthUser | null> {
    if (typeof window === 'undefined') return null;

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!error && user) {
        const mapped = this.mapSupabaseUser(user);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
        // Remove logged out cookie
        document.cookie = 'resora_logged_out=; path=/; max-age=0';
        return mapped;
      }
    } catch (err) {
      console.warn('[AuthService] Fetching Supabase user notice:', err);
    }

    return this.getCurrentUser();
  },

  /**
   * Trigger Google OAuth Sign-In
   */
  async signInWithGoogle(redirectToPath = '/app'): Promise<{ error?: string }> {
    if (typeof window === 'undefined') return { error: 'Window not defined' };

    try {
      const supabase = getSupabaseBrowserClient();
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ||
        window.location.origin;

      const cleanOrigin = origin.replace(/\/+$/, '');
      const callbackUrl = `${cleanOrigin}/auth/callback?from=${encodeURIComponent(redirectToPath)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.url) {
        window.location.href = data.url;
      }

      return {};
    } catch (err: any) {
      return { error: err?.message || 'Failed to initialize Google authentication.' };
    }
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const supabase = getSupabaseBrowserClient();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // If Supabase authentication fails, check error
        throw error;
      }

      if (data.user) {
        const mapped = this.mapSupabaseUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
        document.cookie = `resora_session=${mapped.id}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = 'resora_logged_out=; path=/; max-age=0';
        return { user: mapped };
      }
    } catch (authErr: any) {
      // Re-throw genuine credentials errors
      throw authErr;
    }

    throw new Error('Sign in failed. Please verify credentials.');
  },

  /**
   * Sign Up with Name, Email & Password
   */
  async signUp(name: string, email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const mapped = this.mapSupabaseUser(data.user);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
      document.cookie = `resora_session=${mapped.id}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = 'resora_logged_out=; path=/; max-age=0';
      return { user: mapped };
    }

    throw new Error('Sign up failed.');
  },

  /**
   * Update current user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const supabase = getSupabaseBrowserClient();
    try {
      if (updates.name) {
        await supabase.auth.updateUser({
          data: { full_name: updates.name },
        });
      }
    } catch (e) {
      console.warn('[AuthService] Supabase updateUser notice:', e);
    }

    const current = this.getCurrentUser();
    const updated: AuthUser = {
      ...current,
      ...updates,
      id: current?.id || 'usr_local',
      email: updates.email || current?.email || '',
      name: updates.name || current?.name || 'Researcher',
      created_at: current?.created_at || new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    }
    return updated;
  },

  /**
   * Complete Sign Out Everywhere
   */
  async signOut(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthService] Supabase signOut notice:', err);
    }

    // Clear client-side user and conversation caches
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    localStorage.removeItem('resora_ai_conversations_v1');
    localStorage.removeItem('resora_ai_messages_v1');
    localStorage.removeItem('resora_ai_jobs_v1');

    // Set cookie markers
    document.cookie = 'resora_session=; path=/; max-age=0';
    document.cookie = 'resora_logged_out=true; path=/; max-age=604800; SameSite=Lax';
  },
};
