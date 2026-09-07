import React from 'react';
import { Sun, Moon, Bell, Award, Flame, User, Heart } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { LoopLogo } from './LoopLogo';

interface HeaderProps {
  onOpenAchievements?: () => void;
  onOpenSettings?: () => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAchievements, onOpenSettings }) => {
  const {
    currentPartnerId,
    setCurrentPartnerId,
    coupleProfile,
    theme,
    setTheme,
    screen,
    setScreen,
    currentUser,
  } = useCouple();

  const partner1 = coupleProfile.partner1;
  const partner2 = coupleProfile.partner2;
  const isPaired = !!currentUser?.partnerLogin;

  return (
    <header 
      className="shrink-0 z-30 apple-glass border-b border-[var(--divider)] select-none transition-all"
      style={{ paddingTop: 'max(52px, calc(env(safe-area-inset-top, 0px) + 8px))' }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <LoopLogo size="sm" />
              <span className="font-bold text-base tracking-tight text-[var(--text)]">Loop</span>
            </div>
          </div>

          {/* Right Controls: User Profile Badge & Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* User Profile Pill / Pairing Status */}
            {currentUser && onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] hover:border-[var(--accent)] text-left flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Перейти в личный кабинет"
              >
                <div className="w-6 h-6 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.login[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-[var(--text)] leading-tight flex items-center gap-1">
                    <span>@{currentUser.login}</span>
                    {isPaired && <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />}
                  </div>
                </div>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="header-theme-btn"
              onClick={() => setTheme(theme === 'night' ? 'aurora' : 'night')}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-[var(--surface-2)] text-[var(--text)] text-xs font-semibold border border-[var(--divider)] hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {theme === 'night' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span className="hidden md:inline">Night</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">Day</span>
                </>
              )}
            </button>

            {onOpenAchievements && (
              <button
                id="header-achievements"
                onClick={onOpenAchievements}
                className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-amber-500 hover:text-amber-600 flex items-center justify-center border border-[var(--divider)] shadow-xs"
                title="Награды и достижения"
              >
                <Award className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
