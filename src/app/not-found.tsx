import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { Search, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4 max-w-md">
        <div className="flex justify-center">
          <ResoraLogo size="md" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          That research doesn't exist
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          The resource, document, or project workspace you're looking for may have been moved, deleted, or never indexed.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Workspace</span>
          </Link>
          <Link
            href="/app/library"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-300 hover:text-white border border-[#23293c] transition-all text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse Library</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
