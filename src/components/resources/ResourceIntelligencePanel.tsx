'use client';

import React, { useState } from 'react';
import { ResourceIntelligence } from '@/types/database';
import {
  Brain,
  Sparkles,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldCheck,
  Layers,
  Tag
} from 'lucide-react';

interface ResourceIntelligencePanelProps {
  intelligence: ResourceIntelligence | null;
  onAnalyze: (force?: boolean) => Promise<void>;
  onAcceptTag: (tag: string) => Promise<void>;
  onDismissTag: (tag: string) => Promise<void>;
  onAcceptUseCase: (useCase: string) => Promise<void>;
  onDismissUseCase: (useCase: string) => Promise<void>;
  isAnalyzing?: boolean;
}

export function ResourceIntelligencePanel({
  intelligence,
  onAnalyze,
  onAcceptTag,
  onDismissTag,
  onAcceptUseCase,
  onDismissUseCase,
  isAnalyzing = false,
}: ResourceIntelligencePanelProps) {
  const [confirmReanalyze, setConfirmReanalyze] = useState(false);

  // Status: Not analyzed
  if (!intelligence && !isAnalyzing) {
    return (
      <div className="p-6 rounded-2xl bg-[#11131e] border border-[#22293e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Resora Intelligence
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Not analyzed
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Generate factual structured synthesis, practical use cases, and tag recommendations.
          </p>
        </div>

        <button
          onClick={() => onAnalyze(false)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Analyze resource</span>
        </button>
      </div>
    );
  }

  // Status: Analyzing
  if (isAnalyzing || intelligence?.status === 'processing') {
    return (
      <div className="p-6 rounded-2xl bg-[#11131e] border border-indigo-500/30 flex items-center justify-between gap-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              Analyzing resource...
              <span className="text-[10px] font-mono text-indigo-400">Extracting facts</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesizing structure, key points, and application use cases.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status: Failed
  if (intelligence?.status === 'failed') {
    return (
      <div className="p-6 rounded-2xl bg-[#171216] border border-rose-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-rose-300">
              Analysis unavailable
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {intelligence.error_message || 'Content could not be extracted. You can retry with live metadata.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onAnalyze(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#201822] hover:bg-[#2c1f30] text-rose-200 border border-rose-800/40 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry analysis</span>
        </button>
      </div>
    );
  }

  // Status: Ready (Completed)
  return (
    <div className="p-6 rounded-2xl bg-[#10121d] border border-indigo-500/30 shadow-lg shadow-indigo-950/20 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1c2236]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              RESORA INTELLIGENCE
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Ready
              </span>
            </h3>
            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
              <span>Confidence: {intelligence?.confidence || 'high'}</span>
              <span>•</span>
              <span>Model: {intelligence?.model || 'resora-v1'}</span>
            </div>
          </div>
        </div>

        {/* Re-analyze Button */}
        <div>
          {confirmReanalyze ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Re-run analysis?</span>
              <button
                onClick={() => {
                  setConfirmReanalyze(false);
                  onAnalyze(true);
                }}
                className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmReanalyze(false)}
                className="px-2.5 py-1 rounded-md bg-[#191d2c] text-slate-400 text-xs hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReanalyze(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161a28] hover:bg-[#1f253a] text-slate-300 hover:text-slate-100 border border-[#252b40] text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3 h-3 text-indigo-400" />
              <span>Re-analyze</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-4 text-xs">
        {/* WHAT IS THIS */}
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            WHAT IS THIS?
          </div>
          <p className="text-slate-200 text-sm leading-relaxed bg-[#0d0f17] p-3 rounded-xl border border-[#1a1f2e]">
            {intelligence?.what_it_is}
          </p>
        </div>

        {/* BEST FOR */}
        {intelligence?.best_for && intelligence.best_for.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold mb-1.5">
              BEST FOR
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {intelligence.best_for.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-[#141826] border border-[#20273c] text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KEY POINTS */}
        {intelligence?.key_points && intelligence.key_points.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 font-semibold mb-1.5">
              KEY POINTS
            </div>
            <ul className="space-y-1.5 bg-[#0d0f17] p-3 rounded-xl border border-[#1a1f2e]">
              {intelligence.key_points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="text-indigo-400 select-none">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TOPICS */}
        {intelligence?.topics && intelligence.topics.length > 0 && (
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
              DISCOVERED TOPICS
            </div>
            <div className="flex flex-wrap gap-1.5">
              {intelligence.topics.map((top) => (
                <span
                  key={top}
                  className="px-2.5 py-1 rounded-md bg-[#161a28] text-slate-300 border border-[#252b3e] font-medium text-[11px]"
                >
                  {top}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTED TAGS (Individual Accept / Dismiss) */}
        {intelligence?.suggested_tags && intelligence.suggested_tags.length > 0 && (
          <div className="pt-2 border-t border-[#1a1f2e]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <Tag className="w-3 h-3" />
                SUGGESTED TAGS
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Click + to add to your tags
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligence.suggested_tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => onAcceptTag(tag)}
                    title="Accept tag"
                    className="p-1 rounded hover:bg-indigo-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDismissTag(tag)}
                    title="Dismiss"
                    className="p-1 rounded hover:bg-indigo-500/20 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTED USE CASES (Individual Accept / Dismiss) */}
        {intelligence?.suggested_use_cases && intelligence.suggested_use_cases.length > 0 && (
          <div className="pt-2 border-t border-[#1a1f2e]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                SUGGESTED USE CASES
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Click + to add to your use cases
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligence.suggested_use_cases.map((uc) => (
                <div
                  key={uc}
                  className="flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium"
                >
                  <span>{uc}</span>
                  <button
                    onClick={() => onAcceptUseCase(uc)}
                    title="Accept use case"
                    className="p-1 rounded hover:bg-amber-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDismissUseCase(uc)}
                    title="Dismiss"
                    className="p-1 rounded hover:bg-amber-500/20 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
