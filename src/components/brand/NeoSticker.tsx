import React from 'react';

export type StickerColor = 'red' | 'yellow' | 'violet' | 'white' | 'black';

interface NeoStickerProps {
  children: React.ReactNode;
  color?: StickerColor;
  rotate?: '-2' | '-1' | '0' | '1' | '2' | '3';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NeoSticker({
  children,
  color = 'yellow',
  rotate = '0',
  className = '',
  size = 'md',
}: NeoStickerProps) {
  const colorMap: Record<StickerColor, string> = {
    red: 'bg-[#FF6B6B] text-black',
    yellow: 'bg-[#FFD93D] text-black',
    violet: 'bg-[#C4B5FD] text-black',
    white: 'bg-[#FFFFFF] text-black',
    black: 'bg-[#000000] text-white',
  };

  const rotateMap: Record<string, string> = {
    '-2': '-rotate-2',
    '-1': '-rotate-1',
    '0': 'rotate-0',
    '1': 'rotate-1',
    '2': 'rotate-2',
    '3': 'rotate-3',
  };

  const sizeMap = {
    sm: 'text-[10px] px-2 py-0.5 border-2 shadow-[2px_2px_0px_#000]',
    md: 'text-xs px-2.5 py-1 border-2 shadow-[3px_3px_0px_#000]',
    lg: 'text-sm px-3.5 py-1.5 border-4 shadow-[4px_4px_0px_#000]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-black uppercase tracking-wider select-none border-black shrink-0 ${colorMap[color]} ${rotateMap[rotate]} ${sizeMap[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Neo-Brutalist Badge for Categories / Types
 */
export function NeoBadge({
  label,
  type = 'default',
  className = '',
}: {
  label: string;
  type?: string;
  className?: string;
}) {
  let color: StickerColor = 'white';
  let rot: '-1' | '1' | '0' = '0';

  if (type === 'ai_tool') {
    color = 'yellow';
    rot = '1';
  } else if (type === 'github') {
    color = 'red';
    rot = '-1';
  } else if (type === 'pdf' || type === 'document') {
    color = 'violet';
    rot = '1';
  } else if (type === 'video') {
    color = 'red';
  }

  return (
    <NeoSticker color={color} rotate={rot} size="sm" className={className}>
      {label}
    </NeoSticker>
  );
}
