'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import {
  Plus,
  ArrowRight,
  TrendingUp,
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
  { id: 'qa-1', title: 'AI DEV', topic: 'AI', icon: Brain, bg: 'bg-[#1040C0]', text: 'text-white', shape: 'circle', route: '/app/library?topic=AI' },
  { id: 'qa-2', title: 'DEV TOOLS', topic: 'Coding', icon: Code2, bg: 'bg-[#F0C020]', text: 'text-[#121212]', shape: 'square', route: '/app/tools' },
  { id: 'qa-3', title: 'HACKATHONS', topic: 'Hackathon', icon: Flame, bg: 'bg-[#D02020]', text: 'text-white', shape: 'triangle', route: '/app/projects' },
  { id: 'qa-4', title: 'UI / DESIGN', topic: 'Design', icon: Layers, bg: 'bg-[#FFFFFF]', text: 'text-[#121212]', shape: 'square', route: '/app/library?topic=Design' },
  { id: 'qa-5', title: 'RESEARCH', topic: 'Research', icon: FileSpreadsheet, bg: 'bg-[#1040C0]', text: 'text-white', shape: 'circle', route: '/app/documents' },
  { id: 'qa-6', title: 'LEARNING', topic: 'Learning', icon: GraduationCap, bg: 'bg-[#F0C020]', text: 'text-[#121212]', shape: 'triangle', route: '/app/collections' },
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-200">
      
      {/* ============================================================ */}
      {/* SECTION 1: BAUHAUS HERO COMMAND POSTER */}
      {/* ============================================================ */}
      <section className="relative border-4 border-[#121212] bg-[#FFFFFF] shadow-bauhaus-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[320px]">
          
          {/* LEFT: MASSIVE EDITORIAL POSTER TYPOGRAPHY */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col justify-between border-b-4 lg:border-b-0 lg:border-r-4 border-[#121212] bg-[#FFFFFF] z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F0C020] border-2 border-[#121212] text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#121212]">
                <span className="w-2 h-2 rounded-full bg-[#121212]" />
                Personal Research Intelligence
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-[#121212] leading-[0.9]">
                YOUR<br />
                RESEARCH<br />
                <span className="text-[#1040C0]">STARTS</span> HERE.
              </h1>

              <p className="text-sm md:text-base font-bold text-[#121212]/80 mt-5 max-w-lg">
                "Save it. Understand it. Use it." An architectural workspace engineered to capture, index, and synthesize research.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={openSaveModal}
                className="btn-bauhaus px-6 py-3.5 bg-[#D02020] hover:bg-[#b01818] text-white border-2 border-[#121212] font-black uppercase text-xs md:text-sm tracking-wider shadow-bauhaus-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ CAPTURE RESOURCE</span>
              </button>
              
              <Link
                href="/app/assistant"
                className="btn-bauhaus px-6 py-3.5 bg-[#1040C0] hover:bg-[#0c3194] text-white border-2 border-[#121212] font-black uppercase text-xs md:text-sm tracking-wider shadow-bauhaus-sm flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>ASK RESORA</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: ASYMMETRIC BAUHAUS GEOMETRIC COMPOSITION */}
          <div className="lg:col-span-5 relative bg-[#F0F0F0] p-6 md:p-8 flex flex-col justify-between overflow-hidden">
            {/* Architectural Grid Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#121212_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Geometric Art Composition */}
            <div className="relative z-10 flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#F0C020] border-4 border-[#121212] shadow-bauhaus-sm" />
                <div className="w-16 h-16 rounded-none bg-[#D02020] border-4 border-[#121212] shadow-bauhaus-sm flex items-center justify-center text-white font-black text-xs">
                  RESORA
                </div>
              </div>
              <div className="w-0 h-0 border-l-[35px] border-l-transparent border-r-[35px] border-r-transparent border-b-[60px] border-b-[#1040C0] drop-shadow-[4px_4px_0px_#121212]" />
            </div>

            {/* Live Workspace Summary Banner */}
            <div className="relative z-10 mt-8 p-4 bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-sm">
              <div className="text-[11px] font-black uppercase tracking-wider text-[#121212]">
                STATUS REPORT
              </div>
              <div className="text-2xl font-black text-[#121212] mt-0.5">
                {metrics.total} ACTIVE ASSETS
              </div>
              <div className="text-xs font-bold text-[#121212]/70 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D02020]" />
                {metrics.inbox} UNPROCESSED IN INBOX
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2: BAUHAUS STATISTICS COLOR BLOCKS */}
      {/* ============================================================ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* BLOCK 1: WHITE CARD with YELLOW CIRCLE */}
        <div className="relative p-5 md:p-6 bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div className="absolute top-4 right-4 w-4 h-4 rounded-full bg-[#F0C020] border-2 border-[#121212] shadow-[1px_1px_0px_#121212]" />
          <div className="text-xs font-black uppercase tracking-widest text-[#121212]/70">
            TOTAL RESOURCES
          </div>
          <div className="text-4xl md:text-5xl font-black text-[#121212] my-3 leading-none tracking-tight">
            {metrics.total}
          </div>
          <div className="text-[11px] font-mono font-bold uppercase text-[#121212]/60">
            {metrics.favorites} FAVORITED
          </div>
        </div>

        {/* BLOCK 2: BLUE BLOCK */}
        <div className="relative p-5 md:p-6 bg-[#1040C0] text-white border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div className="absolute top-4 right-4 w-4 h-4 rounded-none bg-[#FFFFFF] border-2 border-[#121212]" />
          <div className="text-xs font-black uppercase tracking-widest text-white/80">
            AI UNDERSTOOD
          </div>
          <div className="text-4xl md:text-5xl font-black text-white my-3 leading-none tracking-tight">
            {metrics.analyzed}
          </div>
          <div className="text-[11px] font-mono font-bold uppercase text-white/80">
            SYNTHESIZED DOSSIERS
          </div>
        </div>

        {/* BLOCK 3: YELLOW BLOCK */}
        <div className="relative p-5 md:p-6 bg-[#F0C020] text-[#121212] border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div className="absolute top-4 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#D02020]" />
          <div className="text-xs font-black uppercase tracking-widest text-[#121212]/80">
            ACTIVE PROJECTS
          </div>
          <div className="text-4xl md:text-5xl font-black text-[#121212] my-3 leading-none tracking-tight">
            {metrics.projects}
          </div>
          <div className="text-[11px] font-mono font-bold uppercase text-[#121212]/70">
            FOCUSED WORKSPACES
          </div>
        </div>

        {/* BLOCK 4: WHITE CARD with RED SQUARE */}
        <div className="relative p-5 md:p-6 bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div className="absolute top-4 right-4 w-4 h-4 rounded-none bg-[#D02020] border-2 border-[#121212] shadow-[1px_1px_0px_#121212]" />
          <div className="text-xs font-black uppercase tracking-widest text-[#121212]/70">
            COLLECTIONS
          </div>
          <div className="text-4xl md:text-5xl font-black text-[#121212] my-3 leading-none tracking-tight">
            {metrics.collections}
          </div>
          <div className="text-[11px] font-mono font-bold uppercase text-[#121212]/60">
            CURATED STACKS
          </div>
        </div>

      </section>

      {/* ============================================================ */}
      {/* SECTION 3: QUICK ACCESS (ARCHITECTURAL TILES) */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-4 border-[#121212]">
          <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-[#121212] flex items-center gap-2">
            <span className="w-3 h-3 bg-[#D02020] border border-[#121212]" />
            INDEX DIRECTORY
          </h2>
          <span className="text-xs font-mono font-bold uppercase text-[#121212]/60">
            PRIMARY TOPICS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACCESS_ITEMS.map((item) => {
            const Icon = item.icon;
            const topicCount = resources.filter((r) =>
              r.tags?.some((t) => t.toLowerCase() === item.topic.toLowerCase())
            ).length;

            return (
              <Link
                key={item.id}
                href={item.route}
                className="p-4 bg-[#FFFFFF] hover:bg-[#F0F0F0] border-4 border-[#121212] shadow-bauhaus-sm hover:shadow-bauhaus-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-none ${item.bg} ${item.text} border-2 border-[#121212] shadow-[1px_1px_0px_#121212]`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#121212] group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#121212] group-hover:text-[#1040C0] transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-[#121212]/60 mt-0.5 uppercase">
                    {topicCount > 0 ? `${topicCount} SAVED` : 'BROWSE'}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4: RECENT RESEARCH DOSSIERS */}
      {/* ============================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-4 border-[#121212]">
          <div>
            <h2 className="text-base md:text-lg font-black uppercase tracking-wider text-[#121212] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1040C0]" />
              RECENTLY SAVED RESEARCH
            </h2>
            <p className="text-xs font-bold text-[#121212]/60 mt-0.5 uppercase">
              LIVE PERSISTED INDEX CARDS
            </p>
          </div>
          <Link
            href="/app/library"
            className="btn-bauhaus px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#121212] border-2 border-[#121212] text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#121212]"
          >
            VIEW ALL ({metrics.total}) →
          </Link>
        </div>

        {isLoading ? (
          <ResourceSkeleton count={6} />
        ) : recentResources.length === 0 ? (
          <div className="p-10 border-4 border-[#121212] bg-[#FFFFFF] shadow-bauhaus-md text-center">
            <h3 className="text-xl font-black uppercase text-[#121212]">NO RESEARCH INGESTED YET</h3>
            <p className="text-xs font-bold text-[#121212]/70 mt-1 mb-4">Click below to capture and analyze your first live link or file.</p>
            <button
              onClick={openSaveModal}
              className="btn-bauhaus px-5 py-2.5 bg-[#D02020] text-white border-2 border-[#121212] font-black uppercase text-xs tracking-wider shadow-bauhaus-sm"
            >
              + CAPTURE RESOURCE
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* SECTION 5: INTELLIGENCE SYNTHESIS & INBOX TRIAGE */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* INBOX ACTION PANEL */}
        <section className="lg:col-span-5 p-6 bg-[#D02020] text-white border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
              <div className="text-xs font-black uppercase tracking-widest text-white/90 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#121212]" />
                UNPROCESSED INBOX
              </div>
              <span className="text-xs font-mono font-black bg-[#121212] text-white px-2 py-0.5 border border-white">
                {metrics.inbox} ITEMS
              </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-4 leading-none">
              RAW CAPTURES AWAITING REVIEW.
            </h3>
            
            <p className="text-xs font-bold text-white/80 mt-2 leading-relaxed">
              Items saved directly via quick capture or browser need project tag assignment and AI dossier verification.
            </p>
          </div>

          <Link
            href="/app/inbox"
            className="btn-bauhaus mt-6 w-full py-3 bg-[#FFFFFF] hover:bg-[#F0F0F0] text-[#121212] border-2 border-[#121212] font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#121212] flex items-center justify-center gap-2"
          >
            <span>TRIAGE INBOX NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* AI SYNTHESIS PANEL */}
        <section className="lg:col-span-7 p-6 bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#121212]">
              <div className="text-xs font-black uppercase tracking-widest text-[#121212] flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#1040C0]" />
                SYNTHESIZED INTELLIGENCE
              </div>
              <span className="text-xs font-mono font-black bg-[#F0C020] text-[#121212] px-2 py-0.5 border border-[#121212]">
                {metrics.analyzed} ANALYZED
              </span>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-black uppercase tracking-wider text-[#121212]/70 mb-2">
                DISCOVERED RESEARCH TOPICS:
              </div>
              <div className="flex flex-wrap gap-2">
                {metrics.discoveredTopics.length > 0 ? (
                  metrics.discoveredTopics.map((top) => (
                    <span
                      key={top}
                      className="px-3 py-1 bg-[#F0F0F0] text-[#121212] border-2 border-[#121212] font-bold text-xs uppercase tracking-wide shadow-[2px_2px_0px_#121212]"
                    >
                      #{top}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-bold text-[#121212]/60">Save resources to generate topic clusters.</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-[#121212] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs font-bold text-[#121212]/80">
              Query your personal research dossier using structured citations.
            </div>
            <Link
              href="/app/assistant"
              className="btn-bauhaus px-4 py-2 bg-[#1040C0] text-white border-2 border-[#121212] font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#121212] shrink-0"
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
    <Suspense fallback={<div className="p-12 text-center text-[#121212] font-black uppercase text-sm">LOADING RESORA WORKSPACE...</div>}>
      <AppHomeContent />
    </Suspense>
  );
}
