'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceType, ResourceModel } from '@/types/database';
import { RESOURCE_TYPE_CONFIGS, INITIAL_SUGGESTED_USE_CASES } from '@/lib/resource-types';
import { normalizeCanonicalUrl } from '@/lib/resources/normalize-url';
import { DocumentDropzone } from '@/components/documents/DocumentDropzone';
import {
  X,
  Globe,
  AlertCircle,
  Plus,
  Loader2,
  Upload,
  Link2,
  Cloud
} from 'lucide-react';

export function SaveResourceDialog() {
  const router = useRouter();
  const { isSaveModalOpen, closeSaveModal, saveResource, checkDuplicate, showToast } = useResora();

  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [rawUrl, setRawUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('website');
  const [tagsInput, setTagsInput] = useState('AI, Research');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>(['Research']);
  const [personalNote, setPersonalNote] = useState('');

  // States for live metadata extraction & duplicate alert
  const [isExtracting, setIsExtracting] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<ResourceModel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleDriveUrl, setIsGoogleDriveUrl] = useState(false);

  useEffect(() => {
    if (!isSaveModalOpen) {
      setRawUrl('');
      setTitle('');
      setDescription('');
      setResourceType('website');
      setPersonalNote('');
      setDuplicateMatch(null);
      setIsExtracting(false);
      setIsGoogleDriveUrl(false);
      setActiveTab('url');
    }
  }, [isSaveModalOpen]);

  if (!isSaveModalOpen) return null;

  // Trigger metadata extraction when user finishes entering/pasting URL
  const handleUrlBlur = async () => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return;

    const norm = normalizeCanonicalUrl(trimmed);
    setIsGoogleDriveUrl(norm.isDriveDoc);
    if (norm.isDriveDoc && resourceType === 'website') {
      setResourceType('document');
    }

    if (!norm.isValid) return;

    // Check duplicate using Central Canonical Engine
    const existing = await checkDuplicate(norm.normalizedUrl);
    if (existing) {
      setDuplicateMatch(existing);
      return;
    } else {
      setDuplicateMatch(null);
    }

    // Attempt auto-metadata fetch if title is still empty
    if (!title) {
      setIsExtracting(true);
      try {
        const res = await fetch('/api/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: norm.normalizedUrl }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title && !title) setTitle(data.title);
          if (data.description && !description) setDescription(data.description);
          if (data.detectedType && !norm.isDriveDoc) setResourceType(data.detectedType);
        }
      } catch {
        // graceful fallback
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(uc) ? prev.filter((item) => item !== uc) : [...prev, uc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawUrl.trim()) return;

    // Strict duplicate block
    const norm = normalizeCanonicalUrl(rawUrl.trim());
    const existing = await checkDuplicate(norm.normalizedUrl);
    if (existing) {
      setDuplicateMatch(existing);
      showToast(`Resource already exists in your library: "${existing.title}"`);
      return;
    }

    setIsSaving(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    try {
      const saved = await saveResource({
        url: norm.normalizedUrl,
        original_url: rawUrl.trim(),
        normalized_url: norm.normalizedUrl,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        resource_type: resourceType,
        source_type: norm.isDriveDoc ? 'external_document' : 'manual',
        tags: parsedTags,
        use_cases: selectedUseCases,
        personal_note: personalNote.trim() || undefined,
      });

      if (saved) {
        showToast(`Captured "${saved.title || saved.url}"`);
        closeSaveModal();
      }
    } catch {
      showToast('Failed to save resource. Please check the URL.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={closeSaveModal} />
      <div className="relative w-full max-w-lg rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-[#FFFDF5]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-[#FF6B6B] border border-black" />
            <h2 className="text-sm font-black uppercase tracking-wider text-black">CAPTURE RESEARCH TO ARCHIVE</h2>
          </div>
          <button
            onClick={closeSaveModal}
            className="p-1.5 border-2 border-black bg-white text-black hover:bg-[#FFD93D] shadow-[2px_2px_0px_0px_#000] transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* Tab Toggle: URL vs File Upload */}
        <div className="flex border-b-4 border-black px-6 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-4 transition-colors ${
              activeTab === 'url'
                ? 'border-black text-black bg-[#FFD93D]'
                : 'border-transparent text-black/60 hover:text-black'
            }`}
          >
            <Link2 className="w-4 h-4 stroke-[2.5px]" />
            <span>WEB / DRIVE URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-4 transition-colors ${
              activeTab === 'upload'
                ? 'border-black text-black bg-[#C4B5FD]'
                : 'border-transparent text-black/60 hover:text-black'
            }`}
          >
            <Upload className="w-4 h-4 stroke-[2.5px]" />
            <span>UPLOAD DOCUMENT</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="p-6 space-y-4 bg-white">
            <div className="text-xs md:text-sm font-bold text-black leading-relaxed">
              Upload a PDF, Markdown, or text file. Resora automatically extracts text, creates page indexes, and generates structured AI dossiers.
            </div>
            <DocumentDropzone
              onUploadComplete={(res) => {
                showToast(`Indexed document "${res.title}"`);
                closeSaveModal();
                router.push(`/app/library/${res.id}`);
              }}
            />
          </div>
        ) : (
          <>
            {/* Dedicated Neo-Brutalist Duplicate Alert */}
            {duplicateMatch && (
              <div className="mx-6 mt-4 p-4 rounded-none bg-[#FFFDF5] border-4 border-black space-y-3 shadow-[6px_6px_0px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#FF6B6B] border border-black inline-block" />
                    <span className="font-black text-xs uppercase tracking-wider text-black">
                      RESOURCE ALREADY IN LIBRARY
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDuplicateMatch(null)}
                    className="p-0.5 border border-black hover:bg-black/10 text-black"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5px]" />
                  </button>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-black">
                  <p className="font-bold">This resource is already saved in RESORA.</p>
                  <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <div className="text-[10px] font-bold uppercase text-black/60">EXISTING RESOURCE</div>
                    <div className="font-black text-sm text-black truncate">{duplicateMatch.title}</div>
                    <div className="text-[10px] font-bold text-black/70 truncate mt-0.5">{duplicateMatch.url}</div>
                  </div>
                  <p className="text-[11px] text-black/80">You already saved this resource earlier.</p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setDuplicateMatch(null)}
                    className="btn-neo px-3 py-1.5 bg-white border-2 border-black text-black font-black uppercase text-[11px]"
                  >
                    CLOSE
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeSaveModal();
                      router.push(`/app/library/${duplicateMatch.id}`);
                    }}
                    className="btn-neo flex items-center gap-1.5 px-4 py-1.5 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-2 border-black font-black uppercase text-[11px] shadow-[2px_2px_0px_0px_#000]"
                  >
                    <span>VIEW RESOURCE</span>
                  </button>
                </div>
              </div>
            )}

            {/* Google Drive Notice */}
            {isGoogleDriveUrl && (
              <div className="mx-6 mt-3 p-3.5 bg-[#C4B5FD] text-black border-4 border-black text-xs flex items-start gap-2.5 shadow-[4px_4px_0px_0px_#000]">
                <Cloud className="w-4 h-4 text-black stroke-[3px] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-black uppercase">GOOGLE DRIVE / DOCS LINK DETECTED</span>
                  <p className="text-xs text-black leading-relaxed font-bold">
                    Private drive files will be indexed as reference links. You can still annotate, organize, and query this resource.
                  </p>
                </div>
              </div>
            )}

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto bg-white">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-black font-black uppercase text-xs">URL / RESOURCE LINK *</label>
                  {isExtracting && (
                    <span className="flex items-center gap-1 font-mono text-[10px] font-black text-black bg-[#FFD93D] px-2 py-0.5 border border-black uppercase">
                      <Loader2 className="w-3 h-3 animate-spin" /> FETCHING METADATA...
                    </span>
                  )}
                </div>
                <div className="flex items-center rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-3 shadow-[3px_3px_0px_0px_#000] focus-within:bg-[#FFD93D]">
                  <Globe className="w-4 h-4 text-black stroke-[2.5px] mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="https://... or Google Drive URL"
                    value={rawUrl}
                    onChange={(e) => {
                      setRawUrl(e.target.value);
                      if (e.target.value.includes('drive.google.com') || e.target.value.includes('docs.google.com')) {
                        setIsGoogleDriveUrl(true);
                        setResourceType('document');
                      } else {
                        setIsGoogleDriveUrl(false);
                      }
                    }}
                    onBlur={handleUrlBlur}
                    className="w-full bg-transparent text-black placeholder-black/50 focus:outline-none text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase text-xs mb-1.5">TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Kilo AI or System Architecture Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2.5 text-black placeholder-black/50 font-black uppercase focus:bg-[#FFD93D] focus:outline-none text-xs shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-black font-black uppercase text-xs mb-1.5">RESOURCE TYPE</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as ResourceType)}
                    className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3 py-2.5 text-black font-black uppercase focus:bg-[#FFD93D] focus:outline-none text-xs shadow-[3px_3px_0px_0px_#000]"
                  >
                    {Object.values(RESOURCE_TYPE_CONFIGS).map((cfg) => (
                      <option key={cfg.id} value={cfg.id}>
                        {cfg.label.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-black font-black uppercase text-xs mb-1.5">TAGS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, CODING, HACKATHON"
                    className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3 py-2.5 text-black placeholder-black/50 font-mono font-bold uppercase focus:bg-[#FFD93D] focus:outline-none text-xs shadow-[3px_3px_0px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase text-xs mb-1.5">
                  USE CASES <span className="text-black/60 font-bold">(WHY WOULD YOU USE THIS?)</span>
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {INITIAL_SUGGESTED_USE_CASES.map((uc) => {
                    const selected = selectedUseCases.includes(uc);
                    return (
                      <button
                        key={uc}
                        type="button"
                        onClick={() => toggleUseCase(uc)}
                        className={`btn-neo px-3 py-1 rounded-none font-black text-xs uppercase transition-all border-2 border-black ${
                          selected
                            ? 'bg-[#FFD93D] text-black shadow-[2px_2px_0px_0px_#000]'
                            : 'bg-white text-black hover:bg-[#FFFDF5]'
                        }`}
                      >
                        {uc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-black font-black uppercase text-xs mb-1.5">SHORT DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="What makes this resource notable or useful?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2 text-black placeholder-black/50 font-medium uppercase focus:bg-[#FFD93D] focus:outline-none text-xs resize-none shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-black font-black uppercase text-xs mb-1.5">PERSONAL NOTE</label>
                <textarea
                  rows={2}
                  placeholder="Why did I save this? How will I use it in my build?"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  className="w-full rounded-none bg-[#FFFDF5] border-4 border-black px-3.5 py-2 text-black placeholder-black/50 font-medium uppercase focus:bg-[#FFD93D] focus:outline-none text-xs resize-none shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t-4 border-black">
                <button
                  type="button"
                  onClick={closeSaveModal}
                  className="btn-neo px-5 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving || Boolean(duplicateMatch)}
                  className="btn-neo flex items-center gap-2 px-6 py-3 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span>
                    {isSaving
                      ? 'SAVING...'
                      : duplicateMatch
                      ? 'ALREADY IN LIBRARY'
                      : 'SAVE TO LIBRARY'}
                  </span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
