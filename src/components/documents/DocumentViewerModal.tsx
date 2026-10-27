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
  ZoomOut,
  Maximize2,
  AlignLeft
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';

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
  const [viewMode, setViewMode] = useState<'native' | 'text'>('native');
  const [isLoading, setIsLoading] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resource) {
      setCurrentPageNum(1);
      setPageSearchQuery('');
      setPages([]);
      setPdfSrc(null);
      setIsLoading(true);

      // Determine if we have a locally stored PDF file
      const isPdf = resource.resource_type === 'pdf' ||
        resource.file_name?.toLowerCase().endsWith('.pdf') ||
        resource.mime_type === 'application/pdf';

      if (isPdf && resource.file_name) {
        // Build the public URL to the locally stored PDF
        const localPdfUrl = `/uploads/documents/${encodeURIComponent(resource.id)}/${encodeURIComponent(resource.file_name)}`;
        setPdfSrc(localPdfUrl);
        setViewMode('native');
      } else {
        setViewMode('text');
      }

      const loadDoc = async () => {
        try {
          let doc = await ResourceService.getDocumentByResourceId(resource.id);
          let loadedPages: DocumentPageModel[] = [];

          if (doc) {
            loadedPages = await ResourceService.getDocumentPages(doc.id);
          }

          // If local store does not have it, fetch from server API
          if (!doc || loadedPages.length === 0) {
            try {
              const apiRes = await fetch(`/api/documents/${encodeURIComponent(resource.id)}`);
              if (apiRes.ok) {
                const data = await apiRes.json();
                if (data.document) {
                  doc = data.document;
                  if (data.pages && data.pages.length > 0) {
                    loadedPages = data.pages;
                  }
                  await ResourceService.syncDocumentRecord(doc!, loadedPages);
                }
              }
            } catch (netErr) {
              console.warn('[DocumentViewerModal] Server fetch error:', netErr);
            }
          }

          setDocumentModel(doc);

          if (loadedPages.length > 0) {
            setPages(loadedPages);
          } else if (doc && doc.extracted_text) {
            const chunkSize = 3000;
            const fullText = doc.extracted_text;
            const chunks: DocumentPageModel[] = [];
            for (let i = 0; i < fullText.length; i += chunkSize) {
              chunks.push({
                id: `fallback-page-${i}`,
                document_id: doc.id,
                page_number: Math.floor(i / chunkSize) + 1,
                content: fullText.slice(i, i + chunkSize).trim(),
                image_url: doc.thumbnail_data_url,
                created_at: resource.created_at,
              });
            }
            setPages(chunks.length > 0 ? chunks : [{
              id: 'fallback-page-0',
              document_id: doc.id,
              page_number: 1,
              content: fullText,
              image_url: doc.thumbnail_data_url,
              created_at: resource.created_at,
            }]);
          } else {
            // Fallback to resource content
            const fallbackText = resource.content || resource.description || '';
            if (fallbackText.trim()) {
              const chunkSize = 3000;
              const chunks: DocumentPageModel[] = [];
              for (let i = 0; i < fallbackText.length; i += chunkSize) {
                chunks.push({
                  id: `fallback-page-${i}`,
                  document_id: 'default',
                  page_number: Math.floor(i / chunkSize) + 1,
                  content: fallbackText.slice(i, i + chunkSize).trim(),
                  image_url: resource.thumbnail_url,
                  created_at: resource.created_at,
                });
              }
              setPages(chunks.length > 0 ? chunks : [{
                id: 'fallback-page-0',
                document_id: 'default',
                page_number: 1,
                content: fallbackText.trim(),
                image_url: resource.thumbnail_url,
                created_at: resource.created_at,
              }]);
            } else {
              setPages([{
                id: 'no-content',
                document_id: 'default',
                page_number: 1,
                content: 'No text extracted for this document. The PDF viewer above displays the original file.',
                image_url: resource.thumbnail_url,
                created_at: resource.created_at,
              }]);
            }
          }
        } finally {
          setIsLoading(false);
        }
      };

      loadDoc();
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

  const handleDownloadOriginal = async () => {
    try {
      const res = await fetch(`/api/documents/${resource.id}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.file_name || resource.title || 'document.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch {}

    // Fallback: direct link to public uploads folder
    if (resource.file_name) {
      const directUrl = `/uploads/documents/${encodeURIComponent(resource.id)}/${encodeURIComponent(resource.file_name)}`;
      const a = document.createElement('a');
      a.href = directUrl;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Last resort: create download from extracted text
    const textData = pages.map(p => p.content).join('\n\n') || resource.content || resource.description || resource.title || '';
    const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = (resource.file_name || resource.title || 'document').replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const isPdfResource = resource.resource_type === 'pdf' ||
    resource.file_name?.toLowerCase().endsWith('.pdf') ||
    resource.mime_type === 'application/pdf';

  const isMarkdown = resource.file_name?.toLowerCase().endsWith('.md') ||
    resource.file_name?.toLowerCase().endsWith('.markdown') ||
    resource.url?.toLowerCase().endsWith('.md');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-6xl h-[93vh] rounded-none bg-[#FFFDF5] border-4 border-black shadow-[12px_12px_0px_0px_#000] flex flex-col overflow-hidden z-10">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b-4 border-black bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-none bg-[#FFD93D] border-2 border-black flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000]">
              <FileText className="w-4 h-4 stroke-[3px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-black text-black truncate uppercase tracking-tight" title={resource.file_name || resource.title}>
                {resource.file_name || resource.title}
              </h2>
              <div className="flex items-center gap-2 font-mono text-[10px] font-bold text-black uppercase flex-wrap">
                <span className="bg-[#C4B5FD] px-1.5 py-0.5 border border-black shrink-0">{resource.resource_type.toUpperCase()}</span>
                {resource.page_count && (
                  <>
                    <span>•</span>
                    <span className="bg-white px-1.5 py-0.5 border border-black shrink-0">{resource.page_count} pages</span>
                  </>
                )}
                {resource.file_size && (
                  <>
                    <span>•</span>
                    <span className="bg-[#FFD93D] px-1.5 py-0.5 border border-black shrink-0">{(resource.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {/* View mode toggle for PDFs */}
            {isPdfResource && pdfSrc && (
              <div className="hidden sm:flex items-center border-2 border-black bg-white">
                <button
                  onClick={() => setViewMode('native')}
                  className={`px-2 py-1.5 font-mono font-bold text-[10px] uppercase flex items-center gap-1 ${viewMode === 'native' ? 'bg-[#FFD93D] font-black' : 'hover:bg-black/5'}`}
                  title="PDF Viewer"
                >
                  <Maximize2 className="w-3 h-3 stroke-[3px]" />
                  <span className="hidden md:inline">PDF</span>
                </button>
                <button
                  onClick={() => setViewMode('text')}
                  className={`px-2 py-1.5 font-mono font-bold text-[10px] uppercase border-l border-black flex items-center gap-1 ${viewMode === 'text' ? 'bg-[#FFD93D] font-black' : 'hover:bg-black/5'}`}
                  title="Text View"
                >
                  <AlignLeft className="w-3 h-3 stroke-[3px]" />
                  <span className="hidden md:inline">TEXT</span>
                </button>
              </div>
            )}

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

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* ===== NATIVE PDF VIEW (iframe embed) ===== */}
          {isPdfResource && pdfSrc && viewMode === 'native' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 relative bg-[#333]">
                <iframe
                  src={pdfSrc}
                  className="w-full h-full border-0"
                  title={resource.file_name || resource.title || 'PDF Document'}
                  style={{ minHeight: '100%' }}
                />
              </div>
              {/* Mobile: show switch to text button */}
              <div className="sm:hidden flex items-center justify-center p-2 bg-white border-t-2 border-black gap-2">
                <button
                  onClick={() => setViewMode('text')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFD93D] border-2 border-black text-black text-xs font-black uppercase"
                >
                  <AlignLeft className="w-3.5 h-3.5 stroke-[3px]" />
                  Switch to Text Mode
                </button>
              </div>
            </div>
          )}

          {/* ===== TEXT / READER VIEW ===== */}
          {(viewMode === 'text' || !isPdfResource || !pdfSrc) && (
            <>
              {/* Left Panel: Search & Page Index */}
              <aside className="hidden md:flex w-56 flex-col border-r-4 border-black bg-white p-3 space-y-3 shrink-0">
                {/* In-Document Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-black absolute left-2.5 top-1/2 -translate-y-1/2 stroke-[3px]" />
                  <input
                    type="text"
                    placeholder="FIND IN TEXT..."
                    value={pageSearchQuery}
                    onChange={(e) => setPageSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-none bg-[#FFFDF5] border-2 border-black text-xs text-black placeholder-black/50 font-mono font-bold focus:bg-[#FFD93D] focus:outline-none"
                  />
                </div>

                {/* Page Jump List */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {pageSearchQuery ? (
                    <div>
                      <div className="text-[10px] font-mono font-black text-black uppercase px-1 pb-1">
                        Matches ({matchingPages.length})
                      </div>
                      {matchingPages.length === 0 ? (
                        <div className="text-xs text-black font-bold p-2 italic bg-[#FFFDF5] border border-black">No matches</div>
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
                            <div className="font-black text-[11px] text-black font-mono uppercase">Page {mp.page_number}</div>
                            <div className="line-clamp-2 text-[11px] text-black mt-0.5 font-mono">{mp.content}</div>
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-mono font-black text-black uppercase px-1 pb-1">Pages</div>
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
                          <span className="font-black uppercase">Pg {p.page_number}</span>
                          <span className="text-[10px] font-bold bg-white px-1 border border-black">
                            {p.content.split(/\s+/).length}w
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </aside>

              {/* Main Reader Pane */}
              <main className="flex-1 flex flex-col overflow-hidden bg-[#FFFDF5]">
                {/* Top Toolbar: Navigation & Zoom */}
                <div className="px-4 py-2 border-b-2 border-black flex items-center justify-between text-xs text-black bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                      disabled={currentPageNum <= 1}
                      className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 stroke-[3px]" />
                    </button>
                    <span className="font-mono font-black text-xs uppercase bg-[#FFD93D] px-2 py-0.5 border border-black whitespace-nowrap">
                      {currentPageNum} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPageNum >= totalPages}
                      className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 stroke-[3px]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                        className="btn-neo p-1 rounded-none border border-black hover:bg-[#FFD93D]"
                        title="Zoom out"
                      >
                        <ZoomOut className="w-3.5 h-3.5 stroke-[3px]" />
                      </button>
                      <span className="font-mono font-black text-[11px] w-10 text-center bg-white px-1 border border-black">{zoomLevel}%</span>
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
                      <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Document Text Rendering */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#FFFDF5]">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <div className="p-6 bg-white border-4 border-black font-mono font-black text-xs uppercase shadow-[4px_4px_0px_#000]">
                        Loading Document...
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-3xl">
                      <div
                        className="rounded-none bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_#000] text-black select-text flex flex-col"
                        style={{ fontSize: `${(zoomLevel / 100) * 14}px` }}
                      >
                        <div className="text-[10px] font-mono font-black uppercase text-black mb-3 pb-2 border-b-2 border-black flex items-center justify-between">
                          <span className="bg-[#FFD93D] px-2 py-0.5 border border-black">EXTRACTED TEXT — PAGE {activePage?.page_number || 1}</span>
                          <span className="text-black/60">{activePage?.content ? activePage.content.split(/\s+/).length : 0} words</span>
                        </div>

                        {activePage?.content ? (
                          isMarkdown ? (
                            <MarkdownRenderer content={activePage.content} />
                          ) : (
                            <div className="font-mono leading-relaxed whitespace-pre-wrap flex-1">
                              {activePage.content}
                            </div>
                          )
                        ) : (
                          <div className="font-mono text-xs text-black/60 italic py-6 text-center">
                            No text extracted for this page.
                            {isPdfResource && pdfSrc && (
                              <div className="mt-3">
                                <button
                                  onClick={() => setViewMode('native')}
                                  className="px-3 py-1.5 bg-[#FFD93D] border-2 border-black text-black text-xs font-black uppercase"
                                >
                                  View PDF instead
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Status Bar */}
                <div className="px-4 py-1.5 border-t-2 border-black bg-white flex items-center justify-between text-[11px] text-black font-mono font-black uppercase shrink-0">
                  <span className="bg-[#FFD93D] px-2 py-0.5 border border-black">
                    {isPdfResource && pdfSrc ? 'PDF + Text Indexed' : 'Text Indexed'}
                  </span>
                  {isPdfResource && pdfSrc && (
                    <button
                      onClick={() => setViewMode('native')}
                      className="text-[10px] underline hover:text-[#FF6B6B] transition-colors"
                    >
                      Switch to PDF Viewer
                    </button>
                  )}
                </div>
              </main>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
