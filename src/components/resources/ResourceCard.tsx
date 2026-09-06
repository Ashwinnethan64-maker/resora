'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ResourceModel } from '@/types/database';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
import { NeoBadge, NeoSticker } from '@/components/brand/NeoSticker';
import {
  ExternalLink,
  Heart,
  MoreVertical,
  Globe,
  Code2,
  FileText,
  Copy,
  Check,
  Edit2,
  Archive,
  ArchiveRestore,
  Trash2,
  Bot,
  Video,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface ResourceCardProps {
  resource: ResourceModel;
  viewMode?: 'grid' | 'list';
  onOrganize?: (id: string) => void;
}

export function ResourceCard({ resource, viewMode = 'grid', onOrganize }: ResourceCardProps) {
  const {
    toggleFavorite,
    archiveResource,
    openEditModal,
    openDeleteDialog,
    recordOpen,
    showToast
  } = useResora();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const typeConfig = RESOURCE_TYPE_CONFIGS[resource.resource_type] || RESOURCE_TYPE_CONFIGS.website;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(resource.url);
    setCopied(true);
    showToast('Resource link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
    setIsMenuOpen(false);
  };

  const handleOpenLink = () => {
    recordOpen(resource.id);
  };

  const formatSavedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Code2 className="w-3.5 h-3.5 text-black" />;
      case 'ai_tool':
        return <Bot className="w-3.5 h-3.5 text-black" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-black" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-black" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-black" />;
    }
  };

  const getStickerColor = (type: string) => {
    switch (type) {
      case 'ai_tool':
        return 'yellow';
      case 'github':
        return 'red';
      case 'pdf':
      case 'document':
        return 'violet';
      default:
        return 'white';
    }
  };

  // List View (Compact Row)
  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-white border-2 border-black hover:border-black shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] transition-all gap-3">
        <Link
          href={`/app/library/${resource.id}`}
          className="flex items-center gap-3.5 min-w-0 flex-1"
        >
          <div className="w-8 h-8 bg-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
            {getSourceIcon(resource.resource_type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-black group-hover:text-[#FF6B6B] transition-colors truncate max-w-sm">
                {resource.title}
              </h3>
              <NeoBadge label={typeConfig.label} type={resource.resource_type} />
              {resource.is_archived && (
                <span className="text-[10px] px-1.5 py-0.2 border border-black bg-black/10 text-black font-mono font-bold uppercase">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-black/70 truncate mt-0.5 font-normal">
              {resource.description || 'No description provided.'}
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/10">
          <span className="font-mono text-xs font-bold text-black/60">{resource.domain}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 border-2 border-black transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                resource.is_favorite
                  ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black hover:bg-[#FFD93D]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-black' : ''}`} />
            </button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenLink}
              className="p-1.5 border-2 border-black bg-white text-black hover:bg-[#C4B5FD] transition-colors"
              title="Open external link"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 border-2 border-black bg-white text-black hover:bg-[#FFFDF5] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#FFD93D] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2]" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#C4B5FD] text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5 stroke-[2]" /> : <Archive className="w-3.5 h-3.5 stroke-[2]" />}
                      {resource.is_archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#FFFDF5] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2]" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold bg-[#FF6B6B] hover:bg-black hover:text-white text-left border-t border-black"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid View: Refined Canonical ResourceCard
  return (
    <div className="card-neo group relative flex flex-col justify-between p-4 sm:p-5 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000]">
      {/* Corner Type Badge */}
      <div className="absolute -top-3 -right-2 z-10">
        <NeoSticker color={getStickerColor(resource.resource_type) as any} size="sm">
          {typeConfig.label}
        </NeoSticker>
      </div>

      <div>
        {/* Top bar: Domain, Icon, Favorite & More */}
        <div className="flex items-center justify-between gap-2 mb-3 pr-8">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 bg-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              {getSourceIcon(resource.resource_type)}
            </div>
            <span className="font-mono text-xs font-bold text-black/70 truncate max-w-[130px]">
              {resource.domain}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Favorited' : 'Favorite'}
              className={`p-1.5 border-2 border-black transition-colors ${
                resource.is_favorite
                  ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black hover:bg-[#FFD93D]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-black' : ''}`} />
            </button>

            {/* Overflow menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 border-2 border-black bg-white text-black hover:bg-[#FFFDF5] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000] py-1 z-30 text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#FFD93D] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2]" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#C4B5FD] text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5 stroke-[2]" /> : <Archive className="w-3.5 h-3.5 stroke-[2]" />}
                      {resource.is_archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold hover:bg-[#FFFDF5] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[2]" /> : <Copy className="w-3.5 h-3.5 stroke-[2]" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-bold bg-[#FF6B6B] hover:bg-black hover:text-white text-left border-t border-black"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Card Title & Link */}
        <Link href={`/app/library/${resource.id}`} className="block group-hover:underline">
          <h3 className="text-base font-bold text-black line-clamp-2 tracking-tight group-hover:text-[#FF6B6B] transition-colors leading-snug">
            {resource.title}
          </h3>
        </Link>

        {/* AI-Generated / Extracted Description (Normal readable case) */}
        <p className="text-xs text-black/85 line-clamp-2 mt-2 leading-relaxed font-normal">
          {resource.description || 'No description available for this resource.'}
        </p>

        {/* Personal Note Callout (if available) */}
        {resource.personal_note && (
          <div className="mt-2.5 p-2 bg-[#FFFDF5] border border-black text-[11px] text-black font-mono">
            <span className="font-bold text-black block text-[10px] uppercase">Note:</span>
            <span className="line-clamp-2">{resource.personal_note}</span>
          </div>
        )}

        {/* Tags & Use Cases */}
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-black/10">
          {resource.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 border border-black bg-[#FFFDF5] text-black font-bold"
            >
              #{tag}
            </span>
          ))}

          {resource.use_cases?.slice(0, 2).map((uc) => (
            <span
              key={uc}
              className="text-[10px] font-mono px-2 py-0.5 border border-black bg-[#FFD93D] text-black font-bold"
            >
              {uc}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Metadata & Action CTA */}
      <div className="pt-3.5 mt-3.5 border-t-2 border-black flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-black font-bold">
          <span>{formatSavedDate(resource.created_at)}</span>
          {resource.page_count && (
            <>
              <span>•</span>
              <span>{resource.page_count}p</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/app/library/${resource.id}`}
            className="text-[11px] font-bold text-black underline underline-offset-2 hover:text-[#FF6B6B]"
          >
            Dossier
          </Link>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleOpenLink}
            className="btn-neo flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FFD93D] border-2 border-black text-black font-black uppercase text-[10px] tracking-wider shadow-[2px_2px_0px_#000]"
          >
            <span>Visit</span>
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
          </a>
        </div>
      </div>
    </div>
  );
}
