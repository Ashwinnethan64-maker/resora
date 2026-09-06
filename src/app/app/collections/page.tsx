'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ArrowRight, Plus } from 'lucide-react';

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

  const getCollectionBadge = (idx: number) => {
    const colors = [
      'bg-[#FFD93D] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      'bg-[#C4B5FD] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      'bg-[#FF6B6B] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]',
      'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
    ];
    return colors[idx % colors.length];
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header: Neo-Brutalist Thematic Stacks */}
      <div className="border-b-4 border-black pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0px_0px_#000] -rotate-1">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            THEMATIC ARCHIVES
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            CURATED<br />
            COLLECTIONS.
          </h1>
          <p className="text-sm md:text-base font-bold text-black mt-3 max-w-xl">
            Thematic resource clusters curated for high-velocity retrieval and cross-project reuse.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn-neo flex items-center gap-2 px-6 py-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_#000] self-start sm:self-auto"
        >
          <Plus className="w-5 h-5 stroke-[3px]" />
          <span>+ NEW COLLECTION</span>
        </button>
      </div>

      {/* Inline Create Collection Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="p-6 md:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] space-y-4 text-xs animate-in fade-in duration-150"
        >
          <div className="font-black uppercase tracking-wider text-sm sm:text-base text-black bg-[#FFD93D] px-2 py-1 border-2 border-black w-max shadow-[2px_2px_0px_0px_#000]">
            CREATE THEMATIC COLLECTION
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <input
              type="text"
              required
              placeholder="COLLECTION NAME (E.G. AI AGENT STACK)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-3 rounded-none bg-[#FFFDF5] border-4 border-black text-black font-black uppercase placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
            />
            <input
              type="text"
              placeholder="TOPIC / CATEGORY"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="px-3.5 py-3 rounded-none bg-[#FFFDF5] border-4 border-black text-black font-black uppercase placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
            />
            <input
              type="text"
              placeholder="SHORT DESCRIPTION"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="px-3.5 py-3 rounded-none bg-[#FFFDF5] border-4 border-black text-black font-black uppercase placeholder-black/50 focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-neo px-5 py-2.5 border-2 border-black bg-white text-black font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn-neo px-6 py-2.5 bg-[#C4B5FD] hover:bg-[#b8a6fb] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_#000]"
            >
              CREATE COLLECTION
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col, idx) => (
          <Link
            key={col.id}
            href={`/app/collections/${col.id}`}
            className="card-neo p-6 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] group flex flex-col justify-between space-y-4 relative"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-none ${getCollectionBadge(idx)}`}>
                  {col.topic || 'CURATED'}
                </span>
                <span className="text-xs font-mono font-black text-black bg-[#FFFDF5] px-2 py-0.5 border border-black uppercase">
                  {col.resource_ids?.length || 0} RESOURCES
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black uppercase text-black group-hover:text-[#FF6B6B] transition-colors leading-tight">
                {col.name}
              </h3>
              <p className="text-xs md:text-sm font-medium text-black mt-2 leading-relaxed line-clamp-2">
                {col.description || 'Curated resource collection.'}
              </p>
            </div>

            <div className="pt-4 border-t-2 border-black flex items-center justify-between text-xs text-black">
              <span className="font-mono font-bold text-[11px] text-black uppercase">
                UPDATED {new Date(col.updated_at).toLocaleDateString()}
              </span>
              <span className="text-black group-hover:text-[#FF6B6B] flex items-center gap-1.5 font-black text-xs uppercase tracking-wider group-hover:translate-x-1 transition-all">
                EXPLORE STACK <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
