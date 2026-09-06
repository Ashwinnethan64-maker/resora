import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { Search, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col items-center justify-center p-6 text-center antialiased selection:bg-[#FFD93D] selection:text-black">
      <div className="space-y-6 max-w-lg p-8 md:p-12 bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000]">
        <div className="flex justify-center">
          <ResoraLogo size="md" />
        </div>
        
        <div className="inline-block bg-[#FF6B6B] text-black px-4 py-1 border-2 border-black font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] -rotate-2">
          ERROR 404
        </div>

        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none">
          WRONG<br />
          PAGE.
        </h1>

        <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">
          The resource, document dossier, or project workspace you're looking for was moved, deleted, or never indexed into the research archive.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app"
            className="btn-neo w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
          >
            <Home className="w-4 h-4 stroke-[3px]" />
            <span>RETURN TO WORKSPACE →</span>
          </Link>
          <Link
            href="/app/library"
            className="btn-neo w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3px]" />
            <span>BROWSE LIBRARY</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
