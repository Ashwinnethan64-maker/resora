import React from 'react';
import { LucideIcon } from 'lucide-react';
import { BauhausGeometric } from '@/components/brand/BauhausGeometric';

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
    <div className="relative flex flex-col items-center justify-center p-10 md:p-14 text-center rounded-none border-4 border-[#121212] bg-[#FFFFFF] shadow-bauhaus-md my-8 overflow-hidden">
      {/* Bauhaus Geometric Composition */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-[#F0C020] border-2 border-[#121212] shadow-[2px_2px_0px_#121212]" />
        <div className="w-9 h-9 rounded-none bg-[#D02020] border-2 border-[#121212] shadow-[2px_2px_0px_#121212] flex items-center justify-center text-white">
          {Icon ? <Icon className="w-5 h-5 text-white" /> : <div className="w-3 h-3 bg-white" />}
        </div>
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-[#1040C0] drop-shadow-[2px_2px_0px_#121212]" />
      </div>

      {/* Editorial Title */}
      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-[#121212]">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm font-medium text-[#121212]/80 max-w-md mt-2 mb-6 leading-relaxed">
        {description}
      </p>

      {/* Primary Bauhaus CTA Button */}
      {actionLabel && (
        <button
          onClick={onAction}
          className="btn-bauhaus px-6 py-3 rounded-none bg-[#D02020] hover:bg-[#b01818] text-white border-2 border-[#121212] font-black uppercase text-xs tracking-wider shadow-bauhaus-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
