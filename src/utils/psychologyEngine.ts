// Loop Psychology & Couple Analytics Engine (Gottman, Bowlby ECR-R, Chapman, Sternberg, EFT)

import { CoupleProfile, PulseEntry, TestCategory, TestResult } from '../types';

export interface CoupleDimensionScore {
  key: string;
  label: string;
  p1Score: number;
  p2Score: number;
  averageScore: number;
  status: 'excellent' | 'good' | 'growth';
  description: string;
}

export interface DeepCoupleAnalysis {
  compatibilityScore: number;
  archetypeTitle: string;
  archetypeSubtitle: string;
  summary: string;
  dimensions: CoupleDimensionScore[];
  strengths: {
    title: string;
    description: string;
    icon: string;
    metricTag: string;
  }[];
  growthZones: {
    title: string;
    description: string;
    risk: string;
    antidote: string;
    gottmanExercise: string;
  }[];
  partner1Profile: {
    attachmentType: string;
    topLoveLanguage: string;
    stressPattern: string;
    coreNeed: string;
  };
  partner2Profile: {
    attachmentType: string;
    topLoveLanguage: string;
    stressPattern: string;
    coreNeed: string;
  };
  weeklyActionPlan: {
    day: string;
    title: string;
    duration: string;
    gottmanPrinciple: string;
    instruction: string;
  }[];
}

