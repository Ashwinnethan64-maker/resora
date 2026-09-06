import React from 'react';
import { LucideIcon } from 'lucide-react';
import { NeoSticker } from '@/components/brand/NeoSticker';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center p-10 md:p-14 text-center rounded-none border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000] my-8 overflow-hidden">
      {/* Decorative Stickers */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <NeoSticker color="yellow" rotate="-2">EMPTY</NeoSticker>
        <div className="w-12 h-12 rounded-none bg-[#FF6B6B] border-4 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-center text-black">
          {Icon ? <Icon className="w-6 h-6 stroke-[3]" /> : <div className="w-4 h-4 bg-black" />}
        </div>
        <NeoSticker color="violet" rotate="2">ARCHIVE</NeoSticker>
      </div>

      {/* Editorial Title */}
      <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-black">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm font-bold text-black/80 max-w-md mt-2 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Primary Neo-Brutalist CTA Button */}
      {actionLabel && (
        <button
          onClick={onAction}
          className="btn-neo px-6 py-3.5 rounded-none bg-[#FFD93D] hover:bg-[#ffe366] text-black border-4 border-black font-black uppercase text-xs tracking-wider shadow-[6px_6px_0px_0px_#000]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
