'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ResourceModel, DocumentModel, DocumentPageModel } from '@/types/database';
import { resolveResourceTarget } from '@/lib/resources/resolve-target';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { NeoBadge } from '@/components/brand/NeoSticker';
import {
  ArrowLeft,
  Download,
  FileText,
  Copy,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
  AlignLeft,
  Maximize2
} from 'lucide-react';

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentDetailPage({ params }: DocumentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { resources, showToast } = useResora();

  const [resource, setResource] = useState<ResourceModel | null>(null);
  const [pages, setPages] = useState<DocumentPageModel[]>([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [pageSearchQuery, setPageSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'native' | 'text'>('native');
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setIsLoading(true);
      try {
        let found = resources.find((r) => r.id === id);

        if (!found) {
          const res = await fetch(`/api/resources/${encodeURIComponent(id)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.resource) {
              found = data.resource;
            }
          }
        }

        if (isMounted && found) {
          setResource(found);

          // Determine PDF src for native viewer
          const isPdf = found.resource_type === 'pdf' ||
            found.file_name?.toLowerCase().endsWith('.pdf') ||
            found.mime_type === 'application/pdf';

          if (isPdf && found.file_name) {
            const localPdfUrl = `/uploads/documents/${encodeURIComponent(found.id)}/${encodeURIComponent(found.file_name)}`;
            setPdfSrc(localPdfUrl);
            setViewMode('native');
          } else {
            setViewMode('text');
          }

          const { ResourceService } = await import('@/lib/services/resource-service');
          let doc = await ResourceService.getDocumentByResourceId(found.id);
          let docPages: DocumentPageModel[] = [];
          if (doc) {
            docPages = await ResourceService.getDocumentPages(doc.id);
          }

          if (!doc || docPages.length === 0) {
            try {
              const apiRes = await fetch(`/api/documents/${encodeURIComponent(found.id)}`);
              if (apiRes.ok) {
                const data = await apiRes.json();
                if (data.document) {
                  doc = data.document;
                  if (data.pages && data.pages.length > 0) {
                    docPages = data.pages;
                  }
                  await ResourceService.syncDocumentRecord(doc!, docPages);
                }
              }
            } catch (netErr) {
              console.warn('[DocPage] Server fetch error:', netErr);
            }
          }

          if (isMounted) {
            if (docPages.length > 0) {
              setPages(docPages);
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
                  created_at: found.created_at,
                });
              }
              setPages(chunks.length > 0 ? chunks : [{
                id: 'fallback-page-0',
                document_id: doc.id,
                page_number: 1,
                content: fullText,
                image_url: doc.thumbnail_data_url,
                created_at: found.created_at,
              }]);
            } else if (found.content) {
              setPages([{
                id: `page_virt_${found.id}`,
                document_id: found.id,
                page_number: 1,
                content: found.content,
                image_url: found.thumbnail_url,
                created_at: found.created_at,
              }]);
            } else {
              setPages([{
                id: 'no-content',
                document_id: 'default',
                page_number: 1,
                content: 'The PDF viewer above displays the original document. No text was extracted for search.',
                created_at: found.created_at,
              }]);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load document details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id, resources]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="h-10 w-48 bg-black/10 animate-pulse border-2 border-black" />
        <div className="h-96 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] flex items-center justify-center font-mono font-black text-sm uppercase">
          Loading Document...
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-8 max-w-3xl mx-auto text-center space-y-4">
        <div className="p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4">
          <FileText className="w-12 h-12 mx-auto stroke-[2.5]" />
          <h1 className="text-2xl font-black uppercase text-black">Document Not Found</h1>
          <p className="text-xs font-mono text-black/70">
            The document ID could not be located in your library.
          </p>
          <Link
            href="/app/documents"
            className="btn-neo inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFD93D] border-3 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> Return to Documents
          </Link>
        </div>
      </div>
    );
  }

  const target = resolveResourceTarget(resource);
  const totalPages = Math.max(1, pages.length);
  const activePage = pages.find((p) => p.page_number === currentPageNum) || pages[0];

  const handleCopyPageText = () => {
    if (!activePage?.content) return;
    navigator.clipboard.writeText(activePage.content);
    setCopied(true);
    showToast('Page content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
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

    // Fallback: direct public URL
    if (resource.file_name) {
      const directUrl = `/uploads/documents/${encodeURIComponent(resource.id)}/${encodeURIComponent(resource.file_name)}`;
      const a = document.createElement('a');
      a.href = directUrl;
      a.download = resource.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const isMarkdown =
    resource.file_name?.toLowerCase().endsWith('.md') ||
    resource.file_name?.toLowerCase().endsWith('.markdown') ||
    resource.url?.toLowerCase().endsWith('.md');

  const isPdf = resource.resource_type === 'pdf' ||
    resource.file_name?.toLowerCase().endsWith('.pdf') ||
    resource.mime_type === 'application/pdf';

  const matchingPages = pageSearchQuery
    ? pages.filter((p) => p.content.toLowerCase().includes(pageSearchQuery.toLowerCase()))
    : [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="btn-neo inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" /> BACK
          </button>
          <Link
            href={`/app/library/${resource.id}`}
            className="btn-neo inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFD93D] border-3 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000]"
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" /> DOSSIER
          </Link>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/app/assistant?scope=document&scopeId=${resource.id}`}
            className="btn-neo inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-3 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000]"
          >
            <Sparkles className="w-4 h-4 stroke-[3]" /> ASK AI ABOUT THIS
          </Link>

          <button
            onClick={handleDownload}
            className="btn-neo inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#C4B5FD] text-black border-3 border-black text-xs font-black uppercase shadow-[3px_3px_0px_#000]"
          >
            <Download className="w-4 h-4 stroke-[3]" /> DOWNLOAD
          </button>
        </div>
      </div>

      {/* Document Info Header */}
      <div className="p-5 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <NeoBadge label={resource.resource_type.toUpperCase()} type={resource.resource_type} />
          {isMarkdown && (
            <span className="text-[10px] font-black uppercase bg-[#C4B5FD] px-2 py-0.5 border border-black font-mono">
              MARKDOWN
            </span>
          )}
          {resource.file_name && (
            <span className="text-[11px] font-mono font-bold text-black/70 break-all">
              {resource.file_name}
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black leading-tight" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {resource.title}
        </h1>

        {resource.description && (
          <p className="text-xs sm:text-sm font-medium text-black/80 font-mono leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* View Mode Toggle (for PDFs) */}
      {isPdf && pdfSrc && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-black uppercase text-black">View:</span>
          <div className="flex items-center border-2 border-black bg-white">
            <button
              onClick={() => setViewMode('native')}
              className={`px-3 py-1.5 font-mono font-bold text-[11px] uppercase flex items-center gap-1.5 ${viewMode === 'native' ? 'bg-[#FFD93D] font-black' : 'hover:bg-black/5'}`}
            >
              <Maximize2 className="w-3.5 h-3.5 stroke-[3px]" /> PDF Viewer
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`px-3 py-1.5 font-mono font-bold text-[11px] uppercase border-l border-black flex items-center gap-1.5 ${viewMode === 'text' ? 'bg-[#FFD93D] font-black' : 'hover:bg-black/5'}`}
            >
              <AlignLeft className="w-3.5 h-3.5 stroke-[3px]" /> Extracted Text
            </button>
          </div>
        </div>
      )}

      {/* ===== NATIVE PDF VIEWER ===== */}
      {isPdf && pdfSrc && viewMode === 'native' && (
        <div className="border-4 border-black shadow-[10px_10px_0px_0px_#000] overflow-hidden bg-[#333]" style={{ height: '80vh' }}>
          <iframe
            src={pdfSrc}
            className="w-full h-full border-0"
            title={resource.file_name || resource.title || 'PDF Document'}
          />
        </div>
      )}

      {/* ===== TEXT READER VIEW ===== */}
      {(viewMode === 'text' || !isPdf || !pdfSrc) && (
        <div className="border-4 border-black bg-white shadow-[10px_10px_0px_0px_#000] flex flex-col md:flex-row overflow-hidden" style={{ minHeight: '60vh' }}>
          {/* Sidebar */}
          <aside className="w-full md:w-56 border-b-4 md:border-b-0 md:border-r-4 border-black bg-[#FFFDF5] p-4 flex flex-col space-y-3 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black stroke-[3]" />
              <input
                type="text"
                placeholder="SEARCH TEXT..."
                value={pageSearchQuery}
                onChange={(e) => setPageSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-white border-2 border-black text-xs font-mono font-bold uppercase focus:bg-[#FFD93D] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 max-h-60 md:max-h-none">
              {pageSearchQuery ? (
                <div>
                  <div className="text-[10px] font-mono font-black uppercase text-black mb-1">
                    Matches ({matchingPages.length})
                  </div>
                  {matchingPages.length === 0 ? (
                    <div className="text-xs font-mono text-black/60 p-2 bg-white border border-black">No matches</div>
                  ) : (
                    matchingPages.map((mp) => (
                      <button
                        key={mp.id}
                        onClick={() => setCurrentPageNum(mp.page_number)}
                        className={`w-full text-left p-2 text-xs border-2 border-black ${
                          currentPageNum === mp.page_number
                            ? 'bg-[#FFD93D] font-black shadow-[2px_2px_0px_#000]'
                            : 'bg-white hover:bg-[#FFFDF5]'
                        }`}
                      >
                        <span className="font-mono font-black text-[11px]">Page {mp.page_number}</span>
                        <p className="line-clamp-2 text-[10px] font-mono text-black/80 mt-0.5">{mp.content}</p>
                      </button>
                    ))
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-[10px] font-mono font-black uppercase text-black mb-1">
                    Pages ({totalPages})
                  </div>
                  {pages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setCurrentPageNum(p.page_number)}
                      className={`w-full text-left px-2.5 py-2 text-xs font-mono border-2 border-black mb-1.5 flex items-center justify-between ${
                        currentPageNum === p.page_number
                          ? 'bg-[#FF6B6B] font-black shadow-[2px_2px_0px_#000]'
                          : 'bg-white hover:bg-[#FFD93D]'
                      }`}
                    >
                      <span className="uppercase font-bold">Pg {p.page_number}</span>
                      <span className="text-[10px] bg-white px-1 border border-black">
                        {p.content.split(/\s+/).length}w
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Reader Pane */}
          <main className="flex-1 flex flex-col bg-[#FFFDF5] min-h-0">
            {/* Toolbar */}
            <div className="px-4 py-2 bg-white border-b-2 border-black flex items-center justify-between text-xs flex-wrap gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
                  disabled={currentPageNum <= 1}
                  className="p-1 border border-black bg-white hover:bg-[#FFD93D] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[3]" />
                </button>
                <span className="font-mono font-black text-xs uppercase bg-[#FFD93D] px-2 py-0.5 border border-black whitespace-nowrap">
                  PG {currentPageNum} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPageNum((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPageNum >= totalPages}
                  className="p-1 border border-black bg-white hover:bg-[#FFD93D] disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => setZoomLevel((z) => Math.max(70, z - 10))} className="p-1 border border-black hover:bg-[#FFD93D]">
                    <ZoomOut className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                  <span className="font-mono text-xs font-bold w-10 text-center bg-white border border-black">{zoomLevel}%</span>
                  <button onClick={() => setZoomLevel((z) => Math.min(160, z + 10))} className="p-1 border border-black hover:bg-[#FFD93D]">
                    <ZoomIn className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
                <button
                  onClick={handleCopyPageText}
                  className="btn-neo flex items-center gap-1 px-2.5 py-1 border border-black bg-white hover:bg-[#C4B5FD] text-xs font-black uppercase"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex justify-center bg-[#FFFDF5]">
              <div
                className="w-full max-w-3xl bg-white border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000] flex flex-col"
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
                    <div className="font-mono leading-relaxed whitespace-pre-wrap select-text flex-1">
                      {activePage.content}
                    </div>
                  )
                ) : (
                  <div className="font-mono text-xs text-black/60 italic py-6 text-center">
                    No text extracted for this section.
                    {isPdf && pdfSrc && (
                      <div className="mt-3">
                        <button
                          onClick={() => setViewMode('native')}
                          className="px-3 py-1.5 bg-[#FFD93D] border-2 border-black text-black text-xs font-black uppercase"
                        >
                          Switch to PDF Viewer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status Bar */}
            <div className="px-4 py-1.5 bg-white border-t-2 border-black flex items-center justify-between text-[11px] font-mono font-black uppercase shrink-0">
              <span className="bg-[#FFD93D] px-2 py-0.5 border border-black">
                {isPdf && pdfSrc ? 'PDF + TEXT' : 'TEXT READER'}
              </span>
              <span className="bg-[#C4B5FD] px-2 py-0.5 border border-black truncate ml-2" title={resource.id}>
                ID: {resource.id.slice(0, 12)}...
              </span>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
