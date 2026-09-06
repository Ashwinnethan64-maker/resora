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
    const element = document.createElement('a');
    const file = new Blob([resource.content || activePage?.content || ''], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = resource.file_name || `${resource.title}.txt`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-5xl h-[92vh] rounded-2xl bg-[#0f111a] border border-[#23293e] shadow-2xl shadow-black/95 flex flex-col overflow-hidden z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c2236] bg-[#0c0e16]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h2 className="text-sm font-semibold text-slate-100 truncate">
                {resource.file_name || resource.title}
              </h2>
              <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500">
                <span>{resource.resource_type.toUpperCase()}</span>
                <span>•</span>
                <span>
                  Page {currentPageNum} of {totalPages}
                </span>
                {resource.file_size && (
                  <>
                    <span>•</span>
                    <span>{(resource.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download */}
            <button
              onClick={handleDownloadOriginal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b29] hover:bg-[#1f2538] border border-[#242b3e] text-slate-300 text-xs font-medium transition-colors"
              title="Download original file"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#181c2b] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar (Page Search & Thumbnails) + Reader Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Search & Page Index */}
          <aside className="hidden md:flex w-64 flex-col border-r border-[#1a1f2e] bg-[#0d0f17] p-3 space-y-3 shrink-0">
            {/* In-Document Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find in document..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141824] border border-[#202638] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            {/* Page Jump List / Search Matches */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {pageSearchQuery ? (
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase px-1 pb-1">
                    Matches ({matchingPages.length})
                  </div>
                  {matchingPages.length === 0 ? (
                    <div className="text-xs text-slate-500 p-2 italic">No matches on any page</div>
                  ) : (
                    matchingPages.map((mp) => (
                      <button
                        key={mp.id}
                        onClick={() => setCurrentPageNum(mp.page_number)}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                          currentPageNum === mp.page_number
                            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                            : 'text-slate-400 hover:bg-[#151928]'
                        }`}
                      >
                        <div className="font-semibold text-[11px] text-indigo-400 font-mono">
                          Page {mp.page_number}
                        </div>
                        <div className="line-clamp-2 text-[11px] text-slate-400 mt-0.5 font-sans">
                          {mp.content}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase px-1 pb-1">
                    Document Pages
                  </div>
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCurrentPageNum(p.page_number)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                        currentPageNum === p.page_number
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-medium'
                          : 'text-slate-400 hover:bg-[#151928] hover:text-slate-200'
                      }`}
                    >
                      <span>Page {p.page_number}</span>
                      <span className="text-[10px] text-slate-600">
                        {p.content.split(/\s+/).length} words
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Reader View */}
          <main className="flex-1 flex flex-col justify-between overflow-hidden bg-[#0a0c13]">
            {/* Top Toolbar: Navigation & Zoom */}
            <div className="px-4 py-2 border-b border-[#181d2c] flex items-center justify-between text-xs text-slate-400 bg-[#0d0f17]/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                  disabled={currentPageNum <= 1}
                  className="p-1 rounded-md hover:bg-[#1c2234] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-xs">
                  Page {currentPageNum} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPageNum >= totalPages}
                  className="p-1 rounded-md hover:bg-[#1c2234] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    className="p-1 rounded hover:bg-[#1c2234]"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-[11px] w-10 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(160, z + 10))}
                    className="p-1 rounded hover:bg-[#1c2234]"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleCopyPageText}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy page'}</span>
                </button>
              </div>
            </div>

            {/* Document Text Rendering Pane */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 flex justify-center">
              <div
                className="w-full max-w-3xl rounded-xl bg-[#11131c] border border-[#1e2334] p-6 sm:p-8 shadow-md text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-text"
                style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
              >
                {activePage?.content || 'No text extracted for this page.'}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-4 py-2 border-t border-[#181d2c] bg-[#0c0e15] flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Status: Text Indexed</span>
              <span>Page-Aware Extraction</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
