import { TestCategory } from '../../types.ts';

export interface TestEditorialMeta {
  emotionalTitle: string;
  categoryLabel: string;
  categoryKey: 'closeness' | 'communication' | 'values' | 'intimacy';
  categoryIcon: string;
  tagline: string;
  discoveryText: string;
  estimatedMinutes: number;
}

export const TEST_META_MAP: Record<string, TestEditorialMeta> = {
  'TEST-S2': {
    emotionalTitle: 'Как вы чувствуете любовь?',
    categoryLabel: 'Близость',
    categoryKey: 'closeness',
    categoryIcon: '♡',
    tagline: '5 языков любви · Гэри Чепмен',
    discoveryText: 'Узнайте, через какие поступки и слова каждый из вас по-настоящему чувствует тепло и заботу.',
    estimatedMinutes: 6,
  },
  'TEST-S1': {
    emotionalTitle: 'Как вы строите эмоциональную близость?',
    categoryLabel: 'Близость',
    categoryKey: 'closeness',
    categoryIcon: '✦',
    tagline: 'Стили привязанности (ECR) · Джон Боулби',
    discoveryText: 'Поймите ваши естественные реакции на дистанцию и глубинные потребности в безопасности.',
    estimatedMinutes: 5,
  },
  'TEST-S3': {
    emotionalTitle: 'Как вы проходите разногласия?',
    categoryLabel: 'Общение',
    categoryKey: 'communication',
    categoryIcon: '✧',
    tagline: 'Паттерны диалога · Институт Готтмана',
    discoveryText: 'Откройте антидоты к спорам и сохраняйте бережное взаимопонимание в моменты напряжения.',
    estimatedMinutes: 7,
  },
  'TEST-C1': {
    emotionalTitle: 'Наш идеальный совместный день',
    categoryLabel: 'Ценности',
    categoryKey: 'values',
    categoryIcon: '★',
    tagline: 'Синхронизация биоритмов и отдыха',
    discoveryText: 'Смоделируйте утро, день и вечер мечты, чтобы наполнить совместные выходные вдохновением.',
    estimatedMinutes: 4,
  },
  'TEST-S4': {
    emotionalTitle: 'Баланс страсти и душевного тепла',
    categoryLabel: 'Интимность',
    categoryKey: 'intimacy',
    categoryIcon: '♥',
    tagline: 'Треугольник любви · Роберт Стернберг',
    discoveryText: 'Исследуйте живой баланс близости, физического притяжения и осознанных обязательств.',
    estimatedMinutes: 5,
  },
  'TEST-D1': {
    emotionalTitle: 'Семейные корни и сценарии',
    categoryLabel: 'Ценности',
    categoryKey: 'values',
    categoryIcon: '★',
    tagline: 'Родительские модели и привычки',
    discoveryText: 'Узнайте, как детский опыт формирует ваши взгляды на роли, традиции и правила в союзе.',
    estimatedMinutes: 8,
  },
  'TEST-D2': {
    emotionalTitle: 'Как вы находите согласие в спорах?',
    categoryLabel: 'Общение',
    categoryKey: 'communication',
    categoryIcon: '✧',
    tagline: 'Стратегии в конфликте · Модель Томаса-Килманна',
    discoveryText: 'Узнайте свои привычные стратегии в моменты разногласий и как экологично приходить к согласию.',
    estimatedMinutes: 6,
  },
};

export const CATEGORIES = [
  { id: 'all', label: 'Все', icon: '✦' },
  { id: 'closeness', label: 'Близость', icon: '♡' },
  { id: 'communication', label: 'Общение', icon: '✧' },
  { id: 'values', label: 'Ценности', icon: '★' },
  { id: 'intimacy', label: 'Интимность', icon: '♥' },
];

export const getTestMeta = (test: TestCategory): TestEditorialMeta => {
  return (
    TEST_META_MAP[test.id] || {
      emotionalTitle: test.title,
      categoryLabel: test.methodology === 'scientific' ? 'Близость' : 'Ценности',
      categoryKey: test.methodology === 'scientific' ? 'closeness' : 'values',
      categoryIcon: '✦',
      tagline: `${test.subtitle || test.title} · ${test.estimatedMinutes || 5} мин`,
      discoveryText: test.description || 'Пройдите тест вместе, чтобы лучше понимать друг друга.',
      estimatedMinutes: test.estimatedMinutes || 5,
    }
  );
};
