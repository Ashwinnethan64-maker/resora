'use client';

import React, { useState, useEffect } from 'react';
import { ResourceModel, DocumentModel, DocumentPageModel } from '@/types/database';
import { ResourceService } from '@/lib/services/resource-service';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  FileText,
  Copy,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  resource: ResourceModel | null;
  onClose: () => void;
}

export function DocumentViewerModal({
  isOpen,
  resource,
  onClose,
}: DocumentViewerModalProps) {
  const [documentModel, setDocumentModel] = useState<DocumentModel | null>(null);
  const [pages, setPages] = useState<DocumentPageModel[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    if (isOpen && resource) {
      setCurrentPageNum(1);
      setPageSearchQuery('');
      ResourceService.getDocumentByResourceId(resource.id).then((doc) => {
        setDocumentModel(doc);
        if (doc) {
          ResourceService.getDocumentPages(doc.id).then(setPages);
        } else {
          // If no formal document record, render resource.content as single page
          setPages([
            {
              id: 'single-page',
              document_id: 'default',
              page_number: 1,
              content: resource.content || resource.description || 'Document content unavailable.',
              created_at: resource.created_at,
            },
          ]);
        }
      });
    }
  }, [isOpen, resource]);

  if (!isOpen || !resource) return null;

  const totalPages = pages.length || resource.page_count || 1;
  const activePage = pages.find((p) => p.page_number === currentPageNum) || pages[0];

  // In-document page search results
  const matchingPages = pageSearchQuery.trim()
    ? pages.filter((p) =>
        p.content.toLowerCase().includes(pageSearchQuery.toLowerCase().trim())
      )
    : [];

  const handleCopyPageText = () => {
    if (activePage?.content) {
      navigator.clipboard.writeText(activePage.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadOriginal = () => {
    // Direct endpoint download from Supabase storage or server buffer
    window.open(`/api/documents/${resource.id}/download`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[92vh] rounded-none bg-[#FFFDF5] border-4 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col overflow-hidden z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-4 border-black bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-none bg-[#FFD93D] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <FileText className="w-4 h-4 stroke-[3px]" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-black text-black truncate uppercase tracking-tight">
                {resource.file_name || resource.title}
              </h2>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-black uppercase">
                <span className="bg-[#C4B5FD] px-1.5 py-0.5 border border-black">{resource.resource_type.toUpperCase()}</span>
                <span>•</span>
                <span className="bg-white px-1.5 py-0.5 border border-black">
                  Page {currentPageNum} / {totalPages}
                </span>
                {resource.file_size && (
                  <>
                    <span>•</span>
                    <span className="bg-[#FFD93D] px-1.5 py-0.5 border border-black">{(resource.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download */}
            <button
              onClick={handleDownloadOriginal}
              className="btn-neo flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white hover:bg-[#FFD93D] border-2 border-black text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] transition-all"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5 stroke-[3px]" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-none text-black hover:bg-[#FF6B6B] border-2 border-black transition-colors"
            >
              <X className="w-5 h-5 stroke-[3px]" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar (Page Search & Thumbnails) + Reader Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Search & Page Index */}
          <aside className="hidden md:flex w-64 flex-col border-r-4 border-black bg-white p-3 space-y-3 shrink-0">
            {/* In-Document Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-black absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[3px]" />
              <input
                type="text"
                placeholder="FIND IN DOCUMENT..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-none bg-[#FFFDF5] border-2 border-black text-xs text-black placeholder-black/50 font-mono font-bold focus:bg-[#FFD93D] focus:outline-none"
              />
            </div>

            {/* Page Jump List / Search Matches */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {pageSearchQuery ? (
                <div>
                  <div className="text-[10px] font-mono font-black text-black uppercase px-1 pb-1">
                    Matches ({matchingPages.length})
                  </div>
                  {matchingPages.length === 0 ? (
                    <div className="text-xs text-black font-bold p-2 italic bg-[#FFFDF5] border border-black">No matches on any page</div>
                  ) : (
                    matchingPages.map((mp) => (
                      <button
                        key={mp.id}
                        onClick={() => setCurrentPageNum(mp.page_number)}
                        className={`w-full text-left p-2 rounded-none text-xs transition-colors border-2 border-black ${
                          currentPageNum === mp.page_number
                            ? 'bg-[#FFD93D] text-black font-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white text-black hover:bg-[#FFFDF5]'
                        }`}
                      >
                        <div className="font-black text-[11px] text-black font-mono uppercase">
                          Page {mp.page_number}
                        </div>
                        <div className="line-clamp-2 text-[11px] text-black mt-0.5 font-mono">
                          {mp.content}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-[10px] font-mono font-black text-black uppercase px-1 pb-1">
                    Document Pages
                  </div>
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCurrentPageNum(p.page_number)}
                      className={`w-full text-left px-2.5 py-2 rounded-none text-xs font-mono transition-colors flex items-center justify-between border-2 border-black mb-1.5 ${
                        currentPageNum === p.page_number
                          ? 'bg-[#FF6B6B] text-black font-black shadow-[2px_2px_0px_0px_#000]'
                          : 'bg-white text-black hover:bg-[#FFD93D]'
                      }`}
                    >
                      <span className="font-black uppercase">Page {p.page_number}</span>
                      <span className="text-[10px] font-bold bg-white px-1 border border-black">
                        {p.content.split(/\s+/).length}w
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Reader View */}
          <main className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FFFDF5]">
            {/* Top Toolbar: Navigation & Zoom */}
            <div className="px-4 py-2 border-b-2 border-black flex items-center justify-between text-xs text-black bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                  disabled={currentPageNum <= 1}
                  className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3px]" />
                </button>
                <span className="font-mono font-black text-xs uppercase bg-[#FFD93D] px-2 py-0.5 border border-black">
                  PAGE {currentPageNum} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPageNum >= totalPages}
                  className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3px]" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D]"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5 stroke-[3px]" />
                  </button>
                  <span className="font-mono font-black text-[11px] w-12 text-center bg-white px-1 border border-black">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
                    className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D]"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5 stroke-[3px]" />
                  </button>
                </div>

                <button
                  onClick={handleCopyPageText}
                  className="btn-neo flex items-center gap-1 px-2.5 py-1 rounded-none border border-black bg-white hover:bg-[#C4B5FD] text-[11px] font-black uppercase"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3px] text-black" /> : <Copy className="w-3.5 h-3.5 stroke-[3px]" />}
                  <span>{copied ? 'Copied' : 'Copy page'}</span>
                </button>
              </div>
            </div>

            {/* Document Text Rendering Pane */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center bg-[#FFFDF5] bg-grid-paper">
              <div
                className="w-full max-w-3xl rounded-none bg-white border-4 border-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_#000] text-black font-mono leading-relaxed whitespace-pre-wrap select-text"
                style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
              >
                {activePage?.content || 'No text extracted for this page.'}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2 border-t-2 border-black bg-white flex items-center justify-between text-[11px] text-black font-mono font-black uppercase">
              <span className="bg-[#FFD93D] px-2 py-0.5 border border-black">Status: Text Indexed</span>
              <span className="bg-[#C4B5FD] px-2 py-0.5 border border-black">Page-Aware Extraction</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
