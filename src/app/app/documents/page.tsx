'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useResora } from '@/context/ResoraContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { DocumentDropzone } from '@/components/documents/DocumentDropzone';
import { ResourceModel } from '@/types/database';
import { PageHeader } from '@/components/ui/SectionLabel';

const DocumentViewerModal = dynamic(
  () => import('@/components/documents/DocumentViewerModal').then((mod) => mod.DocumentViewerModal),
  { ssr: false }
);
import {
  FileText,
  Upload,
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <PageHeader
        eyebrow="DOCUMENT INTELLIGENCE"
        eyebrowColor="coral"
        eyebrowIcon={<span className="w-2.5 h-2.5 bg-black inline-block shrink-0" />}
        title="DOCUMENTS & RESEARCH."
        description="Research papers, PDFs, system briefs, and uploaded files parsed with page-level intelligence."
        actions={
          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setShowDropzone((prev) => !prev)}
              className="btn-neo flex items-center gap-2 px-5 py-3 bg-white hover:bg-[#FFFDF5] text-black text-xs md:text-sm font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000]"
            >
              <Upload className="w-4 h-4 stroke-[3px]" />
              <span>{showDropzone ? 'HIDE UPLOAD' : 'UPLOAD FILES'}</span>
              {showDropzone ? <ChevronUp className="w-4 h-4 stroke-[3px] ml-0.5" /> : <ChevronDown className="w-4 h-4 stroke-[3px] ml-0.5" />}
            </button>

            <button
              onClick={openSaveModal}
              className="btn-neo flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-2 border-black shadow-[3px_3px_0px_#000]"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span>+ SAVE LINK / DRIVE</span>
            </button>
          </div>
        }
      />

      {/* Upload Dropzone Collapse Area */}
      {showDropzone && (
        <div className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 bg-[#FFD93D] border border-black" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-black">FILE INGESTION & PAGE INDEXER</h2>
            </div>
            <span className="text-xs text-black font-mono font-black uppercase bg-[#C4B5FD] px-2 py-0.5 border border-black">
              MAX 25MB · PDF, TXT, MD, DOC
            </span>
          </div>
          <DocumentDropzone
            onUploadComplete={(res) => {
              showToast(`Document "${res.title}" indexed successfully.`);
            }}
          />
        </div>
      )}

      {/* Tabs: Neo-Brutalist Filter Tabs */}
      <div className="flex items-center gap-3 border-b-4 border-black pb-4 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'all'
              ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          ALL DOCUMENTS ({documentResources.length})
        </button>
        <button
          onClick={() => setActiveTab('pdf')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'pdf'
              ? 'bg-[#FF6B6B] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          PDFS & PAPERS
        </button>
        <button
          onClick={() => setActiveTab('doc')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
            activeTab === 'doc'
              ? 'bg-[#C4B5FD] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          NOTES & BRIEFS
        </button>
        <button
          onClick={() => setActiveTab('drive')}
          className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all flex items-center gap-1.5 ${
            activeTab === 'drive'
              ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
              : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
          }`}
        >
          <Cloud className="w-4 h-4 stroke-[3px]" />
          <span>GOOGLE DRIVE / DOCS</span>
        </button>
      </div>

      {/* Content Grid */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={activeTab === 'drive' ? 'NO GOOGLE DRIVE LINKS' : 'NO DOCUMENTS FOUND'}
          description={
            activeTab === 'drive'
              ? 'Paste a Google Drive or Google Docs link using "+ Save Link / Drive".'
              : 'Upload research PDFs or save document links into your Resora archive.'
          }
          actionLabel="+ UPLOAD OR SAVE DOCUMENT"
          onAction={() => setShowDropzone(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  className="btn-neo absolute top-3 right-12 z-20 p-2 bg-white hover:bg-[#FFD93D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  title="Open in Document Reader"
                >
                  <Eye className="w-4 h-4 stroke-[3px]" />
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
