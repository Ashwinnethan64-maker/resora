'use client';

import React, { useState, useEffect } from 'react';
import { useResora } from '@/context/ResoraContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { ResourceIntelligence } from '@/types/database';
import {
  Inbox,
  ExternalLink,
  CheckCircle2,
  Calendar,
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header: Hot Red Neo-Brutalist Banner */}
      <div className="p-6 md:p-10 bg-[#FF6B6B] text-black border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-end justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-4 shadow-[3px_3px_0px_0px_#000] -rotate-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] border border-black" />
            UNPROCESSED RESEARCH
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            INBOX.<br />
            <span className="bg-[#FFFDF5] px-2 py-0.5 inline-block border-2 border-black shadow-[4px_4px_0px_0px_#000] mt-2 rotate-1">
              {inboxResources.length} ITEMS
            </span> PENDING.
          </h1>
          <p className="text-sm md:text-base font-bold text-black mt-4 max-w-xl">
            Captured links awaiting project assignment, taxonomy tags, and AI dossier verification.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleOrganizeWithAI}
            disabled={organizingAI || inboxResources.length === 0}
            className="btn-neo px-6 py-4 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-4 border-black font-black uppercase text-xs sm:text-sm tracking-wider shadow-[6px_6px_0px_0px_#000] disabled:opacity-50"
          >
            {organizingAI ? 'SYNTHESIZING...' : '⚡ ANALYZE INBOX WITH AI'}
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-[#FFFFFF] border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-start gap-3 text-xs md:text-sm text-black font-bold">
        <div className="w-4 h-4 rounded-none bg-[#C4B5FD] border-2 border-black mt-0.5 shrink-0" />
        <div>
          <span className="font-black uppercase bg-[#FFD93D] px-1 border border-black mr-1">INTELLIGENT INBOX TRIAGE:</span> Resora generates verified types, topics, and use cases for unorganized captures. Click "Accept & Organize" to apply recommendations in one step.
        </div>
      </div>

      {/* Content List */}
      {isLoading ? (
        <ResourceSkeleton count={4} viewMode="list" />
      ) : inboxResources.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="YOUR RESEARCH INBOX IS CLEAR"
          description="All captured items have been triaged and organized into your library, projects, and collections."
        />
      ) : (
        <div className="space-y-5">
          {inboxResources.map((item) => {
            const intel = intelMap[item.id];
            return (
              <div
                key={item.id}
                className="p-6 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] hover:shadow-[10px_10px_0px_0px_#000] hover:-translate-y-1 transition-all duration-150 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-3 h-3 rounded-none bg-[#FF6B6B] border-2 border-black" />
                      <h3 className="text-base md:text-lg font-black uppercase text-black truncate">
                        {item.title}
                      </h3>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-[#FF6B6B] transition-colors p-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <span className="text-xs font-mono font-black text-black bg-[#FFFDF5] px-2 py-0.5 border border-black">
                        VIA {item.domain.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm font-medium text-black line-clamp-2 leading-relaxed">
                      {intel?.summary || item.description || 'Quick-saved research resource.'}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs font-mono font-bold text-black uppercase">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-black" /> SAVED {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 bg-[#C4B5FD] text-black border-2 border-black font-black">
                        TYPE: {item.resource_type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t-2 md:border-t-0 border-black">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn-neo flex items-center gap-1.5 px-4 py-2.5 bg-white border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>EDIT</span>
                    </button>
                    {intel ? (
                      <button
                        onClick={() => handleAcceptAllSuggestions(item)}
                        className="btn-neo flex items-center gap-1.5 px-5 py-2.5 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
                      >
                        <Check className="w-4 h-4" />
                        <span>ACCEPT & ORGANIZE</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOrganizeItem(item.id)}
                        className="btn-neo flex items-center gap-1.5 px-5 py-2.5 bg-[#C4B5FD] hover:bg-[#b8a6fb] text-black border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ORGANIZE</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Suggestions Preview Bar */}
                {intel && (
                  <div className="pt-4 border-t-2 border-black flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 font-black uppercase text-black bg-[#FFD93D] px-2 py-1 border border-black">
                      <Brain className="w-3.5 h-3.5" />
                      <span>AI SUGGESTIONS:</span>
                    </div>

                    {intel.suggested_tags && intel.suggested_tags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-black font-mono font-bold uppercase">TAGS:</span>
                        {intel.suggested_tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-white text-black border-2 border-black font-mono font-black text-xs shadow-[2px_2px_0px_0px_#000]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {intel.suggested_use_cases && intel.suggested_use_cases.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-black font-mono font-bold uppercase">USE CASES:</span>
                        {intel.suggested_use_cases.map((uc) => (
                          <span
                            key={uc}
                            className="px-2.5 py-0.5 bg-[#C4B5FD] text-black border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000]"
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