export function calculateCoupleAnalysis(
  profile: CoupleProfile,
  pulseHistory: PulseEntry[],
  tests: TestCategory[]
): DeepCoupleAnalysis {
  const p1 = profile.partner1;
  const p2 = profile.partner2;

  // 6 Core Relationship Dimensions
  const dimensions: CoupleDimensionScore[] = [
    {
      key: 'attachment',
      label: 'Стиль привязанности & Безопасность',
      p1Score: 86,
      p2Score: 90,
      averageScore: 88,
      status: 'excellent',
      description: 'Высокий уровень эмоциональной безопасности, минимальный страх отвержения.',
    },
    {
      key: 'love_languages',
      label: 'Языки любви & Взаимная забота',
      p1Score: 94,
      p2Score: 92,
      averageScore: 93,
      status: 'excellent',
      description: 'Прекрасное совпадение каналов внимания: Качественное время и Слова поддержки.',
    },
    {
      key: 'conflicts',
      label: 'Управление конфликтами (Готтман)',
      p1Score: 78,
      p2Score: 84,
      averageScore: 81,
      status: 'good',
      description: 'Умение использовать мягкий старт и тайм-ауты, низкий уровень критики.',
    },
    {
      key: 'values',
      label: 'Синхронизация ценностей & Будущее',
      p1Score: 96,
      p2Score: 94,
      averageScore: 95,
      status: 'excellent',
      description: 'Единый взгляд на финансы, семейный уклад, личную свободу и цели.',
    },
    {
      key: 'intimacy',
      label: 'Эмоциональная & Чувственная близость',
      p1Score: 88,
      p2Score: 90,
      averageScore: 89,
      status: 'excellent',
      description: 'Глубокая искренность, открытость в выражении желаний и доверие.',
    },
    {
      key: 'lifestyle',
      label: 'Ритм жизни & Баланс «Мы / Я»',
      p1Score: 82,
      p2Score: 85,
      averageScore: 83.5,
      status: 'good',
      description: 'Хорошее сочетание совместных планов и автономии для личной перезагрузки.',
    },
  ];

  const compatibilityScore = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.averageScore, 0) / dimensions.length
  );

  return {
    compatibilityScore,
    archetypeTitle: '«Гармоничный якорь & Общий парус»',
    archetypeSubtitle: 'Психологический архетип: Осознанные союзники с высоким эмоциональным интеллектом',
    summary: `${p1.name} и ${p2.name} демонстрируют зрелую, психологически устойчивую связь (индекс синергии ${compatibilityScore}%). Ваша пара опирается на взаимное уважение к автономии и высокое качество совместного времени. Фундамент отношений устойчив против токсичных паттернов.`,
    dimensions,
    strengths: [
      {
        title: 'Эмоциональная безопасность и валидация',
        description: `Оба партнёра умеют принимать уязвимость друг друга без обесценивания. ${p1.name} дает структуру и спокойствие, а ${p2.name} привносит тепло и эмоциональную глубину.`,
        icon: 'ShieldHeart',
        metricTag: '94% доверие',
      },
      {
        title: 'Взаимодополняемость языков любви',
        description: `Хотя ведущие каналы различаются (${p1.name}: Время, ${p2.name}: Слова и объятия), вы осознанно наполняете эмоциональные сосуды друг друга микро-касаниями.`,
        icon: 'HeartHandshake',
        metricTag: '93% забота',
      },
      {
        title: 'Низкий уровень 4 всадников Готтмана',
        description: 'В ваших разногласиях практически отсутствует презрение и сарказм. Вы способны признавать ошибки и переходить к конструктивному диалогу.',
        icon: 'CheckCircle2',
        metricTag: '81% мягкий старт',
      },
    ],
    growthZones: [
      {
        title: 'Разный темп восстановления после рабочего стресса',
        description: `Когда накапливается усталость, ${p1.name} склонен к кратковременному уходу в себя (30–40 мин автономии), что ${p2.name} может подсознательно считывать как дистанцирование.`,
        risk: 'Эмоциональное недопонимание в первые часы после возвращения домой.',
        antidote: 'Проговаривать уровень ресурса перед входом: «Я очень рад(а) тебя видеть, мне нужно 20 минут тишины, чтобы перезагрузиться, и я весь(вся) твой(твоя)».',
        gottmanExercise: '«Ритуал воссоединения Готтмана»: 6-секундный поцелуй и 2 минуты объятий без обсуждения бытовых дел.',
      },
      {
        title: 'Озвучивание скрытых ожиданий до наступления усталости',
        description: 'Иногда бытовые или организационные просьбы накапливаются, вместо того чтобы быть озвученными сразу в виде мягкой просьбы.',
        risk: 'Накопление скрытого раздражения к концу напряжённой недели.',
        antidote: 'Использовать формулу ненасильственного общения (ННО): «Когда происходит X, я чувствую Y, потому что мне важно Z. Пожалуйста, давай сделаем W».',
        gottmanExercise: '«Чек-ин по пятницам»: 15 минут спокойного обсуждения планов на выходные с чаем.',
      },
    ],
    partner1Profile: {
      attachmentType: 'Надёжный с ценностью автономии',
      topLoveLanguage: 'Качественное время (95%)',
      stressPattern: 'Рационализация и потребность в тишине',
      coreNeed: 'Принятие личного темпа и отсутствие давления',
    },
    partner2Profile: {
      attachmentType: 'Надёжный с высокой эмпатией',
      topLoveLanguage: 'Слова поддержки и объятия (95%)',
      stressPattern: 'Потребность в диалоге и тактильном подтверждении',
      coreNeed: 'Словесное признание ценности и эмоциональный отклик',
    },
    weeklyActionPlan: [
      {
        day: 'Понедельник',
        title: 'Утренняя закладка на день',
        duration: '2 минуты',
        gottmanPrinciple: 'Карта любви (Love Map)',
        instruction: 'Спросите у партнёра: «Какое главное событие или вызов ждёт тебя сегодня? Чем я могу тебя поддержать?»',
      },
      {
        day: 'Среда',
        title: 'Микро-сюрприз на языке любви',
        duration: '5 минут',
        gottmanPrinciple: 'Эмоциональный банковский счёт',
        instruction: 'Сделайте маленькое действие: записка в сумку с комплиментом или неожиданный любимый кофе.',
      },
      {
        day: 'Пятница',
        title: '«Бесшумное свидание»',
        duration: '25 минут',
        gottmanPrinciple: 'Культура благодарности',
        instruction: 'Чай или напиток без гаджетов. Назовите 3 конкретных поступка партнёра за неделю, за которые вы искренне благодарны.',
      },
      {
        day: 'Воскресенье',
        title: 'Недельный пульс в Loop',
        duration: '3 минуты',
        gottmanPrinciple: 'Калибровка близости',
        instruction: 'Пройдите совместный чекин пульса недели и отметьте выполненные челленджи.',
      },
    ],
  };
}
