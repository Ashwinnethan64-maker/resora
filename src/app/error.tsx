'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Resora Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Something went wrong
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Resora encountered an unexpected issue while loading this view. Your saved research and files remain safely intact.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-300 hover:text-white border border-[#23293c] transition-all text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
