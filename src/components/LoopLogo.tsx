import React from 'react';

interface LoopLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withSparkles?: boolean;
}

export const LoopLogo: React.FC<LoopLogoProps> = ({
  size = 'md',
  className = '',
  withSparkles = true,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-[7px]',
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-12 h-12 rounded-[18px]',
    xl: 'w-16 h-16 rounded-[22px]',
  };

  const heartSizes = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 26,
    xl: 34,
  };

  const currentHeartSize = heartSizes[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden select-none bg-gradient-to-br from-[#FF453A] via-[#FF2D55] to-[#D91B42] text-white shadow-md shadow-[#FF2D55]/30 border border-white/25 transition-transform active:scale-95 ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: '0 4px 14px -2px rgba(255, 45, 85, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
      }}
      aria-label="Loop Logo"
    >
      {/* Subtle radial inner glow */}
      <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

      {/* 3D Soft Glowing Heart */}
      <svg
        width={currentHeartSize}
        height={currentHeartSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <linearGradient id="logoHeartGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFF0F3" />
            <stop offset="100%" stopColor="#FFCCD5" />
          </linearGradient>
          <linearGradient id="logoHeartShine" x1="12" y1="2" x2="12" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#logoHeartGrad)"
        />
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="url(#logoHeartShine)"
        />
      </svg>

      {/* Sparkles matching home screen app icon */}
      {withSparkles && (
        <>
          {/* Top-Right Glint */}
          <div
            className="absolute z-20 pointer-events-none top-[12%] right-[12%] text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
            style={{
              width: size === 'xs' ? '4px' : size === 'sm' ? '6px' : '8px',
              height: size === 'xs' ? '4px' : size === 'sm' ? '6px' : '8px',
            }}
          >
            <svg viewBox="0 0 100 100" fill="white" className="w-full h-full">
              <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" />
            </svg>
          </div>

          {/* Bottom-Left subtle glint */}
          {size !== 'xs' && (
            <div
              className="absolute z-20 pointer-events-none bottom-[16%] left-[14%] text-pink-100/90"
              style={{
                width: size === 'sm' ? '4px' : '6px',
                height: size === 'sm' ? '4px' : '6px',
              }}
            >
              <svg viewBox="0 0 100 100" fill="white" className="w-full h-full">
                <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};
