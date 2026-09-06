'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useResora } from '@/context/ResoraContext';
import { ResourceModel } from '@/types/database';
import { RESOURCE_TYPE_CONFIGS } from '@/lib/resource-types';
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
  File,
  Folder
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

  const handleOpenLink = (e: React.MouseEvent) => {
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
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ai_tool':
        return <Bot className="w-3.5 h-3.5 text-violet-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-rose-400" />;
      case 'pdf':
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getGeometricMarker = (type: string) => {
    switch (type) {
      case 'ai_tool':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#F0C020] border border-[#121212] inline-block shrink-0 shadow-[1px_1px_0px_#121212]" title="AI Tool" />;
      case 'github':
        return <span className="w-2.5 h-2.5 rounded-none bg-[#1040C0] border border-[#121212] inline-block shrink-0 shadow-[1px_1px_0px_#121212]" title="Code / Dev" />;
      case 'pdf':
      case 'document':
        return <span className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[9px] border-b-[#D02020] inline-block shrink-0 drop-shadow-[1px_1px_0px_#121212]" title="Document / PDF" />;
      default:
        return <span className="w-2.5 h-2.5 rounded-none bg-[#121212] border border-[#121212] inline-block shrink-0" title="Resource" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 rounded-none bg-[#FFFFFF] hover:bg-[#F0F0F0] border-2 md:border-4 border-[#121212] shadow-bauhaus-sm transition-all duration-150">
        <Link
          href={`/app/library/${resource.id}`}
          onClick={handleOpenLink}
          className="flex items-start md:items-center gap-3.5 flex-1 min-w-0"
        >
          <div className="w-9 h-9 rounded-none bg-[#121212] text-[#FFFFFF] border-2 border-[#121212] flex items-center justify-center shrink-0 font-mono text-xs font-black">
            {resource.title ? resource.title.slice(0, 2).toUpperCase() : 'RE'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {getGeometricMarker(resource.resource_type)}
              <h3 className="text-sm font-bold text-[#121212] group-hover:text-[#1040C0] transition-colors truncate">
                {resource.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-none border border-[#121212] font-bold uppercase tracking-wider bg-[#F0F0F0] text-[#121212]">
                {typeConfig.label}
              </span>
              {resource.is_archived && (
                <span className="text-[10px] px-2 py-0.5 rounded-none border border-[#121212] bg-[#E0E0E0] text-[#121212] font-mono font-bold uppercase">
                  Archived
                </span>
              )}
            </div>
            <p className="text-xs text-[#121212]/70 truncate mt-0.5">
              {resource.description || 'No description provided.'}
            </p>
          </div>
        </Link>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t-2 md:border-t-0 border-[#121212]">
          <span className="font-mono text-xs font-bold text-[#121212]/60">{resource.domain}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1.5 rounded-none border-2 border-[#121212] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
                resource.is_favorite
                  ? 'bg-[#D02020] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#121212] hover:bg-[#F0C020]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-[#FFFFFF]' : ''}`} />
            </button>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenLink}
              className="p-1.5 rounded-none border-2 border-[#121212] bg-[#FFFFFF] text-[#121212] hover:bg-[#1040C0] hover:text-[#FFFFFF] transition-colors"
              title="Open external link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1.5 rounded-none border-2 border-[#121212] bg-[#FFFFFF] text-[#121212] hover:bg-[#E0E0E0] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-none bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-md py-1 z-30 font-sans text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#F0C020] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> EDIT
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#1040C0] hover:text-white text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      {resource.is_archived ? 'UNARCHIVE' : 'ARCHIVE'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#F0F0F0] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#121212]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'COPIED' : 'COPY LINK'}
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#D02020] font-black hover:bg-[#D02020] hover:text-white text-left border-t-2 border-[#121212]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> DELETE
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

  // Default Grid View: Physical Bauhaus Research Index Card
  return (
    <div className="group relative flex flex-col justify-between p-4 rounded-none bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-sm hover:shadow-bauhaus-md hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
      {/* Corner geometric indicator */}
      <div className="absolute -top-2.5 -right-2.5">
        {resource.resource_type === 'ai_tool' && (
          <div className="w-5 h-5 rounded-full bg-[#F0C020] border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" title="AI Intelligence Tool" />
        )}
        {resource.resource_type === 'github' && (
          <div className="w-5 h-5 rounded-none bg-[#1040C0] border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" title="Code Repository" />
        )}
        {(resource.resource_type === 'pdf' || resource.resource_type === 'document') && (
          <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-[#D02020] drop-shadow-[2px_2px_0px_#121212]" title="Research Document" />
        )}
        {resource.resource_type !== 'ai_tool' && resource.resource_type !== 'github' && resource.resource_type !== 'pdf' && resource.resource_type !== 'document' && (
          <div className="w-5 h-5 rounded-none bg-[#121212] border-2 border-[#121212]" title="Web Resource" />
        )}
      </div>

      <div>
        {/* Top bar: Domain, Favicon, Favorite & More */}
        <div className="flex items-center justify-between gap-2 mb-2.5 pr-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-none bg-[#F0F0F0] border-2 border-[#121212] flex items-center justify-center shrink-0">
              {getSourceIcon(resource.resource_type)}
            </div>
            <span className="font-mono text-[11px] font-bold text-[#121212] truncate max-w-[130px]">
              {resource.domain}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(resource.id)}
              title={resource.is_favorite ? 'Favorited' : 'Favorite'}
              className={`p-1 rounded-none border border-[#121212] transition-colors ${
                resource.is_favorite
                  ? 'bg-[#D02020] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#121212] hover:bg-[#F0C020]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${resource.is_favorite ? 'fill-[#FFFFFF]' : ''}`} />
            </button>

            {/* Menu trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-none border border-[#121212] bg-[#FFFFFF] text-[#121212] hover:bg-[#E0E0E0] transition-colors"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-none bg-[#FFFFFF] border-4 border-[#121212] shadow-bauhaus-md py-1 z-30 font-sans text-xs">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openEditModal(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#F0C020] text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> EDIT
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        archiveResource(resource.id, !resource.is_archived);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#1040C0] hover:text-white text-left"
                    >
                      {resource.is_archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                      {resource.is_archived ? 'UNARCHIVE' : 'ARCHIVE'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#F0F0F0] text-left"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#121212]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'COPIED' : 'COPY LINK'}
                    </button>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleOpenLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#121212] font-bold hover:bg-[#1040C0] hover:text-white text-left"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> OPEN EXTERNAL
                    </a>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        openDeleteDialog(resource);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[#D02020] font-black hover:bg-[#D02020] hover:text-white text-left border-t-2 border-[#121212]"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> DELETE
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
          <h3 className="text-sm font-bold text-[#121212] group-hover/link:text-[#1040C0] transition-colors line-clamp-1">
            {resource.title}
          </h3>
          <p className="text-xs text-[#121212]/80 mt-1 line-clamp-2 leading-relaxed">
            {resource.description || 'No description captured.'}
          </p>
        </Link>

        {/* Tags & Use Case Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-none border border-[#121212] font-black uppercase tracking-wider bg-[#F0F0F0] text-[#121212]">
            {typeConfig.label}
          </span>
          {resource.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none bg-[#FFFFFF] text-[#121212] border border-[#121212]"
            >
              #{tag}
            </span>
          ))}
          {resource.use_cases && resource.use_cases.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-none bg-[#F0C020] text-[#121212] border border-[#121212] font-bold uppercase">
              {resource.use_cases[0]}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Saved Date & Detail Anchor */}
      <div className="mt-3.5 pt-2.5 border-t-2 border-[#121212] flex items-center justify-between text-[11px] text-[#121212]/70 font-mono font-bold">
        <span>SAVED {formatSavedDate(resource.created_at).toUpperCase()}</span>
        <Link
          href={`/app/library/${resource.id}`}
          onClick={handleOpenLink}
          className="text-[#121212] hover:text-[#1040C0] flex items-center gap-1 font-black uppercase tracking-wider group-hover:translate-x-0.5 transition-transform"
        >
          DOSSIER →
        </Link>
      </div>
    </div>
  );
}

