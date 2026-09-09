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
  HelpCircle,
  CheckCircle2
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId?: string; // DOM id to highlight/scroll to
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
    title: 'YOUR RESEARCH COMMAND CENTER',
    badge: 'STEP 1: HOME',
    badgeColor: 'yellow',
    content:
      'This is your RESORA command center. Your dashboard gives you a live overview of your saved research, recent resources, documents, favorites, and active projects. Home is the central starting point for everything in your workspace.',
    details: [
      'Quick overview of recently captured resources',
      'Instant access to your active workspaces and metrics',
      'Fast shortcuts to query research or capture new links',
    ],
    icon: Home,
  },
  {
    id: 'assistant',
    targetId: 'nav-assistant',
    title: 'ASK RESORA — RESEARCH AI',
    badge: 'STEP 2: ASK RESORA',
    badgeColor: 'violet',
    content:
      'Ask RESORA is your personal research AI assistant. Instead of manually digging through hundreds of saved bookmarks and notes, you can ask direct questions about your own research archive.',
    details: [
      'Try asking: "What AI tools did I save for rapid prototyping?"',
      'Or: "Summarize the key papers I collected for my project"',
      'Grounded strictly in your private library and documents with citations',
    ],
    icon: Sparkles,
  },
  {
    id: 'inbox',
    targetId: 'nav-inbox',
    title: 'TEMPORARY RESEARCH INBOX',
    badge: 'STEP 3: INBOX',
    badgeColor: 'red',
    content:
      'Inbox is where newly captured resources wait before you organize or review them. When exploring the web, capture first and organize later — keep your research momentum going without getting bogged down in filing.',
    details: [
      'Zero-friction landing pad for fast web captures',
      'Triage quickly: assign to a project, add tags, or archive',
      'Keeps your curated Library clean and high-signal',
    ],
    icon: Inbox,
  },
  {
    id: 'library',
    targetId: 'nav-library',
    title: 'YOUR RESEARCH ARCHIVE',
    badge: 'STEP 4: LIBRARY',
    badgeColor: 'yellow',
    content:
      'Your Library is the permanent archive for everything you have saved. Websites, AI tools, GitHub repositories, PDFs, tutorials, videos, and articles are stored here with physical index cards.',
    details: [
      'Filter by resource type, tags, or use cases',
      'Switch between visual cards and compact list dossiers',
      'Star frequent references to reach them in one click',
    ],
    icon: Library,
  },
  {
    id: 'dossier',
    targetId: 'library-dossier-sample',
    title: 'DETAILED RESOURCE DOSSIER',
    badge: 'STEP 5: DOSSIER',
    badgeColor: 'violet',
    content:
      'Clicking any resource opens its detailed dossier. Instead of just showing a naked URL, RESORA generates structured metadata: title, description, domain, format, use cases, and connected projects.',
    details: [
      'Clean readable view of what the resource actually is',
      'Inspect tags, use cases, and personal research notes',
      'Trace which projects currently depend on this resource',
    ],
    icon: FileCheck,
  },
  {
    id: 'intelligence',
    targetId: 'resource-intelligence-sample',
    title: 'AI RESOURCE UNDERSTANDING',
    badge: 'STEP 6: AI ANALYSIS',
    badgeColor: 'yellow',
    content:
      'RESORA can analyze any saved resource to turn it into structured knowledge. Instead of only remembering a link, RESORA extracts: What is this? What is it useful for? Who is it for? and What topics does it cover?',
    details: [
      'Automated extraction of core concepts and takeaways',
      'Suggested tags and practical use cases you can accept with 1 click',
      'Helps you remember why you saved something weeks later',
    ],
    icon: Brain,
  },
  {
    id: 'projects',
    targetId: 'nav-projects',
    title: 'GOAL-DRIVEN WORKSPACES',
    badge: 'STEP 7: PROJECTS',
    badgeColor: 'yellow',
    content:
      'Projects let you organize research around what you are actively building or writing. For example: a Hackathon project, a Client build, or an Academic thesis connects existing resources without duplicating them.',
    details: [
      'Group resources by status: Saved, Reviewing, Useful, or Used',
      'Keep dedicated project notes and technical decision logs',
      'Receive AI recommendations of library resources that match your goals',
    ],
    icon: FolderKanban,
  },
  {
    id: 'collections',
    targetId: 'nav-collections',
    title: 'CURATED TOPIC COLLECTIONS',
    badge: 'STEP 8: COLLECTIONS',
    badgeColor: 'violet',
    content:
      'Collections let you group related resources together by broad subject. While Projects are built around an active goal with deadlines, Collections are timeless reusable libraries of knowledge.',
    details: [
      'Examples: AI Agents, System Architecture, UI Design Inspiration',
      'Organize resources across different projects under shared themes',
      'Quickly browse your best finds in any field',
    ],
    icon: Bookmark,
  },
  {
    id: 'documents',
    targetId: 'nav-documents',
    title: 'DOCUMENTS & PDF KNOWLEDGE',
    badge: 'STEP 9: DOCUMENTS',
    badgeColor: 'violet',
    content:
      'Documents is where your research files live. Upload PDFs, research papers, notes, and Markdown files. RESORA extracts and indexes their contents page by page so you can read, search, and query them.',
    details: [
      'Built-in document reader with page breakdown',
      'Full-text extraction into searchable knowledge chunks',
      'Query papers and notes directly within Ask RESORA with page citations',
    ],
    icon: FileText,
  },
  {
    id: 'favorites',
    targetId: 'nav-favorites',
    title: 'PINNED FAVORITES',
    badge: 'STEP 10: FAVORITES',
    badgeColor: 'red',
    content:
      'Favorites are your high-frequency gems. Whenever you find an indispensable tool, an essential cheat sheet, or a foundational research paper, mark it with a heart to keep it pinned for instant access.',
    details: [
      'Dedicated quick-access view in the navigation sidebar',
      'Filterable as a scoped sub-library in Ask RESORA',
      'Never lose your most critical daily references',
    ],
    icon: Heart,
  },
  {
    id: 'search',
    targetId: 'global-search-trigger',
    title: 'INSTANT KEYBOARD SEARCH (⌘K)',
    badge: 'STEP 11: SEARCH',
    badgeColor: 'yellow',
    content:
      'Global Search lets you locate anything in your RESORA workspace in milliseconds. Press ⌘K (or Ctrl+K) or tap the top search bar to search across titles, URLs, domains, tags, and notes.',
    details: [
      'Instant fuzzy matching across all resources and projects',
      'Quick keyboard shortcuts: A for Assistant, L for Library, I for Inbox',
      'Direct navigation from anywhere in the app',
    ],
    icon: Search,
  },
  {
    id: 'capture',
    targetId: 'global-capture-btn',
    title: 'FAST WEB CAPTURE (+ CAPTURE)',
    badge: 'STEP 12: CAPTURE',
    badgeColor: 'red',
    content:
      'This is where RESORA begins. Whenever you discover something valuable online, click + CAPTURE or press the red plus button. Paste the URL, and RESORA automatically inspects the domain and saves it.',
    details: [
      'Supports articles, GitHub repositories, AI tools, documentation & video',
      'Auto-fetches title, description, favicon, and detected format',
      'Send straight to your Inbox or file into a Project immediately',
    ],
    icon: Plus,
  },
  {
    id: 'account',
    targetId: 'global-profile-menu',
    title: 'PRIVATE & ISOLATED DATA',
    badge: 'STEP 13: PRIVATE ACCOUNT',
    badgeColor: 'yellow',
    content:
      'Your RESORA account keeps your research workspace completely private and secure. All your saved links, notes, documents, and AI conversations are linked strictly to your verified identity.',
    details: [
      'Complete multi-user data isolation',
      'Full data portability: Export your entire library as JSON or CSV anytime',
      'Customize default views and assistant grounding scopes in Settings',
    ],
    icon: User,
  },
  {
    id: 'workflow',
    targetId: undefined,
    title: 'THE CORE RESORA WORKFLOW',
    badge: 'STEP 14: THE LIFECYCLE',
    badgeColor: 'red',
    content:
      'That is the complete philosophy of RESORA. You discover something useful in the wild, capture it, let RESORA understand it, organize it around your projects, and retrieve it effortlessly when you need to build.',
    details: [
      '1. CAPTURE — Stop scattering bookmarks across tabs and chats',
      '2. UNDERSTAND — AI extracts what it is and why it matters',
      '3. ORGANIZE & CONNECT — Group around active projects and topics',
      '4. RETRIEVE & USE — Ask questions, export data, and build with clarity',
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
  // Tour screen phases: 'welcome' -> 'steps' (0 to 13) -> 'finished'
  const [phase, setPhase] = useState<'welcome' | 'steps' | 'finished'>('welcome');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  const step = TOUR_STEPS[currentStepIdx];
  const totalSteps = TOUR_STEPS.length;

  // Measure and position highlight for current step
  const updateTargetHighlight = useCallback(() => {
    if (phase !== 'steps' || !step?.targetId) {
      setHighlightRect(null);
      return;
    }

    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      // Smoothly scroll target into view if outside viewport (desktop or mobile)
      if (rect.top < 60 || rect.bottom > window.innerHeight - 80) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightRect(null);
    }
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

  // Keyboard navigation (Escape to skip/close, Arrows to navigate)
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
      {/* Dimmed Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Target Element Highlight Box (when highlighting a live DOM element) */}
      {phase === 'steps' && highlightRect && (
        <div
          style={{
            top: `${Math.max(0, highlightRect.top - 6)}px`,
            left: `${Math.max(0, highlightRect.left - 6)}px`,
            width: `${highlightRect.width + 12}px`,
            height: `${highlightRect.height + 12}px`,
          }}
          className="absolute z-10 pointer-events-none border-4 border-[#FFD93D] shadow-[0px_0px_0px_9999px_rgba(0,0,0,0.7),4px_4px_0px_0px_#000] transition-all duration-300"
        >
          {/* Animated beacon badge */}
          <span className="absolute -top-3.5 -right-3.5 flex h-6 w-6">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B6B] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-[#FF6B6B] border-2 border-black"></span>
          </span>
        </div>
      )}

      {/* MODAL PHASE 1: WELCOME SCREEN */}
      {phase === 'welcome' && (
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-4 border-black p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000] space-y-6 text-center animate-in zoom-in-95 duration-150">
            <div className="flex justify-center">
              <ResoraLogo size="lg" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000] -rotate-1">
                <span className="w-2 h-2 rounded-full bg-[#FF6B6B] inline-block" />
                <span>WELCOME TO RESORA</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                YOUR PERSONAL RESEARCH INTELLIGENCE.
              </h2>

              <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed text-left sm:text-center">
                RESORA helps you save, understand, organize, connect, and retrieve everything useful you discover on the web.
              </p>

              <div className="p-3.5 bg-[#FFFDF5] border-2 border-black text-left text-xs font-bold text-black space-y-2 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex items-center gap-2 text-black font-black uppercase text-[11px] font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>30-Second Interactive Tour</span>
                </div>
                <p className="text-black/70 font-normal">
                  You don’t need to figure out everything on your own. We will walk you through where everything lives, how capture works, and how to use Ask RESORA.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleStartTour}
                className="btn-neo w-full sm:flex-1 py-3.5 px-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs sm:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2"
              >
                <span>START TOUR →</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-neo w-full sm:w-auto py-3.5 px-5 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                SKIP FOR NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHASE 2: INTERACTIVE STEP CARDS (Responsive: Bottom sheet on Mobile, Floating popover on Desktop) */}
      {phase === 'steps' && (
        <div className="relative z-20 min-h-screen flex flex-col justify-end md:justify-center items-center p-3 md:p-6 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-lg bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] p-5 sm:p-7 space-y-4 animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-150">
            {/* Header: Badge + Progress + Close */}
            <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-black uppercase border border-black ${
                    step.badgeColor === 'red'
                      ? 'bg-[#FF6B6B] text-black'
                      : step.badgeColor === 'violet'
                      ? 'bg-[#C4B5FD] text-black'
                      : 'bg-[#FFD93D] text-black'
                  }`}
                >
                  {step.badge}
                </span>
                <span className="text-[11px] font-mono font-black text-black/60">
                  {currentStepIdx + 1} / {totalSteps}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Progress bar dots */}
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
                          : 'bg-[#FFFDF5]'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Skip Tour"
                  className="btn-neo p-1 border-2 border-black bg-white hover:bg-[#FFD93D] text-black text-xs font-black"
                >
                  <X className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>
            </div>

            {/* Title & Icon */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-[#FFD93D] border-2 border-black shadow-[2px_2px_0px_0px_#000] shrink-0">
                <step.icon className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-black leading-snug">
                  {step.title}
                </h3>
              </div>
            </div>

            {/* Human-friendly Explanation */}
            <p className="text-xs sm:text-sm font-bold text-black leading-relaxed">
              {step.content}
            </p>

            {/* Concrete Bullet Details */}
            {step.details && step.details.length > 0 && (
              <div className="p-3 bg-[#FFFDF5] border-2 border-black space-y-1.5 text-xs font-bold text-black/80">
                {step.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[#FF6B6B] font-black text-xs leading-tight">▸</span>
                    <span className="leading-snug">{d}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation Controls */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t-2 border-black">
              <button
                type="button"
                onClick={onClose}
                className="text-[11px] font-mono font-black uppercase text-black/60 hover:text-black underline px-1 py-1"
              >
                SKIP TOUR
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn-neo px-3 sm:px-4 py-2 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[3px]" />
                  <span>BACK</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-neo px-4 sm:px-5 py-2 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-1 active:translate-x-0.5 active:translate-y-0.5"
                >
                  <span>{currentStepIdx === totalSteps - 1 ? 'SUMMARY →' : 'NEXT →'}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PHASE 3: FINAL READY SCREEN */}
      {phase === 'finished' && (
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-4 border-black p-6 sm:p-8 shadow-[12px_12px_0px_0px_#000] space-y-6 text-center animate-in zoom-in-95 duration-150">
            <div className="inline-flex p-3 bg-[#FFD93D] border-3 border-black shadow-[3px_3px_0px_0px_#000]">
              <CheckCircle2 className="w-8 h-8 text-black stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#C4B5FD] text-black border-2 border-black text-xs font-mono font-black uppercase shadow-[2px_2px_0px_0px_#000]">
                <span>WORKSPACE ARMED & READY</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
                YOU’RE READY TO RESEARCH.
              </h2>

              <p className="text-xs sm:text-sm font-bold text-black/80 leading-relaxed">
                Your research workspace is set up. Next time you discover a high-value tool, article, or GitHub repository, bring it into RESORA.
              </p>
            </div>

            {/* Lifecycle diagram */}
            <div className="p-3.5 bg-[#FFFDF5] border-2 border-black text-left font-mono text-[11px] font-black space-y-1.5">
              <div className="text-[10px] text-black/50 uppercase tracking-widest pb-1 border-b border-black/10">
                THE RESORA HABIT
              </div>
              <div className="flex items-center gap-1 text-black flex-wrap">
                <span className="px-2 py-0.5 bg-[#FF6B6B] border border-black text-black">CAPTURE</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-[#FFD93D] border border-black text-black">UNDERSTAND</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-[#C4B5FD] border border-black text-black">ORGANIZE</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-white border border-black text-black">USE</span>
              </div>
              <p className="text-black/70 font-sans font-normal text-xs pt-1">
                You can replay this tour anytime from <strong className="text-black">Settings → Workspace</strong>.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="btn-neo w-full sm:flex-1 py-3.5 px-4 bg-[#FFD93D] hover:bg-[#ffe169] text-black font-black uppercase text-xs sm:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center gap-2"
              >
                <span>START EXPLORING →</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </button>

              <button
                type="button"
                onClick={() => setPhase('steps')}
                className="btn-neo w-full sm:w-auto py-3.5 px-5 bg-white hover:bg-[#FFFDF5] text-black font-black uppercase text-xs tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000]"
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
