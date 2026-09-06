'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ProjectModel, ProjectRecommendationModel } from '@/types/database';
import {
  Sparkles,
  Plus,
  X,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ProjectRecommendationsPanelProps {
  project: ProjectModel;
  recommendations: ProjectRecommendationModel[];
  isLoading: boolean;
  onRefresh: () => void;
  onAdded: () => void;
}

export function ProjectRecommendationsPanel({
  project,
  recommendations,
  isLoading,
  onRefresh,
  onAdded,
}: ProjectRecommendationsPanelProps) {
  const { addResourceToProject, dismissRecommendation, showToast } = useResora();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [dismissingId, setDismissingId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAdd = async (resourceId: string) => {
    setAddingId(resourceId);
    try {
      await addResourceToProject(project.id, resourceId);
      onAdded();
    } catch {
      showToast('Failed to add resource');
    } finally {
      setAddingId(null);
    }
  };

  const handleDismiss = async (resourceId: string) => {
    setDismissingId(resourceId);
    try {
      await dismissRecommendation(project.id, resourceId);
      onRefresh();
    } catch {
      showToast('Failed to dismiss recommendation');
    } finally {
      setDismissingId(null);
    }
  };

  if (recommendations.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="rounded-none bg-white border-4 border-black overflow-hidden shadow-[8px_8px_0px_0px_#000] animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b-4 border-black bg-[#FFD93D]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-none bg-white border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-4 h-4 stroke-[3px]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-tight">
                RECOMMENDED FROM YOUR LIBRARY
              </h2>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-none bg-white text-black border border-black uppercase">
                {recommendations.length} {recommendations.length === 1 ? 'MATCH' : 'MATCHES'}
              </span>
            </div>
            <p className="text-[11px] text-black font-mono font-bold mt-0.5 truncate uppercase">
              Objective & Stack ({project.technologies?.slice(0, 3).join(', ') || project.project_type})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-neo p-2 rounded-none bg-white border-2 border-black text-black hover:bg-[#FF6B6B] transition-colors shadow-[2px_2px_0px_0px_#000]"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[3px] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-neo p-2 rounded-none bg-white border-2 border-black text-black hover:bg-[#C4B5FD] transition-colors shadow-[2px_2px_0px_0px_#000]"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 stroke-[3px]" /> : <ChevronDown className="w-3.5 h-3.5 stroke-[3px]" />}
          </button>
        </div>
      </div>

      {/* Recommendations Cards Carousel/Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#FFFDF5]">
          {recommendations.map(({ resource, relevance, reasons }) => {
            const isAdding = addingId === resource.id;
            const isDismissing = dismissingId === resource.id;

            const badgeColor =
              relevance === 'Highly relevant'
                ? 'bg-[#FF6B6B] text-black'
                : relevance === 'Relevant'
                ? 'bg-[#FFD93D] text-black'
                : 'bg-[#C4B5FD] text-black';

            return (
              <div
                key={resource.id}
                className="p-4 rounded-none bg-white border-4 border-black card-neo flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-none border border-black font-black uppercase ${badgeColor}`}>
                      {relevance}
                    </span>
                    <button
                      onClick={() => handleDismiss(resource.id)}
                      disabled={isDismissing}
                      className="p-1 rounded-none text-black hover:bg-[#FF6B6B] border border-black transition-colors"
                      title="Dismiss from project recommendations"
                    >
                      <X className="w-3.5 h-3.5 stroke-[3px]" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-black line-clamp-1 tracking-tight">
                      {resource.title}
                    </h4>
                    <p className="text-[11px] text-black/80 font-mono line-clamp-2 mt-1">
                      {resource.description || resource.domain}
                    </p>
                  </div>

                  {/* Explainable Reasoning ("Why this matches") */}
                  <div className="p-2.5 rounded-none bg-[#FFFDF5] border-2 border-black space-y-1 text-[11px] text-black">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-black font-black flex items-center gap-1">
                      <Info className="w-3 h-3 text-black stroke-[3px]" />
                      WHY THIS MATCHES:
                    </div>
                    <ul className="space-y-1 font-mono text-[10px] text-black/90 font-bold">
                      {reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-black font-black shrink-0">■</span>
                          <span className="leading-tight">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 flex items-center justify-between border-t-2 border-black">
                  <span className="text-[10px] font-mono font-black text-black uppercase bg-[#FFD93D] px-1.5 py-0.5 border border-black">
                    {resource.resource_type} {resource.page_count ? `· ${resource.page_count}P` : ''}
                  </span>
                  <button
                    onClick={() => handleAdd(resource.id)}
                    disabled={isAdding}
                    className="btn-neo flex items-center gap-1 px-3 py-1.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-[11px] border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3 stroke-[3px]" />
                    <span>{isAdding ? 'ADDING...' : 'ADD TO PROJECT'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
