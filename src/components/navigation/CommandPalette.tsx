'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResora } from '@/context/ResoraContext';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
import {
  Search,
  Inbox,
  FolderKanban,
  Library,
  FileText,
  Wrench,
  Heart,
  Settings,
  PlusCircle,
  Compass,
  ArrowRight
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const { isCommandPaletteOpen, closeCommandPalette, resources, openSaveModal } = useResora();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

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

  const navCommands = [
    { title: 'ASK RESORA', icon: Compass, action: () => router.push('/app/assistant'), shortcut: 'A', key: 'a', color: 'bg-[#FFD93D] text-black' },
    { title: 'SEARCH LIBRARY', icon: Search, action: () => router.push('/app/library'), shortcut: 'L', key: 'l', color: 'bg-[#FF6B6B] text-black' },
    { title: 'CAPTURE RESOURCE', icon: PlusCircle, action: () => { closeCommandPalette(); openSaveModal(); }, shortcut: '⌘⇧S', key: 's_shift', color: 'bg-[#C4B5FD] text-black' },
    { title: 'OPEN INBOX', icon: Inbox, action: () => router.push('/app/inbox'), shortcut: 'I', key: 'i', color: 'bg-white text-black' },
    { title: 'OPEN PROJECTS', icon: FolderKanban, action: () => router.push('/app/projects'), shortcut: 'P', key: 'p', color: 'bg-white text-black' },
    { title: 'OPEN COLLECTIONS', icon: Library, action: () => router.push('/app/collections'), shortcut: 'C', key: 'c', color: 'bg-white text-black' },
    { title: 'OPEN DOCUMENTS', icon: FileText, action: () => router.push('/app/documents'), shortcut: 'D', key: 'd', color: 'bg-white text-black' },
    { title: 'OPEN TOOLS', icon: Wrench, action: () => router.push('/app/tools'), shortcut: 'T', key: 't', color: 'bg-white text-black' },
    { title: 'OPEN FAVORITES', icon: Heart, action: () => router.push('/app/favorites'), shortcut: 'F', key: 'f', color: 'bg-white text-black' },
    { title: 'SETTINGS', icon: Settings, action: () => router.push('/app/settings'), shortcut: 'S', key: 's', color: 'bg-white text-black' },
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

  // Handle direct command execution
  const executeNavCommand = (cmd: (typeof navCommands)[number]) => {
    closeCommandPalette();
    cmd.action();
  };

  // Build combined clickable / navigable list
  const totalNavItems = filteredResources.length + navCommands.length;

  // Global key handling inside Command Palette
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Escape ALWAYS closes palette immediately
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        e.stopPropagation();
        closeCommandPalette();
        return;
      }

      // 2. Capture shortcut ⌘⇧S / Ctrl+Shift+S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        e.stopPropagation();
        closeCommandPalette();
        openSaveModal();
        return;
      }

      // If user is holding Ctrl / Meta or Alt, don't hijack typing
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // 3. ArrowDown / ArrowUp navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev + 1 >= totalNavItems ? 0 : prev + 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 < 0 ? totalNavItems - 1 : prev - 1));
        return;
      }

      // 4. Enter executes selected item
      if (e.key === 'Enter') {
        if (selectedIndex >= 0) {
          e.preventDefault();
          e.stopPropagation();
          if (selectedIndex < filteredResources.length) {
            const res = filteredResources[selectedIndex];
            handleSelect(() => router.push(`/app/library/${res.id}`));
          } else {
            const cmd = navCommands[selectedIndex - filteredResources.length];
            if (cmd) executeNavCommand(cmd);
          }
          return;
        }
      }

      // 5. Direct single-letter shortcuts when search query is empty
      // Even if focus is in the search input or anywhere on page, single letter shortcut triggers the action when input is empty!
      const activeInputVal = inputRef.current?.value ?? query;
      if (!activeInputVal.trim()) {
        const pressedKey = e.key.toLowerCase();
        if (pressedKey.length === 1 && pressedKey >= 'a' && pressedKey <= 'z') {
          const matched = navCommands.find((c) => c.key === pressedKey);
          if (matched) {
            e.preventDefault();
            e.stopPropagation();
            executeNavCommand(matched);
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isCommandPaletteOpen, query, totalNavItems, selectedIndex, filteredResources, navCommands, closeCommandPalette, openSaveModal]);

  // If not open, do not render modal at all
  if (!isCommandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-none animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCommandPalette();
        }
      }}
    >
      <div
        className="fixed inset-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeCommandPalette();
        }}
      />
      
      {/* Neo-Brutalist Command Modal Box */}
      <div
        className="relative w-full max-w-2xl rounded-none bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden z-10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Header */}
        <div className="flex items-center px-4 py-4 border-b-4 border-black gap-3 bg-[#FFFDF5]">
          <Search className="w-5 h-5 text-black stroke-[3px] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape' || e.key === 'Esc') {
                e.preventDefault();
                e.stopPropagation();
                closeCommandPalette();
                return;
              }
              // If query is empty and user hits a single character quick-key, trigger it directly!
              if (!query.trim() && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const pressed = e.key.toLowerCase();
                const matched = navCommands.find((cmd) => cmd.key === pressed);
                if (matched) {
                  e.preventDefault();
                  e.stopPropagation();
                  executeNavCommand(matched);
                  return;
                }
              }
            }}
            placeholder="SEARCH RESEARCH INDEX (CMD+K)..."
            className="w-full bg-transparent text-sm md:text-base font-black uppercase text-black placeholder-black/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeCommandPalette();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeCommandPalette();
            }}
            className="hidden sm:inline-block font-mono text-[10px] font-black text-black bg-[#FFD93D] hover:bg-[#FF6B6B] px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer select-none"
            title="Click or press ESC to close"
          >
            ESC
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-3 bg-white">
          {/* Matching live resources */}
          {/* Matching live resources */}
          {filteredResources.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5 bg-[#FFD93D] border-2 border-black w-max mb-2">
                <span className="w-2.5 h-2.5 rounded-none bg-[#FF6B6B] border border-black" />
                MATCHING SAVED RESEARCH
              </div>
              {filteredResources.map((res, idx) => {
                const isSelected = selectedIndex === idx;
                const cfg = RESOURCE_TYPE_CONFIGS[res.resource_type] || RESOURCE_TYPE_CONFIGS.website;
                return (
                  <button
                    key={res.id}
                    onClick={() => handleSelect(() => router.push(`/app/library/${res.id}`))}
                    className={`w-full flex items-center justify-between p-3 rounded-none text-left border-2 border-black transition-all group mb-2 shadow-[3px_3px_0px_0px_#000] ${
                      isSelected
                        ? 'bg-[#FFD93D] -translate-y-0.5 shadow-[5px_5px_0px_0px_#000]'
                        : 'bg-white hover:bg-[#FFFDF5]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-none bg-[#FFD93D] text-black border-2 border-black flex items-center justify-center text-xs font-mono font-black shrink-0">
                        {res.title ? res.title.slice(0, 2).toUpperCase() : 'RE'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs md:text-sm font-black uppercase text-black group-hover:text-[#FF6B6B] truncate">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-black font-mono font-bold truncate">
                          {res.domain} • {cfg.label.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3px] group-hover:translate-x-1 transition-transform" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Suggestions if empty */}
          {!query && (
            <div className="mb-4">
              <div className="px-2 py-1 text-xs font-mono font-black uppercase tracking-wider text-black flex items-center gap-1.5 bg-[#C4B5FD] border-2 border-black w-max mb-2">
                <span className="w-2.5 h-2.5 bg-black" />
                RESEARCH PROMPTS
              </div>
              <div className="flex flex-wrap gap-2 px-1 pt-1 pb-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setQuery(sug)}
                    className="btn-neo text-xs px-3 py-1.5 rounded-none bg-[#FFFDF5] text-black font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD93D]"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Commands */}
          <div>
            <div className="px-2 py-1 text-xs font-mono font-black uppercase tracking-wider text-black bg-[#FF6B6B] border-2 border-black w-max mb-2">
              QUICK COMMANDS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {navCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const commandIndex = filteredResources.length + idx;
                const isSelected = selectedIndex === commandIndex;
                return (
                  <button
                    key={cmd.title}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(cmd.action);
                    }}
                    className={`btn-neo flex items-center justify-between p-2.5 rounded-none text-left border-2 border-black transition-all group shadow-[2px_2px_0px_0px_#000] cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFD93D] -translate-y-0.5 shadow-[4px_4px_0px_0px_#000]'
                        : 'bg-white hover:bg-[#FFFDF5]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-black stroke-[2.5px]" />
                      <span className="text-xs font-black uppercase text-black group-hover:text-[#FF6B6B]">
                        {cmd.title}
                      </span>
                    </div>
                    <kbd className={`font-mono text-[10px] font-black text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000] ${
                      isSelected ? 'bg-white' : 'bg-[#FFD93D]'
                    }`}>
                      {cmd.shortcut}
                    </kbd>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-3 border-t-4 border-black bg-[#FFFDF5] flex items-center justify-between text-xs font-bold text-black select-none">
          <span className="flex items-center gap-2 font-black">
            <span className="w-2.5 h-2.5 rounded-none bg-[#FF6B6B] border border-black" />
            PERSISTENT RESEARCH INDEX ({resources.length} ITEMS)
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeCommandPalette();
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              closeCommandPalette();
            }}
            className="font-mono text-[10px] uppercase bg-black hover:bg-[#FF6B6B] text-white px-2 py-0.5 transition-colors cursor-pointer select-none"
          >
            ESC TO CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
