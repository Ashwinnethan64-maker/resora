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
  Video
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

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-none bg-white hover:bg-[#FFFDF5] border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-100">
        <Link
          href={`/app/library/${resource.id}`}
          onClick={handleOpenLink}
          className="flex items-start md:items-center gap-3.5 flex-1 min-w-0"
        >
          <div className="w-9 h-9 rounded-none bg-black text-white border-2 border-black flex items-center justify-center shrink-0 font-mono text-xs font-black">
            {resource.title ? resource.title.slice(0, 2).toUpperCase() : 'RE'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-black group-hover:underline truncate">
                {resource.title}
              </h3>
              <NeoBadge label={typeConfig.label} type={resource.resource_type} />
              {resource.is_archived && (
                <span className="text-[10px] px-2 py-0.5 rounded-none border-2 border-black bg-[#E0E0E0] text-black font-mono font-black uppercase">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-black/70 truncate mt-0.5">
              {resource.description || 'No description provided.'}
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t-2 md:border-t-0 border-black">
          <span className="font-mono text-xs font-black text-black/60">{resource.domain}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-none border-2 border-black transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                resource.is_favorite
                  ? 'bg-[#FF6B6B] text-black'
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
              className="p-1.5 rounded-none border-2 border-black bg-white text-black hover:bg-[#C4B5FD] transition-colors"
              title="Open external link"
            >
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-none border-2 border-black bg-white text-black hover:bg-[#FFFDF5] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] py-1 z-30 font-sans text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#FFD93D] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" /> EDIT
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#C4B5FD] text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5 stroke-[2.5]" /> : <Archive className="w-3.5 h-3.5 stroke-[2.5]" />}
                      {resource.is_archived ? 'UNARCHIVE' : 'ARCHIVE'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#FFFDF5] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                      {copied ? 'COPIED' : 'COPY LINK'}
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black bg-[#FF6B6B] hover:bg-black hover:text-white text-left border-t-2 border-black"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> DELETE
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

  // Default Grid View: Neo-Brutalist Research Card with Physical Lift
  return (
    <div className="card-neo group relative flex flex-col justify-between p-5 rounded-none bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
      {/* Corner Sticker Badge */}
      <div className="absolute -top-3 -right-2 z-10">
        <NeoSticker color={getStickerColor(resource.resource_type) as any} rotate={resource.resource_type === 'ai_tool' ? '2' : '-1'} size="sm">
          {typeConfig.label}
        </NeoSticker>
      </div>

      <div>
        {/* Top bar: Domain, Icon, Favorite & More */}
        <div className="flex items-center justify-between gap-2 mb-3 pr-8">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-none bg-[#FFD93D] border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000]">
              {getSourceIcon(resource.resource_type)}
            </div>
            <span className="font-mono text-xs font-black text-black truncate max-w-[130px]">
              {resource.domain}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Favorited' : 'Favorite'}
              className={`p-1.5 rounded-none border-2 border-black transition-colors ${
                resource.is_favorite
                  ? 'bg-[#FF6B6B] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black hover:bg-[#FFD93D]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-black' : ''}`} />
            </button>

            {/* Menu trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-none border-2 border-black bg-white text-black hover:bg-[#FFD93D] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-none bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] py-1 z-30 font-sans text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#FFD93D] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" /> EDIT
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#C4B5FD] text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5 stroke-[2.5]" /> : <Archive className="w-3.5 h-3.5 stroke-[2.5]" />}
                      {resource.is_archived ? 'UNARCHIVE' : 'ARCHIVE'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#FFFDF5] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[2.5]" />}
                      {copied ? 'COPIED' : 'COPY LINK'}
                    </button>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleOpenLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black hover:bg-[#C4B5FD] text-left"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" /> OPEN LINK
                    </a>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-black font-black bg-[#FF6B6B] hover:bg-black hover:text-white text-left border-t-2 border-black"
                    >
                      <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" /> DELETE
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description Link */}
        <Link
          href={`/app/library/${resource.id}`}
          onClick={handleOpenLink}
          className="block group/link"
        >
          <h3 className="text-base font-black text-black group-hover/link:underline leading-tight line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-xs font-bold text-black/80 mt-1.5 line-clamp-2 leading-relaxed">
            {resource.description || 'No description captured.'}
          </p>
        </Link>

        {/* Tags & Use Case Badges */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {resource.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono font-black px-2 py-0.5 rounded-none bg-[#FFFDF5] text-black border-2 border-black shadow-[1px_1px_0px_#000]"
            >
              #{tag}
            </span>
          ))}
          {resource.use_cases && resource.use_cases.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-none bg-[#C4B5FD] text-black border-2 border-black font-black uppercase shadow-[1px_1px_0px_#000]">
              {resource.use_cases[0]}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Saved Date & Detail Anchor */}
      <div className="mt-4 pt-3 border-t-4 border-black flex items-center justify-between text-xs text-black/80 font-mono font-black">
        <span>SAVED {formatSavedDate(resource.created_at).toUpperCase()}</span>
        <Link
          href={`/app/library/${resource.id}`}
          onClick={handleOpenLink}
          className="btn-neo px-2.5 py-1 bg-[#FFD93D] hover:bg-[#ffe366] text-black border-2 border-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_#000]"
        >
          VIEW →
        </Link>
      </div>
    </div>
  );
}
