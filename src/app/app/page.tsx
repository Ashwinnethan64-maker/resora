'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { NeoSticker } from '@/components/brand/NeoSticker';
import {
  Plus,
  ArrowRight,
  Brain,
  Code2,
  Flame,
  Layers,
  FileSpreadsheet,
  GraduationCap,
  Clock,
  Compass
} from 'lucide-react';

const QUICK_ACCESS_ITEMS = [
  { id: 'qa-1', title: 'AI DEV', topic: 'AI', icon: Brain, bg: 'bg-[#FFD93D]', rotate: '-1', route: '/app/library?topic=AI' },
  { id: 'qa-2', title: 'DEV TOOLS', topic: 'Coding', icon: Code2, bg: 'bg-[#C4B5FD]', rotate: '1', route: '/app/tools' },
  { id: 'qa-3', title: 'HACKATHONS', topic: 'Hackathon', icon: Flame, bg: 'bg-[#FF6B6B]', rotate: '-2', route: '/app/projects' },
  { id: 'qa-4', title: 'UI / DESIGN', topic: 'Design', icon: Layers, bg: 'bg-[#FFFFFF]', rotate: '2', route: '/app/library?topic=Design' },
  { id: 'qa-5', title: 'RESEARCH', topic: 'Research', icon: FileSpreadsheet, bg: 'bg-[#FFD93D]', rotate: '-1', route: '/app/documents' },
  { id: 'qa-6', title: 'LEARNING', topic: 'Learning', icon: GraduationCap, bg: 'bg-[#C4B5FD]', rotate: '1', route: '/app/collections' },
];

