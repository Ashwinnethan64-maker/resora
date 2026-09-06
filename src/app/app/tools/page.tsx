'use client';

import React, { useState } from 'react';
import { useResora } from '@/context/ResoraContext';
import { ResourceCard } from '@/components/resources/ResourceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Wrench,
  ExternalLink,
  Heart,
  Globe,
  Tag,
  Sparkles,
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1c2132]">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Tools
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Software utilities, AI companions, and development engines curated for your workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search tool */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter saved tools..."
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#121420] border border-[#212638] text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={openSaveModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-900/30 transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Save tool</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const label =
            cat === 'All'
              ? 'All Tools'
              : cat === 'ai_tool'
              ? 'AI Tools'
              : cat === 'developer_tool'
              ? 'Developer Tools'
              : 'Web Apps';

          return (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === cat
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-[#121420] text-slate-400 hover:text-slate-200 border border-[#202537]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tools Grid */}
      {filteredTools.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No tools found."
          description="Save AI tools, CLI agents, or developer utilities into your library."
          actionLabel="+ Save tool"
          onAction={openSaveModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTools.map((tool) => (
            <ResourceCard key={tool.id} resource={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
