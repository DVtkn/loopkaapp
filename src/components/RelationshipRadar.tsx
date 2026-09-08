import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Flame,
  Home,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { PulseEntry, MoodHistoryItem } from '../types';
import { triggerHaptic } from '../utils/haptics';

export interface MetricDetail {
  key: 'trust' | 'closeness' | 'communication' | 'sex' | 'routine';
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  p1Score: number;
  p2Score: number;
  avgScore: number;
  statusLabel: string;
  description: string;
  insight: string;
  gottmanTip: string;
  relatedTestTitle: string;
  relatedTestId: string;
}

interface RelationshipRadarProps {
  compact?: boolean;
  className?: string;
  onStartTest?: (testId: string) => void;
}

export const RelationshipRadar: React.FC<RelationshipRadarProps> = ({
  compact = false,
  className = '',
  onStartTest,
}) => {
  const {
    coupleProfile,
    pulseHistory,
    tests,
    challenges,
    smallCravings,
    moodHistory,
    dateInvites,
    loveTaps,
    dailyQuiz,
    currentPartnerId,
  } = useCouple();

  const [viewMode, setViewMode] = useState<'both' | 'partner1' | 'partner2'>('both');
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;

  const p1Label = p1.name || 'Партнёр 1';
  const p2Label = p2.name || 'Партнёр 2';

  // Compute live 5 metrics based on actual tests completion & activities
  const metricsData = useMemo(() => {
    // 1. Tests completion
    const test1 = tests.find((t) => t.id === 'TEST-S1' || t.slug === 'attachment-style');
    const test2 = tests.find((t) => t.id === 'TEST-S2' || t.slug === 'love-languages');
    const test3 = tests.find((t) => t.id === 'TEST-S3' || t.slug === 'gottman-four-horsemen');
    const test4 = tests.find((t) => t.id === 'TEST-C1' || t.slug === 'ideal-day');
    const test5 = tests.find((t) => t.id === 'TEST-S4' || t.slug === 'intimacy-passion');
    const test6 = tests.find((t) => t.id === 'TEST-D1' || t.slug === 'family-scripts');

    // 2. Pulse averages
    const p1Pulses = pulseHistory.filter((p) => p.author === 'partner1');
    const p2Pulses = pulseHistory.filter((p) => p.author === 'partner2');
    const avgPulseClosenessP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.closeness, 0) / p1Pulses.length) * 10 : 0;
    const avgPulseClosenessP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.closeness, 0) / p2Pulses.length) * 10 : 0;
    const avgPulseConstructP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.constructiveness, 0) / p1Pulses.length) * 10 : 0;
    const avgPulseConstructP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.constructiveness, 0) / p2Pulses.length) * 10 : 0;

    // 3. Completed challenges
    const commChallenges = challenges.filter((c) => c.category === 'communication' || c.category === 'gottman');
    const intimacyChallenges = challenges.filter((c) => c.category === 'intimacy');
    const funChallenges = challenges.filter((c) => c.category === 'fun' || c.category === 'adventure');

    // 4. Mood logs
    const p1Moods = moodHistory.filter((m) => m.partnerId === 'partner1');
    const p2Moods = moodHistory.filter((m) => m.partnerId === 'partner2');
    const avgMoodP1 = p1Moods.length ? (p1Moods.reduce((s, m) => s + m.score, 0) / p1Moods.length) * 10 : 0;
    const avgMoodP2 = p2Moods.length ? (p2Moods.reduce((s, m) => s + m.score, 0) / p2Moods.length) * 10 : 0;

    // 5. Cravings fulfilled
    const fulfilledCravings = smallCravings.filter((c) => c.fulfilled);
    const p1FulfilledCravings = fulfilledCravings.filter(c => c.forPartner === 'partner1').length;
    const p2FulfilledCravings = fulfilledCravings.filter(c => c.forPartner === 'partner2').length;

    // 6. Dynamic Interactions
    const p1TapsSent = loveTaps?.filter(t => t.senderLogin === p1.login).length || 0;
    const p2TapsSent = loveTaps?.filter(t => t.senderLogin === p2.login).length || 0;
    const p1DatesInitiated = dateInvites?.filter(d => d.senderId === 'partner1').length || 0;
    const p2DatesInitiated = dateInvites?.filter(d => d.senderId === 'partner2').length || 0;
    const quizMatches = dailyQuiz?.isMatch ? 1 : 0;

    const calculateARE = (p1Actions: number, p2Actions: number) => {
      if (p1Actions === 0 && p2Actions === 0) return { p1: 0, p2: 0 };
      return { p1: Math.min(20, p1Actions * 5), p2: Math.min(20, p2Actions * 5) };
    };
    const tapsARE = calculateARE(p1TapsSent, p2TapsSent);
    const datesARE = calculateARE(p1DatesInitiated, p2DatesInitiated);

    const calculateGottmanBalance = (pulses: PulseEntry[], moods: MoodHistoryItem[]) => {
      let positive = 0;
      let negative = 0;
      pulses.forEach(p => {
        if (p.constructiveness >= 6) positive++;
        if (p.closeness >= 6) positive++;
        if (p.constructiveness <= 4) negative++;
        if (p.closeness <= 4) negative++;
      });
      moods.forEach(m => {
        if (m.score >= 6) positive++;
        if (m.score <= 4) negative++;
      });
      const ratio = positive / Math.max(1, negative);
      return Math.min(25, ratio * 5);
    };
    const gottmanP1 = calculateGottmanBalance(p1Pulses, p1Moods);
    const gottmanP2 = calculateGottmanBalance(p2Pulses, p2Moods);

    let trustP1 = 0, trustP2 = 0;
    const hasTrustDataP1 = !!(test1?.partner1Done || test4?.partner1Done || p1Pulses.length > 0);
    const hasTrustDataP2 = !!(test1?.partner2Done || test4?.partner2Done || p2Pulses.length > 0);
    if (hasTrustDataP1) {
      if (test1?.partner1Done) trustP1 += 40;
      if (test4?.partner1Done) trustP1 += 20;
      if (quizMatches > 0) trustP1 += 5;
      if (p1Pulses.length > 0) trustP1 += Math.round(avgPulseConstructP1 * 0.1);
      trustP1 += gottmanP1;
      trustP1 = Math.min(100, Math.max(20, trustP1));
    }
    if (hasTrustDataP2) {
      if (test1?.partner2Done) trustP2 += 40;
      if (test4?.partner2Done) trustP2 += 20;
      if (quizMatches > 0) trustP2 += 5;
      if (p2Pulses.length > 0) trustP2 += Math.round(avgPulseConstructP2 * 0.1);
      trustP2 += gottmanP2;
      trustP2 = Math.min(100, Math.max(20, trustP2));
    }

    let closeP1 = 0, closeP2 = 0;
    const hasCloseDataP1 = !!(test2?.partner1Done || p1Pulses.length > 0 || p1FulfilledCravings > 0 || p1TapsSent > 0);
    const hasCloseDataP2 = !!(test2?.partner2Done || p2Pulses.length > 0 || p2FulfilledCravings > 0 || p2TapsSent > 0);
    if (hasCloseDataP1) {
      if (test2?.partner1Done) closeP1 += 40;
      if (p1Pulses.length > 0) closeP1 += Math.round(avgPulseClosenessP1 * 0.20);
      closeP1 += Math.min(15, p2FulfilledCravings * 5);
      closeP1 += tapsARE.p1;
      closeP1 = Math.min(100, Math.max(20, closeP1));
    }
    if (hasCloseDataP2) {
      if (test2?.partner2Done) closeP2 += 40;
      if (p2Pulses.length > 0) closeP2 += Math.round(avgPulseClosenessP2 * 0.20);
      closeP2 += Math.min(15, p1FulfilledCravings * 5);
      closeP2 += tapsARE.p2;
      closeP2 = Math.min(100, Math.max(20, closeP2));
    }

    let commP1 = 0, commP2 = 0;
    const hasCommDataP1 = !!(test3?.partner1Done || p1Pulses.length > 0 || commChallenges.some(c => c.partner1Completed));
    const hasCommDataP2 = !!(test3?.partner2Done || p2Pulses.length > 0 || commChallenges.some(c => c.partner2Completed));
    if (hasCommDataP1) {
      if (test3?.partner1Done) commP1 += 50;
      if (p1Pulses.length > 0) commP1 += Math.round(avgPulseConstructP1 * 0.20);
      if (commChallenges.some(c => c.partner1Completed)) commP1 += 15;
      commP1 += gottmanP1;
      commP1 = Math.min(100, Math.max(20, commP1));
    }
    if (hasCommDataP2) {
      if (test3?.partner2Done) commP2 += 50;
      if (p2Pulses.length > 0) commP2 += Math.round(avgPulseConstructP2 * 0.20);
      if (commChallenges.some(c => c.partner2Completed)) commP2 += 15;
      commP2 += gottmanP2;
      commP2 = Math.min(100, Math.max(20, commP2));
    }

    let sexP1 = 0, sexP2 = 0;
    const hasSexDataP1 = !!(test5?.partner1Done || datesARE.p1 > 0 || intimacyChallenges.some(c => c.partner1Completed));
    const hasSexDataP2 = !!(test5?.partner2Done || datesARE.p2 > 0 || intimacyChallenges.some(c => c.partner2Completed));
    if (hasSexDataP1) {
      if (test5?.partner1Done) sexP1 += 50;
      sexP1 += datesARE.p1;
      if (intimacyChallenges.some(c => c.partner1Completed)) sexP1 += 15;
      sexP1 += Math.round(avgMoodP1 * 0.1);
      sexP1 = Math.min(100, Math.max(20, sexP1));
    }
    if (hasSexDataP2) {
      if (test5?.partner2Done) sexP2 += 50;
      sexP2 += datesARE.p2;
      if (intimacyChallenges.some(c => c.partner2Completed)) sexP2 += 15;
      sexP2 += Math.round(avgMoodP2 * 0.1);
      sexP2 = Math.min(100, Math.max(20, sexP2));
    }

    let routineP1 = 0, routineP2 = 0;
    const hasRoutineDataP1 = !!(test6?.partner1Done || p2FulfilledCravings > 0);
    const hasRoutineDataP2 = !!(test6?.partner2Done || p1FulfilledCravings > 0);
    if (hasRoutineDataP1) {
      if (test6?.partner1Done) routineP1 += 60;
      if (p2FulfilledCravings > 0) routineP1 += Math.min(20, p2FulfilledCravings * 7);
      if (funChallenges.some(c => c.partner1Completed)) routineP1 += 10;
      routineP1 = Math.min(100, Math.max(20, routineP1));
    }
    if (hasRoutineDataP2) {
      if (test6?.partner2Done) routineP2 += 60;
      if (p1FulfilledCravings > 0) routineP2 += Math.min(20, p1FulfilledCravings * 7);
      if (funChallenges.some(c => c.partner2Completed)) routineP2 += 10;
      routineP2 = Math.min(100, Math.max(20, routineP2));
    }

    const calcAvg = (score1: number, score2: number): number => {
      if (score1 > 0 && score2 > 0) return Math.round((score1 + score2) / 2);
      if (score1 > 0) return score1;
      if (score2 > 0) return score2;
      return 0;
    };

    const getStatusLabel = (avg: number) => {
      if (avg === 0) return 'Не исследовано';
      if (avg >= 80) return 'Высокая гармония';
      if (avg >= 60) return 'Хороший баланс';
      return 'Зона роста';
    };

    const trustAvg = calcAvg(trustP1, trustP2);
    const closeAvg = calcAvg(closeP1, closeP2);
    const commAvg = calcAvg(commP1, commP2);
    const sexAvg = calcAvg(sexP1, sexP2);
    const routineAvg = calcAvg(routineP1, routineP2);

    const list: MetricDetail[] = [
      {
        key: 'trust',
        name: 'Доверие',
        shortName: 'Доверие',
        icon: ShieldCheck,
        color: 'var(--accent)',
        p1Score: trustP1,
        p2Score: trustP2,
        avgScore: trustAvg,
        statusLabel: getStatusLabel(trustAvg),
        description: 'Ощущение эмоциональной безопасности, надежности и готовности открываться друг другу.',
        insight: trustAvg === 0
          ? 'Пройдите тест «Стили привязанности», чтобы исследовать глубинные потребности в безопасности.'
          : `Уровень доверия оценивается в ${trustAvg}%. Вы создаете надежную гавань друг для друга.`,
        gottmanTip: 'Маленькие обещания, сдержанные вовремя, строят фундамент надежности прочнее любых слов.',
        relatedTestTitle: 'Стили привязанности',
        relatedTestId: 'TEST-S1',
      },
      {
        key: 'closeness',
        name: 'Близость',
        shortName: 'Близость',
        icon: Heart,
        color: 'var(--accent)',
        p1Score: closeP1,
        p2Score: closeP2,
        avgScore: closeAvg,
        statusLabel: getStatusLabel(closeAvg),
        description: 'Теплота, взаимное сопереживание и понимание уникальных языков любви.',
        insight: closeAvg === 0
          ? 'Пройдите исследование «5 языков любви», чтобы точно знать, как партнер ощущает заботу.'
          : `Эмоциональная близость союза — ${closeAvg}%. Вы тонко чувствуете настроение друг друга.`,
        gottmanTip: 'Ежедневно замечайте минимум 3 попытки партнера установить контакт и откликайтесь на них.',
        relatedTestTitle: '5 языков любви',
        relatedTestId: 'TEST-S2',
      },
      {
        key: 'communication',
        name: 'Общение',
        shortName: 'Общение',
        icon: MessageCircle,
        color: 'var(--accent)',
        p1Score: commP1,
        p2Score: commP2,
        avgScore: commAvg,
        statusLabel: getStatusLabel(commAvg),
        description: 'Способность обсуждать сложные темы и мягко находить согласие в моменты споров.',
        insight: commAvg === 0
          ? 'Пройдите тест «Паттерны диалога», чтобы сохранять бережное взаимопонимание при разногласиях.'
          : `Конструктивность диалога оценивается в ${commAvg}%. Вы избегаете токсичных паттернов.`,
        gottmanTip: 'Используйте «я-сообщения»: говорите о своих чувствах вместо критики поступков.',
        relatedTestTitle: 'Паттерны диалога',
        relatedTestId: 'TEST-S3',
      },
      {
        key: 'sex',
        name: 'Интимность',
        shortName: 'Интимность',
        icon: Flame,
        color: 'var(--accent)',
        p1Score: sexP1,
        p2Score: sexP2,
        avgScore: sexAvg,
        statusLabel: getStatusLabel(sexAvg),
        description: 'Чувственная гармония, открытость в выражении желаний и романтическое притяжение.',
        insight: sexAvg === 0
          ? 'Пройдите тест «Баланс страсти и тепла», чтобы исследовать совпадение желаний и ритмов.'
          : `Чувственная гармония — ${sexAvg}%. Готовность открыто говорить о романтических ожиданиях.`,
        gottmanTip: 'Планируйте свидания заранее: предвкушение встречи усиливает страсть.',
        relatedTestTitle: 'Баланс страсти и тепла',
        relatedTestId: 'TEST-S4',
      },
      {
        key: 'routine',
        name: 'Ценности & Быт',
        shortName: 'Ценности',
        icon: Home,
        color: 'var(--accent)',
        p1Score: routineP1,
        p2Score: routineP2,
        avgScore: routineAvg,
        statusLabel: getStatusLabel(routineAvg),
        description: 'Слаженность в повседневных делах, согласованность планов на будущее и финансов.',
        insight: routineAvg === 0
          ? 'Пройдите тест «Идеальный совместный день», чтобы синхронизировать биоритмы и отдых.'
          : `Синхронизация быта и ценностей — ${routineAvg}%. Справедливый баланс и взаимное уважение.`,
        gottmanTip: 'Короткое 5-минутное обсуждение планов на выходные снимает большинство скрытых стрессов.',
        relatedTestTitle: 'Идеальный день',
        relatedTestId: 'TEST-C1',
      },
    ];

    return list;
  }, [coupleProfile, pulseHistory, tests, challenges, smallCravings, moodHistory, dateInvites, loveTaps, dailyQuiz]);

  const hasAnyData = useMemo(() => {
    return metricsData.some((m) => m.avgScore > 0);
  }, [metricsData]);

  const overallScore = useMemo(() => {
    const validScores = metricsData.map((m) => m.avgScore).filter((s) => s > 0);
    if (!validScores.length) return 0;
    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }, [metricsData]);

  const chartData = useMemo(() => {
    return metricsData.map((m) => ({
      metric: m.shortName,
      partner1: m.p1Score > 0 ? m.p1Score : (hasAnyData ? 20 : 0),
      partner2: m.p2Score > 0 ? m.p2Score : (hasAnyData ? 20 : 0),
      average: m.avgScore > 0 ? m.avgScore : (hasAnyData ? 20 : 0),
      fullMark: 100,
    }));
  }, [metricsData, hasAnyData]);

  return (
    <div className={`space-y-5 ${className}`}>
      
      {/* 1. Radar Card Container */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] shadow-2xs space-y-4 relative overflow-hidden">
        
        {/* Soft Background Warmth */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
              5 сфер союза
            </span>
            <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">
              Баланс отношений
            </h3>
          </div>

          {hasAnyData && (
            <div className="px-3 py-1 rounded-full bg-[var(--surface-blush)] text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20 shadow-2xs">
              {overallScore}% совпадение
            </div>
          )}
        </div>

        {/* Empty State: Single clean editorial invitation (no redundant fake chart underneath) */}
        {!hasAnyData ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                <Heart className="w-4 h-4 fill-[var(--accent)]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text)]">
                  Карта совместимости формируется
                </h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">
                  Пройдите исследования пары — и здесь откроется наглядная карта ваших сильных сторон и сфер сближения.
                </p>
              </div>
            </div>

            {onStartTest && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  onStartTest('TEST-S2');
                }}
                className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-3)] text-[var(--text)] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-[var(--divider)] shadow-2xs cursor-pointer active:scale-98"
              >
                <span>Пройти первое исследование</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mode Switcher (Clean Pills) */}
            <div className="flex items-center justify-center gap-1 p-1 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewMode('both');
                }}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'both'
                    ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                Вместе
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewMode('partner1');
                }}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'partner1'
                    ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                {p1Label}
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setViewMode('partner2');
                }}
                className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'partner2'
                    ? 'bg-[var(--surface)] text-[var(--accent)] font-bold shadow-2xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                {p2Label}
              </button>
            </div>

            {/* Recharts Radar */}
            <div className="w-full h-64 sm:h-72 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="var(--divider)" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{
                      fill: 'var(--text)',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />

                  {(viewMode === 'both' || viewMode === 'partner1') && (
                    <Radar
                      name={p1Label}
                      dataKey="partner1"
                      stroke="var(--text-2)"
                      strokeWidth={2}
                      fill="var(--text-2)"
                      fillOpacity={viewMode === 'partner1' ? 0.35 : 0.15}
                      isAnimationActive={true}
                    />
                  )}

                  {(viewMode === 'both' || viewMode === 'partner2') && (
                    <Radar
                      name={p2Label}
                      dataKey="partner2"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      fill="var(--accent)"
                      fillOpacity={viewMode === 'partner2' ? 0.45 : 0.25}
                      isAnimationActive={true}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* 2. The 5 Key Spheres Breakdown */}
      <div className="space-y-3">
        <div className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--text-2)]">
          Подробный разбор сфер
        </div>

        <div className="space-y-2.5">
          {metricsData.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMetricKey === m.key;

            return (
              <div
                key={m.key}
                className={`p-4 rounded-2xl border transition-all bg-[var(--surface)] shadow-2xs space-y-2.5 ${
                  isSelected
                    ? 'border-[var(--accent)]/40 ring-1 ring-[var(--accent)]/20'
                    : 'border-[var(--divider)] hover:border-[var(--divider)]'
                }`}
              >
                {/* Clickable Header */}
                <div
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedMetricKey(isSelected ? null : m.key);
                  }}
                  className="flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/15">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)]">
                        {m.name}
                      </h4>
                      <span className="text-[11px] text-[var(--text-3)]">
                        {m.relatedTestTitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {m.avgScore > 0 ? (
                      <span className="text-xs font-bold text-[var(--accent)]">
                        {m.avgScore}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-[var(--text-3)] font-medium">
                        Не пройден
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar if completed */}
                {m.avgScore > 0 && (
                  <div className="w-full bg-[var(--surface-2)] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.avgScore}%` }}
                    />
                  </div>
                )}

                <p className="text-xs text-[var(--text-2)] leading-relaxed font-normal">
                  {m.description}
                </p>

                {/* Inline Accordion Details */}
                {isSelected && (
                  <div className="pt-2 border-t border-[var(--divider)] space-y-2.5 animate-fadeIn">
                    <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1 text-xs">
                      <div className="font-bold text-[var(--accent)] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        <span>Взгляд психолога</span>
                      </div>
                      <p className="text-[var(--text-2)] leading-relaxed text-[11px]">
                        {m.insight}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] space-y-1 text-xs">
                      <div className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Совет для пары</span>
                      </div>
                      <p className="text-[var(--text-2)] leading-relaxed text-[11px]">
                        {m.gottmanTip}
                      </p>
                    </div>

                    {onStartTest && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          onStartTest(m.relatedTestId);
                        }}
                        className="w-full py-2 bg-[var(--surface-blush)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Исследовать «{m.relatedTestTitle}»</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
