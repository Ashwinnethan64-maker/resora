'use client';

import React, { useState, useRef } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceService } from '@/lib/services/resource-service';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { DuplicateDocumentModal } from './DuplicateDocumentModal';
import { ImportSummaryModal, ImportSummaryData } from './ImportSummaryModal';

interface UploadQueueItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'extracting' | 'completed' | 'failed' | 'duplicate';
  stage?: 'EXTRACTING LINKS' | 'ANALYZING' | 'CATEGORIZING' | 'COMPLETE';
  linkCount?: number;
  analyzedCount?: number;
  error?: string;
  resourceId?: string;
}

interface DocumentDropzoneProps {
  onUploadSuccess?: () => void;
  onUploadComplete?: (resource: any) => void;
  className?: string;
}

export function DocumentDropzone({ onUploadSuccess, onUploadComplete, className = '' }: DocumentDropzoneProps) {
  const { showToast, refreshData } = useResora();
  const [isDragOver, setIsDragOver] = useState(false);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [duplicateModalData, setDuplicateModalData] = useState<{
    isOpen: boolean;
    fileName: string;
    resourceId?: string;
    linkCount?: number;
  }>({
    isOpen: false,
    fileName: '',
  });
  const [importSummaryData, setImportSummaryData] = useState<ImportSummaryData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newItems: UploadQueueItem[] = files.map((f) => ({
      id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      status: 'pending',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    newItems.forEach((item) => uploadFile(item));
  };

  const uploadFile = async (item: UploadQueueItem, force = false) => {
    setQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'uploading' } : q))
    );

    const formData = new FormData();
    formData.append('file', item.file);
    if (force) formData.append('force', 'true');

    try {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'extracting', stage: 'EXTRACTING LINKS' }
            : q
        )
      );

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 409) {
        const data = await res.json();
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  status: 'duplicate',
                  error: data.message || 'Document already exists in your library.',
                  resourceId: data.existingResourceId,
                }
              : q
          )
        );

        // Open dedicated Neo-Brutalist Duplicate Document Modal
        setDuplicateModalData({
          isOpen: true,
          fileName: data.existingFileName || item.file.name,
          resourceId: data.existingResourceId,
          linkCount: data.linkCount || 0,
        });
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await res.json();
      const extractedCount = result.extractedResources?.length || 0;

      // Transition visual stages if links were extracted
      if (extractedCount > 0) {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  stage: 'CATEGORIZING',
                  linkCount: extractedCount,
                  analyzedCount: extractedCount,
                }
              : q
          )
        );
      }

      // Ensure created resource and any extracted links are synced into the client store
      if (result.resource) {
        await ResourceService.syncResource(result.resource);
      }
      if (result.document) {
        await ResourceService.syncDocumentRecord(result.document, result.document.pages);
      }
      if (result.extractedResources && Array.isArray(result.extractedResources) && result.extractedResources.length > 0) {
        await ResourceService.syncResources(result.extractedResources);
      }

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: 'completed',
                stage: 'COMPLETE',
                linkCount: extractedCount,
                resourceId: result.resource.id,
              }
            : q
        )
      );

      await refreshData();

      // Show Import Summary Modal if multi-link extraction occurred
      if (result.summary && result.summary.detected > 0) {
        setImportSummaryData({
          sourceFileName: item.file.name,
          sourceDocumentId: result.resource.id,
          detected: result.summary.detected,
          newResourcesCreated: result.summary.created,
          duplicatesSkipped: result.summary.duplicates,
        });
      }

      if (extractedCount > 0) {
        showToast(`Indexed "${item.file.name}": ${result.summary?.created || extractedCount} new resources created`);
      } else {
        showToast(`Extracted & indexed "${item.file.name}"`);
      }
      if (onUploadSuccess) onUploadSuccess();
      if (onUploadComplete && result.resource) onUploadComplete(result.resource);
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id ? { ...q, status: 'failed', error: err.message } : q
        )
      );
      showToast(`Failed to process ${item.file.name}`);
    }
  };

  const removeItem = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 sm:p-8 rounded-none border-4 border-black transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 group ${
          isDragOver
            ? 'bg-[#FFD93D] shadow-none translate-x-[2px] translate-y-[2px]'
            : 'bg-white hover:bg-[#FFFDF5] shadow-[6px_6px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-none bg-[#FFD93D] border-4 border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_#000] group-hover:-translate-y-1 transition-transform">
          <UploadCloud className="w-7 h-7 stroke-[3px]" />
        </div>

        <div>
          <div className="text-base font-black uppercase tracking-tight text-black">
            DROP RESEARCH DOCUMENTS HERE
          </div>
          <p className="text-xs text-black font-mono font-bold mt-1">
            or <span className="bg-[#FF6B6B] text-black px-1.5 py-0.5 border-2 border-black underline">BROWSE LOCAL DISK</span>
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] font-black text-black pt-2 uppercase">
          <span className="bg-[#C4B5FD] px-2 py-0.5 border border-black">PDF, TXT, MARKDOWN</span>
          <span>•</span>
          <span className="bg-white px-2 py-0.5 border border-black">MAX 25 MB</span>
        </div>
      </div>

      {/* Processing Queue */}
      {queue.length > 0 && (
        <div className="space-y-3 p-4 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-xs">
          <div className="flex items-center justify-between font-black uppercase text-black pb-2 border-b-2 border-black">
            <span className="bg-[#FFD93D] px-2 py-0.5 border border-black text-xs">
              DOCUMENT QUEUE [{queue.length}]
            </span>
            <button
              onClick={() => setQueue([])}
              className="text-black hover:text-[#FF6B6B] font-black uppercase tracking-wider underline text-xs"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-none bg-[#FFFDF5] border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 bg-white border border-black flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5 stroke-[2.5px] text-black" />
                  </div>
                  <span className="truncate text-black font-black text-xs uppercase">
                    {item.file.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-black shrink-0 bg-white px-1 border border-black">
                    {(item.file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'uploading' && (
                    <span className="flex items-center gap-1 font-mono font-black text-[10px] bg-[#FFD93D] px-2 py-0.5 border border-black text-black uppercase">
                      <Loader2 className="w-3 h-3 animate-spin stroke-[3px]" /> Uploading
                    </span>
                  )}
                  {item.status === 'extracting' && (
                    <span className="flex items-center gap-1 font-mono font-black text-[10px] bg-[#C4B5FD] px-2 py-0.5 border border-black text-black uppercase">
                      <Loader2 className="w-3 h-3 animate-spin stroke-[3px]" /> {item.stage || 'Extracting Links'}
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 font-mono font-black text-[10px] bg-[#FFD93D] px-2 py-0.5 border border-black text-black uppercase">
                      <CheckCircle2 className="w-3 h-3 stroke-[3px]" />
                      {item.linkCount && item.linkCount > 0
                        ? `COMPLETE · ${item.linkCount} RESOURCES`
                        : 'INDEXED'}
                    </span>
                  )}
                  {item.status === 'duplicate' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-[#FF6B6B] text-black px-1.5 py-0.5 border border-black font-mono font-black uppercase">Duplicate</span>
                      <button
                        onClick={() => uploadFile(item, true)}
                        className="btn-neo px-2 py-0.5 bg-white text-black text-[10px] font-black border border-black uppercase hover:bg-[#FFD93D]"
                      >
                        Force Upload
                      </button>
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <span className="flex items-center gap-1 font-mono font-black text-[10px] bg-[#FF6B6B] text-black px-2 py-0.5 border border-black uppercase" title={item.error}>
                      <AlertCircle className="w-3 h-3 stroke-[3px]" /> Failed
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-black hover:bg-[#FF6B6B] border border-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exact Duplicate Document Modal */}
      <DuplicateDocumentModal
        isOpen={duplicateModalData.isOpen}
        fileName={duplicateModalData.fileName}
        resourceId={duplicateModalData.resourceId}
        linkCount={duplicateModalData.linkCount}
        onClose={() => setDuplicateModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Multi-Link Import Summary Modal */}
      <ImportSummaryModal
        isOpen={Boolean(importSummaryData)}
        summary={importSummaryData}
        onClose={() => setImportSummaryData(null)}
      />
    </div>
  );
}
