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
    <div className="rounded-2xl bg-[#11131e] border border-indigo-500/30 overflow-hidden shadow-xl shadow-black/50 animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#1c2236] bg-gradient-to-r from-indigo-950/30 via-[#131625] to-[#11131e]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-100">
                Recommended from Your Library
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {recommendations.length} {recommendations.length === 1 ? 'match' : 'matches'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Resources matching your objective and stack ({project.technologies?.slice(0, 3).join(', ') || project.project_type})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-[#242b3e] text-slate-400 hover:text-slate-200 hover:bg-[#181c2b] transition-colors"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-[#242b3e] text-slate-400 hover:text-slate-200 hover:bg-[#181c2b] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Recommendations Cards Carousel/Grid */}
      {isExpanded && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recommendations.map(({ resource, relevance, reasons }) => {
            const isAdding = addingId === resource.id;
            const isDismissing = dismissingId === resource.id;

            const badgeColor =
              relevance === 'Highly relevant'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : relevance === 'Relevant'
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700';

            return (
              <div
                key={resource.id}
                className="p-3.5 rounded-xl bg-[#141825] border border-[#22283a] hover:border-indigo-500/40 flex flex-col justify-between space-y-3 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-medium ${badgeColor}`}>
                      {relevance}
                    </span>
                    <button
                      onClick={() => handleDismiss(resource.id)}
                      disabled={isDismissing}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                      title="Dismiss from project recommendations"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-1">
                      {resource.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {resource.description || resource.domain}
                    </p>
                  </div>

                  {/* Explainable Reasoning ("Why this matches") */}
                  <div className="p-2.5 rounded-lg bg-[#0d0f18] border border-[#1b2030] space-y-1 text-[11px] text-slate-300">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-1">
                      <Info className="w-3 h-3 text-indigo-400" />
                      Why this matches:
                    </div>
                    <ul className="space-y-0.5 text-slate-400">
                      {reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 shrink-0">•</span>
                          <span className="leading-tight">{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-[#1b2030]">
                  <span className="text-[10px] font-mono text-slate-500">
                    {resource.resource_type} {resource.page_count ? `· ${resource.page_count}p` : ''}
                  </span>
                  <button
                    onClick={() => handleAdd(resource.id)}
                    disabled={isAdding}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-[11px] shadow-sm transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAdding ? 'Adding...' : 'Add to project'}</span>
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
