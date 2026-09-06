'use client';

import React from 'react';

export type SectionLabelColor = 'yellow' | 'coral' | 'violet' | 'white';

interface SectionLabelProps {
  label: string;
  icon?: React.ReactNode;
  color?: SectionLabelColor;
  className?: string;
}

export function SectionLabel({
  label,
  icon,
  color = 'yellow',
  className = '',
}: SectionLabelProps) {
  const colorStyles: Record<SectionLabelColor, string> = {
    yellow: 'bg-[#FFD93D] text-black border-black shadow-[2.5px_2.5px_0px_#000]',
    coral: 'bg-[#FF6B6B] text-black border-black shadow-[2.5px_2.5px_0px_#000]',
    violet: 'bg-[#C4B5FD] text-black border-black shadow-[2.5px_2.5px_0px_#000]',
    white: 'bg-white text-black border-black shadow-[2.5px_2.5px_0px_#000]',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-black uppercase tracking-wider border-2 ${colorStyles[color]} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      <span>{label}</span>
    </div>
  );
}

interface PageHeaderProps {
  eyebrow: string;
  eyebrowColor?: SectionLabelColor;
  eyebrowIcon?: React.ReactNode;
  title: string | React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowColor = 'yellow',
  eyebrowIcon,
  title,
  description,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-black/15 ${className}`}
    >
      <div className="space-y-2">
        <div>
          <SectionLabel label={eyebrow} color={eyebrowColor} icon={eyebrowIcon} />
        </div>
        {typeof title === 'string' ? (
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-[1.05]">
            {title}
          </h1>
        ) : (
          title
        )}
        {description && (
          <p className="text-xs sm:text-sm font-medium text-black/80 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="self-start sm:self-auto shrink-0">{actions}</div>}
    </div>
  );
}
