import { SPHERE_TO_TESTS_MAP } from '../../utils/sphereMapping.ts';
import React from 'react';
import {
  ShieldCheck,
  Heart,
  MessageCircle,
  Compass,
  Flame,
  Home,
} from 'lucide-react';
import { CoupleProfile, PulseEntry, MoodHistoryItem, TestCategory, Challenge, SmallCraving, DateInvite, LoveTap, DailyCoupleQuiz, PsychProfile24Scales } from '../../types.ts';

export interface MetricDetail {
  key: 'trust' | 'closeness' | 'communication' | 'values' | 'intimacy' | 'lifestyle';
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
  isCompletedByMe?: boolean;
  isCompletedByPartner?: boolean;
}

export interface VectorScaleInfo {
  id: keyof PsychProfile24Scales;
  name: string;
  vectorKey: string;
  vectorName: string;
  description: string;
}

export const PSYCH_24_SCALES_CONFIG: VectorScaleInfo[] = [
  // Вектор 1: Доверие и безопасность
  { id: 's1', vectorKey: 'v1', vectorName: '1. Доверие и безопасность', name: 'Тревожность привязанности (ECR)', description: 'Чувствительность к эмоциональной дистанции и страх отвержения' },
  { id: 's2', vectorKey: 'v1', vectorName: '1. Доверие и безопасность', name: 'Избегание близости (ECR)', description: 'Стремление сохранять дистанцию при угрозе уязвимости' },
  { id: 's3', vectorKey: 'v1', vectorName: '1. Доверие и безопасность', name: 'Базовая настороженность', description: 'Степень изначального доверия и ожидания подвоха' },
  { id: 's4', vectorKey: 'v1', vectorName: '1. Доверие и безопасность', name: 'Допуск к уязвимости', description: 'Готовность открывать сокровенные переживания без масок' },

  // Вектор 2: Эмоциональная близость
  { id: 's5', vectorKey: 'v2', vectorName: '2. Эмоциональная близость', name: 'Канал заботы: Слова и признание', description: 'Чувствительность к вербальной поддержке и похвале' },
  { id: 's6', vectorKey: 'v2', vectorName: '2. Эмоциональная близость', name: 'Канал заботы: Качественное время', description: 'Ценность безраздельного внимания и совместного фокуса' },
  { id: 's7', vectorKey: 'v2', vectorName: '2. Эмоциональная близость', name: 'Канал заботы: Помощь и дела', description: 'Снятие бытового груза и практическая забота в действиях' },
  { id: 's8', vectorKey: 'v2', vectorName: '2. Эмоциональная близость', name: 'Канал заботы: Физический контакт', description: 'Тактильная нежность, объятия и телесная теплота' },

  // Вектор 3: Конфликтная динамика
  { id: 's9', vectorKey: 'v3', vectorName: '3. Конфликтная динамика', name: 'Склонность к преследованию', description: 'Желание немедленно выяснить отношения при стрессе' },
  { id: 's10', vectorKey: 'v3', vectorName: '3. Конфликтная динамика', name: 'Склонность к отстранению (пауза)', description: 'Потребность закрыться или уйти в тишину для остывания' },
  { id: 's11', vectorKey: 'v3', vectorName: '3. Конфликтная динамика', name: 'Реактивная критика / сарказм', description: 'Импульсивная защита через упрёки или сарказм' },
  { id: 's12', vectorKey: 'v3', vectorName: '3. Конфликтная динамика', name: 'Скорость остывания & Мягкий старт', description: 'Умение экологично снижать градус напряжения' },

  // Вектор 4: Ценности и горизонт
  { id: 's13', vectorKey: 'v4', vectorName: '4. Ценности и горизонт', name: 'Баланс Автономия vs Слияние', description: 'Индивидуальная потребность в личном пространстве' },
  { id: 's14', vectorKey: 'v4', vectorName: '4. Ценности и горизонт', name: 'Материальные амбиции vs Комфорт', description: 'Отношение к карьерным вызовам и уровню потребления' },
  { id: 's15', vectorKey: 'v4', vectorName: '4. Ценности и горизонт', name: 'Семейные ценности и дети', description: 'Взгляд на воспитание, родительство и приоритет союза' },
  { id: 's16', vectorKey: 'v4', vectorName: '4. Ценности и горизонт', name: 'Роль традиций и внешней семьи', description: 'Границы пары с родственниками и важность ритуалов' },

  // Вектор 5: Интимность и страсть
  { id: 's17', vectorKey: 'v5', vectorName: '5. Интимность и страсть', name: 'Эмоциональный триггер страсти', description: 'Связь романтического влечения с душевной безопасностью' },
  { id: 's18', vectorKey: 'v5', vectorName: '5. Интимность и страсть', name: 'Спонтанность vs Предсказуемость', description: 'Тяга к новизне и экспериментам в близости' },
  { id: 's19', vectorKey: 'v5', vectorName: '5. Интимность и страсть', name: 'Инициативность в контакте', description: 'Смелость первым(ой) проявлять романтическое желание' },
  { id: 's20', vectorKey: 'v5', vectorName: '5. Интимность и страсть', name: 'Открытость фантазий и желаний', description: 'Свобода говорить о сокровенном без стеснения' },

  // Вектор 6: Быт и жизнестойкость
  { id: 's21', vectorKey: 'v6', vectorName: '6. Быт и жизнестойкость', name: 'Контроль и порядок в быту', description: 'Требовательность к организации пространства и чистоте' },
  { id: 's22', vectorKey: 'v6', vectorName: '6. Быт и жизнестойкость', name: 'Финансовая прозрачность & Бюджет', description: 'Отношение к общему кошельку и согласованию трат' },
  { id: 's23', vectorKey: 'v6', vectorName: '6. Быт и жизнестойкость', name: 'Социальная батарейка', description: 'Экстраверсия / Интроверсия и потребность в гостях' },
  { id: 's24', vectorKey: 'v6', vectorName: '6. Быт и жизнестойкость', name: 'Жизнестойкость в кризисах', description: 'Сплочённость и адаптивность при внешних трудностях' },
];

