'use client';

import React, { useState, useRef } from 'react';
import { useResora } from '@/context/ResoraContext';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

interface UploadQueueItem {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'extracting' | 'completed' | 'failed' | 'duplicate';
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
        prev.map((q) => (q.id === item.id ? { ...q, status: 'extracting' } : q))
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
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await res.json();

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: 'completed', resourceId: result.resource.id }
            : q
        )
      );

      await refreshData();
      showToast(`Extracted & indexed "${item.file.name}"`);
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
        className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 group ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
            : 'border-[#23293c] hover:border-indigo-500/50 bg-[#10121c]/60 hover:bg-[#121522]'
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

        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform shadow-inner">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <div className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
            Drop research documents here
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            or <span className="text-indigo-400 underline underline-offset-2">browse files</span> from your computer
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 pt-1">
          <span>Supported: PDF, TXT, Markdown</span>
          <span>•</span>
          <span>Up to 25 MB</span>
        </div>
      </div>

      {/* Processing Queue */}
      {queue.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-[#0e1017] border border-[#1f2434] text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-[#1a1f2e]">
            <span>Document Processing Queue ({queue.length})</span>
            <button
              onClick={() => setQueue([])}
              className="text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[#141824] border border-[#202638]"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate text-slate-200 font-medium">
                    {item.file.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    ({(item.file.size / 1024 / 1024).toFixed(1)}MB)
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'uploading' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading
                    </span>
                  )}
                  {item.status === 'extracting' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-amber-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Extracting pages
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Indexed
                    </span>
                  )}
                  {item.status === 'duplicate' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-amber-400 font-mono">Duplicate</span>
                      <button
                        onClick={() => uploadFile(item, true)}
                        className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 text-[10px] font-medium hover:bg-amber-500/30"
                      >
                        Upload anyway
                      </button>
                    </div>
                  )}
                  {item.status === 'failed' && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-rose-400" title={item.error}>
                      <AlertCircle className="w-3 h-3" /> Failed
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
