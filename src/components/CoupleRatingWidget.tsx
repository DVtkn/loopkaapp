import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Layers,
  Activity,
  Zap,
  ShieldCheck,
  Wine,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCouple } from '../context/CoupleContext.tsx';
import { computeCoupleRatingAnalytics } from '../utils/rankingEngine.ts';
import { RatingHeader } from './rating/RatingHeader.tsx';
import { RatingChartTab } from './rating/RatingChartTab.tsx';
import { RatingCategoriesTab } from './rating/RatingCategoriesTab.tsx';
import { RatingLevelsTab } from './rating/RatingLevelsTab.tsx';
import { RatingHistoryTab } from './rating/RatingHistoryTab.tsx';

interface CoupleRatingWidgetProps {
  onNavigateToTests?: () => void;
  onNavigateToDates?: () => void;
  onNavigateToChat?: () => void;
  className?: string;
}

type RatingTab = 'chart' | 'categories' | 'levels' | 'history';

export const CoupleRatingWidget: React.FC<CoupleRatingWidgetProps> = ({
  onNavigateToTests,
  onNavigateToDates,
  className = '',
}) => {
  const {
    coupleProfile,
    tests,
    pulseHistory,
    challenges,
    dateInvites,
    smallCravings,
    loveTaps,
    coupleXP,
    xpHistory,
    sendLoveTap,
    triggerConfetti,
  } = useCouple();

  const [activeTab, setActiveTab] = useState<RatingTab>('chart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;
  const p1Name = p1.name || 'Партнёр 1';
  const p2Name = p2.name || 'Партнёр 2';

  const analytics = useMemo(() => {
    return computeCoupleRatingAnalytics({
      xpHistory,
      totalXP: coupleXP,
      tests,
      dateInvites,
      smallCravings,
      loveTaps,
      pulseHistory,
      challenges,
      p1Name,
      p2Name,
    });
  }, [xpHistory, coupleXP, tests, dateInvites, smallCravings, loveTaps, pulseHistory, challenges, p1Name, p2Name]);

  const handleQuickBoost = (type: 'tap' | 'test' | 'date') => {
    if (type === 'tap') {
      sendLoveTap('thinking', 'Отправлено быстрое касание для рейтинга');
      setToastMessage('Рейтинг пополнен! Отправлено касание партнёру (+10 XP)');
    } else if (type === 'test' && onNavigateToTests) {
      onNavigateToTests();
    } else if (type === 'date' && onNavigateToDates) {
      onNavigateToDates();
    }
    triggerConfetti();
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div
      id="couple-rating-widget"
      className={`rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-sm backdrop-blur-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center"
          >
            <Sparkles className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <RatingHeader analytics={analytics} p1={p1} p2={p2} p1Name={p1Name} p2Name={p2Name} />

      {/* Tabs Navigation */}
      <div className="px-5 sm:px-7 pt-4 border-b border-[var(--divider)] flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'chart', label: 'Динамика роста', icon: TrendingUp },
            { id: 'categories', label: 'Источники рейтинга', icon: Layers },
            { id: 'levels', label: 'Шкала рангов', icon: Award },
            { id: 'history', label: 'История начислений', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RatingTab)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleQuickBoost('tap')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            +10 XP Касание
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-7">
        {activeTab === 'chart' && (
          <RatingChartTab timelineData={analytics.timelineData} p1Name={p1Name} p2Name={p2Name} />
        )}
        {activeTab === 'categories' && (
          <RatingCategoriesTab
            categories={analytics.categories}
            onNavigateToTests={onNavigateToTests}
            onNavigateToDates={onNavigateToDates}
          />
        )}
        {activeTab === 'levels' && (
          <RatingLevelsTab currentLevel={analytics.levelInfo.level} totalXP={analytics.totalXP} />
        )}
        {activeTab === 'history' && <RatingHistoryTab xpHistory={xpHistory} />}

        {/* Quick Action Boost Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)]">Быстро прокачать рейтинг:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickBoost('tap')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Отправить реакцию (+10 XP)
            </button>
            {onNavigateToTests && (
              <button
                onClick={onNavigateToTests}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Пройти тест (+150 XP)
              </button>
            )}
            {onNavigateToDates && (
              <button
                onClick={onNavigateToDates}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wine className="w-3.5 h-3.5 text-rose-500" />
                Запланировать свидание (+100 XP)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