export function getStatusLabel(score: number): string {
  if (score <= 0) return 'Калибровка';
  if (score >= 75) return 'Синхронный резонанс';
  if (score >= 50) return 'Зона синергии';
  return 'Точка рассинхрона';
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

  
  const test1 = tests.find((t) => SPHERE_TO_TESTS_MAP.trust.includes(t.id) || SPHERE_TO_TESTS_MAP.trust.includes(t.slug || ''));
  const test2 = tests.find((t) => SPHERE_TO_TESTS_MAP.closeness.includes(t.id) || SPHERE_TO_TESTS_MAP.closeness.includes(t.slug || ''));
  const test3 = tests.find((t) => SPHERE_TO_TESTS_MAP.communication.includes(t.id) || SPHERE_TO_TESTS_MAP.communication.includes(t.slug || ''));
  const test4 = tests.find((t) => SPHERE_TO_TESTS_MAP.values.includes(t.id) || SPHERE_TO_TESTS_MAP.values.includes(t.slug || ''));
  const test5 = tests.find((t) => SPHERE_TO_TESTS_MAP.intimacy.includes(t.id) || SPHERE_TO_TESTS_MAP.intimacy.includes(t.slug || ''));
  const test6 = tests.find((t) => SPHERE_TO_TESTS_MAP.lifestyle.includes(t.id) || SPHERE_TO_TESTS_MAP.lifestyle.includes(t.slug || ''));

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
    return Math.min(20, ratio * 4);
  };
  const gottmanP1 = calculateGottmanBalance(p1Pulses, p1Moods);
  const gottmanP2 = calculateGottmanBalance(p2Pulses, p2Moods);

  // 1. Доверие и безопасность
  let trustP1 = 0, trustP2 = 0;
  const hasTrustP1 = !!(test1?.partner1Done || p1Pulses.length > 0);
  const hasTrustP2 = !!(test1?.partner2Done || p2Pulses.length > 0);
  if (hasTrustP1) {
    if (test1?.partner1Done) trustP1 += 55;
    if (quizMatches > 0) trustP1 += 5;
    if (p1Pulses.length > 0) trustP1 += Math.round(avgPulseConstructP1 * 0.15);
    trustP1 += gottmanP1;
    trustP1 = Math.min(100, Math.max(20, trustP1));
  }
  if (hasTrustP2) {
    if (test1?.partner2Done) trustP2 += 55;
    if (quizMatches > 0) trustP2 += 5;
    if (p2Pulses.length > 0) trustP2 += Math.round(avgPulseConstructP2 * 0.15);
    trustP2 += gottmanP2;
    trustP2 = Math.min(100, Math.max(20, trustP2));
  }

  // 2. Эмоциональная близость
  let closeP1 = 0, closeP2 = 0;
  const hasCloseP1 = !!(test2?.partner1Done || p1Pulses.length > 0 || p1FulfilledCravings > 0 || p1TapsSent > 0);
  const hasCloseP2 = !!(test2?.partner2Done || p2Pulses.length > 0 || p2FulfilledCravings > 0 || p2TapsSent > 0);
  if (hasCloseP1) {
    if (test2?.partner1Done) closeP1 += 50;
    if (p1Pulses.length > 0) closeP1 += Math.round(avgPulseClosenessP1 * 0.20);
    closeP1 += Math.min(15, p2FulfilledCravings * 5);
    closeP1 += tapsARE.p1;
    closeP1 = Math.min(100, Math.max(20, closeP1));
  }
  if (hasCloseP2) {
    if (test2?.partner2Done) closeP2 += 50;
    if (p2Pulses.length > 0) closeP2 += Math.round(avgPulseClosenessP2 * 0.20);
    closeP2 += Math.min(15, p1FulfilledCravings * 5);
    closeP2 += tapsARE.p2;
    closeP2 = Math.min(100, Math.max(20, closeP2));
  }

  // 3. Конфликтная динамика & Диалог
  let commP1 = 0, commP2 = 0;
  const hasCommP1 = !!(test3?.partner1Done || p1Pulses.length > 0 || commChallenges.some((c) => c.partner1Completed));
  const hasCommP2 = !!(test3?.partner2Done || p2Pulses.length > 0 || commChallenges.some((c) => c.partner2Completed));
  if (hasCommP1) {
    if (test3?.partner1Done) commP1 += 50;
    if (p1Pulses.length > 0) commP1 += Math.round(avgPulseConstructP1 * 0.20);
    if (commChallenges.some((c) => c.partner1Completed)) commP1 += 15;
    commP1 += gottmanP1;
    commP1 = Math.min(100, Math.max(20, commP1));
  }
  if (hasCommP2) {
    if (test3?.partner2Done) commP2 += 50;
    if (p2Pulses.length > 0) commP2 += Math.round(avgPulseConstructP2 * 0.20);
    if (commChallenges.some((c) => c.partner2Completed)) commP2 += 15;
    commP2 += gottmanP2;
    commP2 = Math.min(100, Math.max(20, commP2));
  }

  // 4. Ценности и горизонт
  let valP1 = 0, valP2 = 0;
  const hasValP1 = !!(test4?.partner1Done || test6?.partner1Done);
  const hasValP2 = !!(test4?.partner2Done || test6?.partner2Done);
  if (hasValP1) {
    if (test4?.partner1Done) valP1 += 45;
    if (test6?.partner1Done) valP1 += 35;
    valP1 += Math.round(avgMoodP1 * 0.1);
    valP1 = Math.min(100, Math.max(20, valP1));
  }
  if (hasValP2) {
    if (test4?.partner2Done) valP2 += 45;
    if (test6?.partner2Done) valP2 += 35;
    valP2 += Math.round(avgMoodP2 * 0.1);
    valP2 = Math.min(100, Math.max(20, valP2));
  }

  // 5. Интимность и страсть
  let sexP1 = 0, sexP2 = 0;
  const hasSexP1 = !!(test5?.partner1Done || datesARE.p1 > 0 || intimacyChallenges.some((c) => c.partner1Completed));
  const hasSexP2 = !!(test5?.partner2Done || datesARE.p2 > 0 || intimacyChallenges.some((c) => c.partner2Completed));
  if (hasSexP1) {
    if (test5?.partner1Done) sexP1 += 50;
    sexP1 += datesARE.p1;
    if (intimacyChallenges.some((c) => c.partner1Completed)) sexP1 += 15;
    sexP1 += Math.round(avgMoodP1 * 0.1);
    sexP1 = Math.min(100, Math.max(20, sexP1));
  }
  if (hasSexP2) {
    if (test5?.partner2Done) sexP2 += 50;
    sexP2 += datesARE.p2;
    if (intimacyChallenges.some((c) => c.partner2Completed)) sexP2 += 15;
    sexP2 += Math.round(avgMoodP2 * 0.1);
    sexP2 = Math.min(100, Math.max(20, sexP2));
  }

  // 6. Быт и жизнестойкость
  let lifeP1 = 0, lifeP2 = 0;
  const hasLifeP1 = !!(test6?.partner1Done || p2FulfilledCravings > 0 || funChallenges.some((c) => c.partner1Completed));
  const hasLifeP2 = !!(test6?.partner2Done || p1FulfilledCravings > 0 || funChallenges.some((c) => c.partner2Completed));
  if (hasLifeP1) {
    if (test6?.partner1Done) lifeP1 += 50;
    if (p2FulfilledCravings > 0) lifeP1 += Math.min(20, p2FulfilledCravings * 6);
    if (funChallenges.some((c) => c.partner1Completed)) lifeP1 += 15;
    lifeP1 = Math.min(100, Math.max(20, lifeP1));
  }
  if (hasLifeP2) {
    if (test6?.partner2Done) lifeP2 += 50;
    if (p1FulfilledCravings > 0) lifeP2 += Math.min(20, p1FulfilledCravings * 6);
    if (funChallenges.some((c) => c.partner2Completed)) lifeP2 += 15;
    lifeP2 = Math.min(100, Math.max(20, lifeP2));
  }

  const calcAvg = (score1: number, score2: number): number => {
    if (score1 > 0 && score2 > 0) return Math.round((score1 + score2) / 2);
    return 0;
  };

  const trustAvg = calcAvg(trustP1, trustP2);
  const closeAvg = calcAvg(closeP1, closeP2);
  const commAvg = calcAvg(commP1, commP2);
  const valAvg = calcAvg(valP1, valP2);
  const sexAvg = calcAvg(sexP1, sexP2);
  const lifeAvg = calcAvg(lifeP1, lifeP2);

  return [
    {
      key: 'trust',
      name: 'Доверие и безопасность',
      shortName: 'Доверие',
      icon: ShieldCheck,
      color: 'var(--accent)',
      p1Score: trustP1,
      p2Score: trustP2,
      avgScore: trustAvg,
      statusLabel: getStatusLabel(trustAvg),
      description: 'Ощущение эмоциональной защищённости, надёжности и готовности открываться друг другу без страха осуждения.',
      insight:
        trustAvg === 0
          ? 'Пройдите исследование «Стили привязанности», чтобы исследовать глубинные паттерны безопасности.'
          : `Уровень доверия оценивается в ${trustAvg}%. Вы создаёте надёжную гавань друг для друга.`,
      gottmanTip: 'Маленькие обещания, сдержанные вовремя, строят фундамент надёжности прочнее любых слов.',
      relatedTestTitle: 'Стили привязанности',
      relatedTestId: 'TEST-S1',
    },
    {
      key: 'closeness',
      name: 'Эмоциональная близость',
      shortName: 'Близость',
      icon: Heart,
      color: 'var(--accent)',
      p1Score: closeP1,
      p2Score: closeP2,
      avgScore: closeAvg,
      statusLabel: getStatusLabel(closeAvg),
      description: 'Теплота, взаимное сопереживание, знание и отклик на ведущие языки заботы партнёра.',
      insight:
        closeAvg === 0
          ? 'Пройдите исследование «Пять языков любви», чтобы точно знать, как партнёр ощущает заботу.'
          : `Эмоциональная близость союза — ${closeAvg}%. Вы тонко чувствуете настроение друг друга.`,
      gottmanTip: 'Ежедневно замечайте минимум 3 попытки партнёра установить контакт и бережно откликайтесь на них.',
      relatedTestTitle: 'Пять языков любви',
      relatedTestId: 'TEST-S2',
    },
    {
      key: 'communication',
      name: 'Осознанный диалог & Конфликты',
      shortName: 'Диалог',
      icon: MessageCircle,
      color: 'var(--accent)',
      p1Score: commP1,
      p2Score: commP2,
      avgScore: commAvg,
      statusLabel: getStatusLabel(commAvg),
      description: 'Способность экологично обсуждать разногласия, применять «мягкий старт» и избегать деструктивных эскалаций.',
      insight:
        commAvg === 0
          ? 'Пройдите тест «Четыре всадника Готтмана», чтобы сохранять бережное взаимопонимание при разногласиях.'
          : `Конструктивность диалога оценивается в ${commAvg}%. Вы избегаете деструктивных ловушек.`,
      gottmanTip: 'Используйте правило «Я-сообщений»: говорите о своём чувстве вместо критики поступков партнёра.',
      relatedTestTitle: 'Четыре всадника Готтмана',
      relatedTestId: 'TEST-S3',
    },
    {
      key: 'values',
      name: 'Ценности и горизонт',
      shortName: 'Ценности',
      icon: Compass,
      color: 'var(--accent)',
      p1Score: valP1,
      p2Score: valP2,
      avgScore: valAvg,
      statusLabel: getStatusLabel(valAvg),
      description: 'Согласованность жизненных ориентиров, баланс автономии и совместности, взгляд на семью и будущее.',
      insight:
        valAvg === 0
          ? 'Пройдите тест «Идеальный совместный день», чтобы синхронизировать совместные планы и ритм.'
          : `Созвучие ценностей союза — ${valAvg}%. Вы смотрите в одну сторону.`,
      gottmanTip: 'Регулярно сверяйте «Карту общих смыслов»: какие традиции и цели объединяют вашу пару.',
      relatedTestTitle: 'Идеальный день',
      relatedTestId: 'TEST-C1',
    },
    {
      key: 'intimacy',
      name: 'Интимность и страсть',
      shortName: 'Интимность',
      icon: Flame,
      color: 'var(--accent)',
      p1Score: sexP1,
      p2Score: sexP2,
      avgScore: sexAvg,
      statusLabel: getStatusLabel(sexAvg),
      description: 'Чувственная гармония, романтическое притяжение, взаимная инициатива и открытость сокровенным желаниям.',
      insight:
        sexAvg === 0
          ? 'Пройдите исследование «Баланс страсти и тепла», чтобы исследовать совпадение желаний и ритмов.'
          : `Чувственная гармония — ${sexAvg}%. Готовность открыто говорить о романтических ожиданиях.`,
      gottmanTip: 'Планируйте свидания заранее: сладкое предвкушение встречи усиливает страсть.',
      relatedTestTitle: 'Баланс страсти и тепла',
      relatedTestId: 'TEST-S4',
    },
    {
      key: 'lifestyle',
      name: 'Быт и жизнестойкость',
      shortName: 'Быт',
      icon: Home,
      color: 'var(--accent)',
      p1Score: lifeP1,
      p2Score: lifeP2,
      avgScore: lifeAvg,
      statusLabel: getStatusLabel(lifeAvg),
      description: 'Слаженность в повседневных договоренностях, распределении бюджета и устойчивость перед внешними вызовами.',
      insight:
        lifeAvg === 0
          ? 'Пройдите исследование «Семейные сценарии и быт», чтобы выстроить комфортный уклад жизни.'
          : `Синхронизация быта и жизнестойкости — ${lifeAvg}%. Справедливый баланс и взаимная опора.`,
      gottmanTip: 'Короткое 5-минутное обсуждение расписания на неделю снимает большинство бытовых напряжений.',
      relatedTestTitle: 'Семейные сценарии',
      relatedTestId: 'TEST-D1',
    },
  ];
}
