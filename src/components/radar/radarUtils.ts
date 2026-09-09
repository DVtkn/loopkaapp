import React from 'react';
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Flame,
  Home,
} from 'lucide-react';
import { CoupleProfile, PulseEntry, MoodHistoryItem, TestCategory, Challenge, SmallCraving, DateInvite, LoveTap, DailyCoupleQuiz } from '../../types.ts';

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

export interface RadarCalculationInput {
  coupleProfile: CoupleProfile;
  pulseHistory: PulseEntry[];
  tests: TestCategory[];
  challenges: Challenge[];
  smallCravings: SmallCraving[];
  moodHistory: MoodHistoryItem[];
  dateInvites?: DateInvite[];
  loveTaps?: LoveTap[];
  dailyQuiz?: DailyCoupleQuiz | null;
}

export function calculateRadarMetrics({
  coupleProfile,
  pulseHistory,
  tests,
  challenges,
  smallCravings,
  moodHistory,
  dateInvites,
  loveTaps,
  dailyQuiz,
}: RadarCalculationInput): MetricDetail[] {
  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;

  const test1 = tests.find((t) => t.id === 'TEST-S1' || t.slug === 'attachment-style');
  const test2 = tests.find((t) => t.id === 'TEST-S2' || t.slug === 'love-languages');
  const test3 = tests.find((t) => t.id === 'TEST-S3' || t.slug === 'gottman-four-horsemen');
  const test4 = tests.find((t) => t.id === 'TEST-C1' || t.slug === 'ideal-day');
  const test5 = tests.find((t) => t.id === 'TEST-S4' || t.slug === 'intimacy-passion');
  const test6 = tests.find((t) => t.id === 'TEST-D1' || t.slug === 'family-scripts');

  const p1Pulses = pulseHistory.filter((p) => p.author === 'partner1');
  const p2Pulses = pulseHistory.filter((p) => p.author === 'partner2');
  const avgPulseClosenessP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.closeness, 0) / p1Pulses.length) * 10 : 0;
  const avgPulseClosenessP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.closeness, 0) / p2Pulses.length) * 10 : 0;
  const avgPulseConstructP1 = p1Pulses.length ? (p1Pulses.reduce((s, p) => s + p.constructiveness, 0) / p1Pulses.length) * 10 : 0;
  const avgPulseConstructP2 = p2Pulses.length ? (p2Pulses.reduce((s, p) => s + p.constructiveness, 0) / p2Pulses.length) * 10 : 0;

  const commChallenges = challenges.filter((c) => c.category === 'communication' || c.category === 'gottman');
  const intimacyChallenges = challenges.filter((c) => c.category === 'intimacy');
  const funChallenges = challenges.filter((c) => c.category === 'fun' || c.category === 'adventure');

  const p1Moods = moodHistory.filter((m) => m.partnerId === 'partner1');
  const p2Moods = moodHistory.filter((m) => m.partnerId === 'partner2');
  const avgMoodP1 = p1Moods.length ? (p1Moods.reduce((s, m) => s + m.score, 0) / p1Moods.length) * 10 : 0;
  const avgMoodP2 = p2Moods.length ? (p2Moods.reduce((s, m) => s + m.score, 0) / p2Moods.length) * 10 : 0;

  const fulfilledCravings = smallCravings.filter((c) => c.fulfilled);
  const p1FulfilledCravings = fulfilledCravings.filter((c) => c.forPartner === 'partner1').length;
  const p2FulfilledCravings = fulfilledCravings.filter((c) => c.forPartner === 'partner2').length;

  const p1TapsSent = loveTaps?.filter((t) => t.senderLogin === p1.login).length || 0;
  const p2TapsSent = loveTaps?.filter((t) => t.senderLogin === p2.login).length || 0;
  const p1DatesInitiated = dateInvites?.filter((d) => d.senderId === 'partner1').length || 0;
  const p2DatesInitiated = dateInvites?.filter((d) => d.senderId === 'partner2').length || 0;
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
    pulses.forEach((p) => {
      if (p.constructiveness >= 6) positive++;
      if (p.closeness >= 6) positive++;
      if (p.constructiveness <= 4) negative++;
      if (p.closeness <= 4) negative++;
    });
    moods.forEach((m) => {
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
  const hasCommDataP1 = !!(test3?.partner1Done || p1Pulses.length > 0 || commChallenges.some((c) => c.partner1Completed));
  const hasCommDataP2 = !!(test3?.partner2Done || p2Pulses.length > 0 || commChallenges.some((c) => c.partner2Completed));
  if (hasCommDataP1) {
    if (test3?.partner1Done) commP1 += 50;
    if (p1Pulses.length > 0) commP1 += Math.round(avgPulseConstructP1 * 0.20);
    if (commChallenges.some((c) => c.partner1Completed)) commP1 += 15;
    commP1 += gottmanP1;
    commP1 = Math.min(100, Math.max(20, commP1));
  }
  if (hasCommDataP2) {
    if (test3?.partner2Done) commP2 += 50;
    if (p2Pulses.length > 0) commP2 += Math.round(avgPulseConstructP2 * 0.20);
    if (commChallenges.some((c) => c.partner2Completed)) commP2 += 15;
    commP2 += gottmanP2;
    commP2 = Math.min(100, Math.max(20, commP2));
  }

  let sexP1 = 0, sexP2 = 0;
  const hasSexDataP1 = !!(test5?.partner1Done || datesARE.p1 > 0 || intimacyChallenges.some((c) => c.partner1Completed));
  const hasSexDataP2 = !!(test5?.partner2Done || datesARE.p2 > 0 || intimacyChallenges.some((c) => c.partner2Completed));
  if (hasSexDataP1) {
    if (test5?.partner1Done) sexP1 += 50;
    sexP1 += datesARE.p1;
    if (intimacyChallenges.some((c) => c.partner1Completed)) sexP1 += 15;
    sexP1 += Math.round(avgMoodP1 * 0.1);
    sexP1 = Math.min(100, Math.max(20, sexP1));
  }
  if (hasSexDataP2) {
    if (test5?.partner2Done) sexP2 += 50;
    sexP2 += datesARE.p2;
    if (intimacyChallenges.some((c) => c.partner2Completed)) sexP2 += 15;
    sexP2 += Math.round(avgMoodP2 * 0.1);
    sexP2 = Math.min(100, Math.max(20, sexP2));
  }

  let routineP1 = 0, routineP2 = 0;
  const hasRoutineDataP1 = !!(test6?.partner1Done || p2FulfilledCravings > 0);
  const hasRoutineDataP2 = !!(test6?.partner2Done || p1FulfilledCravings > 0);
  if (hasRoutineDataP1) {
    if (test6?.partner1Done) routineP1 += 60;
    if (p2FulfilledCravings > 0) routineP1 += Math.min(20, p2FulfilledCravings * 7);
    if (funChallenges.some((c) => c.partner1Completed)) routineP1 += 10;
    routineP1 = Math.min(100, Math.max(20, routineP1));
  }
  if (hasRoutineDataP2) {
    if (test6?.partner2Done) routineP2 += 60;
    if (p1FulfilledCravings > 0) routineP2 += Math.min(20, p1FulfilledCravings * 7);
    if (funChallenges.some((c) => c.partner2Completed)) routineP2 += 10;
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

  return [
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
      insight:
        trustAvg === 0
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
      insight:
        closeAvg === 0
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
      insight:
        commAvg === 0
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
      insight:
        sexAvg === 0
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
      insight:
        routineAvg === 0
          ? 'Пройдите тест «Идеальный совместный день», чтобы синхронизировать биоритмы и отдых.'
          : `Синхронизация быта и ценностей — ${routineAvg}%. Справедливый баланс и взаимное уважение.`,
      gottmanTip: 'Короткое 5-минутное обсуждение планов на выходные снимает большинство скрытых стрессов.',
      relatedTestTitle: 'Идеальный день',
      relatedTestId: 'TEST-C1',
    },
  ];
}
