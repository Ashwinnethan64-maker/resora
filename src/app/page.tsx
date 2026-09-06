import React from 'react';
import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { NeoSticker, NeoBadge } from '@/components/brand/NeoSticker';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Bookmark,
  Layers,
  FileText,
  Terminal,
  Check
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col antialiased selection:bg-[#FFD93D] selection:text-black">
      
      {/* Navigation Header */}
      <header className="h-20 border-b-4 border-black bg-white sticky top-0 z-40 px-4 md:px-8 max-w-7xl mx-auto w-full flex items-center justify-between shadow-[0px_4px_0px_0px_#000]">
        <Link href="/" className="flex items-center">
          <ResoraLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="btn-neo text-xs md:text-sm font-black uppercase tracking-wider text-black px-4 py-2.5 border-2 border-black bg-white hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000] hidden sm:inline-block"
          >
            ENTER WORKSPACE
          </Link>
          <Link
            href="/app"
            className="btn-neo flex items-center gap-2 px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
          >
            <span>LAUNCH RESORA</span>
            <ArrowRight className="w-4 h-4 stroke-[3px]" />
          </Link>
        </div>
      </header>

      {/* ============================================================ */}
      {/* HERO SECTION: MASSIVE NEO-BRUTALIST BULLETIN COMPOSITION */}
      {/* ============================================================ */}
      <section className="px-4 md:px-8 pt-10 pb-16 max-w-7xl mx-auto w-full">
        <div className="border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* LEFT 65%: GIANT SPACE GROTESK DISPLAY TYPOGRAPHY */}
            <div className="lg:col-span-8 p-6 sm:p-10 md:p-14 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-[#FFFDF5] relative">
              
              {/* Tape sticker overlay */}
              <div className="absolute -top-3 right-8 bg-[#FFD93D] text-black px-4 py-1 border-2 border-black font-black text-xs uppercase tracking-widest rotate-2 shadow-[2px_2px_0px_0px_#000] z-20">
                ★ RESEARCH INTELLIGENCE 2026
              </div>

              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-6 shadow-[3px_3px_0px_0px_#000] -rotate-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] border border-black" />
                  PERSONAL RESEARCH INTELLIGENCE
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-black leading-none">
                  SAVE IT.<br />
                  <span className="text-[#FF6B6B] inline-block -rotate-1">UNDERSTAND</span><br />
                  IT.<br />
                  <span className="bg-[#C4B5FD] text-black px-3 py-1 inline-block border-4 border-black shadow-[6px_6px_0px_0px_#000] mt-2 rotate-1">
                    USE IT.
                  </span>
                </h1>

                <p className="text-base sm:text-lg font-bold text-black mt-8 max-w-2xl leading-relaxed">
                  A high-velocity, Neo-Brutalist research workspace. Capture complex websites, GitHub repositories, PDFs, and developer tools. Synthesize them into structured physical dossier cards.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-10">
                <Link
                  href="/app"
                  className="btn-neo flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-sm md:text-base tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000]"
                >
                  <span>OPEN YOUR ARCHIVE →</span>
                </Link>
                <a
                  href="#system-engine"
                  className="btn-neo flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000]"
                >
                  HOW IT WORKS ↓
                </a>
              </div>
            </div>

            {/* RIGHT 35%: STACKED RESEARCH DOSSIER BULLETIN */}
            <div className="lg:col-span-4 bg-[#FFD93D] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b-4 border-black">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                  INDEX DOSSIER #001
                </span>
                <span className="text-xs font-mono font-black bg-white text-black px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  LIVE SYSTEM
                </span>
              </div>

              {/* Physical Research Card Mockup Stack */}
              <div className="my-8 space-y-4">
                {/* Pinned Card 1 */}
                <div className="p-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] -rotate-2 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black bg-[#FF6B6B] text-black px-2 py-0.5 border border-black uppercase">
                      AI ENGINE
                    </span>
                    <span className="text-[10px] font-mono font-bold text-black">98% CONFIDENCE</span>
                  </div>
                  <h4 className="text-sm font-black uppercase text-black">DEEP RESEARCH SYNTHESIS</h4>
                  <p className="text-xs text-black font-medium mt-1 line-clamp-2">
                    Extract key points, production use cases, and tech stack tags automatically.
                  </p>
                </div>

                {/* Pinned Card 2 */}
                <div className="p-4 bg-[#C4B5FD] border-4 border-black shadow-[6px_6px_0px_0px_#000] rotate-2 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black bg-white text-black px-2 py-0.5 border border-black uppercase">
                      PDF & PAPERS
                    </span>
                    <span className="text-[10px] font-mono font-bold text-black">PAGE-LEVEL RAG</span>
                  </div>
                  <h4 className="text-sm font-black uppercase text-black">GROUNDED CITATIONS</h4>
                  <p className="text-xs text-black font-medium mt-1 line-clamp-2">
                    Inspect exact page numbers and quotes from uploaded documents.
                  </p>
                </div>
              </div>

              {/* Core Philosophy Box */}
              <div className="p-4 bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_#000]">
                <div className="text-[10px] font-mono font-black uppercase bg-[#FF6B6B] text-black px-2 py-0.5 border border-black w-max">
                  ARCHIVE CREED
                </div>
                <div className="text-lg font-black uppercase mt-1 leading-tight">
                  "CONTROLLED CHAOS. ZERO HALLUCINATIONS."
                </div>
                <div className="text-xs font-bold text-black mt-1">
                  Zero fake glowing gradients. Thick 4px borders. Solid tactile feedback.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: 4-STEP RESEARCH LIFECYCLE (COLOR BLOCKED) */}
      {/* ============================================================ */}
      <section id="system-engine" className="py-14 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="border-b-4 border-black pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-black uppercase tracking-widest bg-[#FFD93D] px-2 py-0.5 border border-black w-max mb-2">
              SYSTEM MECHANISM
            </div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black">
              THE RESEARCH ENGINE.
            </h2>
          </div>
          <span className="text-xs font-mono font-black uppercase text-black bg-[#C4B5FD] px-3 py-1 border-2 border-black">
            CONTINUOUS GROUNDED INTELLIGENCE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* STEP 1: CAPTURE */}
          <div className="card-neo p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-none bg-[#FF6B6B] text-black border-4 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-lg mb-4 -rotate-3">
                01
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black">CAPTURE</h3>
              <p className="text-xs md:text-sm font-medium text-black mt-3 leading-relaxed">
                Ingest web links, code repositories, whitepapers, and developer tools into your raw inbox immediately.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black text-xs font-mono font-black text-black uppercase bg-[#FFFDF5] px-2 py-1 border border-black">
              INPUT: URL / PDF / FILE
            </div>
          </div>

          {/* STEP 2: UNDERSTAND */}
          <div className="card-neo p-6 bg-[#C4B5FD] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-none bg-white text-black border-4 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-lg mb-4 rotate-2">
                02
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black">UNDERSTAND</h3>
              <p className="text-xs md:text-sm font-medium text-black mt-3 leading-relaxed">
                Resora synthesizes facts, target frameworks, and operational use cases with zero hallucinated fluff.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black text-xs font-mono font-black text-black uppercase bg-white px-2 py-1 border border-black">
              DOSSIER: WHAT / BEST FOR / SPECS
            </div>
          </div>

          {/* STEP 3: ORGANIZE */}
          <div className="card-neo p-6 bg-[#FFD93D] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-none bg-black text-white border-4 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-lg mb-4 -rotate-2">
                03
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black">ORGANIZE</h3>
              <p className="text-xs md:text-sm font-medium text-black mt-3 leading-relaxed">
                Group assets into focused project workspaces, multi-project cross-links, and curated stacks.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black text-xs font-mono font-black text-black uppercase bg-[#FFFDF5] px-2 py-1 border border-black">
              STRUCTURE: PROJECTS & STACKS
            </div>
          </div>

          {/* STEP 4: USE */}
          <div className="card-neo p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-none bg-[#FF6B6B] text-black border-4 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-black text-lg mb-4 rotate-3">
                04
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider text-black">USE</h3>
              <p className="text-xs md:text-sm font-medium text-black mt-3 leading-relaxed">
                Retrieve with sub-second ⌘K command search or launch the Ask Resora research terminal with verified citations.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t-2 border-black text-xs font-mono font-black text-black uppercase bg-[#FFFDF5] px-2 py-1 border border-black">
              OUTPUT: CITATIONS & ACTIONS
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FINAL CALL TO ACTION BANNER (HOT RED & YELLOW) */}
      {/* ============================================================ */}
      <section className="px-4 md:px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="p-8 sm:p-14 bg-[#FFD93D] text-black border-4 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-3 max-w-xl relative z-10">
            <span className="bg-[#FF6B6B] text-black text-xs font-black uppercase px-2 py-0.5 border border-black -rotate-1 inline-block">
              READY FOR LAUNCH
            </span>
            <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter leading-none text-black">
              BUILD YOUR PERSONAL RESEARCH INTELLIGENCE.
            </h2>
            <p className="text-sm sm:text-base font-bold text-black">
              Transform chaotic browser bookmarks into an engineered, tactile personal intelligence system.
            </p>
          </div>

          <Link
            href="/app"
            className="btn-neo px-8 py-5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-sm sm:text-base tracking-wider shadow-[6px_6px_0px_0px_#000] flex items-center justify-center gap-3 shrink-0 relative z-10"
          >
            <span>ENTER RESORA NOW</span>
            <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* STARK BLACK NEO-BRUTALIST FOOTER */}
      {/* ============================================================ */}
      <footer className="mt-auto border-t-4 border-black bg-black text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <ResoraLogo size="sm" showTagline={false} />
            <span className="font-mono font-bold text-[#FFD93D] uppercase">
              — PERSONAL RESEARCH INTELLIGENCE
            </span>
          </div>
          <div className="flex items-center gap-6 font-black uppercase tracking-wider text-white">
            <Link href="/app" className="hover:text-[#FFD93D] transition-colors">WORKSPACE</Link>
            <Link href="/app/library" className="hover:text-[#FFD93D] transition-colors">LIBRARY</Link>
            <Link href="/app/assistant" className="hover:text-[#FFD93D] transition-colors">ASK RESORA</Link>
            <Link href="/app/projects" className="hover:text-[#FFD93D] transition-colors">PROJECTS</Link>
            <Link href="/app/settings" className="hover:text-[#FFD93D] transition-colors">SETTINGS</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
