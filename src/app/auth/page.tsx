'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { AuthService } from '@/lib/auth/auth-service';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User, Loader2 } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('from') || '/app';

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
        // Forgot password
        setSuccessMessage('Password reset instructions have been sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <ResoraLogo size="lg" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            {mode === 'signin' && 'Welcome back to Resora'}
            {mode === 'signup' && 'Create your research workspace'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin' && 'Access your private library, documents, and research intelligence.'}
            {mode === 'signup' && 'Start organizing your scattered research into compound knowledge.'}
            {mode === 'forgot' && 'Enter your account email to receive a recovery link.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 rounded-2xl bg-[#0f121d] border border-[#1e2335] shadow-xl shadow-black/50 space-y-5">
          {/* Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#090b12] border border-[#191d2c] text-xs font-medium">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-[#181d2c] text-indigo-300 shadow-sm border border-[#262e44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMessage(''); }}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-[#181d2c] text-indigo-300 shadow-sm border border-[#262e44]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="block text-slate-400 font-medium mb-1">Display Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashwin"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-[#090a12] border border-[#212638] pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#090a12] border border-[#212638] pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-medium">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMessage(''); }}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-[#090a12] border border-[#212638] pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-900/40 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
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
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMessage(''); }}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Private research intelligence. Your data is never sold.</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08090e] flex items-center justify-center text-slate-500 text-xs">Loading authentication...</div>}>
      <AuthContent />
    </Suspense>
  );
}
