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
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col items-center justify-center p-6 text-center antialiased selection:bg-[#FFD93D] selection:text-black">
      <div className="space-y-5 max-w-lg p-8 md:p-12 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]">
        <div className="w-12 h-12 bg-[#FF6B6B] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
          <AlertTriangle className="w-6 h-6 text-black stroke-[2.5]" />
        </div>
        <div className="inline-block bg-[#FFD93D] text-black px-4 py-1 border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
          APPLICATION ERROR
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black leading-tight">
          SOMETHING WENT WRONG.
        </h1>
        <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">
          Resora encountered an unexpected issue while loading this view. Your saved research and indexed files remain safely intact.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-neo w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-3 border-black shadow-[3px_3px_0px_0px_#000]"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
            <span>TRY AGAIN</span>
          </button>
          <Link
            href="/app"
            className="btn-neo w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs md:text-sm tracking-wider border-3 border-black shadow-[3px_3px_0px_0px_#000]"
          >
            <Home className="w-3.5 h-3.5 stroke-[3]" />
            <span>RETURN HOME</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
