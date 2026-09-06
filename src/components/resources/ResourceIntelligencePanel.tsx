'use client';

import React, { useState } from 'react';
import { ResourceIntelligence } from '@/types/database';
import { NeoSticker } from '@/components/brand/NeoSticker';
import {
  Brain,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  Tag,
  Compass
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
      <div className="p-6 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <NeoSticker color="yellow" size="sm" rotate="-1">AI</NeoSticker>
            <h3 className="text-sm font-black uppercase tracking-wider text-black">
              RESORA INTELLIGENCE DOSSIER
            </h3>
            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-none bg-[#E0E0E0] text-black border-2 border-black uppercase">
              NOT ANALYZED
            </span>
          </div>
          <p className="text-xs font-bold text-black/70">
            Synthesize structured facts, operational use cases, and metadata taxonomy.
          </p>
        </div>

        <button
          onClick={() => onAnalyze(false)}
          className="btn-neo px-6 py-3.5 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
        >
          ANALYZE RESOURCE →
        </button>
      </div>
    );
  }

  // Status: Analyzing
  if (isAnalyzing || intelligence?.status === 'processing') {
    return (
      <div className="p-6 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#FFD93D] border-4 border-black flex items-center justify-center text-black">
            <RefreshCw className="w-5 h-5 animate-spin stroke-[3]" />
          </div>
          <div>
            <div className="text-sm font-black uppercase text-black flex items-center gap-2">
              ANALYZING RESOURCE...
              <span className="text-[10px] font-mono font-black bg-[#C4B5FD] text-black px-1.5 py-0.5 border-2 border-black uppercase">EXTRACTING FACTS</span>
            </div>
            <p className="text-xs font-bold text-black/70 mt-0.5">
              Synthesizing structure, key arguments, and application use cases.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status: Failed
  if (intelligence?.status === 'failed') {
    return (
      <div className="p-6 rounded-none bg-white border-4 border-[#FF6B6B] shadow-[8px_8px_0px_0px_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#FF6B6B] border-4 border-black flex items-center justify-center text-black shrink-0">
            <AlertCircle className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <div className="text-sm font-black uppercase text-[#FF6B6B]">
              ANALYSIS UNAVAILABLE
            </div>
            <p className="text-xs font-bold text-black/70 mt-0.5">
              {intelligence.error_message || 'Content could not be parsed. You can retry with live extraction.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onAnalyze(true)}
          className="btn-neo px-4 py-2.5 rounded-none bg-black text-white border-4 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000]"
        >
          RETRY ANALYSIS
        </button>
      </div>
    );
  }

  // Status: Ready (Completed)
  return (
    <div className="p-6 md:p-8 rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-4 border-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-[#C4B5FD] border-4 border-black flex items-center justify-center text-black shadow-[3px_3px_0px_#000]">
            <Brain className="w-5 h-5 stroke-[3]" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-black flex items-center gap-2">
              RESORA INTELLIGENCE DOSSIER
              <NeoSticker color="yellow" size="sm" rotate="1">
                VERIFIED
              </NeoSticker>
            </h3>
            <div className="text-[11px] text-black/70 font-mono font-black flex items-center gap-2 mt-0.5 uppercase">
              <span>CONFIDENCE: {intelligence?.confidence || 'HIGH'}</span>
              <span>•</span>
              <span>MODEL: {intelligence?.model || 'RESORA-V1'}</span>
            </div>
          </div>
        </div>

        {/* Re-analyze Button */}
        <div>
          {confirmReanalyze ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-black">RE-RUN ANALYSIS?</span>
              <button
                onClick={() => {
                  setConfirmReanalyze(false);
                  onAnalyze(true);
                }}
                className="btn-neo px-3 py-1 bg-[#FF6B6B] text-black border-2 border-black text-xs font-black uppercase"
              >
                YES
              </button>
              <button
                onClick={() => setConfirmReanalyze(false)}
                className="btn-neo px-3 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase"
              >
                CANCEL
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReanalyze(true)}
              className="btn-neo flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#FFD93D] text-black border-4 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000]"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[3]" />
              <span>RE-ANALYZE</span>
            </button>
          )}
        </div>
      </div>

      {/* EDITORIAL SECTIONS WITH BOLD BLACK BORDERS */}
      <div className="space-y-5 text-xs">
        
        {/* SECTION: WHAT IS THIS? (WHITE WITH RED ACCENT HEADER) */}
        <div className="border-4 border-black bg-[#FFFDF5] text-black p-5 shadow-[6px_6px_0px_0px_#000]">
          <div className="text-xs font-mono font-black uppercase tracking-wider text-black mb-2 flex items-center gap-2">
            <span className="w-3 h-3 bg-[#FF6B6B] border-2 border-black" />
            WHAT IS THIS?
          </div>
          <p className="text-sm font-black leading-relaxed text-black">
            {intelligence?.what_it_is}
          </p>
        </div>

        {/* SECTION: BEST FOR (VIVID YELLOW BLOCK) */}
        {intelligence?.best_for && intelligence.best_for.length > 0 && (
          <div className="border-4 border-black bg-[#FFD93D] text-black p-5 shadow-[6px_6px_0px_0px_#000]">
            <div className="text-xs font-mono font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-black border-2 border-black" />
              BEST FOR
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {intelligence.best_for.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 bg-white border-2 border-black text-xs font-black text-black shadow-[3px_3px_0px_#000]"
                >
                  <span className="w-2.5 h-2.5 bg-[#FF6B6B] border border-black mt-1 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: KEY POINTS (SOFT VIOLET ACCENTS) */}
        {intelligence?.key_points && intelligence.key_points.length > 0 && (
          <div className="border-4 border-black bg-white text-black p-5 shadow-[6px_6px_0px_0px_#000]">
            <div className="text-xs font-mono font-black uppercase tracking-wider text-black mb-3 flex items-center gap-2">
              <span className="w-3 h-3 bg-[#C4B5FD] border-2 border-black rotate-45" />
              KEY FACTUAL POINTS
            </div>
            <ul className="space-y-2.5">
              {intelligence.key_points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-black border-b-2 border-black/20 pb-2.5 last:border-b-0 last:pb-0">
                  <span className="font-mono font-black text-black bg-[#FFD93D] px-1.5 border border-black select-none shrink-0">{idx + 1}</span>
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* SECTION: TOPICS */}
        {intelligence?.topics && intelligence.topics.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black mb-2.5">
              DISCOVERED CLUSTER TOPICS
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligence.topics.map((top, idx) => (
                <span
                  key={top}
                  className={`px-3 py-1 text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#000] ${
                    idx % 3 === 0 ? 'bg-[#FFD93D]' : idx % 3 === 1 ? 'bg-[#C4B5FD]' : 'bg-[#FF6B6B]'
                  }`}
                >
                  #{top}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTED TAGS */}
        {intelligence?.suggested_tags && intelligence.suggested_tags.length > 0 && (
          <div className="pt-4 border-t-4 border-black">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 stroke-[3]" />
                SUGGESTED TAXONOMY TAGS
              </div>
              <span className="text-[10px] text-black/60 font-mono font-black uppercase">
                CLICK ✓ TO ADOPT
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligence.suggested_tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-none bg-white border-2 border-black text-xs font-mono font-black text-black shadow-[3px_3px_0px_#000]"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => onAcceptTag(tag)}
                    title="Accept tag"
                    className="p-1 rounded-none bg-[#FFD93D] hover:bg-[#ffe366] border border-black text-black transition-colors"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => onDismissTag(tag)}
                    title="Dismiss"
                    className="p-1 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] border border-black text-black transition-colors"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUGGESTED USE CASES */}
        {intelligence?.suggested_use_cases && intelligence.suggested_use_cases.length > 0 && (
          <div className="pt-4 border-t-4 border-black">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] font-mono font-black uppercase tracking-wider text-black flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 stroke-[3]" />
                SUGGESTED USE CASES
              </div>
              <span className="text-[10px] text-black/60 font-mono font-black uppercase">
                CLICK ✓ TO ADOPT
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligence.suggested_use_cases.map((uc) => (
                <div
                  key={uc}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-none bg-[#C4B5FD] border-2 border-black text-xs font-black text-black shadow-[3px_3px_0px_#000]"
                >
                  <span>{uc}</span>
                  <button
                    onClick={() => onAcceptUseCase(uc)}
                    title="Accept use case"
                    className="p-1 rounded-none bg-[#FFD93D] hover:bg-[#ffe366] border border-black text-black transition-colors"
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </button>
                  <button
                    onClick={() => onDismissUseCase(uc)}
                    title="Dismiss"
                    className="p-1 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] border border-black text-black transition-colors"
                  >
                    <X className="w-3 h-3 stroke-[3]" />
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
