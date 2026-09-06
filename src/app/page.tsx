import React from 'react';
import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import {
  ArrowRight,
  Sparkles,
  Search,
  Layers,
  Brain,
  Bookmark,
  Shield,
  Zap,
  CheckCircle2,
  FolderKanban,
  FileText,
  Code2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation Header */}
      <header className="h-16 border-b border-[#1b1f2e] bg-[#0c0e16]/80 backdrop-blur-md sticky top-0 z-40 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <ResoraLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#161a27] transition-colors"
          >
            Open App
          </Link>
          <Link
            href="/app"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-all active:scale-95"
          >
            <span>Start building library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 md:pt-28 md:pb-24 max-w-5xl mx-auto text-center space-y-6">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Research Intelligence Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.12]">
          Save it. Understand it.{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
            Use it.
          </span>
        </h1>

        {/* Supporting Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Save websites, tools, documents, ideas, and resources. Resora organizes everything around what you're building.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/app"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-xl shadow-indigo-900/40 transition-all active:scale-95"
          >
            <span>Start building your library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#131622] hover:bg-[#1a1f30] text-slate-300 hover:text-white border border-[#23293c] transition-all text-sm font-medium"
          >
            Explore how it works
          </a>
        </div>

        {/* Polished Product Mock Preview */}
        <div className="pt-10 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-[#23293e] bg-[#0e111a] p-3 sm:p-4 shadow-2xl shadow-indigo-950/40">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1c2234] px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a3148]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a3148]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a3148]"></div>
              </div>
              <div className="font-mono text-[11px] text-slate-500 bg-[#161a26] px-3 py-0.5 rounded-md border border-[#23283a]">
                resora.app / workspace
              </div>
              <div className="text-[10px] text-indigo-400 font-mono">LIVE PREVIEW</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-[#121522] border border-[#1e2436] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>AI Tool</span>
                  <span className="text-emerald-400">Captured</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">Kilo AI Assistant</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  Autonomous coding companion with real-time pair programming.
                </div>
                <div className="pt-1 text-[10px] font-mono text-indigo-400">#Hackathon #Coding</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121522] border border-[#1e2436] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>PDF / Research</span>
                  <span className="text-sky-400">Synthesized</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">AI Agents 2026 Architecture</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  Comprehensive study on stateful agent coordination and buffers.
                </div>
                <div className="pt-1 text-[10px] font-mono text-indigo-400">#Research #Agents</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121522] border border-[#1e2436] space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Developer Tool</span>
                  <span className="text-violet-400">Active</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">Cline CLI Agent</div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  Autonomous coding agent in IDE with shell execution authority.
                </div>
                <div className="pt-1 text-[10px] font-mono text-indigo-400">#Automation #Terminal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section: Capture, Understand, Organize, Use */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            A continuous loop for research intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Designed to replace unstructured browser tabs, lost bookmarks, and scattered notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 font-mono text-xs font-bold mb-3">
              01
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Capture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Snag web apps, GitHub repos, technical whitepapers, and CLI tools instantly into your raw inbox.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold mb-3">
              02
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Understand</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract semantic purpose, target frameworks, and practical use cases without manual tagging slog.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold mb-3">
              03
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Organize</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Group into project workspaces, thematic stacks, and high-velocity collections tailored to your build.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2434] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 font-mono text-xs font-bold mb-3">
              04
            </div>
            <h3 className="text-sm font-semibold text-slate-200">Use</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Retrieve with sub-second ⌘K fuzzy search and seamless external launcher links whenever you're coding.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1a1f2e] bg-[#0c0e15] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ResoraLogo size="sm" showTagline={false} />
            <span>— Personal Research Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/app" className="hover:text-slate-300">Dashboard</Link>
            <Link href="/app/library" className="hover:text-slate-300">Library</Link>
            <Link href="/app/projects" className="hover:text-slate-300">Projects</Link>
            <Link href="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
