import React from 'react';
import Link from 'next/link';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import { NeoSticker } from '@/components/brand/NeoSticker';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Bookmark,
  Layers,
  FileText,
  Terminal,
  Check,
  Code2,
  FolderKanban,
  Search,
  CheckCircle2,
  Lock,
  Database,
  ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col antialiased selection:bg-[#FFD93D] selection:text-black">
      
      {/* Navigation Header */}
      <header className="h-18 border-b-3 border-black bg-white sticky top-0 z-40 px-4 sm:px-8 w-full flex items-center justify-between shadow-[0px_2px_0px_0px_#000]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <ResoraLogo size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="text-xs md:text-sm font-bold uppercase tracking-wider text-black px-4 py-2 border-2 border-black bg-white hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000] hidden sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="btn-neo flex items-center gap-2 px-5 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000]"
            >
              <span>ENTER RESORA</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* SECTION 1: SOPHISTICATED HERO COMPOSITION */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 pt-10 pb-16 max-w-7xl mx-auto w-full">
        <div className="border-3 border-black bg-white shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* LEFT 60%: EDITORIAL HEADLINE & STORYTELLING */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-b-3 lg:border-b-0 lg:border-r-3 border-black bg-[#FFFDF5]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B6B] border border-black" />
                  PERSONAL RESEARCH INTELLIGENCE
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-black leading-none">
                  SAVE IT.<br />
                  <span className="text-[#FF6B6B]">UNDERSTAND</span> IT.<br />
                  <span className="bg-[#FFD93D] text-black px-2 py-0.5 inline-block border-2 border-black mt-2">
                    USE IT.
                  </span>
                </h1>

                <p className="text-base sm:text-lg font-bold text-black mt-6 max-w-xl leading-snug">
                  Your personal intelligence layer for everything you discover online.
                </p>

                <p className="text-xs sm:text-sm text-black/75 mt-3 max-w-xl leading-relaxed font-normal">
                  Capture websites, tools, papers, documents, tutorials, and research. RESORA understands what you saved, connects it to your work, and helps you retrieve it when it matters.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-8">
                <Link
                  href="/app"
                  className="btn-neo flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs sm:text-sm tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000]"
                >
                  <span>ENTER RESORA →</span>
                </Link>
                <a
                  href="#engine-flow"
                  className="btn-neo flex items-center justify-center gap-2 px-5 py-3.5 bg-white hover:bg-[#FFFDF5] text-black font-bold uppercase text-xs sm:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000]"
                >
                  SEE HOW IT WORKS ↓
                </a>
              </div>
            </div>

            {/* RIGHT 40%: LIVE RESEARCH INTELLIGENCE VISUALIZATION */}
            <div className="lg:col-span-5 bg-[#FFFDF5] p-6 sm:p-8 flex flex-col justify-between border-t-3 lg:border-t-0 border-black bg-grid-paper relative">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse"></span>
                  LIVE INTELLIGENCE GRAPH
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#FFD93D] text-black px-2 py-0.5 border border-black uppercase">
                  NVIDIA NEMOTRON
                </span>
              </div>

              {/* Research Intelligence Connected Cards */}
              <div className="my-6 space-y-3 relative">
                {/* Node 1: AI Tool */}
                <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span className="bg-[#FFD93D] px-1.5 py-0.2 border border-black uppercase">AI TOOL</span>
                    <span className="text-black/60">kilo.ai</span>
                  </div>
                  <div className="text-xs font-bold text-black">Autonomous Coding Engine</div>
                  <div className="text-[11px] text-black/70 mt-0.5 line-clamp-1">Extracted: agentic pair programming, CLI workflow</div>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center text-black font-mono text-xs font-black">
                  ↓ <span className="text-[10px] px-2 bg-white border border-black ml-1">AI UNDERSTANDING & TAXONOMY</span>
                </div>

                {/* Node 2: PDF Paper */}
                <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span className="bg-[#C4B5FD] px-1.5 py-0.2 border border-black uppercase">RESEARCH PDF</span>
                    <span className="text-black/60">arxiv.org</span>
                  </div>
                  <div className="text-xs font-bold text-black">Compound AI Systems (Page 4 cited)</div>
                  <div className="text-[11px] text-black/70 mt-0.5 line-clamp-1">Extracted: state machines, deterministic verification</div>
                </div>

                {/* Arrow connector */}
                <div className="flex justify-center text-black font-mono text-xs font-black">
                  ↓ <span className="text-[10px] px-2 bg-[#FFD93D] border border-black ml-1">GROUNDED IN ACTIVE PROJECT</span>
                </div>

                {/* Node 3: Project Workspace */}
                <div className="p-3.5 bg-[#FFFDF5] border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1">
                    <span className="bg-[#FF6B6B] px-1.5 py-0.2 border border-black uppercase">ACTIVE PROJECT</span>
                    <span className="text-emerald-700 font-bold">READY TO BUILD</span>
                  </div>
                  <div className="text-xs font-bold text-black">AI Campus Assistant (Hackathon 2026)</div>
                  <div className="text-[11px] text-black/70 mt-0.5">2 tools & 1 paper linked with grounded recommendations</div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between text-[11px] font-mono text-black/70">
                <span>Total Index: 18 Assets</span>
                <span className="font-bold text-black">100% Grounded</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 01: THE PROBLEM (EXPLAIN THE CHAOS) */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-14 max-w-7xl mx-auto w-full border-t-3 border-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FF6B6B] text-black px-2 py-1 border border-black">
              SECTION 01 · THE PROBLEM
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
              YOUR RESEARCH<br />IS EVERYWHERE.
            </h2>
            <p className="text-sm text-black/80 font-normal leading-relaxed">
              Every day you discover high-value tools, architectural blueprints, and articles across the web. Within 48 hours, they disappear into a fragmented graveyard of tabs and folders.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Browser Bookmarks', note: 'Unsearchable lists' },
              { label: 'Random PDFs', note: 'Buried in Downloads' },
              { label: 'GitHub Stars', note: 'Forgotten repos' },
              { label: 'Mobile Screenshots', note: 'Lost in camera roll' },
              { label: 'AI Tool Bookmarks', note: 'Context vanishes' },
              { label: 'Google Docs & Briefs', note: 'Disconnected files' },
            ].map((c) => (
              <div key={c.label} className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <div className="text-xs font-bold text-black">{c.label}</div>
                <div className="text-[11px] font-mono text-black/60 mt-1">{c.note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 02: THE RESORA ENGINE (6-STEP LIFECYCLE) */}
      {/* ============================================================ */}
      <section id="engine-flow" className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t-3 border-black bg-white shadow-[0px_4px_0px_0px_#000]">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FFD93D] text-black px-2.5 py-1 border border-black">
            SECTION 02 · ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mt-3">
            THE RESORA ENGINE.
          </h2>
          <p className="text-xs sm:text-sm text-black/70 mt-2 font-normal">
            From fragmented raw URLs to grounded project execution.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              title: 'CAPTURE',
              color: 'bg-[#FF6B6B]',
              desc: 'One-click ingestion from browsers, bookmarklets, document uploads, or manual links.',
            },
            {
              step: '02',
              title: 'UNDERSTAND',
              color: 'bg-[#FFD93D]',
              desc: 'NVIDIA Nemotron extracts summaries, use cases, key technical points, and developer tags.',
            },
            {
              step: '03',
              title: 'ORGANIZE',
              color: 'bg-[#C4B5FD]',
              desc: 'Triage incoming discoveries in the Inbox before committing to your permanent library.',
            },
            {
              step: '04',
              title: 'CONNECT',
              color: 'bg-white',
              desc: 'Link resources into Project Workspaces with explainable AI match recommendations.',
            },
            {
              step: '05',
              title: 'RETRIEVE',
              color: 'bg-[#FFD93D]',
              desc: 'Ask Resora queries your personal library with verifiable page-level citations.',
            },
            {
              step: '06',
              title: 'USE',
              color: 'bg-[#FF6B6B]',
              desc: 'Deploy code, cite whitepapers, and build projects with zero research amnesia.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 bg-[#FFFDF5] border-2 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-mono font-black px-2 py-0.5 border border-black ${item.color}`}>
                    STEP {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-black uppercase text-black tracking-tight">{item.title}</h3>
                <p className="text-xs text-black/75 mt-2 leading-relaxed font-normal">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 03: INTELLIGENCE, NOT BOOKMARKS */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t-3 border-black">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#C4B5FD] text-black px-2 py-1 border border-black">
              SECTION 03 · DIFFERENTIATION
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
              INTELLIGENCE,<br />NOT BOOKMARKS.
            </h2>
            <p className="text-sm text-black/80 font-normal leading-relaxed">
              Bookmarks store URLs. Resora understands content. Every item you save receives a structured dossier so you immediately recall why you saved it months later.
            </p>
          </div>

          <div className="lg:col-span-7 bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-[#FFFDF5] border-2 border-black space-y-1.5">
                <div className="text-[11px] font-mono font-black text-black uppercase bg-[#FFD93D] px-1.5 py-0.2 w-max border border-black">
                  WHAT IT IS
                </div>
                <div className="text-xs text-black font-normal">
                  One clear, factual sentence answering what the resource does without marketing fluff.
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF5] border-2 border-black space-y-1.5">
                <div className="text-[11px] font-mono font-black text-black uppercase bg-[#FF6B6B] px-1.5 py-0.2 w-max border border-black">
                  BEST FOR
                </div>
                <div className="text-xs text-black font-normal">
                  Concrete developer applications: "AI agent testing", "System design reference", "Rapid MVP".
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF5] border-2 border-black space-y-1.5">
                <div className="text-[11px] font-mono font-black text-black uppercase bg-[#C4B5FD] px-1.5 py-0.2 w-max border border-black">
                  WHEN TO USE IT
                </div>
                <div className="text-xs text-black font-normal">
                  Identifies specific project phases: "Architecture & Planning", "Hackathon sprints", "Production review".
                </div>
              </div>

              <div className="p-4 bg-[#FFFDF5] border-2 border-black space-y-1.5">
                <div className="text-[11px] font-mono font-black text-black uppercase bg-white px-1.5 py-0.2 w-max border border-black">
                  WHAT IT CONNECTS TO
                </div>
                <div className="text-xs text-black font-normal">
                  Automatic link discovery to your active projects and matching documents in your library.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 04: ASK RESORA RESEARCH CONSOLE PREVIEW */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t-3 border-black bg-white shadow-[0px_4px_0px_0px_#000]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FFD93D] text-black px-2.5 py-1 border border-black">
              SECTION 04 · FLAGSHIP ASSISTANT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
              ASK RESORA.
            </h2>
            <p className="text-xs sm:text-sm text-black/70 font-normal">
              A private research console connected directly to your personal archive.
            </p>
          </div>

          {/* Interactive Simulation Card */}
          <div className="border-3 border-black bg-[#FFFDF5] p-5 sm:p-7 shadow-[6px_6px_0px_#000] space-y-4">
            {/* User Question */}
            <div className="flex items-start gap-3 bg-white p-3.5 border-2 border-black shadow-[2px_2px_0px_#000]">
              <span className="text-xs font-mono font-bold bg-[#FFD93D] px-2 py-0.5 border border-black">YOU</span>
              <div className="text-xs sm:text-sm font-bold text-black">
                "What resources in my library can help me build an autonomous AI coding agent?"
              </div>
            </div>

            {/* Assistant Answer with citations */}
            <div className="bg-white p-4 sm:p-5 border-2 border-black shadow-[3px_3px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-black text-black">
                <span className="bg-[#FF6B6B] px-2 py-0.5 border border-black">RESORA AI</span>
                <span className="text-black/60">Grounded across 3 sources</span>
              </div>
              <p className="text-xs sm:text-sm text-black/85 leading-relaxed font-normal">
                Based on your saved research in <strong>Library</strong>, you have 2 tools and 1 research paper covering agent architecture:
              </p>
              <ul className="text-xs text-black/85 space-y-2 font-normal pl-4 list-disc">
                <li>
                  <strong>[Source 1] Cline</strong>: An autonomous coding agent in your IDE capable of running shell commands directly.
                </li>
                <li>
                  <strong>[Source 2] Kilo AI</strong>: Real-time pair programming tool designed for rapid hackathon iteration.
                </li>
                <li>
                  <strong>[Source 3] Compound AI Systems (Page 4)</strong>: Detailed paper analyzing task decomposition and state verification.
                </li>
              </ul>

              {/* Citations bar */}
              <div className="pt-3 border-t border-black/10 flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 bg-[#FFFDF5] border border-black font-bold">Source 1: github.com/cline</span>
                <span className="px-2 py-0.5 bg-[#FFFDF5] border border-black font-bold">Source 2: kilo.ai</span>
                <span className="px-2 py-0.5 bg-[#FFFDF5] border border-black font-bold">Source 3: arxiv.org (p.4)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 05: BUILT FOR REAL WORK */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto w-full border-t-3 border-black">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FF6B6B] text-black px-2.5 py-1 border border-black">
            SECTION 05 · USE CASES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black mt-3">
            BUILT FOR REAL WORK.
          </h2>
          <p className="text-xs sm:text-sm text-black/70 mt-2 font-normal">
            Designed for engineers, founders, researchers, and creators who learn in public and build fast.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'HACKATHONS', desc: 'Rapid 48h sprint reference & tech stacks', bg: 'bg-[#FFD93D]' },
            { title: 'STARTUPS', desc: 'Competitor dossiers & architecture notes', bg: 'bg-[#FF6B6B]' },
            { title: 'RESEARCH', desc: 'Paper citations with page-aware extraction', bg: 'bg-[#C4B5FD]' },
            { title: 'ENGINEERING', desc: 'GitHub repos, APIs, and SDK documentation', bg: 'bg-white' },
          ].map((u) => (
            <div key={u.title} className="p-4 sm:p-5 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
              <div className={`text-xs font-mono font-black px-2 py-0.5 border border-black w-max ${u.bg} mb-2`}>
                {u.title}
              </div>
              <p className="text-xs text-black/70 font-normal leading-snug">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 06: FINAL CTA */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-20 max-w-7xl mx-auto w-full border-t-3 border-black text-center bg-[#FFFDF5]">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-black leading-none">
            STOP LOSING<br />WHAT YOU LEARN.
          </h2>
          <p className="text-sm sm:text-base text-black/80 font-bold max-w-lg mx-auto">
            Build your personal research intelligence system with zero friction.
          </p>

          <div className="pt-4">
            <Link
              href="/app"
              className="btn-neo inline-flex items-center gap-2 px-8 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-sm md:text-base tracking-wider border-3 border-black shadow-[6px_6px_0px_0px_#000]"
            >
              <span>ENTER RESORA →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION: FOLLOW THE BUILD (PROJECT & CREATOR LINKS) */}
      {/* ============================================================ */}
      <section className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full border-t-3 border-black bg-[#FFFDF5]">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black uppercase tracking-wider bg-[#FFD93D] text-black px-2 py-0.5 border border-black">
              FOLLOW THE BUILD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub Card */}
            <a
              href="https://github.com/Ashwinnethan64-maker/resora.git"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open RESORA GitHub repository"
              className="group p-4 sm:p-5 bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all duration-150 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-black shrink-0"
                    >
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span className="font-mono text-sm font-black uppercase text-black tracking-tight">
                      GITHUB
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-black/75 font-normal leading-relaxed">
                  View the RESORA source repository
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between text-xs font-mono font-bold text-black group-hover:text-[#FF6B6B] transition-colors">
                <span>View source →</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#FFFDF5] border border-black text-black">
                  Open Source
                </span>
              </div>
            </a>

            {/* LinkedIn Card */}
            <a
              href="https://www.linkedin.com/in/ashwin-nethan-a59259366/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Ashwin Nethan LinkedIn profile"
              className="group p-4 sm:p-5 bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all duration-150 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 fill-black shrink-0"
                    >
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66z" />
                    </svg>
                    <span className="font-mono text-sm font-black uppercase text-black tracking-tight">
                      LINKEDIN
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-black/75 font-normal leading-relaxed">
                  Connect with the creator
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-black/15 flex items-center justify-between text-xs font-mono font-bold text-black group-hover:text-[#FF6B6B] transition-colors">
                <span>Connect / Profile →</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#FFFDF5] border border-black text-black">
                  Creator
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-3 border-black bg-white py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-bold text-black">
          <ResoraLogo size="sm" variant="compact" />
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
            <span>•</span>
            <span>RESORA v1.0 © 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
