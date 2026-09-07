'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Workspace route error:', error);
  }, [error]);

  return (
    <div className="p-6 sm:p-12 max-w-2xl mx-auto my-12 bg-white border-4 border-black shadow-[8px_8px_0px_#000] text-center space-y-5">
      <div className="w-12 h-12 bg-[#FF6B6B] border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_#000]">
        <AlertTriangle className="w-6 h-6 text-black stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FFD93D] px-2 py-0.5 border border-black">
          WHAT HAPPENED
        </span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-black pt-2">
          Unable to Load Workspace Section
        </h1>
        <p className="text-xs sm:text-sm text-black/75 max-w-md mx-auto font-normal">
          An unexpected error occurred while rendering this workspace route. Your underlying database records and files remain securely intact.
        </p>
      </div>

      <div className="pt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="btn-neo flex items-center gap-2 px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>TRY AGAIN</span>
        </button>
        <Link
          href="/app"
          className="btn-neo flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FFD93D] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_#000]"
        >
          <Home className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>RETURN HOME</span>
        </Link>
      </div>
    </div>
  );
}