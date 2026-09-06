'use client';

import React, { useState, useEffect } from 'react';
import { ResourceModel, ResourceType } from '@/types/database';
import { RESOURCE_TYPE_CONFIGS, INITIAL_SUGGESTED_USE_CASES } from '@/lib/resource-types';
import { X, Save, Sparkles, Tag, Layers, FileEdit } from 'lucide-react';

interface EditResourceDialogProps {
  isOpen: boolean;
  resource: ResourceModel | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<ResourceModel>) => Promise<void>;
}

export function EditResourceDialog({
  isOpen,
  resource,
  onClose,
  onSave,
}: EditResourceDialogProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('website');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || '');
      setUrl(resource.url || '');
      setDescription(resource.description || '');
      setResourceType(resource.resource_type || 'website');
      setTagsInput(resource.tags?.join(', ') || '');
      setSelectedUseCases(resource.use_cases || []);
      setPersonalNote(resource.personal_note || '');
    }
  }, [resource]);

  if (!isOpen || !resource) return null;

  const toggleUseCase = (uc: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(uc) ? prev.filter((u) => u !== uc) : [...prev, uc]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    setIsSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await onSave(resource.id, {
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      resource_type: resourceType,
      tags,
      use_cases: selectedUseCases,
      personal_note: personalNote.trim(),
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#11131c] border border-[#23293c] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2132]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FileEdit className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Edit Resource</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
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
                className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Use Cases (Why would you use this?)</label>
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
            <label className="block text-slate-400 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Personal Notes</label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Why did you save this? Project context, prompt ideas..."
              className="w-full rounded-lg bg-[#161925] border border-[#242a3e] px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#1a1f2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving changes...' : 'Save changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
