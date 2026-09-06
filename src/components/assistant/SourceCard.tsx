'use client';

import React from 'react';
import Link from 'next/link';
import { AssistantCitation } from '@/types/database';
import {
  ExternalLink,
  ArrowRight
} from 'lucide-react';

interface SourceCardProps {
  citation: AssistantCitation;
  index: number;
  onOpenDocumentPage?: (resourceId: string, pageNumber: number) => void;
}

export function SourceCard({ citation, index, onOpenDocumentPage }: SourceCardProps) {
  const isDocument = citation.resource_type === 'pdf' || citation.resource_type === 'document' || citation.page_number !== undefined;

  return (
    <div className="card-neo p-4 rounded-none bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between space-y-2.5 text-xs">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-[#FFD93D] text-black border-2 border-black uppercase tracking-wider shadow-[1px_1px_0px_#000]">
            SOURCE [{index + 1}]
          </span>
          <span className="text-[10px] font-mono font-black text-black/60 truncate">
            {citation.domain}
          </span>
        </div>

        <div>
          <h4 className="font-black uppercase text-black hover:underline transition-colors line-clamp-1">
            {citation.title}
          </h4>
          {citation.snippet && (
            <p className="text-[11px] text-black/80 line-clamp-2 mt-1 italic font-bold leading-relaxed bg-[#FFFDF5] p-2 border-2 border-black/30">
              "{citation.snippet}"
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t-2 border-black flex items-center justify-between">
        {citation.page_number ? (
          <span className="text-[10px] font-mono font-black bg-[#C4B5FD] text-black px-1.5 border border-black uppercase">
            PAGE {citation.page_number}
          </span>
        ) : (
          <span className="text-[10px] font-mono font-black text-black/60 uppercase">
            {citation.resource_type}
          </span>
        )}

        {isDocument && citation.page_number && onOpenDocumentPage ? (
          <button
            onClick={() => onOpenDocumentPage(citation.resource_id, citation.page_number!)}
            className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#FF6B6B] hover:text-black transition-colors"
          >
            <span>PAGE {citation.page_number} →</span>
          </button>
        ) : (
          <Link
            href={`/app/library/${citation.resource_id}`}
            className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-black hover:text-[#FF6B6B] transition-colors"
          >
            <span>DOSSIER</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        )}
      </div>
    </div>
  );
}
