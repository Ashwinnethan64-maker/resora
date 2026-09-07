'use client';

import React from 'react';
import { AlertTriangle, ExternalLink, X, FileText, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DuplicateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  documentId?: string;
  extractedCount?: number;
  uploadedAt?: string;
  fileName?: string;
  resourceId?: string;
  linkCount?: number;
}

export function DuplicateDocumentModal({
  isOpen,
  onClose,
  documentTitle,
  documentId,
  extractedCount = 0,
  uploadedAt,
  fileName,
  resourceId,
  linkCount,
}: DuplicateDocumentModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const title = fileName || documentTitle || 'Document';
  const docId = resourceId || documentId || '';
  const totalCount = linkCount ?? extractedCount;

  const formattedDate = uploadedAt
    ? new Date(uploadedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Earlier';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFDF5] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-doc-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-[#FF6B6B] border-2 border-black p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <AlertTriangle className="w-5 h-5 text-black" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider bg-black text-white px-2 py-0.5">
            Exact Match Detected
          </span>
        </div>

        {/* Header */}
        <h2 id="duplicate-doc-modal-title" className="text-xl font-black uppercase tracking-tight text-black mb-2">
          Already in Research Archive
        </h2>

        {/* Description */}
        <p className="text-sm font-bold text-gray-700 mb-5 leading-relaxed">
          This exact document has already been uploaded and indexed. Resora does not duplicate documents or re-index existing links.
        </p>

        {/* Info Card */}
        <div className="bg-white border-3 border-black p-3.5 mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] space-y-2">
          <div className="flex items-center gap-2 font-black text-sm text-black truncate">
            <FileText className="w-4 h-4 shrink-0 text-black" />
            <span className="truncate">{title}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-dashed border-gray-300 text-xs font-bold text-gray-600">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-400">Indexed Links</span>
              <span className="font-black text-black text-sm">{totalCount} resources</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-gray-400">Uploaded</span>
              <span className="font-black text-black text-sm">{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              onClose();
              if (docId) {
                router.push(`/library?doc=${docId}`);
              } else {
                router.push('/library');
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FFD93D] hover:bg-[#FFE566] text-black font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer text-xs"
          >
            <ExternalLink className="w-4 h-4" />
            View Existing Document in Library
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-black font-black uppercase tracking-wider border-2 border-black transition-colors cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
