import { XPEntry, PartnerId, TestCategory, DateInvite, SmallCraving, LoveTap, PulseEntry, Challenge } from '../types';
import { IconColorTheme } from '../components/ColoredIcon';

export interface LevelInfo {
  level: number;
  name: string;
  minXP: number;
  maxXP: number;
  color: IconColorTheme;
  iconName: string;
  description: string;
  perks: string[];
  nextLevelName?: string;
}

export const COUPLE_LEVELS: LevelInfo[] = [
  {
    level: 1,
    name: 'Первая искра',
    minXP: 0,
    maxXP: 300,
    color: 'gold',
    iconName: 'Sparkles',
    description: 'Начало пути: первые совместные шаги, исследование стилей привязанности и языков любви.',
    perks: ['Базовые тесты', 'Касания Love Taps', 'Колесо свиданий'],
    nextLevelName: 'Взаимный резонанс',
  },
  {
    level: 2,
    name: 'Взаимный резонанс',
    minXP: 300,
    maxXP: 750,
    color: 'rose',
    iconName: 'Heart',
    description: 'Тёплая сонастройка: открытые диалоги, первые совместные свидания и регулярный чекин настроения.',
    perks: ['Анализ конфликтов по Готтману', 'Карточки Deep Talk', 'Секретный вишлист'],
    nextLevelName: 'Глубокая привязанность',
  },
  {
    level: 3,
    name: 'Глубокая привязанность',
    minXP: 750,
    maxXP: 1500,
    color: 'teal',
    iconName: 'ShieldCheck',
    description: 'Истинная близость: глубокое взаимопонимание триггеров, забота без слов и устойчивое доверие.',
    perks: ['Капсула времени', 'Индекс эмоциональной безопасности', 'Индивидуальные советы Совы'],
    nextLevelName: 'Неразлучные сердца',
  },
  {
    level: 4,
    name: 'Неразлучные сердца',
    minXP: 1500,
    maxXP: 2500,
    color: 'coral',
    iconName: 'Flame',
    description: 'Крепкий союз: слаженность в быту, страсти, ценностях и преодолении жизненных вызовов.',
    perks: ['Радар отношений PRO', 'Совместные челленджи месяца', 'Синхронизация долгосрочных целей'],
    nextLevelName: 'Абсолютная гармония',
  },
  {
    level: 5,
    name: 'Абсолютная гармония',
    minXP: 2500,
    maxXP: 4000,
    color: 'amber',
    iconName: 'Crown',
    description: 'Мастерство любви: безусловное принятие, высокая психологическая зрелость и нерушимая опора.',
    perks: ['Золотой статус пары', 'Полный психологический паспорт союза', 'VIP-сценарии свиданий'],
    nextLevelName: 'Легендарный союз',
  },
  {
    level: 6,
    name: 'Легендарный союз',
    minXP: 4000,
    maxXP: 10000,
    color: 'purple',
    iconName: 'Trophy',
    description: 'Вершина гармонии: эталонные партнёрские отношения, проверенные совместным опытом и временем.',
    perks: ['Легендарный статус', 'Архив лучших совместных воспоминаний', 'Бессрочный доступ ко всем возможностям'],
    nextLevelName: 'Максимальный ранг',
  },
];

export function getCoupleLevelInfo(xp: number) {
  const currentLevel =
    COUPLE_LEVELS.slice().reverse().find((l) => xp >= l.minXP) || COUPLE_LEVELS[0];

  const nextLevel = COUPLE_LEVELS.find((l) => l.level === currentLevel.level + 1);

  const rangeSpan = nextLevel ? nextLevel.minXP - currentLevel.minXP : 2000;
  const currentInLevel = xp - currentLevel.minXP;
  const progressPercent = nextLevel
    ? Math.min(100, Math.max(0, Math.round((currentInLevel / rangeSpan) * 100)))
    : 100;

  const xpToNext = nextLevel ? Math.max(0, nextLevel.minXP - xp) : 0;

  return {
    level: currentLevel.level,
    levelName: currentLevel.name,
    color: currentLevel.color,
    iconName: currentLevel.iconName,
    description: currentLevel.description,
    perks: currentLevel.perks,
    currentXP: xp,
    minXP: currentLevel.minXP,
    nextLevelMinXP: nextLevel ? nextLevel.minXP : currentLevel.maxXP,
    xpToNext,
    progressPercent,
    nextLevelName: nextLevel?.name || 'Максимальный ранг',
  };
}

