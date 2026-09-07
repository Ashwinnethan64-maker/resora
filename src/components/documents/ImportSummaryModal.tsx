'use client';

import React from 'react';
import { CheckCircle, AlertCircle, ExternalLink, X, PlusCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ImportSummaryData {
  sourceFileName?: string;
  sourceDocumentId?: string;
  detected: number;
  newResourcesCreated: number;
  duplicatesSkipped: number;
  documentTitle?: string;
  documentId?: string;
}

export type ImportMetrics = ImportSummaryData;

interface ImportSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics?: ImportMetrics | null;
  summary?: ImportSummaryData | null;
}

export function ImportSummaryModal({
  isOpen,
  onClose,
  metrics,
  summary,
}: ImportSummaryModalProps) {
  const router = useRouter();

  const data = summary || metrics;
  if (!isOpen || !data) return null;

  const title = data.sourceFileName || data.documentTitle || 'Document';
  const detected = data.detected ?? 0;
  const newCount = data.newResourcesCreated ?? 0;
  const skippedCount = data.duplicatesSkipped ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFDF5] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-summary-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#4D96FF] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
            Deduplicated Import
          </span>
        </div>

        {/* Header */}
        <h2 id="import-summary-modal-title" className="text-xl font-black uppercase tracking-tight text-black mb-1">
          Import Complete
        </h2>
        <p className="text-xs font-bold text-gray-500 mb-5 truncate">
          File: <span className="text-black font-black">{title}</span>
        </p>

        {/* Breakdown Card Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {/* Detected */}
          <div className="bg-white border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1">
              Detected
            </div>
            <div className="text-2xl font-black text-black">
              {detected}
            </div>
          </div>

          {/* New Resources */}
          <div className="bg-[#98EECC] border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black uppercase tracking-wider text-black/70 mb-1">
              New Added
            </div>
            <div className="text-2xl font-black text-black">
              {newCount}
            </div>
          </div>

          {/* Duplicates Skipped */}
          <div className="bg-[#FFD93D] border-3 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black uppercase tracking-wider text-black/70 mb-1">
              Duplicates
            </div>
            <div className="text-2xl font-black text-black">
              {skippedCount}
            </div>
          </div>
        </div>

        {/* Explanation Alert */}
        <div className="bg-[#F0EDFF] border-2 border-black p-3 mb-6 flex items-start gap-2.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-black leading-relaxed">
            {skippedCount > 0
              ? `${skippedCount} link${skippedCount === 1 ? '' : 's'} already existed in your library and ${skippedCount === 1 ? 'was' : 'were'} skipped to prevent duplication. AI analysis has been triggered for the ${newCount} new item${newCount === 1 ? '' : 's'}.`
              : `All ${newCount} detected links are brand new. AI analysis and categorization have started automatically.`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              router.push('/library');
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FFD93D] hover:bg-[#FFE566] text-black font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer text-xs"
          >
            <ExternalLink className="w-4 h-4" />
            View Library Resources
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider border-2 border-black transition-colors cursor-pointer text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
