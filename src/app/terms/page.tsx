import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col antialiased">
      <header className="h-16 border-b border-[#1b1f2e] bg-[#0c0e16] px-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/">
          <ResoraLogo size="md" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8 flex-1">
        <div className="space-y-2 border-b border-[#1c2132] pb-6">
          <div className="inline-flex items-center gap-1.5 text-indigo-400 font-mono text-xs">
            <FileText className="w-3.5 h-3.5" />
            <span>COMMERCIAL AGREEMENT</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">1. Acceptance of Terms</h2>
            <p>
              By accessing or using RESORA ("the Service"), you agree to be bound by these Terms. The Service is provided for personal and professional research management and synthesis.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">2. Acceptable Use</h2>
            <p>
              You agree not to use the Service to capture or distribute unlawful material, attempt to compromise server infrastructure, perform unauthorized automated scraping against third-party sites, or inject malicious payloads into document extraction pipelines.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">3. Research Content & Intellectual Property</h2>
            <p>
              You retain all rights to your saved research notes, personal files, and original document uploads. Resora claims no intellectual property rights over external websites, papers, or tools indexed within your private workspaces.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
