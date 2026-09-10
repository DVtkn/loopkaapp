import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Flame, ShieldCheck, HeartPulse, Scale, Trophy, TrendingUp, Info } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';

export const DynamicsGamificationWidget: React.FC = () => {
  const {
    coupleProfile,
    pulseHistory,
    moodHistory,
    challenges,
    smallCravings,
    loveTaps,
    dateInvites,
  } = useCouple();

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;

  const stats = useMemo(() => {
    // 1. Gottman 5:1 Positive Balance Tracker
    const calculateGottmanBalance = (partnerId: string) => {
      const partnerPulses = pulseHistory.filter((p) => p.author === partnerId);
      const partnerMoods = moodHistory.filter((m) => m.partnerId === partnerId);
      let positive = 0;
      let negative = 0;

      partnerPulses.forEach((p) => {
        if (p.constructiveness >= 6) positive++;
        if (p.closeness >= 6) positive++;
        if (p.constructiveness <= 4) negative++;
        if (p.closeness <= 4) negative++;
      });
      partnerMoods.forEach((m) => {
        if (m.score >= 6) positive++;
        if (m.score <= 4) negative++;
      });

      return { positive, negative, ratio: positive / Math.max(1, negative) };
    };

    const gottmanP1 = calculateGottmanBalance("partner1");
    const gottmanP2 = calculateGottmanBalance("partner2");

    const totalPositive = gottmanP1.positive + gottmanP2.positive;
    const totalNegative = gottmanP1.negative + gottmanP2.negative;
    const gottmanRatio = totalPositive / Math.max(1, totalNegative);

    // 2. A.R.E. (Accessibility, Responsiveness, Engagement) Sync Engine
    const p1Taps = loveTaps?.filter((t) => t.senderLogin === p1.login).length || 0;
    const p2Taps = loveTaps?.filter((t) => t.senderLogin === p2.login).length || 0;

    const p1Dates = dateInvites?.filter((d) => d.senderId === "partner1").length || 0;
    const p2Dates = dateInvites?.filter((d) => d.senderId === "partner2").length || 0;

    const p1Cravings = smallCravings.filter((c) => c.fulfilled && c.forPartner === "partner2").length;
    const p2Cravings = smallCravings.filter((c) => c.fulfilled && c.forPartner === "partner1").length;

    const p1Effort = p1Taps + p1Dates * 3 + p1Cravings * 2;
    const p2Effort = p2Taps + p2Dates * 3 + p2Cravings * 2;
    const totalEffort = p1Effort + p2Effort;
    const p1Share = totalEffort === 0 ? 50 : Math.round((p1Effort / totalEffort) * 100);
    const p2Share = totalEffort === 0 ? 50 : 100 - p1Share;

    return {
      gottman: {
        ratio: gottmanRatio.toFixed(1),
        isOptimal: gottmanRatio >= 5,
        totalPositive,
        totalNegative,
        percentage: Math.min(100, Math.max(0, (gottmanRatio / 5) * 100))
      },
      are: {
        p1Effort,
        p2Effort,
        p1Share,
        p2Share,
        isSynced: Math.abs(p1Share - p2Share) <= 20 // 40-60 to 60-40 is synced
      }
    };
  }, [pulseHistory, moodHistory, loveTaps, dateInvites, smallCravings, p1, p2]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      className="app-card overflow-hidden"
    >
      <div className="p-4 border-b border-[var(--divider)] bg-[var(--surface-2)] flex flex-col gap-1 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-extrabold text-[var(--text)]">
            Динамический движок Loop
          </h3>
        </div>
        <p className="text-xs text-[var(--text-2)] font-medium max-w-[280px]">
          Как ваши ежедневные действия влияют на индексы радара отношений
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Gottman Metric */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--text)]">Коэффициент Готтмана (5:1)</h4>
                <p className="text-[10px] text-[var(--text-2)] font-medium">Позитив против негатива</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-lg font-black font-mono ${stats.gottman.isOptimal ? 'text-emerald-500' : 'text-amber-500'}`}>
                {stats.gottman.ratio}:1
              </span>
            </div>
          </div>
          
          <div className="relative h-3 w-full bg-rose-500/20 rounded-full overflow-hidden border border-rose-500/10 shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-full"
              style={{ width: `${stats.gottman.percentage}%` }}
            />
            {/* The 5:1 Marker */}
            <div className="absolute top-0 bottom-0 left-[100%] w-0.5 bg-[var(--text)] z-10 hidden" />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-2)]">
            <span>+{stats.gottman.totalPositive} Действий</span>
            <span className={stats.gottman.isOptimal ? 'text-emerald-500' : ''}>
              {stats.gottman.isOptimal ? 'Супер-буст активен!' : 'Цель: 5 к 1'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[var(--divider)]" />

        {/* A.R.E. Engine */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center border border-blue-500/20">
                <Scale className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--text)]">A.R.E. Синхронизация</h4>
                <p className="text-[10px] text-[var(--text-2)] font-medium">Баланс отзывчивости и усилий</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--divider)] text-[var(--text)]">
                {stats.are.isSynced ? 'Синхронизировано' : 'Дисбаланс'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--accent-blue)] w-8">{p1.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-[var(--divider)] overflow-hidden flex shadow-inner">
              <div 
                className="h-full bg-[var(--accent-blue)] transition-all duration-1000"
                style={{ width: `${stats.are.p1Share}%` }}
              />
              <div 
                className="h-full bg-[var(--accent)] transition-all duration-1000"
                style={{ width: `${stats.are.p2Share}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[var(--accent)] w-8 text-right">{p2.name}</span>
          </div>
          
          <p className="text-[10px] leading-relaxed text-[var(--text-2)] font-medium text-center">
            {stats.are.isSynced 
              ? 'Вы вкладываетесь в отношения на равных. Индекс Близости получает бонус к росту!'
              : 'Один из партнёров сейчас тянет отношения активнее. Штраф к индексу Близости.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
