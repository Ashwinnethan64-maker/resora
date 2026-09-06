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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-100">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-none bg-[#FFFDF5] border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-4 border-black bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-[#FFD93D] border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_#000]">
              <FileEdit className="w-4 h-4 stroke-[3px]" />
            </div>
            <h2 className="text-base font-black text-black uppercase tracking-tight">EDIT RESOURCE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-none text-black hover:bg-[#FF6B6B] border-2 border-black transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-bold focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs"
            />
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1">URL</label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-black uppercase focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs"
              >
                {Object.values(RESOURCE_TYPE_CONFIGS).map((cfg) => (
                  <option key={cfg.id} value={cfg.id} className="bg-white text-black font-bold">
                    {cfg.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-black font-black uppercase tracking-wider mb-1">Tags (Comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="AI, CODING, TOOLS"
                className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1">Use Cases</label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {INITIAL_SUGGESTED_USE_CASES.map((uc) => {
                const selected = selectedUseCases.includes(uc);
                return (
                  <button
                    key={uc}
                    type="button"
                    onClick={() => toggleUseCase(uc)}
                    className={`px-2.5 py-1 rounded-none font-black text-[11px] uppercase transition-all border-2 border-black ${
                      selected
                        ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white text-black hover:bg-[#FFD93D]'
                    }`}
                  >
                    {uc}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-bold focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs resize-none"
            />
          </div>

          <div>
            <label className="block text-black font-black uppercase tracking-wider mb-1">Personal Notes</label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder="Why did you save this? Research notes..."
              className="w-full rounded-none bg-white border-4 border-black px-3 py-2 text-black font-mono font-bold focus:bg-[#FFD93D] focus:outline-none focus:shadow-[4px_4px_0px_0px_#000] text-xs resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="btn-neo px-4 py-2 rounded-none border-2 border-black text-black font-black uppercase text-xs bg-white hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-neo flex items-center gap-1.5 px-5 py-2 rounded-none bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs border-4 border-black shadow-[4px_4px_0px_0px_#000] transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 stroke-[3px]" />
              <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
