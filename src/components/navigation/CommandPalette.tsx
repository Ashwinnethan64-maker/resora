'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
import {
  Search,
  BookOpen,
  Inbox,
  FolderKanban,
  Library,
  FileText,
  Wrench,
  Heart,
  Settings,
  PlusCircle,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, closeCommandPalette, resources, openSaveModal } = useResora();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Real-time fuzzy query across title, description, domain, tags, and use cases
  const q = query.trim().toLowerCase();
  const filteredResources = q
    ? resources
        .filter((r) => {
          if (r.is_archived) return false;
          return (
            r.title.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q)) ||
            r.domain.toLowerCase().includes(q) ||
            r.tags?.some((t) => t.toLowerCase().includes(q)) ||
            r.use_cases?.some((u) => u.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  // Static navigation commands
  const navCommands = [
    { title: 'Ask Resora', icon: Sparkles, action: () => router.push('/app/assistant'), shortcut: 'A' },
    { title: 'Search library', icon: Search, action: () => router.push('/app/library'), shortcut: 'L' },
    { title: 'Save resource', icon: PlusCircle, action: () => { closeCommandPalette(); openSaveModal(); }, shortcut: '⌘⇧S' },
    { title: 'Open inbox', icon: Inbox, action: () => router.push('/app/inbox'), shortcut: 'I' },
    { title: 'Open projects', icon: FolderKanban, action: () => router.push('/app/projects'), shortcut: 'P' },
    { title: 'Open collections', icon: Library, action: () => router.push('/app/collections'), shortcut: 'C' },
    { title: 'Open documents', icon: FileText, action: () => router.push('/app/documents'), shortcut: 'D' },
    { title: 'Open tools', icon: Wrench, action: () => router.push('/app/tools'), shortcut: 'T' },
    { title: 'Open favorites', icon: Heart, action: () => router.push('/app/favorites'), shortcut: 'F' },
    { title: 'Settings', icon: Settings, action: () => router.push('/app/settings'), shortcut: 'S' },
  ].filter((cmd) => cmd.title.toLowerCase().includes(q));

  const suggestions = [
    'AI tools for hackathons',
    'Resources about AI agents',
    'UI libraries',
    'Saved PDFs',
    'Developer tools',
  ];

  const handleSelect = (action: () => void) => {
    action();
    closeCommandPalette();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={closeCommandPalette} />
      <div className="relative w-full max-w-xl rounded-2xl bg-[#11131c] border border-[#23293c] shadow-2xl shadow-black/90 overflow-hidden z-10 flex flex-col">
        {/* Search input field */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1c2132] gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your research library..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block font-mono text-[10px] text-slate-400 bg-[#1a1e2d] px-2 py-0.5 rounded border border-[#2b3248]">
            ESC
          </kbd>
        </div>

        {/* Content list */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
          {/* Matching live resources */}
          {filteredResources.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Matching Saved Resources
              </div>
              {filteredResources.map((res) => {
                const cfg = RESOURCE_TYPE_CONFIGS[res.resource_type] || RESOURCE_TYPE_CONFIGS.website;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleSelect(() => router.push(`/app/library/${res.id}`))}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#191d2c] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded bg-[#202538] border border-[#2d344d] flex items-center justify-center text-[10px] font-mono text-slate-300 shrink-0">
                        {res.title ? res.title.slice(0, 2).toUpperCase() : 'RE'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                          {res.title}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {res.domain} • {cfg.label}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick suggestions if query is empty */}
          {!query && (
            <div className="mb-3">
              <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Research Suggestions
              </div>
              <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#161a27] hover:bg-[#1e2335] text-slate-400 hover:text-slate-200 border border-[#23283a] transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Commands */}
          <div>
            <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Quick Navigation
            </div>
            {navCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.title}
                  onClick={() => handleSelect(cmd.action)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#191d2c] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-xs text-slate-300 group-hover:text-slate-100">
                      {cmd.title}
                    </span>
                  </div>
                  <kbd className="font-mono text-[10px] text-slate-500 bg-[#161925] px-1.5 py-0.5 rounded border border-[#222739]">
                    {cmd.shortcut}
                  </kbd>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 border-t border-[#1a1f2e] bg-[#0e1017] flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Persistent index active ({resources.length} items)
          </span>
          <span className="font-mono text-[10px]">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
