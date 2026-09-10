import React from 'react';
import { Trophy, Crown, HeartHandshake } from 'lucide-react';
import { motion } from 'motion/react';
import { ColoredAvatar } from '../ColoredIcon.tsx';

interface RatingHeaderProps {
  analytics: any;
  p1: any;
  p2: any;
  p1Name: string;
  p2Name: string;
}

export const RatingHeader: React.FC<RatingHeaderProps> = ({
  analytics,
  p1,
  p2,
  p1Name,
  p2Name,
}) => {
  const levelInfo = analytics.levelInfo;

  return (
    <div className="p-5 sm:p-7 border-b border-[var(--divider)] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Title & Level Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[var(--accent)]">Общий рейтинг активности пары</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight">
              {analytics.totalXP.toLocaleString('ru-RU')}{' '}
              <span className="text-sm font-semibold text-[var(--text-secondary)]">XP</span>
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Crown className="w-3.5 h-3.5" />
              Ранг {levelInfo.level}: {levelInfo.levelName}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
            Рейтинг растёт от совместных действий: прохождения тестов, свиданий, быстрых реакций и заботы.
          </p>
        </div>

        {/* Level Progress Bar Card */}
        <div className="min-w-[280px] p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--text)]">Прогресс до ранга «{levelInfo.nextLevelName}»</span>
            <span className="text-[var(--accent)] font-bold">{levelInfo.progressPercent}%</span>
          </div>

          <div className="w-full h-2.5 bg-[var(--divider)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.xpToNext > 0 ? `Ещё ${levelInfo.xpToNext} XP` : 'Максимальный ранг!'}</span>
          </div>
        </div>
      </div>

      {/* Mutual Balance & Partner Contribution Strip */}
      <div className="mt-6 pt-6 border-t border-[var(--divider)] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Partner 1 Info */}
        <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)]">
          <ColoredAvatar avatar={p1.avatar} name={p1Name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text)]">{p1Name}</span>
              <span className="text-xs font-bold text-rose-500">{analytics.partner1Percent}%</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {analytics.partner1XP.toLocaleString('ru-RU')} XP вклада
            </p>
          </div>
        </div>

        {/* Balance Bar & Synergy */}
        <div className="md:col-span-4 px-2 space-y-2 text-center">
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
            <span>Вклад партнёров</span>
            <span className="text-emerald-500 font-bold">{analytics.balanceStatus}</span>
          </div>
          <div className="h-2.5 w-full bg-[var(--divider)] rounded-full overflow-hidden flex">
            <div
              style={{ width: `${analytics.partner1Percent}%` }}
              className="h-full bg-rose-500 transition-all duration-700"
            />
            <div
              style={{ width: `${analytics.partner2Percent}%` }}
              className="h-full bg-indigo-500 transition-all duration-700"
            />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <HeartHandshake className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>
              Индекс синергии: <strong className="text-[var(--text)]">{analytics.synergyScore}%</strong>
            </span>
          </div>
        </div>

        {/* Partner 2 Info */}
        <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)]">
          <ColoredAvatar avatar={p2.avatar} name={p2Name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text)]">{p2Name}</span>
              <span className="text-xs font-bold text-indigo-500">{analytics.partner2Percent}%</span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {analytics.partner2XP.toLocaleString('ru-RU')} XP вклада
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
