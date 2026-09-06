'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { DocumentDropzone } from '@/components/documents/DocumentDropzone';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { ResourceModel } from '@/types/database';
import {
  FileText,
  Upload,
  Sparkles,
  Plus,
  Eye,
  Cloud,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DocumentsPage() {
  const { resources, openSaveModal, showToast } = useResora();
  const [activeTab, setActiveTab] = useState<'all' | 'pdf' | 'doc' | 'drive'>('all');
  const [showDropzone, setShowDropzone] = useState(false);
  const [selectedDocResource, setSelectedDocResource] = useState<ResourceModel | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Query persistent resources of document types
  const documentResources = resources.filter(
    (r) => !r.is_archived && (
      r.resource_type === 'pdf' ||
      r.resource_type === 'document' ||
      (r.url && (r.url.includes('drive.google.com') || r.url.includes('docs.google.com')))
    )
  );

  const filteredDocs = documentResources.filter((doc) => {
    const isDrive = doc.url && (doc.url.includes('drive.google.com') || doc.url.includes('docs.google.com'));
    if (activeTab === 'drive') return isDrive;
    if (activeTab === 'pdf') return doc.resource_type === 'pdf' && !isDrive;
    if (activeTab === 'doc') return doc.resource_type === 'document' && !isDrive;
    return true;
  });

  const handleOpenViewer = (resource: ResourceModel) => {
    setSelectedDocResource(resource);
    setIsViewerOpen(true);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2132]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
              Documents & Research
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              Intelligence Ready
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Research papers, PDFs, system briefs, and uploaded files parsed with page-level intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setShowDropzone((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              showDropzone
                ? 'bg-[#1e2335] text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-[#151926] text-slate-300 border-[#262e43] hover:text-white hover:border-slate-600'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showDropzone ? 'Hide Upload Zone' : 'Upload Files'}</span>
            {showDropzone ? <ChevronUp className="w-3 h-3 ml-0.5 opacity-60" /> : <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />}
          </button>

          <button
            onClick={openSaveModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save Link / Drive</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone Collapse Area */}
      {showDropzone && (
        <div className="p-5 rounded-2xl bg-[#11131c] border border-indigo-500/30 shadow-xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-slate-200">File Ingestion & Page Indexer</h2>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Max 25MB · PDF, TXT, MD, DOC</span>
          </div>
          <DocumentDropzone
            onUploadComplete={(res) => {
              showToast(`Document "${res.title}" indexed successfully.`);
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1c2132] pb-3 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Documents ({documentResources.length})
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'pdf'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          PDFs & Papers
        </button>
        <button
          onClick={() => setActiveTab('doc')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
            activeTab === 'doc'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Notes & Briefs
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'drive'
              ? 'bg-[#181d2c] text-indigo-300 border border-[#272f44]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cloud className="w-3 h-3 text-amber-400" />
          <span>Google Drive / Docs</span>
        </button>
      </div>

      {/* Content Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={activeTab === 'drive' ? 'No Google Drive links saved.' : 'No documents found.'}
          description={
            activeTab === 'drive'
              ? 'Paste a Google Drive or Google Docs link using "+ Save Link / Drive".'
              : 'Upload research PDFs or save document links into your Resora library.'
          }
          actionLabel="+ Upload or save document"
          onAction={() => setShowDropzone(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="relative group">
              <ResourceCard resource={doc} />
              {/* Quick Reader Button for local files */}
              {doc.storage_path && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenViewer(doc);
                  }}
                  className="absolute top-3 right-12 z-20 p-1.5 rounded-lg bg-[#1a1e2d]/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-[#2b334a] shadow-md backdrop-blur-sm transition-all"
                  title="Open in Document Reader"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Document Viewer Modal */}
      {isViewerOpen && selectedDocResource && (
        <DocumentViewerModal
          resource={selectedDocResource}
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedDocResource(null);
          }}
        />
      )}
    </div>
  );
}
