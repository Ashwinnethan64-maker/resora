'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Wrench,
  Search,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'ai_tool',
  'developer_tool',
  'web_app',
];

export default function ToolsPage() {
  const { resources, openSaveModal } = useResora();
  const [selectedType, setSelectedType] = useState('All');
  const [toolSearch, setToolSearch] = useState('');

  // Filter tools from persistent resources
  const toolResources = resources.filter(
    (r) =>
      !r.is_archived &&
      (r.resource_type === 'ai_tool' ||
        r.resource_type === 'developer_tool' ||
        r.resource_type === 'web_app')
  );

  const filteredTools = toolResources.filter((tool) => {
    const matchesCategory =
      selectedType === 'All' || tool.resource_type === selectedType;
    const matchesSearch =
      toolSearch.trim() === '' ||
      tool.title.toLowerCase().includes(toolSearch.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(toolSearch.toLowerCase())) ||
      tool.domain.toLowerCase().includes(toolSearch.toLowerCase()) ||
      tool.tags?.some((t) => t.toLowerCase().includes(toolSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header: Neo-Brutalism Toolkit Directory */}
      <div className="border-b-4 border-black pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD93D] text-black border-2 border-black text-xs font-black uppercase tracking-wider mb-3 shadow-[3px_3px_0px_0px_#000] -rotate-1">
            <span className="w-2.5 h-2.5 rounded-none bg-black" />
            TOOLKIT DIRECTORY
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            DEVELOPER<br />
            TOOLS.
          </h1>
          <p className="text-sm md:text-base font-bold text-black mt-3 max-w-xl">
            Software utilities, AI companions, and development engines curated for your active workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search tool */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-black stroke-[3px] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="SEARCH SAVED TOOLS..."
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-3 rounded-none bg-white border-4 border-black text-black placeholder-black/50 text-xs font-black uppercase focus:bg-[#FFD93D] focus:outline-none shadow-[3px_3px_0px_0px_#000]"
            />
          </div>

          <button
            onClick={openSaveModal}
            className="btn-neo flex items-center gap-2 px-6 py-3.5 bg-[#FF6B6B] hover:bg-[#ff5252] text-black font-black uppercase text-xs md:text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>+ SAVE TOOL</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-3 border-b-4 border-black pb-4">
        {CATEGORIES.map((cat) => {
          const label =
            cat === 'All'
              ? 'ALL TOOLS'
              : cat === 'ai_tool'
              ? 'AI TOOLS'
              : cat === 'developer_tool'
              ? 'DEVELOPER TOOLS'
              : 'WEB APPS';

          const isSelected = selectedType === cat;

          return (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`btn-neo px-4 py-2.5 rounded-none border-2 border-black font-black uppercase text-xs tracking-wider transition-all ${
                isSelected
                  ? 'bg-[#FFD93D] text-black shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-white text-black hover:bg-[#FFFDF5] shadow-[2px_2px_0px_0px_#000]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filteredTools.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="NO TOOLS SAVED"
          description="Save AI platforms, dev tools, and utilities into your Resora archive."
          actionLabel="+ SAVE FIRST TOOL"
          onAction={openSaveModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ResourceCard key={tool.id} resource={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
