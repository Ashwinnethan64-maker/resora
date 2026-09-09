'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResoraLogo } from '@/components/brand/ResoraLogo';
import {
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Home,
  Inbox,
  Library,
  FolderKanban,
  Bookmark,
  FileText,
  Heart,
  Search,
  Plus,
  User,
  Compass,
  FileCheck,
  Brain,
  CheckCircle2,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId?: string; // DOM id to highlight on desktop when visible
  title: string;
  badge: string;
  badgeColor?: 'yellow' | 'red' | 'violet';
  content: string;
  details?: string[];
  icon: React.ElementType;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'home',
    targetId: 'nav-home',
    title: 'RESEARCH COMMAND CENTER',
    badge: 'STEP 1: HOME',
    badgeColor: 'yellow',
    content: 'Your central overview. Track recently saved resources, active projects, and workspace metrics in real time.',
    details: [
      'Quick view of recent web captures',
      'Instant access to all research metrics',
      'Fast jump to any workspace section',
    ],
    icon: Home,
  },
  {
    id: 'assistant',
    targetId: 'nav-assistant',
    title: 'ASK RESORA (RESEARCH AI)',
    badge: 'STEP 2: ASK RESORA',
    badgeColor: 'violet',
    content: 'Ask direct questions across all your saved research, notes, and documents with grounded citations.',
    details: [
      'Answers grounded in your own library',
      'Exact source and paper citations',
      'Synthesizes complex research topics',
    ],
    icon: Sparkles,
  },
  {
    id: 'inbox',
    targetId: 'nav-inbox',
    title: 'TEMPORARY RESEARCH INBOX',
    badge: 'STEP 3: INBOX',
    badgeColor: 'red',
    content: 'New resources wait here until you organize them. Capture findings fast and triage whenever you are ready.',
    details: [
      'Zero-friction landing pad for web finds',
      'Organize when you have time',
      'Keeps your curated Library clean',
    ],
    icon: Inbox,
  },
  {
    id: 'library',
    targetId: 'nav-library',
    title: 'PERMANENT RESEARCH ARCHIVE',
    badge: 'STEP 4: LIBRARY',
    badgeColor: 'yellow',
    content: 'The permanent home for all your saved tools, articles, repositories, and notes as physical index cards.',
    details: [
      'Filter by tags, formats, or use cases',
      'Switch between visual cards and list view',
      'Star essential items for quick reference',
    ],
    icon: Library,
  },
  {
    id: 'dossier',
    targetId: 'library-dossier-sample',
    title: 'DETAILED RESOURCE DOSSIER',
    badge: 'STEP 5: DOSSIER',
    badgeColor: 'violet',
    content: 'Click any resource to inspect generated metadata, full summary, tags, and connected workspaces.',
    details: [
      'Structured summary of what the resource is',
      'Personal research notes and tags',
      'Trace connected projects at a glance',
    ],
    icon: FileCheck,
  },
  {
    id: 'intelligence',
    targetId: 'resource-intelligence-sample',
    title: 'AI RESOURCE UNDERSTANDING',
    badge: 'STEP 6: AI ANALYSIS',
    badgeColor: 'yellow',
    content: 'RESORA analyzes saved links to extract core concepts, target audience, and suggested tags automatically.',
    details: [
      'Core takeaways extracted in seconds',
      '1-click suggested tags and use cases',
      'Never forget why you saved a link',
    ],
    icon: Brain,
  },
  {
    id: 'projects',
    targetId: 'nav-projects',
    title: 'GOAL-DRIVEN WORKSPACES',
    badge: 'STEP 7: PROJECTS',
    badgeColor: 'yellow',
    content: 'Organize research around active builds, hackathons, or writing goals without duplicating files.',
    details: [
      'Track status: Saved, Reviewing, or Used',
      'Dedicated project logs and decisions',
      'AI recommendations matched to your goals',
    ],
    icon: FolderKanban,
  },
  {
    id: 'collections',
    targetId: 'nav-collections',
    title: 'CURATED TOPIC COLLECTIONS',
    badge: 'STEP 8: COLLECTIONS',
    badgeColor: 'violet',
    content: 'Timeless knowledge hubs grouped by broad subject rather than deadline-driven active projects.',
    details: [
      'Reusable cross-project topic hubs',
      'E.g. AI Agents, UI Systems, Papers',
      'High-signal thematic archives',
    ],
    icon: Bookmark,
  },
  {
    id: 'documents',
    targetId: 'nav-documents',
    title: 'DOCUMENTS & PDF KNOWLEDGE',
    badge: 'STEP 9: DOCUMENTS',
    badgeColor: 'violet',
    content: 'Upload research papers, PDFs, and notes. RESORA indexes them page by page for search and AI Q&A.',
    details: [
      'Page-by-page reader and viewer',
      'Searchable full-text knowledge chunks',
      'Page-cited Ask RESORA answers',
    ],
    icon: FileText,
  },
  {
    id: 'favorites',
    targetId: 'nav-favorites',
    title: 'PINNED FAVORITES',
    badge: 'STEP 10: FAVORITES',
    badgeColor: 'red',
    content: 'Mark indispensable tools, cheat sheets, or core papers with a heart for immediate 1-click access.',
    details: [
      '1-click access in the sidebar',
      'Scoped search in Ask RESORA',
      'Never lose your daily go-to tools',
    ],
    icon: Heart,
  },
  {
    id: 'search',
    targetId: 'global-search-trigger',
    title: 'KEYBOARD SEARCH (⌘K)',
    badge: 'STEP 11: SEARCH',
    badgeColor: 'yellow',
    content: 'Press ⌘K (or Ctrl+K) or tap Search to instantly locate anything in your workspace in milliseconds.',
    details: [
      'Instant fuzzy matching across all items',
      'Quick navigation shortcuts (A, L, I)',
      'Available anywhere across the app',
    ],
    icon: Search,
  },
  {
    id: 'capture',
    targetId: 'global-capture-btn',
    title: 'FAST WEB CAPTURE (+ CAPTURE)',
    badge: 'STEP 12: CAPTURE',
    badgeColor: 'red',
    content: 'Tap + CAPTURE whenever you discover something online. Paste the URL and RESORA inspects and saves it.',
    details: [
      'Auto-fetches title, description & favicon',
      'Supports articles, tools, repos & videos',
      'Send to Inbox or Project in one tap',
    ],
    icon: Plus,
  },
  {
    id: 'account',
    targetId: 'global-profile-menu',
    title: 'PRIVATE & ISOLATED DATA',
    badge: 'STEP 13: PRIVATE ACCOUNT',
    badgeColor: 'yellow',
    content: 'Your research workspace is completely private. All saved links, notes, and AI chats belong only to you.',
    details: [
      'Multi-user private data isolation',
      'Full JSON/CSV export anytime',
      'Custom assistant grounding scopes',
    ],
    icon: User,
  },
  {
    id: 'workflow',
    targetId: undefined,
    title: 'THE CORE RESORA WORKFLOW',
    badge: 'STEP 14: WORKFLOW',
    badgeColor: 'red',
    content: 'Capture from anywhere, let AI extract the value, organize around projects, and retrieve with clarity.',
    details: [
      '1. CAPTURE — No more scattered browser tabs',
      '2. UNDERSTAND — Instant AI extraction',
      '3. ORGANIZE — Projects & timeless Collections',
    ],
    icon: Compass,
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  // Tour phases: 'welcome' -> 'steps' (0 to 13) -> 'finished'
  const [phase, setPhase] = useState<'welcome' | 'steps' | 'finished'>('welcome');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIdx];
  const totalSteps = TOUR_STEPS.length;

  // Background body scroll lock while tour is active
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  // Target element spotlight calculation
  const updateTargetHighlight = useCallback(() => {
    if (phase !== 'steps' || !step?.targetId) {
      setHighlightRect(null);
      return;
    }

    const isMobile = window.innerWidth < 768;
    const el = document.getElementById(step.targetId);

    if (el) {
      const rect = el.getBoundingClientRect();
      // Only highlight if visible within viewport (do not force mobile sidebar open)
      if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
        setHighlightRect(rect);
        return;
      }
      if (!isMobile) {
        // Desktop smooth scroll into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightRect(rect);
        return;
      }
    }
    setHighlightRect(null);
  }, [phase, step]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetHighlight();
    window.addEventListener('resize', updateTargetHighlight);
    window.addEventListener('scroll', updateTargetHighlight, true);

    return () => {
      window.removeEventListener('resize', updateTargetHighlight);
      window.removeEventListener('scroll', updateTargetHighlight, true);
    };
  }, [isOpen, phase, currentStepIdx, updateTargetHighlight]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight' && phase === 'steps') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' && phase === 'steps') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase, currentStepIdx]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < totalSteps - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      setPhase('finished');
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    } else {
      setPhase('welcome');
    }
  };

  const handleStartTour = () => {
    setCurrentStepIdx(0);
    setPhase('steps');
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="RESORA Product Tour"
      className="fixed inset-0 z-50 overflow-hidden font-sans select-none animate-in fade-in duration-150"
    >
      {/* Controlled Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Target Element Highlight Box (Desktop only when visible) */}
      {phase === 'steps' && highlightRect && (
        <div
          style={{
            top: `${Math.max(0, highlightRect.top - 6)}px`,
            left: `${Math.max(0, highlightRect.left - 6)}px`,
            width: `${highlightRect.width + 12}px`,
            height: `${highlightRect.height + 12}px`,
          }}
          className="absolute z-10 pointer-events-none border-4 border-[#FFD93D] shadow-[0px_0px_0px_9999px_rgba(0,0,0,0.55),4px_4px_0px_0px_#000] transition-all duration-300 hidden md:block"
        >
          <span className="absolute -top-3.5 -right-3.5 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-[#FF6B6B] border-2 border-black"></span>
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 1: WELCOME SCREEN (Mobile-responsive, fits <= 100dvh) */}
      {/* ============================================================ */}
      {phase === 'welcome' && (
        <div className="relative z-20 w-full min-h-[100dvh] flex items-center justify-center p-3 min-[375px]:p-4 md:p-6 pointer-events-none">
          <div className="pointer-events-auto w-[calc(100%-16px)] min-[375px]:w-[calc(100%-24px)] max-w-md bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] min-[375px]:shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[calc(100dvh-24px)] min-[375px]:max-h-[calc(100dvh-32px)] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Scrollable Welcome Body */}
            <div className="overflow-y-auto overscroll-contain p-4 min-[375px]:p-6 space-y-4 text-center">
              <div className="flex justify-center pt-1">
                <ResoraLogo size="md" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFD93D] text-black border-2 border-black text-[11px] font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B6B] inline-block" />
                  <span>WELCOME TO RESORA</span>
                </div>

                <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-tight">
                  YOUR PERSONAL RESEARCH INTELLIGENCE.
                </h2>

                <p className="text-xs min-[375px]:text-sm font-bold text-black/80 leading-relaxed text-left min-[375px]:text-center">
                  Save, understand, organize, and retrieve everything useful you discover online.
                </p>
              </div>

              <div className="p-3 bg-[#FFFDF5] border-2 border-black text-left text-xs font-bold text-black space-y-1.5 shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-1.5 text-black font-black uppercase text-[11px] font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>1-Minute Interactive Tour</span>
                </div>
                <p className="text-black/70 font-normal leading-snug">
                  Quickly learn where everything lives, how capture works, and how to query with Ask RESORA.
                </p>
              </div>
            </div>

            {/* Fixed Welcome Actions */}
            <div className="p-3 min-[375px]:p-4 border-t-2 border-black bg-white flex flex-col min-[375px]:flex-row items-stretch min-[375px]:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleStartTour}
                className="btn-neo flex-1 min-h-[44px] py-2.5 px-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs sm:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>START TOUR</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-neo min-h-[44px] py-2.5 px-4 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: INTERACTIVE STEP CARDS (Fixed Header + Scrollable   */}
      {/* Content + Fixed Footer, Never Exceeds 100dvh)               */}
      {/* ============================================================ */}
      {phase === 'steps' && (
        <div className="relative z-20 w-full min-h-[100dvh] flex items-center justify-center p-3 min-[375px]:p-4 md:p-6 pointer-events-none">
          <div className="pointer-events-auto w-[calc(100%-16px)] min-[375px]:w-[calc(100%-24px)] max-w-[440px] md:max-w-lg bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] min-[375px]:shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[calc(100dvh-24px)] min-[375px]:max-h-[calc(100dvh-32px)] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* 1. FIXED HEADER: Badge + Step Counter + 44px Touch Target Close Button */}
            <div className="flex items-center justify-between gap-2 border-b-2 border-black px-3.5 min-[375px]:px-5 py-2.5 min-[375px]:py-3 shrink-0 bg-[#FFFDF5]">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border-2 border-black shadow-[1px_1px_0px_#000] truncate ${
                    step.badgeColor === 'red'
                      ? 'bg-[#FF6B6B] text-black'
                      : step.badgeColor === 'violet'
                      ? 'bg-[#C4B5FD] text-black'
                      : 'bg-[#FFD93D] text-black'
                  }`}
                >
                  {step.badge}
                </span>
                <span className="text-[11px] font-mono font-black text-black/60 shrink-0">
                  {currentStepIdx + 1} / {totalSteps}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Desktop step indicators */}
                <div className="hidden sm:flex items-center gap-1">
                  {TOUR_STEPS.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentStepIdx(idx)}
                      title={`Go to step ${idx + 1}: ${s.title}`}
                      className={`w-2 h-2 border border-black transition-all ${
                        idx === currentStepIdx
                          ? 'bg-[#FF6B6B] scale-125'
                          : idx < currentStepIdx
                          ? 'bg-[#FFD93D]'
                          : 'bg-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Mobile & Desktop Close Button (min 44x44px touch target) */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Tour"
                  className="btn-neo min-w-[44px] min-h-[44px] p-2 border-2 border-black bg-white hover:bg-[#FFD93D] text-black flex items-center justify-center shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <X className="w-4 h-4 stroke-[3px]" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE CONTENT: Icon, Title, Short Description, Compact Benefits */}
            <div className="overflow-y-auto overscroll-contain px-3.5 min-[375px]:px-5 py-3 min-[375px]:py-4 space-y-3 flex-1">
              {/* Icon & Title */}
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 min-[375px]:w-12 min-[375px]:h-12 bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0 flex items-center justify-center">
                  <step.icon className="w-5 h-5 min-[375px]:w-6 min-[375px]:h-6 text-black stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm min-[375px]:text-base md:text-lg font-black uppercase tracking-tight text-black leading-snug">
                    {step.title}
                  </h3>
                </div>
              </div>

              {/* Concise Explanation */}
              <p className="text-xs min-[375px]:text-sm font-bold text-black/85 leading-relaxed">
                {step.content}
              </p>

              {/* Compact Benefits Card */}
              {step.details && step.details.length > 0 && (
                <div className="p-2.5 min-[375px]:p-3 bg-[#FFFDF5] border-2 border-black space-y-1.5 shadow-[2px_2px_0px_#000]">
                  {step.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-bold text-black/85">
                      <span className="font-mono text-[#FF6B6B] font-black text-xs leading-tight shrink-0">▸</span>
                      <span className="leading-snug">{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. FIXED FOOTER CONTROLS: SKIP, BACK, NEXT (Exact single arrow, >=44px touch targets) */}
            <div className="px-3.5 min-[375px]:px-5 py-2.5 min-[375px]:py-3 border-t-2 border-black bg-white flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[56px] text-[11px] font-mono font-black uppercase text-black/60 hover:text-black underline px-2 py-2 flex items-center justify-center transition-colors"
              >
                SKIP
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-neo min-h-[44px] px-3 min-[375px]:px-4 py-2 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
                  <span>BACK</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-neo min-h-[44px] px-4 min-[375px]:px-5 py-2 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{currentStepIdx === totalSteps - 1 ? 'SUMMARY' : 'NEXT'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PHASE 3: FINAL READY SCREEN (Clean Responsive Summary)       */}
      {/* ============================================================ */}
      {phase === 'finished' && (
        <div className="relative z-20 w-full min-h-[100dvh] flex items-center justify-center p-3 min-[375px]:p-4 md:p-6 pointer-events-none">
          <div className="pointer-events-auto w-[calc(100%-16px)] min-[375px]:w-[calc(100%-24px)] max-w-md bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] min-[375px]:shadow-[8px_8px_0px_0px_#000] md:shadow-[12px_12px_0px_0px_#000] flex flex-col max-h-[calc(100dvh-24px)] min-[375px]:max-h-[calc(100dvh-32px)] overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Scrollable Body */}
            <div className="overflow-y-auto overscroll-contain p-4 min-[375px]:p-6 space-y-4 text-center">
              <div className="inline-flex p-2.5 bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <CheckCircle2 className="w-7 h-7 text-black stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#C4B5FD] text-black border-2 border-black text-[11px] font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                  <span>WORKSPACE ARMED & READY</span>
                </div>

                <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-tight">
                  YOU’RE READY TO RESEARCH.
                </h2>

                <p className="text-xs min-[375px]:text-sm font-bold text-black/80 leading-relaxed">
                  Your workspace is ready. When you discover high-value tools, papers, or articles, bring them into RESORA.
                </p>
              </div>

              {/* Lifecycle flow */}
              <div className="p-3 bg-[#FFFDF5] border-2 border-black text-left font-mono text-[11px] font-black space-y-1.5 shadow-[2px_2px_0px_#000]">
                <div className="text-[10px] text-black/50 uppercase tracking-widest pb-1 border-b border-black/10">
                  THE RESORA HABIT
                </div>
                <div className="flex items-center gap-1 text-black flex-wrap">
                  <span className="px-2 py-0.5 bg-[#FF6B6B] border border-black text-black text-[10px]">CAPTURE</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-[#FFD93D] border border-black text-black text-[10px]">UNDERSTAND</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-[#C4B5FD] border border-black text-black text-[10px]">ORGANIZE</span>
                  <span>→</span>
                  <span className="px-2 py-0.5 bg-white border border-black text-black text-[10px]">USE</span>
                </div>
                <p className="text-black/70 font-sans font-normal text-xs pt-1">
                  Replay this tour anytime from <strong className="text-black">Settings → Workspace</strong>.
                </p>
              </div>
            </div>

            {/* Fixed Finished Actions */}
            <div className="p-3 min-[375px]:p-4 border-t-2 border-black bg-white flex flex-col min-[375px]:flex-row items-stretch min-[375px]:items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleFinish}
                className="btn-neo flex-1 min-h-[44px] py-2.5 px-4 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs sm:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>START EXPLORING</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>

              <button
                type="button"
                onClick={() => setPhase('steps')}
                className="btn-neo min-h-[44px] py-2.5 px-4 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5"
              >
                BACK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
