/**
 * RESORA Authentication Service
 * Production Firebase Authentication with Google Sign-In and resilient session synchronization.
 */

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase';

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

let redirectResultPromise: Promise<{ user?: AuthUser; error?: string }> | null = null;

export const AuthService = {
  /**
   * Helper to write authentication cookies synchronously
   */
  setAuthCookies(userId: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `resora_session=${encodeURIComponent(userId)}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = 'resora_logged_out=; path=/; max-age=0; SameSite=Lax';
  },

  /**
   * Helper to clear authentication cookies synchronously
   */
  clearAuthCookies(): void {
    if (typeof document === 'undefined') return;
    document.cookie = 'resora_session=; path=/; max-age=0; SameSite=Lax';
    document.cookie = 'resora_logged_out=true; path=/; max-age=604800; SameSite=Lax';
  },

  /**
   * Check if the specific authenticated user has completed the onboarding tour
   */
  isOnboardingCompleted(userId?: string): boolean {
    if (typeof window === 'undefined') return true;
    const uid = userId || this.getCurrentUser()?.id;
    if (!uid) return true;
    return localStorage.getItem(`resora_onboarding_completed_${uid}`) === 'true';
  },

  /**
   * Mark onboarding tour as completed for this specific authenticated user
   */
  async setOnboardingCompleted(userId?: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const uid = userId || this.getCurrentUser()?.id;
    if (!uid) return;
    localStorage.setItem(`resora_onboarding_completed_${uid}`, 'true');

    // Optionally persist to profiles table in Supabase if column exists
    if (supabase && uid !== 'usr_local') {
      try {
        await supabase.from('profiles').update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }).eq('firebase_uid', uid);
      } catch {
        // Non-blocking
      }
    }
  },

  /**
   * Reset onboarding tour for this specific authenticated user (allows replaying tour from Settings)
   */
  async resetOnboarding(userId?: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const uid = userId || this.getCurrentUser()?.id;
    if (!uid) return;
    localStorage.removeItem(`resora_onboarding_completed_${uid}`);

    if (supabase && uid !== 'usr_local') {
      try {
        await supabase.from('profiles').update({
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        }).eq('firebase_uid', uid);
      } catch {
        // Non-blocking
      }
    }
  },

  /**
   * Upsert user profile to Supabase database for persistent identity
   */
  async syncProfileToDatabase(user: AuthUser): Promise<void> {
    if (!supabase || !user.id || user.id === 'usr_local') return;
    try {
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          firebase_uid: user.id,
          email: user.email,
          display_name: user.name,
          avatar_url: user.avatar_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'firebase_uid' }
      );
    } catch (e) {
      // Non-blocking in case table is not yet migrated or offline
    }
  },

  /**
   * Helper to map Firebase User to AuthUser
   */
  mapFirebaseUser(user: FirebaseUser): AuthUser {
    const fullName =
      user.displayName ||
      user.email?.split('@')[0] ||
      'Researcher';

    return {
      id: user.uid,
      email: user.email || '',
      name: fullName,
      avatar_url: user.photoURL || '',
      created_at: user.metadata.creationTime || new Date().toISOString(),
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
   * Fetch current user and sync session markers
   */
  async fetchUser(): Promise<AuthUser | null> {
    if (typeof window === 'undefined') return null;

    if (auth.currentUser) {
      const mapped = this.mapFirebaseUser(auth.currentUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
      this.setAuthCookies(mapped.id);
      return mapped;
    }

    return this.getCurrentUser();
  },

  /**
   * Handle redirect result when returning from OAuth redirect on mobile.
   * Memoized as a singleton promise so concurrent calls (ResoraContext & AuthPage)
   * both resolve the exact same Firebase result.
   */
  async handleRedirectResult(): Promise<{ user?: AuthUser; error?: string }> {
    if (typeof window === 'undefined') return {};

    if (redirectResultPromise) {
      return redirectResultPromise;
    }

    redirectResultPromise = (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const mapped = this.mapFirebaseUser(result.user);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
          this.setAuthCookies(mapped.id);
          sessionStorage.removeItem('resora_auth_pending_redirect');

          // Sync to Supabase in background
          this.syncProfileToDatabase(mapped).catch(() => {});

          return { user: mapped };
        }
        return {};
      } catch (err: any) {
        console.error('[AuthService] handleRedirectResult error:', err);
        sessionStorage.removeItem('resora_auth_pending_redirect');
        const code = err?.code || '';
        let message = 'Failed to complete Google Sign In.';

        if (code === 'auth/unauthorized-domain') {
          message = 'Domain not authorized in Firebase Console. Please add your domain to Authorized Domains.';
        } else if (code === 'auth/network-request-failed') {
          message = 'Network error during sign-in. Please check your internet connection.';
        } else if (err?.message) {
          message = err.message;
        }

        return { error: message };
      }
    })();

    return redirectResultPromise;
  },

  /**
   * Trigger Google Sign-In via Firebase
   */
  async signInWithGoogle(returnUrl: string = '/app'): Promise<{ user?: AuthUser; error?: string; code?: string }> {
    if (typeof window === 'undefined') return { error: 'Window not defined' };

    try {
      // Check if mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // Set pending redirect marker in sessionStorage and clear logged out cookie
        sessionStorage.setItem('resora_auth_pending_redirect', returnUrl);
        document.cookie = 'resora_logged_out=; path=/; max-age=0; SameSite=Lax';
        await signInWithRedirect(auth, googleProvider);
        return {};
      }

      const result = await signInWithPopup(auth, googleProvider);
      const mapped = this.mapFirebaseUser(result.user);

      // Store in cache & cookie
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
      this.setAuthCookies(mapped.id);

      // Sync profile
      this.syncProfileToDatabase(mapped).catch(() => {});

      return { user: mapped };
    } catch (err: any) {
      console.error('[AuthService] Firebase Google Sign-In error:', err);
      sessionStorage.removeItem('resora_auth_pending_redirect');
      const code = err?.code || '';
      let message = 'Failed to complete Google Sign In. Please try again.';

      if (code === 'auth/popup-closed-by-user') {
        message = 'Sign-in cancelled. The authentication window was closed.';
      } else if (code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups for this site.';
      } else if (code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized in Firebase Console. Please add your domain to Authorized Domains.';
      } else if (code === 'auth/network-request-failed') {
        message = 'Network error during sign-in. Please check your internet connection.';
      } else if (err?.message) {
        message = err.message;
      }

      return { error: message, code };
    }
  },

  /**
   * Sign In with Email & Password
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const mapped = this.mapFirebaseUser(result.user);

      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
      this.setAuthCookies(mapped.id);

      return { user: mapped };
    } catch (authErr: any) {
      const code = authErr?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        throw new Error('Invalid email or password. Please verify credentials.');
      } else if (code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later or reset password.');
      }
      throw authErr;
    }
  },

  /**
   * Sign Up with Name, Email & Password
   */
  async signUp(name: string, email: string, password: string): Promise<{ user: AuthUser; error?: string }> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const result = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    if (name.trim()) {
      try {
        await firebaseUpdateProfile(result.user, { displayName: name.trim() });
      } catch {}
    }

    const mapped = this.mapFirebaseUser(result.user);
    mapped.name = name.trim() || mapped.name;

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mapped));
    this.setAuthCookies(mapped.id);

    return { user: mapped };
  },

  /**
   * Send Password Reset Email
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!email) throw new Error('Email is required');
    await sendPasswordResetEmail(auth, email.trim().toLowerCase());
  },

  /**
   * Update current user profile
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    if (auth.currentUser && updates.name) {
      try {
        await firebaseUpdateProfile(auth.currentUser, { displayName: updates.name });
      } catch (e) {
        console.warn('[AuthService] Firebase updateProfile notice:', e);
      }
    }

    const current = this.getCurrentUser();
    const updated: AuthUser = {
      ...current,
      ...updates,
      id: current?.id || auth.currentUser?.uid || 'usr_local',
      email: updates.email || current?.email || auth.currentUser?.email || '',
      name: updates.name || current?.name || auth.currentUser?.displayName || 'Researcher',
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

    redirectResultPromise = null;
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('[AuthService] Firebase signOut notice:', err);
    }

    // Clear client-side user and conversation caches
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    localStorage.removeItem('resora_ai_conversations_v1');
    localStorage.removeItem('resora_ai_messages_v1');
    localStorage.removeItem('resora_ai_jobs_v1');
    sessionStorage.removeItem('resora_auth_pending_redirect');

    // Set cookie markers
    this.clearAuthCookies();
  },
};