function AppHomeContent() {
  const searchParams = useSearchParams();
  const { resources, metrics, isLoading, openSaveModal } = useResora();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('onboarding') === 'true') {
      setIsOnboardingOpen(true);
    }
  }, [searchParams]);

  const recentResources = resources.slice(0, 6);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-100">
      
      {/* ============================================================ */}
      {/* SECTION 1: NEO-BRUTALIST HERO COMMAND CENTER (60/40 ASYMMETRIC) */}
      {/* ============================================================ */}
      <section className="relative border-4 border-black bg-white shadow-[12px_12px_0px_0px_#000] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
          
          {/* LEFT 60%: LOUD OVERSIZED TYPOGRAPHY & RESEARCH STATEMENT */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-black bg-white z-10">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <NeoSticker color="yellow" rotate="-1">
                  PERSONAL RESEARCH INTELLIGENCE
                </NeoSticker>
                <NeoSticker color="violet" rotate="1" size="sm">
                  LIVE 2026
                </NeoSticker>
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-black leading-[0.88]">
                YOUR<br />
                RESEARCH<br />
                <span className="text-[#FF6B6B] underline decoration-8 decoration-black">IS WAITING.</span>
              </h1>

              <p className="text-sm md:text-base font-black text-black/80 mt-6 max-w-lg leading-relaxed">
                Save what matters. Understand what you saved. Use it when it counts. A tactile research bulletin board engineered for creative builders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-8">
              <button
                onClick={openSaveModal}
                className="btn-neo px-6 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-xs md:text-sm tracking-wider shadow-[6px_6px_0px_0px_#000] flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ CAPTURE TO ARCHIVE</span>
              </button>
              
              <Link
                href="/app/assistant"
                className="btn-neo px-6 py-4 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-4 border-black font-black uppercase text-xs md:text-sm tracking-wider shadow-[6px_6px_0px_0px_#000] flex items-center gap-2"
              >
                <Compass className="w-4 h-4 stroke-[3]" />
                <span>QUERY RESEARCH</span>
              </Link>
            </div>
          </div>

          {/* RIGHT 40%: STACKED STICKER LAB COMPOSITION WITH HALFTONE PATTERN */}
          <div className="lg:col-span-5 relative bg-[#FFFDF5] p-6 md:p-8 flex flex-col justify-between overflow-hidden bg-halftone">
            {/* Top Tape Header */}
            <div className="relative z-10 flex items-center justify-between pb-3 border-b-4 border-black">
              <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
                BULLETIN INDEX
              </span>
              <span className="text-xs font-mono font-black bg-[#C4B5FD] text-black px-2 py-0.5 border-2 border-black">
                STATUS: SYNCED
              </span>
            </div>

            {/* Overlapping Sticker Cards (Controlled Chaos) */}
            <div className="relative z-10 my-6 flex flex-col items-center justify-center gap-3">
              <div className="w-full bg-[#FFD93D] border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] -rotate-2">
                <div className="text-[10px] font-mono font-black uppercase text-black">ACTIVE DOSSIERS</div>
                <div className="text-3xl font-black uppercase text-black leading-none mt-1">
                  {metrics.total} ITEMS SAVED
                </div>
              </div>

              <div className="w-full bg-[#C4B5FD] border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] rotate-1">
                <div className="text-[10px] font-mono font-black uppercase text-black">INBOX QUEUE</div>
                <div className="text-2xl font-black uppercase text-black leading-none mt-1">
                  {metrics.inbox} PENDING TRIAGE
                </div>
              </div>
            </div>

            {/* Bottom Statement Box */}
            <div className="relative z-10 p-4 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000]">
              <div className="text-[10px] font-mono font-black uppercase text-black/60">
                SYSTEM MOTTO
              </div>
              <div className="text-lg font-black uppercase text-black leading-tight mt-0.5">
                "NO FLUFF. PURE INTELLIGENCE."
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: HARD STATISTIC BLOCKS (SOLID 8PX SHADOWS) */}
      {/* ============================================================ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* BLOCK 1: CREAM / YELLOW STICKER */}
        <div className="card-neo relative p-6 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70">
              RESOURCES
            </span>
            <NeoSticker color="yellow" size="sm" rotate="-2">ALL</NeoSticker>
          </div>
          <div className="text-5xl md:text-6xl font-black text-black my-4 leading-none tracking-tight">
            {metrics.total}
          </div>
          <div className="text-[11px] font-mono font-black uppercase text-black/60">
            {metrics.favorites} FAVORITED
          </div>
        </div>

        {/* BLOCK 2: HOT RED BLOCK */}
        <div className="card-neo relative p-6 bg-[#FF6B6B] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              UNDERSTOOD
            </span>
            <NeoSticker color="white" size="sm" rotate="1">AI</NeoSticker>
          </div>
          <div className="text-5xl md:text-6xl font-black text-black my-4 leading-none tracking-tight">
            {metrics.analyzed}
          </div>
          <div className="text-[11px] font-mono font-black uppercase text-black/80">
            FACTUAL DOSSIERS
          </div>
        </div>

        {/* BLOCK 3: VIVID YELLOW BLOCK */}
        <div className="card-neo relative p-6 bg-[#FFD93D] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              PROJECTS
            </span>
            <NeoSticker color="black" size="sm" rotate="-1">ACTIVE</NeoSticker>
          </div>
          <div className="text-5xl md:text-6xl font-black text-black my-4 leading-none tracking-tight">
            {metrics.projects}
          </div>
          <div className="text-[11px] font-mono font-black uppercase text-black/80">
            ACTIVE WORKSPACES
          </div>
        </div>

        {/* BLOCK 4: SOFT VIOLET BLOCK */}
        <div className="card-neo relative p-6 bg-[#C4B5FD] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black">
              COLLECTIONS
            </span>
            <NeoSticker color="yellow" size="sm" rotate="2">STACKS</NeoSticker>
          </div>
          <div className="text-5xl md:text-6xl font-black text-black my-4 leading-none tracking-tight">
            {metrics.collections}
          </div>
          <div className="text-[11px] font-mono font-black uppercase text-black/80">
            THEMATIC CLUSTERS
          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 3: QUICK ACCESS (RESEARCH BULLETIN TILES) */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-4 border-black">
          <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#FF6B6B] border-2 border-black rotate-45" />
            RESEARCH DIRECTORY
          </h2>
          <span className="text-xs font-mono font-black uppercase text-black/60">
            THEMATIC ROUTING
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {QUICK_ACCESS_ITEMS.map((item) => {
            const Icon = item.icon;
            const topicCount = resources.filter((r) =>
              r.tags?.some((t) => t.toLowerCase() === item.topic.toLowerCase())
            ).length;

            return (
              <Link
                key={item.id}
                href={item.route}
                className={`card-neo p-4 ${item.bg} border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between min-h-[120px]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Icon className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-black">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono font-black text-black/70 mt-0.5 uppercase">
                    {topicCount > 0 ? `${topicCount} SAVED` : 'BROWSE'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: RECENT RESEARCH CARDS */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-4 border-black">
          <div>
            <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-black flex items-center gap-2">
              <Clock className="w-4 h-4 stroke-[3]" />
              RECENTLY INGESTED RESEARCH
            </h2>
            <p className="text-xs font-black text-black/60 mt-0.5 uppercase">
              LIVE PERSISTED INDEX CARDS
            </p>
          </div>
          <Link
            href="/app/library"
            className="btn-neo px-4 py-2 bg-white hover:bg-[#FFD93D] text-black border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
          >
            VIEW ARCHIVE ({metrics.total}) →
          </Link>
        </div>

        {isLoading ? (
          <ResourceSkeleton count={6} />
        ) : recentResources.length === 0 ? (
          <div className="p-10 border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] text-center">
            <h3 className="text-2xl font-black uppercase text-black">NO RESEARCH INGESTED YET</h3>
            <p className="text-xs font-bold text-black/70 mt-1 mb-4">Click below to capture and analyze your first live link or file.</p>
            <button
              onClick={openSaveModal}
              className="btn-neo px-6 py-3 bg-[#FF6B6B] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
            >
              + CAPTURE RESOURCE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: INBOX TRIAGE & AI SYNTHESIS PANELS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* INBOX ACTION PANEL: HOT RED */}
        <section className="lg:col-span-5 p-6 md:p-8 bg-[#FF6B6B] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-4 border-black">
              <div className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black" />
                UNPROCESSED INBOX
              </div>
              <span className="text-xs font-mono font-black bg-white text-black px-2 py-0.5 border-2 border-black">
                {metrics.inbox} ITEMS
              </span>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-5 leading-none">
              RAW CAPTURES AWAITING REVIEW.
            </h3>
            
            <p className="text-xs font-bold text-black/90 mt-3 leading-relaxed">
              Items saved directly via quick capture need project tag assignment and AI dossier verification.
            </p>
          </div>

          <Link
            href="/app/inbox"
            className="btn-neo mt-6 w-full py-3.5 bg-white hover:bg-[#FFD93D] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2"
          >
            <span>TRIAGE INBOX NOW</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </section>

        {/* AI SYNTHESIS PANEL: CREAM WHITE */}
        <section className="lg:col-span-7 p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-4 border-black">
              <div className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-2">
                <Brain className="w-4 h-4 stroke-[3]" />
                SYNTHESIZED TOPIC CLUSTERS
              </div>
              <span className="text-xs font-mono font-black bg-[#FFD93D] text-black px-2 py-0.5 border-2 border-black">
                {metrics.analyzed} ANALYZED
              </span>
            </div>

            <div className="mt-5">
              <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black/70 mb-2.5">
                DISCOVERED RESEARCH TOPICS:
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.discoveredTopics.length > 0 ? (
                  metrics.discoveredTopics.map((top, idx) => (
                    <span
                      key={top}
                      className={`px-3 py-1 font-black text-xs uppercase tracking-wide border-2 border-black shadow-[2px_2px_0px_#000] ${
                        idx % 3 === 0 ? 'bg-[#FFD93D]' : idx % 3 === 1 ? 'bg-[#C4B5FD]' : 'bg-[#FF6B6B]'
                      }`}
                    >
                      #{top}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-black/60">Save resources to generate topic clusters.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-4 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-black text-black/80">
              Query your personal research dossier using structured citations.
            </div>
            <Link
              href="/app/assistant"
              className="btn-neo px-5 py-2.5 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000] shrink-0"
            >
              LAUNCH CONSOLE →
            </Link>
          </div>
        </section>

      </div>

      {/* 3-Step Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}

export default function AppHomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-black font-black uppercase text-sm">LOADING RESORA WORKSPACE...</div>}>
      <AppHomeContent />
    </Suspense>
  );
}
