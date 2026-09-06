'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { Bookmark, ArrowRight, Plus, Layers } from 'lucide-react';

export default function CollectionsPage() {
  const { collections, createCollection } = useResora();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [topic, setTopic] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createCollection(name.trim(), desc.trim(), topic.trim() || undefined);
    setName('');
    setDesc('');
    setTopic('');
    setIsCreating(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2132]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Collections
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Thematic resource clusters curated for high-velocity retrieval and cross-project reuse.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ New collection</span>
        </button>
      </div>

      {/* Inline Create Collection */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-5 rounded-2xl bg-[#11131e] border border-indigo-500/30 space-y-3 shadow-xl shadow-black/60 text-xs animate-in fade-in duration-150"
        >
          <div className="font-semibold text-slate-200 text-sm">Create Thematic Collection</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Collection Name (e.g. AI Agent Stack)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#161925] border border-[#242a3e] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Topic / Category"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#161925] border border-[#242a3e] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              placeholder="Short Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#161925] border border-[#242a3e] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg border border-[#23283a] text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              Create Collection
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/app/collections/${col.id}`}
            className="p-5 rounded-2xl bg-[#11131c] hover:bg-[#151926] border border-[#1f2433] hover:border-[#30384f] transition-all group flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-slate-400 bg-[#171a26] px-2 py-0.5 rounded border border-[#222738]">
                  {col.topic || 'Curated'}
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {col.resource_ids?.length || 0} resources
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {col.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {col.description || 'Curated resource collection.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#1a1f2e] flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">
                Updated {new Date(col.updated_at).toLocaleDateString()}
              </span>
              <span className="text-slate-400 group-hover:text-indigo-400 flex items-center gap-1 font-medium text-xs">
                Explore stack <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
