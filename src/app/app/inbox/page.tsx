'use client';

import React, { useState, useEffect } from 'react';
import { useResora } from '@/context/ResoraContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { ResourceIntelligence } from '@/types/database';
import {
  Inbox,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Tag,
  Info,
  Edit2,
  Brain,
  Check
} from 'lucide-react';

export default function InboxPage() {
  const {
    inboxResources,
    updateResource,
    openEditModal,
    getIntelligence,
    analyzeResource,
    isLoading,
    showToast
  } = useResora();

  const [organizingAI, setOrganizingAI] = useState(false);
  const [intelMap, setIntelMap] = useState<Record<string, ResourceIntelligence>>({});

  // Load or fetch intelligence previews for inbox items
  useEffect(() => {
    inboxResources.forEach((item) => {
      getIntelligence(item.id).then((intel) => {
        if (intel) {
          setIntelMap((prev) => ({ ...prev, [item.id]: intel }));
        }
      });
    });
  }, [inboxResources, getIntelligence]);

  const handleOrganizeWithAI = async () => {
    setOrganizingAI(true);
    for (const item of inboxResources) {
      if (!intelMap[item.id]) {
        const generated = await analyzeResource(item.id, false);
        if (generated) {
          setIntelMap((prev) => ({ ...prev, [item.id]: generated }));
        }
      }
    }
    setOrganizingAI(false);
    showToast('AI suggestions generated for inbox items');
  };

  const handleOrganizeItem = async (id: string) => {
    await updateResource(id, { is_inbox: false });
    showToast('Organized resource into primary library');
  };

  const handleAcceptAllSuggestions = async (item: any) => {
    const intel = intelMap[item.id];
    const newTags = Array.from(new Set([...(item.tags || []), ...(intel?.suggested_tags || [])]));
    const newUcs = Array.from(new Set([...(item.use_cases || []), ...(intel?.suggested_use_cases || [])]));

    await updateResource(item.id, {
      is_inbox: false,
      tags: newTags,
      use_cases: newUcs,
    });
    showToast(`Accepted AI suggestions & organized "${item.title}"`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1c2132]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Inbox
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {inboxResources.length} pending
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400">
            Capture now. Organize with AI intelligence when you're ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOrganizeWithAI}
            disabled={organizingAI || inboxResources.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-md shadow-indigo-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className={`w-3.5 h-3.5 ${organizingAI ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
            <span>{organizingAI ? 'Analyzing resources...' : 'Analyze inbox with AI'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#131622] border border-[#212739] flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Intelligent Inbox Triage:</span> Resora generates suggested types, topics, and use cases for unorganized items. Click "Accept & Organize" to apply recommendations in one step.
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <ResourceSkeleton count={4} viewMode="list" />
      ) : inboxResources.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Your research inbox is clear."
          description="All captured items have been triaged and organized into your library, projects, and collections."
        />
      ) : (
        <div className="space-y-4">
          {inboxResources.map((item) => {
            const intel = intelMap[item.id];
            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#11131c] border border-[#1f2433] hover:border-[#2f3850] transition-all space-y-3 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {item.title}
                      </h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[10px] font-mono text-slate-500">
                        via {item.domain}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {intel?.summary || item.description || 'Quick-saved research resource.'}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> Saved {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                        Type: {item.resource_type}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1c2132]">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#23293c] text-slate-300 hover:text-white hover:bg-[#181d2c] text-xs font-medium transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    {intel ? (
                      <button
                        onClick={() => handleAcceptAllSuggestions(item)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Organize</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOrganizeItem(item.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Organize</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Suggestions Preview Bar */}
                {intel && (
                  <div className="pt-3 border-t border-[#1a1f2e] flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-mono text-[11px] font-semibold">
                      <Brain className="w-3.5 h-3.5" />
                      <span>AI Suggested:</span>
                    </div>

                    {intel.suggested_tags && intel.suggested_tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">Tags:</span>
                        {intel.suggested_tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded bg-[#181c2b] text-indigo-300 border border-indigo-500/20 font-mono text-[10px]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {intel.suggested_use_cases && intel.suggested_use_cases.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">Use Cases:</span>
                        {intel.suggested_use_cases.map((uc) => (
                          <span
                            key={uc}
                            className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium"
                          >
                            {uc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