export interface ActionCategoryStats {
  key: 'tests' | 'dates' | 'reactions' | 'care' | 'challenges';
  title: string;
  subtitle: string;
  points: number;
  count: number;
  color: IconColorTheme;
  iconName: string;
  xpPerAction: string;
}

export interface CoupleRatingAnalytics {
  totalXP: number;
  levelInfo: ReturnType<typeof getCoupleLevelInfo>;
  partner1XP: number;
  partner2XP: number;
  partner1Percent: number;
  partner2Percent: number;
  balanceScore: number; // 0 to 100 (100 = 50/50 balance)
  balanceStatus: string;
  categories: ActionCategoryStats[];
  synergyScore: number; // 0-100 composite index
  synergyStatus: string;
  timelineData: {
    name: string;
    total: number;
    p1: number;
    p2: number;
    tests: number;
    dates: number;
    reactions: number;
    care: number;
  }[];
}

export function computeCoupleRatingAnalytics(params: {
  xpHistory: XPEntry[];
  totalXP: number;
  tests: TestCategory[];
  dateInvites: DateInvite[];
  smallCravings: SmallCraving[];
  loveTaps: LoveTap[];
  pulseHistory: PulseEntry[];
  challenges: Challenge[];
  p1Name: string;
  p2Name: string;
}): CoupleRatingAnalytics {
  const { xpHistory, totalXP, tests, dateInvites, smallCravings, loveTaps, pulseHistory, challenges } = params;

  const levelInfo = getCoupleLevelInfo(totalXP);

  // 1. Calculate points by category
  let testXP = 0;
  let dateXP = 0;
  let reactionXP = 0;
  let careXP = 0;
  let challengeXP = 0;

  let p1XP = 0;
  let p2XP = 0;

  // Base calculation from actual user actions in components
  const p1TestsCount = tests.filter((t) => t.partner1Done).length;
  const p2TestsCount = tests.filter((t) => t.partner2Done).length;
  const bothTestsCount = tests.filter((t) => t.partner1Done && t.partner2Done).length;

  const confirmedDates = dateInvites.filter((d) => d.status === 'CONFIRMED' || d.completed);
  const completedReviews = dateInvites.filter((d) => d.review);
  const fulfilledCravings = smallCravings.filter((c) => c.fulfilled);
  const p1TapsCount = loveTaps.length;
  const pulseCount = pulseHistory.length;
  const completedChallenges = challenges.filter((c) => c.partner1Completed || c.partner2Completed);

  // Calculate categorized points from history + state
  testXP = (p1TestsCount + p2TestsCount) * 150 + bothTestsCount * 100;
  dateXP = dateInvites.length * 40 + confirmedDates.length * 100 + completedReviews.length * 150;
  reactionXP = p1TapsCount * 10 + pulseCount * 25 + 50; // daily checkins
  careXP = fulfilledCravings.length * 50 + smallCravings.length * 20;
  challengeXP = completedChallenges.length * 60;

  // Calculate partner split
  p1XP = p1TestsCount * 150 + bothTestsCount * 50 + Math.round(dateXP * 0.48) + Math.round(reactionXP * 0.52) + Math.round(careXP * 0.5);
  p2XP = p2TestsCount * 150 + bothTestsCount * 50 + Math.round(dateXP * 0.52) + Math.round(reactionXP * 0.48) + Math.round(careXP * 0.5);

  // Factor in raw xpHistory if exists
  if (xpHistory && xpHistory.length > 0) {
    xpHistory.forEach((entry) => {
      if (entry.partnerId === 'partner1') p1XP += entry.points;
      else if (entry.partnerId === 'partner2') p2XP += entry.points;
      else {
        p1XP += Math.round(entry.points / 2);
        p2XP += Math.round(entry.points / 2);
      }
    });
  }

  const effectiveTotal = Math.max(totalXP, p1XP + p2XP, 50);
  if (p1XP + p2XP === 0) {
    p1XP = Math.round(effectiveTotal * 0.52);
    p2XP = Math.round(effectiveTotal * 0.48);
  }

  const partner1Percent = Math.min(95, Math.max(5, Math.round((p1XP / (p1XP + p2XP)) * 100)));
  const partner2Percent = 100 - partner1Percent;

  // Balance calculation: 100 is exact 50/50, 0 is 100/0
  const balanceDiff = Math.abs(partner1Percent - partner2Percent);
  const balanceScore = Math.max(10, 100 - balanceDiff * 2);

  let balanceStatus = 'Идеальная синергия активности';
  if (balanceDiff > 35) {
    balanceStatus = 'Один партнёр проявляет больше инициативы';
  } else if (balanceDiff > 18) {
    balanceStatus = 'Хороший взаимный баланс';
  }

  // Composite synergy score (0 - 100)
  const testsCoverage = Math.min(1, (p1TestsCount + p2TestsCount) / 8);
  const dateEngagement = Math.min(1, (confirmedDates.length + 1) / 3);
  const activityFactor = Math.min(1, effectiveTotal / 2000);
  const synergyScore = Math.min(
    100,
    Math.max(25, Math.round(balanceScore * 0.35 + testsCoverage * 30 + dateEngagement * 20 + activityFactor * 15))
  );

  let synergyStatus = 'Гармоничный устойчивый контакт';
  if (synergyScore >= 88) synergyStatus = 'Высшая степень парного единения';
  else if (synergyScore >= 70) synergyStatus = 'Тёплый взаимный резонанс';
  else if (synergyScore < 50) synergyStatus = 'Рекомендуется совместная активность';

  const categories: ActionCategoryStats[] = [
    {
      key: 'tests',
      title: 'Психологические тесты',
      subtitle: `${p1TestsCount + p2TestsCount} пройдено (${bothTestsCount} синхронно)`,
      points: testXP,
      count: p1TestsCount + p2TestsCount,
      color: 'indigo',
      iconName: 'ShieldCheck',
      xpPerAction: '+150 XP за тест, +100 XP бонус',
    },
    {
      key: 'dates',
      title: 'Свидания и встречи',
      subtitle: `${dateInvites.length} создано, ${confirmedDates.length} проведено`,
      points: dateXP,
      count: dateInvites.length,
      color: 'rose',
      iconName: 'Wine',
      xpPerAction: '+40..150 XP за свидание',
    },
    {
      key: 'reactions',
      title: 'Быстрые реакции и чекины',
      subtitle: `${p1TapsCount} касаний, ${pulseCount} замеров пульса`,
      points: reactionXP,
      count: p1TapsCount + pulseCount,
      color: 'gold',
      iconName: 'Zap',
      xpPerAction: '+10..25 XP за чекин',
    },
    {
      key: 'care',
      title: 'Забота и желания',
      subtitle: `${fulfilledCravings.length} из ${smallCravings.length} исполнено`,
      points: careXP,
      count: smallCravings.length,
      color: 'emerald',
      iconName: 'Heart',
      xpPerAction: '+50 XP за исполнение',
    },
    {
      key: 'challenges',
      title: 'Челленджи и карточки',
      subtitle: `${completedChallenges.length} совместных заданий`,
      points: challengeXP,
      count: completedChallenges.length,
      color: 'coral',
      iconName: 'Target',
      xpPerAction: '+60 XP за челлендж',
    },
  ];

  // Timeline chart data for rating progression
  const timelineData = [
    {
      name: 'Старт',
      total: Math.round(effectiveTotal * 0.15),
      p1: Math.round(p1XP * 0.15),
      p2: Math.round(p2XP * 0.15),
      tests: Math.round(testXP * 0.2),
      dates: Math.round(dateXP * 0.1),
      reactions: Math.round(reactionXP * 0.1),
      care: Math.round(careXP * 0.1),
    },
    {
      name: 'Неделя 1',
      total: Math.round(effectiveTotal * 0.35),
      p1: Math.round(p1XP * 0.35),
      p2: Math.round(p2XP * 0.35),
      tests: Math.round(testXP * 0.4),
      dates: Math.round(dateXP * 0.3),
      reactions: Math.round(reactionXP * 0.35),
      care: Math.round(careXP * 0.3),
    },
    {
      name: 'Неделя 2',
      total: Math.round(effectiveTotal * 0.65),
      p1: Math.round(p1XP * 0.65),
      p2: Math.round(p2XP * 0.65),
      tests: Math.round(testXP * 0.7),
      dates: Math.round(dateXP * 0.6),
      reactions: Math.round(reactionXP * 0.7),
      care: Math.round(careXP * 0.65),
    },
    {
      name: 'Сейчас',
      total: effectiveTotal,
      p1: p1XP,
      p2: p2XP,
      tests: testXP,
      dates: dateXP,
      reactions: reactionXP,
      care: careXP,
    },
  ];

  return {
    totalXP: effectiveTotal,
    levelInfo,
    partner1XP: p1XP,
    partner2XP: p2XP,
    partner1Percent,
    partner2Percent,
    balanceScore,
    balanceStatus,
    categories,
    synergyScore,
    synergyStatus,
    timelineData,
  };
}
