'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import { NeoSticker } from '@/components/brand/NeoSticker';
import { PageHeader } from '@/components/ui/SectionLabel';
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
  Compass,
  Sparkles,
  Inbox,
  FolderKanban,
  FileText,
  Heart,
  ArrowUpRight
} from 'lucide-react';

function AppHomeContent() {
  const searchParams = useSearchParams();
  const { resources, projects, metrics, isLoading, openSaveModal } = useResora();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('onboarding') === 'true') {
      setIsOnboardingOpen(true);
    }
  }, [searchParams]);

  const recentResources = resources.slice(0, 6);
  const activeProjects = projects.filter((p) => p.status !== 'archived').slice(0, 3);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-150">
      
      {/* Greeting & Header */}
      <PageHeader
        eyebrow="PERSONAL RESEARCH INTELLIGENCE"
        eyebrowColor="yellow"
        eyebrowIcon={<span className="w-2 h-2 rounded-full bg-black inline-block" />}
        title="RESEARCH COMMAND CENTER."
        description="Welcome back. Your personal index is grounded and ready to retrieve, organize, and synthesize."
        actions={
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/app/assistant"
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#C4B5FD] hover:bg-[#b8a6fb] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#000]"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>ASK RESORA</span>
            </Link>

            <button
              onClick={openSaveModal}
              className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ CAPTURE</span>
            </button>
          </div>
        }
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'TOTAL RESOURCES', count: metrics.total, accent: 'border-l-4 border-l-black', href: '/app/library' },
          { label: 'UNPROCESSED INBOX', count: metrics.inbox, accent: 'border-l-4 border-l-[#FF6B6B]', href: '/app/inbox' },
          { label: 'ACTIVE PROJECTS', count: metrics.projects, accent: 'border-l-4 border-l-[#FFD93D]', href: '/app/projects' },
          { label: 'DOCUMENTS / PDFS', count: metrics.documents, accent: 'border-l-4 border-l-[#C4B5FD]', href: '/app/documents' },
          { label: 'FAVORITES PINNED', count: metrics.favorites, accent: 'border-l-4 border-l-[#FF6B6B]', href: '/app/favorites' },
        ].map((m) => (
          <Link
            key={m.label}
            href={m.href}
            className={`p-3.5 bg-white border-2 border-black ${m.accent} shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-transform flex flex-col justify-between`}
          >
            <div className="text-[10px] font-mono font-bold text-black/60 leading-tight">{m.label}</div>
            <div className="text-2xl font-black text-black mt-2">{m.count}</div>
          </Link>
        ))}
      </div>

      {/* Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Recently Captured & Library */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#FF6B6B] border border-black" />
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                RECENTLY CAPTURED RESEARCH
              </h2>
            </div>
            <Link
              href="/app/library"
              className="text-xs font-bold text-black underline hover:text-[#FF6B6B]"
            >
              View all archive →
            </Link>
          </div>

          {isLoading ? (
            <ResourceSkeleton count={4} />
          ) : recentResources.length === 0 ? (
            <div className="p-8 text-center bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
              <p className="text-sm font-bold text-black">Your archive is empty.</p>
              <button
                onClick={openSaveModal}
                className="btn-neo px-4 py-2 bg-[#FF6B6B] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000]"
              >
                + Capture First Resource
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentResources.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Projects, Insights & Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Projects Block */}
          <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <span className="text-xs font-mono font-black uppercase text-black">ACTIVE PROJECTS</span>
              <Link href="/app/projects" className="text-[11px] font-bold text-black underline">
                View All
              </Link>
            </div>

            <div className="space-y-2">
              {activeProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/projects/${p.id}`}
                  className="block p-2.5 bg-[#FFFDF5] border border-black hover:bg-[#FFD93D] transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                    <span className="truncate max-w-[160px] text-black font-black">{p.name}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 border border-black bg-white">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-black/70 mt-1 line-clamp-1 font-normal">
                    {p.objective || 'No objective specified.'}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* AI Intelligence Insight */}
          <div className="p-4 bg-[#FFD93D] border-2 border-black shadow-[4px_4px_0px_#000] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-black text-black uppercase">
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>AI Research Insight</span>
            </div>
            <p className="text-xs text-black font-normal leading-relaxed">
              Your library contains a strong cluster of <strong>AI coding tools</strong> and <strong>hackathon architecture</strong>. Connect them to an active workspace for real-time recommendations.
            </p>
            <Link
              href="/app/assistant?q=Summarize%20my%20AI%20developer%20tools"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-black underline pt-1"
            >
              <span>Explore tools synthesis</span>
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            </Link>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-mono font-black uppercase text-black block pb-1 border-b border-black/10">
              QUICK COMMANDS
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={openSaveModal}
                className="btn-neo p-2.5 bg-[#FFFDF5] hover:bg-[#FF6B6B] border border-black text-xs font-bold text-black text-left flex flex-col justify-between shadow-[2px_2px_0px_#000]"
              >
                <span>+ Capture</span>
                <span className="text-[9px] font-mono text-black/60">Any URL</span>
              </button>
              <Link
                href="/app/documents"
                className="btn-neo p-2.5 bg-[#FFFDF5] hover:bg-[#C4B5FD] border border-black text-xs font-bold text-black text-left flex flex-col justify-between shadow-[2px_2px_0px_#000]"
              >
                <span>Upload PDF</span>
                <span className="text-[9px] font-mono text-black/60">Page index</span>
              </Link>
              <Link
                href="/app/inbox"
                className="btn-neo p-2.5 bg-[#FFFDF5] hover:bg-[#FFD93D] border border-black text-xs font-bold text-black text-left flex flex-col justify-between shadow-[2px_2px_0px_#000]"
              >
                <span>Triage Inbox</span>
                <span className="text-[9px] font-mono text-black/60">{metrics.inbox} items</span>
              </Link>
              <Link
                href="/app/assistant"
                className="btn-neo p-2.5 bg-[#FFFDF5] hover:bg-[#FFD93D] border border-black text-xs font-bold text-black text-left flex flex-col justify-between shadow-[2px_2px_0px_#000]"
              >
                <span>Query RAG</span>
                <span className="text-[9px] font-mono text-black/60">Ask Resora</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}

export default function AppHome() {
  return (
    <Suspense fallback={<div className="p-8"><ResourceSkeleton count={6} /></div>}>
      <AppHomeContent />
    </Suspense>
  );
}
