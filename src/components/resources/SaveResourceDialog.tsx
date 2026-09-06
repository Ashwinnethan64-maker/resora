'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { ResourceType, ResourceModel } from '@/types/database';
import { RESOURCE_TYPE_CONFIGS, INITIAL_SUGGESTED_USE_CASES } from '@/lib/resource-types';
import { normalizeUrl } from '@/lib/url-helper';
import { DocumentDropzone } from '@/components/documents/DocumentDropzone';
import {
  X,
  Globe,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
  CheckCircle2,
  Upload,
  Link2,
  Cloud,
  FileText
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

    // Detect Google Drive or Docs
    const isDrive = trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
    setIsGoogleDriveUrl(isDrive);
    if (isDrive && resourceType === 'website') {
      setResourceType('document');
    }

    const { url, isValid } = normalizeUrl(trimmed);
    if (!isValid) return;

    // Check duplicate
    const existing = await checkDuplicate(url);
    if (existing) {
      setDuplicateMatch(existing);
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
          body: JSON.stringify({ url: trimmed }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.title && !title) setTitle(data.title);
          if (data.description && !description) setDescription(data.description);
          if (data.detectedType && !isDrive) setResourceType(data.detectedType);
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
      prev.includes(uc) ? prev.filter((u) => u !== uc) : [...prev, uc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawUrl.trim() && !title.trim()) return;

    setIsSaving(true);
    const { url, domain } = normalizeUrl(rawUrl.trim());
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await saveResource({
      url: url || 'https://resora.app/resource',
      domain: domain || 'resora.app',
      title: title.trim() || domain || 'Saved Resource',
      description: description.trim() || (isGoogleDriveUrl ? 'Google Drive / Docs reference.' : 'Captured research resource.'),
      resource_type: resourceType,
      source_type: 'web',
      tags,
      use_cases: selectedUseCases,
      personal_note: personalNote.trim(),
      is_inbox: false,
    });

    setIsSaving(false);
    closeSaveModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={closeSaveModal} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11131c] border border-[#23293c] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2132]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Save Resource to Library</h2>
          </div>
          <button
            onClick={closeSaveModal}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: URL vs File Upload */}
        <div className="flex border-b border-[#1c2132] px-5 bg-[#0d0f17]">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'url'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Web / Drive URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-400">
              Upload a PDF, Markdown, or text file. Resora automatically extracts text, creates page indexes, and generates structured AI summaries.
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
            {/* Duplicate Banner Notice */}
            {duplicateMatch && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    You already saved this resource: <strong>{duplicateMatch.title}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeSaveModal();
                    router.push(`/app/library/${duplicateMatch.id}`);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 font-medium text-amber-200 shrink-0 transition-colors"
                >
                  Open existing
                </button>
              </div>
            )}

            {/* Google Drive / Docs Detection Notice */}
            {isGoogleDriveUrl && (
              <div className="mx-5 mt-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2.5">
                <Cloud className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-blue-200">Google Drive / Docs link detected</span>
                  <p className="text-[11px] text-blue-300/80 leading-relaxed">
                    Connect Google Drive to analyze this document. Content extraction is currently unavailable for private drive files; you can still save and organize this resource.
                  </p>
                </div>
              </div>
            )}

            {/* Scrollable Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-medium">URL / Resource Link *</label>
                  {isExtracting && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching metadata...
                    </span>
                  )}
                </div>
                <div className="flex items-center rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 focus-within:border-indigo-500 transition-colors">
                  <Globe className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
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
                    className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kilo AI or System Architecture Guide"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Resource Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as ResourceType)}
                    className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    {Object.values(RESOURCE_TYPE_CONFIGS).map((cfg) => (
                      <option key={cfg.id} value={cfg.id} className="bg-[#11131c]">
                        {cfg.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="AI, Coding, Hackathon"
                    className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  Use Cases <span className="text-slate-500">(Why would you use this?)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {INITIAL_SUGGESTED_USE_CASES.map((uc) => {
                    const selected = selectedUseCases.includes(uc);
                    return (
                      <button
                        key={uc}
                        type="button"
                        onClick={() => toggleUseCase(uc)}
                        className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors border ${
                          selected
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                            : 'bg-[#151926] text-slate-400 border-[#23293c] hover:text-slate-200'
                        }`}
                      >
                        {uc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="What makes this resource notable or useful?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Personal Note</label>
                <textarea
                  rows={2}
                  placeholder="Why did I save this? How will I use it in my build?"
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1a1f2e]">
                <button
                  type="button"
                  onClick={closeSaveModal}
                  className="px-3.5 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : duplicateMatch ? 'Save anyway' : 'Save resource'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
