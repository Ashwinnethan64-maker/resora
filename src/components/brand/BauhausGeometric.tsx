import React from 'react';

export type BauhausShape = 'circle' | 'square' | 'triangle';
export type BauhausColor = 'red' | 'blue' | 'yellow' | 'black' | 'white';

interface BauhausGeometricProps {
  shape: BauhausShape;
  color?: BauhausColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  bordered?: boolean;
}

export function BauhausGeometric({
  shape,
  color = 'yellow',
  size = 'md',
  className = '',
  bordered = true,
}: BauhausGeometricProps) {
  const colorClasses: Record<BauhausColor, string> = {
    red: 'bg-[#D02020]',
    blue: 'bg-[#1040C0]',
    yellow: 'bg-[#F0C020]',
    black: 'bg-[#121212]',
    white: 'bg-[#FFFFFF]',
  };

  const textColors: Record<BauhausColor, string> = {
    red: 'text-[#D02020]',
    blue: 'text-[#1040C0]',
    yellow: 'text-[#F0C020]',
    black: 'text-[#121212]',
    white: 'text-[#FFFFFF]',
  };

  const sizeDimensions = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const borderClass = bordered ? 'border-2 border-[#121212]' : '';

  if (shape === 'circle') {
    return (
      <div
        className={`rounded-full shrink-0 ${sizeDimensions[size]} ${colorClasses[color]} ${borderClass} ${className}`}
      />
    );
  }

  if (shape === 'square') {
    return (
      <div
        className={`rounded-none shrink-0 ${sizeDimensions[size]} ${colorClasses[color]} ${borderClass} ${className}`}
      />
    );
  }

  if (shape === 'triangle') {
    // Triangle using SVG for crisp scale
    return (
      <div className={`shrink-0 ${sizeDimensions[size]} ${className}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full overflow-visible">
          <polygon
            points="12,2 22,22 2,22"
            className={`${textColors[color]} fill-current`}
            stroke="#121212"
            strokeWidth={bordered ? "2.5" : "0"}
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    );
  }

  return null;
}

/**
 * Bauhaus Corner Shape Accents on Cards
 */
export function BauhausCornerBadge({
  shape = 'circle',
  color = 'yellow',
}: {
  shape?: BauhausShape;
  color?: BauhausColor;
}) {
  return (
    <div className="absolute -top-3 -right-3 z-10">
      <BauhausGeometric shape={shape} color={color} size="md" bordered />
    </div>
  );
}
