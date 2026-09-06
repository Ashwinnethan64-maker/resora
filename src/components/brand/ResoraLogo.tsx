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
    sm: 26,
    md: 34,
    lg: 42,
    xl: 52,
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
          className="object-contain rounded-none border border-black shadow-[2px_2px_0px_#000]"
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
          className="object-contain rounded-none border border-black shadow-[2px_2px_0px_#000]"
        />
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 leading-none">
          <span className="font-black tracking-tight text-black text-base md:text-lg uppercase">
            RESORA
          </span>
          {variant !== 'compact' && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-[#FFD93D] text-black border border-black font-black">
              v1.0
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[11px] font-mono text-black font-bold tracking-tight mt-1">
            Save it. Understand it. Use it.
          </span>
        )}
      </div>
    </div>
  );
}
