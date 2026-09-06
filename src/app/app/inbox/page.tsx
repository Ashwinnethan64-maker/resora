'use client';

import React, { useState, useEffect } from 'react';
import { useResora } from '@/context/ResoraContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResourceSkeleton } from '@/components/resources/ResourceSkeleton';
import { ResourceIntelligence } from '@/types/database';
import { PageHeader } from '@/components/ui/SectionLabel';
import {
  Inbox,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Edit2,
  Sparkles,
  Check,
  ArrowRight,
  Trash2
} from 'lucide-react';

export default function InboxPage() {
  const {
    inboxResources,
    updateResource,
    openEditModal,
    openDeleteDialog,
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <PageHeader
        eyebrow="UNPROCESSED RESEARCH"
        eyebrowColor="coral"
        eyebrowIcon={<span className="w-2 h-2 rounded-full bg-black inline-block" />}
        title={`INBOX (${inboxResources.length}).`}
        description="Captured research waiting to be understood, tagged, and filed into active projects."
        actions={
          <button
            onClick={handleOrganizeWithAI}
            disabled={organizingAI || inboxResources.length === 0}
            className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FFD93D] hover:bg-[#ffe169] text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#000] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>{organizingAI ? 'ANALYZING INBOX...' : 'AI AUTO-TRIAGE'}</span>
          </button>
        }
      />

      {/* Inbox Items Feed */}
      {isLoading ? (
        <ResourceSkeleton count={3} />
      ) : inboxResources.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="YOUR INBOX IS CLEAN"
          description="All captured research has been organized into your library and project workspaces."
          actionLabel="EXPLORE YOUR LIBRARY"
          onAction={() => {}}
        />
      ) : (
        <div className="space-y-4">
          {inboxResources.map((item) => {
            const intel = intelMap[item.id];
            return (
              <div
                key={item.id}
                className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_#000] space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-black bg-[#FFD93D] text-black">
                        {item.resource_type.toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-black/60 font-bold">{item.domain}</span>
                    </div>

                    <h3 className="text-base font-bold text-black">{item.title}</h3>
                    <p className="text-xs text-black/75 font-normal leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleOrganizeItem(item.id)}
                      className="btn-neo px-3 py-1.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-[#FFD93D] text-black shadow-[2px_2px_0px_#000]"
                      title="Edit details"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(item)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-[#FF6B6B] text-black shadow-[2px_2px_0px_#000]"
                      title="Discard"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                    </button>
                  </div>
                </div>

                {/* AI Intelligence Suggestions (if ready) */}
                {intel && (
                  <div className="p-3.5 bg-[#FFFDF5] border-2 border-black space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-black uppercase text-black flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#FF6B6B] stroke-[2.5]" />
                        <span>AI Dossier Insight</span>
                      </span>
                      <button
                        onClick={() => handleAcceptAllSuggestions(item)}
                        className="text-[11px] font-bold text-black underline hover:text-[#FF6B6B]"
                      >
                        Accept Suggestions →
                      </button>
                    </div>

                    <div className="text-xs text-black/85 font-normal">
                      <strong>What it is:</strong> {intel.what_it_is}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {intel.suggested_tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-black font-bold">
                          #{tag}
                        </span>
                      ))}
                      {intel.suggested_use_cases?.slice(0, 2).map((uc) => (
                        <span key={uc} className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FFD93D] border border-black font-bold">
                          {uc}
                        </span>
                      ))}
                    </div>
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
