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
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)', paddingBottom: '2px' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-13 sm:h-14">
          
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <LoopLogo size="sm" />
            <span className="font-extrabold text-base tracking-tight text-[var(--text)]">Loop</span>
          </div>

          {/* Right Controls: User Avatar & Theme */}
          <div className="flex items-center gap-2">
            {/* User Profile Pill / Pairing Status */}
            {currentUser && onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1.5 rounded-full bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] flex items-center gap-2 transition-colors cursor-pointer"
                title="Перейти в личный кабинет"
              >
                <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : currentUser.login[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] hidden sm:inline">
                  @{currentUser.login}
                </span>
                {isPaired && <Heart className="w-3 h-3 text-[var(--accent)] fill-[var(--accent)] shrink-0" />}
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              id="header-theme-btn"
              onClick={() => setTheme(theme === 'night' ? 'aurora' : 'night')}
              className="w-8 h-8 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)] flex items-center justify-center active:scale-95 transition-all cursor-pointer"
              title="Сменить тему"
            >
              {theme === 'night' ? (
                <Moon className="w-3.5 h-3.5 text-[var(--accent)]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
