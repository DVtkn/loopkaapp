import React from 'react';
import { useCouple } from '../context/CoupleContext';

export const AmbientBackground: React.FC = () => {
  const { theme, activeTab } = useCouple();
  const isDark = theme === 'night';

  // Tasteful, calm, and subtle ambient accents by tab (low intensity, zero harsh glare)
  const getTabGradient = () => {
    switch (activeTab) {
      case 'us':
      case 'tests':
      case 'report':
      case 'care':
        return {
          glowPrimary: isDark ? 'rgba(255, 45, 85, 0.08)' : 'rgba(255, 45, 85, 0.035)',
          glowSecondary: isDark ? 'rgba(255, 59, 48, 0.06)' : 'rgba(255, 59, 48, 0.025)',
        };
      case 'dates':
        return {
          glowPrimary: isDark ? 'rgba(255, 69, 58, 0.07)' : 'rgba(255, 69, 58, 0.03)',
          glowSecondary: isDark ? 'rgba(255, 149, 0, 0.05)' : 'rgba(255, 149, 0, 0.02)',
        };
      case 'chat':
      case 'owl':
        return {
          glowPrimary: isDark ? 'rgba(255, 45, 85, 0.05)' : 'rgba(255, 45, 85, 0.02)',
          glowSecondary: isDark ? 'rgba(10, 132, 255, 0.04)' : 'rgba(0, 122, 255, 0.02)',
        };
      case 'profile':
      case 'settings':
        return {
          glowPrimary: isDark ? 'rgba(255, 59, 48, 0.06)' : 'rgba(255, 59, 48, 0.025)',
          glowSecondary: isDark ? 'rgba(255, 45, 85, 0.05)' : 'rgba(255, 45, 85, 0.02)',
        };
      default:
        // Dashboard / Home
        return {
          glowPrimary: isDark ? 'rgba(255, 59, 48, 0.08)' : 'rgba(255, 59, 48, 0.035)',
          glowSecondary: isDark ? 'rgba(255, 45, 85, 0.06)' : 'rgba(255, 45, 85, 0.025)',
        };
    }
  };

  const currentGlow = getTabGradient();

  return (
    <div
      id="app-ambient-background"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 transition-colors duration-700"
      aria-hidden="true"
    >
      {/* 1. Base Solid Theme Canvas */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          backgroundColor: isDark ? '#070709' : '#F4F4F8',
        }}
      />

      {/* 2. Seamless, Ultra-Wide Diffused Ambient Mesh (Zero harsh boundaries or hotspots) */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isDark
            ? `
              radial-gradient(ellipse 120% 70% at 50% -10%, ${currentGlow.glowPrimary} 0%, rgba(255, 45, 85, 0.03) 45%, transparent 80%),
              radial-gradient(ellipse 100% 60% at 85% 30%, ${currentGlow.glowSecondary} 0%, transparent 70%),
              radial-gradient(ellipse 110% 70% at 15% 85%, ${currentGlow.glowPrimary} 0%, transparent 75%)
            `
            : `
              radial-gradient(ellipse 120% 60% at 50% -10%, ${currentGlow.glowPrimary} 0%, transparent 70%),
              radial-gradient(ellipse 90% 50% at 80% 20%, ${currentGlow.glowSecondary} 0%, transparent 65%),
              radial-gradient(ellipse 100% 60% at 20% 90%, ${currentGlow.glowPrimary} 0%, transparent 70%)
            `,
        }}
      />

      {/* 3. Extremely Soft, Slow-Breathing Ambient Velvet Aurora Layer */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[120%] h-[80%] filter blur-[150px] pointer-events-none transition-all duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 40% 30%, rgba(255, 59, 48, 0.06) 0%, rgba(255, 45, 85, 0.03) 50%, transparent 80%)'
            : 'radial-gradient(ellipse at 40% 30%, rgba(255, 59, 48, 0.025) 0%, transparent 75%)',
          opacity: isDark ? 0.9 : 0.6,
        }}
      />

      {/* 4. Subtle Lower Glow */}
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[100%] h-[60%] filter blur-[160px] pointer-events-none transition-all duration-1000"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 60% 70%, rgba(255, 45, 85, 0.05) 0%, rgba(255, 149, 0, 0.02) 45%, transparent 75%)'
            : 'radial-gradient(ellipse at 60% 70%, rgba(255, 45, 85, 0.02) 0%, transparent 70%)',
          opacity: isDark ? 0.85 : 0.5,
        }}
      />

      {/* 5. Minimal Apple Dot Grid Texture Overlay (Very subtle, soft tactile texture) */}
      <div
        className={`absolute inset-0 apple-bg-grid pointer-events-none transition-opacity duration-700 ${
          isDark ? 'opacity-15 mix-blend-screen' : 'opacity-10 mix-blend-soft-light'
        }`}
      />
    </div>
  );
};
