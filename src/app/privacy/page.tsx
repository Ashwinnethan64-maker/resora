import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            <span>TRANSPARENCY & DATA PRIVACY</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">1. Private by Default</h2>
            <p>
              Resora is designed for personal research intelligence. Your saved bookmarks, articles, notes, PDFs, and project workspaces belong exclusively to you. We do not sell your personal data or index your research for third-party advertising.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">2. AI Intelligence & External Providers</h2>
            <p>
              When you trigger AI synthesis, metadata extraction, or document indexing, text excerpts are passed to configured AI providers (e.g. OpenAI) strictly for inference and grounding. Content is never used to train generalized foundation models without your explicit consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">3. Document & Storage Security</h2>
            <p>
              Uploaded research files (PDFs, text files, and markdown documents) are stored in private storage containers secured with Row-Level Security (RLS) policies tied directly to your authenticated user account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-100">4. Data Portability & Deletion</h2>
            <p>
              You maintain full ownership of your research. At any point, you can export your entire database in JSON or CSV format, or permanently purge your account and associated vectors through the Settings panel.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
