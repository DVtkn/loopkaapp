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
  TrendingUp,
  Award,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { PulseEntry, MoodHistoryItem } from "../types";

export interface MetricDetail {
  key: 'trust' | 'closeness' | 'communication' | 'sex' | 'routine';
  name: string;
  shortName: string;
  icon: React.ElementType;
  color: string;
  p1Score: number;
  p2Score: number;
  avgScore: number;
  p1Steps: number;
  p2Steps: number;
  gapSteps: number;
  status: 'excellent' | 'good' | 'growth';
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
  } = useCouple();

  const [viewMode, setViewMode] = useState<'both' | 'average' | 'partner1' | 'partner2'>('both');
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;

  const p1Label = `${p1.name}${p1.gender === 'female' ? ' (Она)' : p1.gender === 'male' ? ' (Он)' : ''}`;
  const p2Label = `${p2.name}${p2.gender === 'female' ? ' (Она)' : p2.gender === 'male' ? ' (Он)' : ''}`;
  // Compute live 5 metrics based on actual tests completion & activities
  // METHODOLOGY: Gottman 5:1 Ratio + Sue Johnson A.R.E. (Accessibility, Responsiveness, Engagement)
  const metricsData = useMemo(() => {
    // 1. Tests completion
    const test1 = tests.find((t) => t.id === "TEST-S1" || t.id === "test-1" || t.slug === "attachment-style");
    const test2 = tests.find((t) => t.id === "TEST-S2" || t.id === "test-2" || t.slug === "five-love-languages" || t.slug === "love-languages");
    const test3 = tests.find((t) => t.id === "TEST-S3" || t.id === "TEST-D2" || t.id === "test-3" || t.slug === "gottman-four-horsemen" || t.slug === "conflict-resolution-styles" || t.slug === "conflict-gottman");
    const test4 = tests.find((t) => t.id === "TEST-C1" || t.id === "TEST-D1" || t.id === "test-4" || t.slug === "ideal-day" || t.slug === "family-scripts" || t.slug === "core-values");
    const test5 = tests.find((t) => t.id === "TEST-S4" || t.id === "test-5" || t.slug === "sternberg-love-triangle" || t.slug === "intimacy-passion");
    const test6 = tests.find((t) => t.id === "TEST-D1" || t.id === "test-6" || t.slug === "family-scripts" || t.slug === "domestic-lifestyle");

    // 2. Pulse averages
    const p1Pulses = pulseHistory.filter((p) => p.author === "partner1");
    const p2Pulses = pulseHistory.filter((p) => p.author === "partner2");
    const avgPulseClosenessP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.closeness, 0) / p1Pulses.length) * 10 : 0;
    const avgPulseClosenessP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.closeness, 0) / p2Pulses.length) * 10 : 0;
    const avgPulseConstructP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.constructiveness, 0) / p1Pulses.length) * 10 : 0;
    const avgPulseConstructP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.constructiveness, 0) / p2Pulses.length) * 10 : 0;

    // 3. Completed challenges
    const commChallenges = challenges.filter((c) => c.category === "communication" || c.category === "gottman");
    const intimacyChallenges = challenges.filter((c) => c.category === "intimacy");
    const funChallenges = challenges.filter((c) => c.category === "fun" || c.category === "adventure");

    // 4. Mood logs
    const p1Moods = moodHistory.filter((m) => m.partnerId === "partner1");
    const p2Moods = moodHistory.filter((m) => m.partnerId === "partner2");
    const avgMoodP1 = p1Moods.length ? (p1Moods.reduce((s, m) => s + m.score, 0) / p1Moods.length) * 10 : 0;
    const avgMoodP2 = p2Moods.length ? (p2Moods.reduce((s, m) => s + m.score, 0) / p2Moods.length) * 10 : 0;

    // 5. Cravings fulfilled
    const fulfilledCravings = smallCravings.filter((c) => c.fulfilled);
    const p1FulfilledCravings = fulfilledCravings.filter(c => c.forPartner === "partner1").length;
    const p2FulfilledCravings = fulfilledCravings.filter(c => c.forPartner === "partner2").length;

    // 6. Dynamic Interactions (Love Taps & Dates - Gottman Positive Deposits)
    const p1TapsSent = loveTaps?.filter(t => t.senderLogin === p1.login).length || 0;
    const p2TapsSent = loveTaps?.filter(t => t.senderLogin === p2.login).length || 0;
    const p1DatesInitiated = dateInvites?.filter(d => d.senderId === "partner1").length || 0;
    const p2DatesInitiated = dateInvites?.filter(d => d.senderId === "partner2").length || 0;
    const quizMatches = dailyQuiz?.isMatch ? 1 : 0;

    // A.R.E. Responsiveness Engine
    const calculateARE = (p1Actions: number, p2Actions: number) => {
      if (p1Actions === 0 && p2Actions === 0) return { p1: 0, p2: 0 };
      return { p1: Math.min(20, p1Actions * 5), p2: Math.min(20, p2Actions * 5) };
    };
    const tapsARE = calculateARE(p1TapsSent, p2TapsSent);
    const datesARE = calculateARE(p1DatesInitiated, p2DatesInitiated);

    // Gottman 5:1 Positive Balance Tracker
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

    const getStatus = (avg: number): { status: "excellent" | "good" | "growth"; statusLabel: string } => {
      if (avg === 0) return { status: "growth", statusLabel: "Тест не пройден" };
      if (avg >= 80) return { status: "excellent", statusLabel: "Высокая гармония" };
      if (avg >= 50) return { status: "good", statusLabel: "Баланс и устойчивость" };
      return { status: "growth", statusLabel: "Зона роста" };
    };

    const trustAvg = calcAvg(trustP1, trustP2);
    const closeAvg = calcAvg(closeP1, closeP2);
    const commAvg = calcAvg(commP1, commP2);
    const sexAvg = calcAvg(sexP1, sexP2);
    const routineAvg = calcAvg(routineP1, routineP2);

    const computeSteps = (score1: number, score2: number) => {
      const totalPoints = score1 + score2;
      let totalSteps = Math.round(totalPoints / 10);
      if (totalSteps > 20) totalSteps = 20;
      if (totalPoints === 0) return { p1Steps: 0, p2Steps: 0, gapSteps: 20 };
      let s1 = Math.round((score1 / totalPoints) * totalSteps);
      let s2 = totalSteps - s1;
      if (s1 > 20) { s1 = 20; s2 = 0; }
      if (s2 > 20) { s2 = 20; s1 = 0; }
      return { p1Steps: s1, p2Steps: s2, gapSteps: Math.max(0, 20 - s1 - s2) };
    };

    const list: MetricDetail[] = [
      {
        key: 'trust',
        name: 'Доверие',
        shortName: 'Доверие',
        icon: ShieldCheck,
        color: '#6366f1', // Indigo
        ...computeSteps(trustP1, trustP2),
        p1Score: trustP1,
        p2Score: trustP2,
        avgScore: trustAvg,
        ...getStatus(trustAvg),
        description: 'Психологическая безопасность, отсутствие страха уязвимости и уверенность в надёжности партнёра.',
        insight: trustAvg === 0
          ? 'Пройдите тест «Стиль привязанности & Безопасность», чтобы определить ваш уровень доверия и эмоциональной безопасности.'
          : `${p1Label} (${trustP1}%) и ${p2Label} (${trustP2}%). Базис взаимного доверия и безопасности сформирован.`,
        gottmanTip: 'Практикуйте эмоциональную прозрачность: делитесь сомнениями до того, как они перерастут в тревогу.',
        relatedTestTitle: 'Стиль привязанности (ECR)',
        relatedTestId: 'TEST-S1',
      },
      {
        key: 'closeness',
        name: 'Близость',
        shortName: 'Близость',
        icon: Heart,
        color: '#f43f5e', // Rose
        ...computeSteps(closeP1, closeP2),
        p1Score: closeP1,
        p2Score: closeP2,
        avgScore: closeAvg,
        ...getStatus(closeAvg),
        description: 'Эмоциональный резонанс, глубокий контакт, взаимное знание внутреннего мира друг друга.',
        insight: closeAvg === 0
          ? 'Пройдите тест «5 языков любви», чтобы раскрыть глубокий эмоциональный резонанс и потребности партнёра.'
          : `Индекс эмоциональной связи составляет ${closeAvg}%. Микро-проявления нежности поддерживают высокий тонус.`,
        gottmanTip: 'Правило 6 секунд: долгий осознанный поцелуй при встрече запускает выработку окситоцина.',
        relatedTestTitle: 'Пять языков любви',
        relatedTestId: 'TEST-S2',
      },
      {
        key: 'communication',
        name: 'Коммуникация',
        shortName: 'Коммуникация',
        icon: MessageCircle,
        color: '#0ea5e9', // Sky blue
        ...computeSteps(commP1, commP2),
        p1Score: commP1,
        p2Score: commP2,
        avgScore: commAvg,
        ...getStatus(commAvg),
        description: 'Способность обсуждать сложные темы, экологично выражать потребности и решать разногласия без критики.',
        insight: commAvg === 0
          ? 'Пройдите тест «Анатомия конфликтов», чтобы исследовать сценарии разрешения споров и мягкий старт.'
          : `Конструктивность диалога оценивается в ${commAvg}%. Вы избегаете токсичных паттернов и умеете восстанавливать контакт.`,
        gottmanTip: 'Используйте мягкий старт: заменяйте «Ты опять забыл» на «Мне важно, чтобы мы вовремя...».',
        relatedTestTitle: 'Стили прохождения конфликтов',
        relatedTestId: 'TEST-S3',
      },
      {
        key: 'sex',
        name: 'Секс',
        shortName: 'Секс',
        icon: Flame,
        color: '#f59e0b', // Amber / Flame
        ...computeSteps(sexP1, sexP2),
        p1Score: sexP1,
        p2Score: sexP2,
        avgScore: sexAvg,
        ...getStatus(sexAvg),
        description: 'Чувственная и физическая гармония, открытость в выражении желаний, романтическая искра.',
        insight: sexAvg === 0
          ? 'Пройдите тест «Эротический интеллект & Желания», чтобы узнать совпадение темпераментов и желаний.'
          : `Оценка чувственной сферы — ${sexAvg}%. Готовность открыто говорить о желаниях и романтический интерес.`,
        gottmanTip: 'Планируйте свидания заранее: спонтанность в долгих отношениях часто рождается из заботливой подготовки.',
        relatedTestTitle: 'Эротический интеллект',
        relatedTestId: 'TEST-S4',
      },
      {
        key: 'routine',
        name: 'Быт',
        shortName: 'Быт',
        icon: Home,
        color: '#10b981', // Emerald
        ...computeSteps(routineP1, routineP2),
        p1Score: routineP1,
        p2Score: routineP2,
        avgScore: routineAvg,
        ...getStatus(routineAvg),
        description: 'Распределение обязанностей, финансовая слаженность, комфортный ритм повседневной жизни.',
        insight: routineAvg === 0
          ? 'Пройдите тест «Быт, бюджет & Баланс ролей», чтобы синхронизировать бытовые ожидания и финансы.'
          : `Синхронизация быта — ${routineAvg}%. Справедливое деление домашних задач и взаимное уважение.`,
        gottmanTip: 'Еженедельный 10-минутный синк по бытовым планам на выходные снимает до 80% скрытого раздражения.',
        relatedTestTitle: 'Совместный быт и финансы',
        relatedTestId: 'TEST-C1',
      },
    ];

    return list;
  }, [coupleProfile, pulseHistory, tests, challenges, smallCravings, moodHistory, dateInvites, p1Label, p2Label]);

  // Recharts radar format
  const chartData = useMemo(() => {
    return metricsData.map((m) => ({
      metric: m.name,
      shortMetric: m.shortName,
      partner1: m.p1Score,
      partner2: m.p2Score,
      average: m.avgScore,
      fullMark: 100,
    }));
  }, [metricsData]);

  // Overall relationship harmony score
  const hasAnyData = useMemo(() => {
    return metricsData.some((m) => m.avgScore > 0);
  }, [metricsData]);

  const overallScore = useMemo(() => {
    const total = metricsData.reduce((acc, m) => acc + m.avgScore, 0);
    return Math.round(total / metricsData.length);
  }, [metricsData]);

  const selectedMetric = useMemo(() => {
    if (!selectedMetricKey) return null;
    return metricsData.find((m) => m.key === selectedMetricKey) || null;
  }, [selectedMetricKey, metricsData]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--surface)] text-[var(--text)] p-3 rounded-xl border border-[var(--divider)] shadow-lg text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-extrabold text-sm border-b border-[var(--divider)] pb-1 flex items-center justify-between gap-4">
            <span>{data.metric}</span>
            <span className="text-[var(--accent)] font-mono">
              {data.average > 0 ? `${data.average}% ср.` : 'Не пройден'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[var(--accent-blue)] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
              {p1Label}:
            </span>
            <span className="font-mono">{data.partner1 > 0 ? `${data.partner1}%` : '—'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[var(--accent)] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              {p2Label}:
            </span>
            <span className="font-mono">{data.partner2 > 0 ? `${data.partner2}%` : '—'}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="relationship-radar-card"
      className={`app-card text-[var(--text)] transition-all relative overflow-hidden ${
        compact ? 'p-4' : 'p-4 sm:p-5'
      } ${className}`}
    >
      <div className="absolute top-0 right-0 w-36 h-36 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--divider)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center shadow-2xs border border-[var(--accent)]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text)]">
              Радар отношений
            </h3>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20 shadow-2xs">
              5 осей
            </span>
          </div>
          <p className="text-xs text-[var(--text-2)] mt-0.5">
            Динамический баланс: доверие, близость, коммуникация, секс и быт
          </p>
        </div>

        {/* Global Harmony Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--surface-2)] px-3.5 py-1.5 rounded-2xl border border-[var(--divider)] shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] font-bold text-[var(--text-2)] block uppercase tracking-wider">
              Индекс гармонии
            </span>
            <span className="text-sm font-extrabold text-[var(--text)]">
              {hasAnyData ? `${overallScore}%` : '0%'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-extrabold text-xs shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Empty State Banner if no tests/pulses completed */}
      {!hasAnyData && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent-2)]/10 to-[var(--accent-blue)]/10 border border-[var(--accent)]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center font-black text-lg shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text)]">
                Радар ещё не заполнен
              </h4>
              <p className="text-[11px] text-[var(--text-2)] leading-tight mt-0.5">
                Пройдите тесты и отмечайте пульс отношений, чтобы построить точную карту гармонии
              </p>
            </div>
          </div>
          {onStartTest && (
            <button
              onClick={() => onStartTest('TEST-S1')}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Пройти первый тест</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Interactive Mode Switcher & Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--divider)] text-xs font-bold gap-1">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'both'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Оба партнёра
          </button>
          <button
            onClick={() => setViewMode('average')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'average'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Баланс пары
          </button>
          <button
            onClick={() => setViewMode('partner1')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'partner1'
                ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {p1Label}
          </button>
          <button
            onClick={() => setViewMode('partner2')}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === 'partner2'
                ? 'bg-[var(--accent)] text-white shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            {p2Label}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
          {(viewMode === 'both' || viewMode === 'partner1') && (
            <span className="flex items-center gap-1.5 text-[var(--accent-blue)] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)]" />
              {p1Label}
            </span>
          )}
          {(viewMode === 'both' || viewMode === 'partner2') && (
            <span className="flex items-center gap-1.5 text-[var(--accent)] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              {p2Label}
            </span>
          )}
          {viewMode === 'average' && (
            <span className="flex items-center gap-1.5 text-[var(--accent)] font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
              Среднее значение пары
            </span>
          )}
        </div>
      </div>

      {/* 3. Recharts Radar Visualization */}
      <div className="mt-3 flex flex-col items-center justify-center">
        <div className="w-full h-72 sm:h-80 -my-2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="var(--divider)" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{
                  fill: 'var(--text)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{
                  fill: 'var(--text-2)',
                  fontSize: 9,
                }}
                stroke="var(--divider)"
              />

              {/* Partner 1 Radar */}
              {(viewMode === 'both' || viewMode === 'partner1') && (
                <Radar
                  name={p1Label}
                  dataKey="partner1"
                  stroke="#007AFF"
                  strokeWidth={2.5}
                  fill="#007AFF"
                  fillOpacity={viewMode === 'partner1' ? 0.45 : 0.25}
                  isAnimationActive={true}
                />
              )}

              {/* Partner 2 Radar */}
              {(viewMode === 'both' || viewMode === 'partner2') && (
                <Radar
                  name={p2Label}
                  dataKey="partner2"
                  stroke="#FF3B30"
                  strokeWidth={2.5}
                  fill="#FF3B30"
                  fillOpacity={viewMode === 'partner2' ? 0.45 : 0.25}
                  isAnimationActive={true}
                />
              )}

              {/* Average Pair Radar */}
              {viewMode === 'average' && (
                <Radar
                  name="Баланс пары"
                  dataKey="average"
                  stroke="var(--accent)"
                  strokeWidth={3}
                  fill="var(--accent)"
                  fillOpacity={0.35}
                  isAnimationActive={true}
                />
              )}

              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[11px] text-[var(--text-2)] text-center max-w-sm mt-1 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
          <span>Наведите курсор на вершины радара или нажмите на карточку метрики для подробного разбора</span>
        </p>
      </div>

      {/* 4. The 5 Key Metric Detail Cards */}
      <div className="mt-6 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-2)]">
            5 ключевых метрик союза
          </h4>
          <span className="text-[11px] text-[var(--text-2)] font-medium">
            Нажмите для разбора
          </span>
        </div>

        <div className="space-y-3">
          {metricsData.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMetricKey === m.key;

            return (
              <div
                key={m.key}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isSelected
                    ? 'bg-[var(--surface-2)] border-[var(--accent)] ring-2 ring-[var(--accent)]/20 shadow-sm'
                    : 'bg-[var(--surface)] border-[var(--divider)] hover:border-[var(--divider)]'
                }`}
              >
                {/* Clickable Card Header */}
                <div
                  onClick={() => setSelectedMetricKey(isSelected ? null : m.key)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${m.color}20`, color: m.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[var(--text)]">
                          {m.name}
                        </h4>
                        <span className="text-[10px] text-[var(--text-2)]">
                          {m.relatedTestTitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold font-mono text-[var(--text)]">
                        {m.avgScore > 0 ? `${m.avgScore}%` : '0%'}
                      </span>
                    </div>
                  </div>

                  {/* Bridge of 20 Steps Metaphor */}
                  <div className="space-y-2 my-3">
                    <div className="flex items-end justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] relative">
                      <div className="flex flex-col items-start min-w-0 max-w-[35%]">
                        <span className="text-[var(--accent-blue)] truncate w-full" title={p1Label}>{p1Label}</span>
                        <span className="text-[var(--accent-blue)]">{m.p1Steps}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-end px-1 shrink-0 absolute left-1/2 -translate-x-1/2 bottom-0">
                        {m.gapSteps === 0 ? (
                          <span className="text-emerald-500 font-extrabold px-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-2xs whitespace-nowrap">Встретились!</span>
                        ) : (
                          <span className="text-[var(--text-2)] whitespace-nowrap">{m.gapSteps} {m.gapSteps === 1 ? 'шаг' : (m.gapSteps >= 2 && m.gapSteps <= 4 ? 'шага' : 'шагов')} разрыв</span>
                        )}
                      </div>

                      <div className="flex flex-col items-end min-w-0 max-w-[35%] text-right">
                        <span className="text-[var(--accent)] truncate w-full" title={p2Label}>{p2Label}</span>
                        <span className="text-[var(--accent)]">{m.p2Steps}</span>
                      </div>
                    </div>
                    
                    <div className="w-full flex items-center justify-between gap-[2px] h-3.5 p-0.5 rounded-full overflow-hidden bg-[var(--surface-2)] border border-[var(--divider)] shadow-inner">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const isP1 = i < m.p1Steps;
                        const isP2 = i >= 20 - m.p2Steps;
                        
                        let bgColor = 'bg-transparent';
                        if (isP1) bgColor = 'bg-[var(--accent-blue)] shadow-[0_0_8px_rgba(59,130,246,0.6)] rounded-sm';
                        else if (isP2) bgColor = 'bg-[var(--accent)] shadow-[0_0_8px_rgba(239,68,68,0.6)] rounded-sm';

                        return (
                          <div 
                            key={i} 
                            className={`flex-1 h-full transition-all duration-700 ${bgColor}`} 
                          />
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-2)] leading-relaxed">
                    {m.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[var(--divider)] flex items-center justify-between text-[11px] font-bold">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg ${
                        m.avgScore === 0
                          ? 'bg-[var(--surface)] text-[var(--text-2)] border border-[var(--divider)]'
                          : m.status === 'excellent'
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : m.status === 'good'
                          ? 'bg-blue-500/15 text-blue-600'
                          : 'bg-amber-500/15 text-amber-600'
                      }`}
                    >
                      {m.statusLabel}
                    </span>
                    <span className="text-[var(--accent)] flex items-center gap-1">
                      <span>{isSelected ? 'Свернуть' : 'Подробнее'}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                    </span>
                  </div>
                </div>

                {/* Inline Accordion Details Section — opens strictly under this card */}
                {isSelected && (
                  <div className="px-4 pb-4 pt-2 border-t border-[var(--divider)] bg-[var(--surface)]/70 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--accent)] font-bold text-xs">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Психологический статус пары</span>
                        </div>
                        <p className="text-[var(--text-2)] leading-relaxed text-[11px]">
                          {m.insight}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Практика Готтмана для укрепления</span>
                        </div>
                        <p className="text-[var(--text-2)] leading-relaxed text-[11px]">
                          {m.gottmanTip}
                        </p>
                      </div>
                    </div>

                    {onStartTest && (
                      <div className="pt-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMetricKey(null);
                          }}
                          className="text-[11px] text-[var(--text-2)] hover:text-[var(--text)] font-semibold"
                        >
                          Свернуть разбор
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onStartTest) onStartTest(m.relatedTestId);
                          }}
                          className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          <span>Пройти тест «{m.relatedTestTitle}»</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
