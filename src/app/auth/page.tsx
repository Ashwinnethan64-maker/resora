'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { AuthService } from '@/lib/auth/auth-service';
import { ArrowRight, ShieldCheck, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/app';
  const urlError = searchParams.get('error');

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(urlError || '');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (urlError) {
      setErrorMessage(urlError);
    }
  }, [urlError]);

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setErrorMessage('');
    setIsGoogleLoading(true);

    try {
      const res = await AuthService.signInWithGoogle(redirectTo);
      if (res.error) {
        setErrorMessage(res.error);
        setIsGoogleLoading(false);
      }
      // Browser redirects to Google OAuth consent page
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize Google Sign In.');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await AuthService.signIn(email, password);
        router.push(redirectTo);
      } else if (mode === 'signup') {
        await AuthService.signUp(name, email, password);
        router.push('/app?onboarding=true');
      } else {
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col justify-center items-center px-4 py-12 selection:bg-[#FFD93D] selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <ResoraLogo size="lg" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-black">
            {mode === 'signin' && 'Welcome back to Resora'}
            {mode === 'signup' && 'Create your workspace'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black">
            {mode === 'signin' && 'Access your private library, documents, and research intelligence.'}
            {mode === 'signup' && 'Start organizing your scattered research into compound knowledge.'}
            {mode === 'forgot' && 'Enter your account email to receive a recovery link.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] space-y-5">
          {/* PRIMARY: CONTINUE WITH GOOGLE */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
                className="btn-neo w-full py-3.5 px-4 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[5px_5px_0px_0px_#000] flex items-center justify-center gap-3 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                    <span>CONTINUE WITH GOOGLE</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t-2 border-black w-full" />
                <span className="bg-white px-3 font-mono text-[10px] font-black uppercase text-black/60 relative">
                  OR USE EMAIL
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-none bg-[#FFFDF5] border-2 border-black text-xs font-black uppercase">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className={`py-2 transition-all ${
                  mode === 'signin'
                    ? 'bg-[#FFD93D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(''); }}
                className={`py-2 transition-all ${
                  mode === 'signup'
                    ? 'bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'text-black/60 hover:text-black'
                }`}
              >
                SIGN UP
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-[#FF6B6B] border-2 border-black text-black font-bold text-xs shadow-[3px_3px_0px_0px_#000] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              <div>
                <div className="font-black uppercase text-[11px]">AUTHENTICATION NOTICE</div>
                <div className="text-xs mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#FFD93D] border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_0px_#000]">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-black font-black uppercase text-xs mb-1">DISPLAY NAME</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-black stroke-[2.5px]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashwin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-none bg-[#FFFDF5] border-4 border-black pl-9 pr-3 py-2.5 text-black font-black uppercase focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-black font-black uppercase text-xs mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-black stroke-[2.5px]" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black pl-9 pr-3 py-2.5 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-black font-black uppercase text-xs">PASSWORD</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(''); }}
                      className="text-[11px] font-black uppercase text-black hover:underline"
                    >
                      FORGOT?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-black stroke-[2.5px]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-none bg-[#FFFDF5] border-4 border-black pl-9 pr-3 py-2.5 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="btn-neo w-full py-3.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase tracking-wider text-xs md:text-sm border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to Workspace'}
                    {mode === 'signup' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className="text-xs font-black uppercase text-black hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-black">
          <ShieldCheck className="w-4 h-4 text-black stroke-[2.5px]" />
          <span>Private research intelligence. Your data is never sold.</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center text-black font-mono text-xs">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
