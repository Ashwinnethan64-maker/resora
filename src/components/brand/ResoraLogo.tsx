import React from 'react';
import Image from 'next/image';

interface ResoraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon';
  showTagline?: boolean;
}

export function ResoraLogo({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = false,
}: ResoraLogoProps) {
  const pixelSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const textSizes = {
    sm: 'text-sm gap-2',
    md: 'text-base gap-2.5',
    lg: 'text-lg gap-3',
    xl: 'text-xl gap-3.5',
  };

  const dimension = pixelSizes[size];

  // Icon only variant
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}>
        <Image
          src="/Resora_logo.png"
          alt="RESORA Logo"
          width={dimension}
          height={dimension}
          priority
          className="object-contain rounded-lg shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${textSizes[size]} ${className}`}>
      {/* Official RESORA Brand Logo Asset */}
      <div className="shrink-0 flex items-center justify-center">
        <Image
          src="/Resora_logo.png"
          alt="RESORA Logo"
          width={dimension}
          height={dimension}
          priority
          className="object-contain rounded-lg shadow-sm"
        />
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-bold tracking-wider text-slate-100 font-sans">
            RESORA
          </span>
          {variant !== 'compact' && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
              v1.0
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-400 tracking-tight mt-1 font-normal">
            Save it. Understand it. Use it.
          </span>
        )}
      </div>
    </div>
  );
}
