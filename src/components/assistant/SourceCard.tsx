'use client';

import React from 'react';
import Link from 'next/link';
import { AssistantCitation } from '@/types/database';
import {
  FileText,
  Globe,
  ExternalLink,
  BookOpen,
  Wrench,
  Sparkles,
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
    <div className="p-3 rounded-xl bg-[#121522] hover:bg-[#151928] border border-[#21273a] hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-2.5 text-xs shadow-sm group">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
            Source [{index + 1}]
          </span>
          <span className="text-[10px] font-mono text-slate-500 truncate">
            {citation.domain}
          </span>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {citation.title}
          </h4>
          {citation.snippet && (
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic leading-relaxed">
              "{citation.snippet}"
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-[#1a1f2e] flex items-center justify-between">
        {citation.page_number ? (
          <span className="text-[10px] font-mono text-indigo-400 font-medium">
            Page {citation.page_number}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-500 capitalize">
            {citation.resource_type}
          </span>
        )}

        {isDocument && citation.page_number && onOpenDocumentPage ? (
          <button
            onClick={() => onOpenDocumentPage(citation.resource_id, citation.page_number!)}
            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <span>Open Page {citation.page_number}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        ) : (
          <Link
            href={`/app/library/${citation.resource_id}`}
            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <span>Open resource</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
