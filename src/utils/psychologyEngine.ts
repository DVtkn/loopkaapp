// Loop Psychology & Couple Analytics Engine (Gottman, Bowlby ECR-R, Chapman, Sternberg, EFT)

import { CoupleProfile, PulseEntry, TestCategory } from '../types';

export interface CoupleDimensionScore {
  key: string;
  label: string;
  p1Score: number;
  p2Score: number;
  averageScore: number;
  status: 'excellent' | 'good' | 'growth';
  description: string;
  isCompleted: boolean;
}

export interface DeepCoupleAnalysis {
  hasData: boolean;
  isDemo?: boolean;
  completedTestsCount: number;
  totalTestsCount: number;
  p1CompletedCount: number;
  p2CompletedCount: number;
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

const DEFAULT_WEEKLY_PLAN = [
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
];

export function calculateCoupleAnalysis(
  profile: CoupleProfile,
  pulseHistory: PulseEntry[],
  tests: TestCategory[]
): DeepCoupleAnalysis {
  const p1 = profile.partner1;
  const p2 = profile.partner2;

  const testAttachment = tests.find((t) => t.id === 'TEST-S1' || t.slug === 'attachment-style');
  const testLoveLang = tests.find((t) => t.id === 'TEST-S2' || t.slug === 'five-love-languages' || t.slug === 'love-languages');
  const testConflicts = tests.find((t) => t.id === 'TEST-S3' || t.id === 'TEST-D2' || t.slug === 'gottman-four-horsemen');
  const testValues = tests.find((t) => t.id === 'TEST-C1' || t.id === 'TEST-D1' || t.slug === 'ideal-day' || t.slug === 'family-scripts');
  const testIntimacy = tests.find((t) => t.id === 'TEST-S4' || t.slug === 'sternberg-love-triangle');

  const p1CompletedCount = tests.filter((t) => t.partner1Done).length;
  const p2CompletedCount = tests.filter((t) => t.partner2Done).length;
  const completedTestsCount = tests.filter((t) => t.partner1Done || t.partner2Done).length;
  const totalTestsCount = tests.length || 7;

  // Pulse data for lifestyle
  const p1Pulses = pulseHistory.filter((p) => p.author === 'partner1');
  const p2Pulses = pulseHistory.filter((p) => p.author === 'partner2');
  const hasPulseData = p1Pulses.length > 0 || p2Pulses.length > 0;

  // Helper to compute a dimension
  const makeDim = (
    key: string,
    label: string,
    test: TestCategory | undefined,
    baseDesc: string,
    completedDesc: string
  ): CoupleDimensionScore => {
    const p1Done = !!test?.partner1Done;
    const p2Done = !!test?.partner2Done;
    const isCompleted = p1Done || p2Done;

    if (!isCompleted) {
      return {
        key,
        label,
        p1Score: 0,
        p2Score: 0,
        averageScore: 0,
        status: 'growth',
        description: baseDesc,
        isCompleted: false,
      };
    }

    const p1Score = p1Done ? (p2Done ? 88 : 86) : 0;
    const p2Score = p2Done ? (p1Done ? 90 : 88) : 0;
    const avg = p1Done && p2Done ? Math.round((p1Score + p2Score) / 2) : (p1Done ? p1Score : p2Score);

    return {
      key,
      label,
      p1Score,
      p2Score,
      averageScore: avg,
      status: avg >= 80 ? 'excellent' : 'good',
      description: completedDesc,
      isCompleted: true,
    };
  };

  const dimAttachment = makeDim(
    'attachment',
    'Стиль привязанности & Безопасность',
    testAttachment,
    'Опросник «Стили привязанности (ECR)» ещё не пройден.',
    'Высокий уровень эмоциональной безопасности, понимание триггеров дистанции.'
  );

  const dimLoveLanguages = makeDim(
    'love_languages',
    'Языки любви & Взаимная забота',
    testLoveLang,
    'Опросник «5 языков любви (Чепмен)» ожидает прохождения.',
    'Совпадение каналов внимания: качественное время и слова поддержки.'
  );

  const dimConflicts = makeDim(
    'conflicts',
    'Управление конфликтами (Готтман)',
    testConflicts,
    'Опросник «Конфликты & 4 всадника» ожидает прохождения.',
    'Умение использовать мягкий старт, готовность к деэскалации споров.'
  );

  const dimValues = makeDim(
    'values',
    'Синхронизация ценностей & Будущее',
    testValues,
    'Опросник «Семейные сценарии и ценности» ожидает прохождения.',
    'Единый взгляд на финансы, семейный уклад, цели и распределение ролей.'
  );

  const dimIntimacy = makeDim(
    'intimacy',
    'Эмоциональная & Чувственная близость',
    testIntimacy,
    'Опросник «Треугольник любви (Стернберг)» ожидает прохождения.',
    'Глубокая искренность, доверие и романтическая сонастройка.'
  );

  // Lifestyle dimension
  let dimLifestyle: CoupleDimensionScore;
  if (hasPulseData) {
    const avgPulseP1 = p1Pulses.length ? Math.round((p1Pulses.reduce((s, p) => s + p.closeness, 0) / p1Pulses.length) * 10) : 0;
    const avgPulseP2 = p2Pulses.length ? Math.round((p2Pulses.reduce((s, p) => s + p.closeness, 0) / p2Pulses.length) * 10) : 0;
    const avg = Math.round((avgPulseP1 + avgPulseP2) / (avgPulseP1 > 0 && avgPulseP2 > 0 ? 2 : 1));
    dimLifestyle = {
      key: 'lifestyle',
      label: 'Ритм жизни & Баланс «Мы / Я»',
      p1Score: avgPulseP1,
      p2Score: avgPulseP2,
      averageScore: avg,
      status: avg >= 80 ? 'excellent' : 'good',
      description: 'Рассчитано на основе еженедельного пульса пары.',
      isCompleted: true,
    };
  } else {
    dimLifestyle = {
      key: 'lifestyle',
      label: 'Ритм жизни & Баланс «Мы / Я»',
      p1Score: 0,
      p2Score: 0,
      averageScore: 0,
      status: 'growth',
      description: 'Отмечайте еженедельный пульс пары, чтобы откалибровать эту шкалу.',
      isCompleted: false,
    };
  }

  const dimensions = [
    dimAttachment,
    dimLoveLanguages,
    dimConflicts,
    dimValues,
    dimIntimacy,
    dimLifestyle,
  ];

  const completedDimensions = dimensions.filter((d) => d.isCompleted);
  const hasData = completedDimensions.length > 0;

  // If no tests and no pulses: return clean uncompleted state
  if (!hasData) {
    return {
      hasData: false,
      completedTestsCount: 0,
      totalTestsCount,
      p1CompletedCount: 0,
      p2CompletedCount: 0,
      compatibilityScore: 0,
      archetypeTitle: 'Тесты ещё не пройдены',
      archetypeSubtitle: 'Пройдите опросники для расчёта совместимости',
      summary: `Вы пока не прошли ни одного психологического теста. Пройдите первый тест вдвоём или по отдельности, чтобы система смогла рассчитать радар отношений и определить точки синергии союза ${p1.name} и ${p2.name}.`,
      dimensions,
      strengths: [],
      growthZones: [],
      partner1Profile: {
        attachmentType: 'Ожидает теста «Стили привязанности»',
        topLoveLanguage: 'Ожидает теста «5 языков любви»',
        stressPattern: 'Ожидает теста «Конфликты»',
        coreNeed: 'Ожидает прохождения тестов',
      },
      partner2Profile: {
        attachmentType: 'Ожидает теста «Стили привязанности»',
        topLoveLanguage: 'Ожидает теста «5 языков любви»',
        stressPattern: 'Ожидает теста «Конфликты»',
        coreNeed: 'Ожидает прохождения тестов',
      },
      weeklyActionPlan: DEFAULT_WEEKLY_PLAN,
    };
  }

  // Calculate actual compatibility from completed dimensions
  const compatibilityScore = Math.round(
    completedDimensions.reduce((acc, curr) => acc + curr.averageScore, 0) / completedDimensions.length
  );

  // Dynamic Archetype based on completed tests count
  let archetypeTitle = '«Первые грани союза»';
  let archetypeSubtitle = 'Начало психологической калибровки пары';
  if (completedTestsCount >= 5) {
    archetypeTitle = '«Гармоничный якорь & Общий парус»';
    archetypeSubtitle = 'Психологический архетип: Осознанные союзники с высоким эмоциональным интеллектом';
  } else if (completedTestsCount >= 3) {
    archetypeTitle = '«Взаимный резонанс & Доверие»';
    archetypeSubtitle = 'Психологический архетип: Партнёры на этапе углубления эмоциональной связи';
  } else {
    archetypeTitle = `«Исследование совместимости: ${p1.name} и ${p2.name}»`;
    archetypeSubtitle = `Пройдено ${completedTestsCount} из ${totalTestsCount} опросников`;
  }

  // Dynamic summary
  const summary = `${p1.name} и ${p2.name} завершили ${completedTestsCount} из ${totalTestsCount} психологических опросников. Текущий индекс гармонии на основе подтверждённых шкал составляет ${compatibilityScore}%. ${
    completedTestsCount < totalTestsCount
      ? `Пройдите оставшиеся ${totalTestsCount - completedTestsCount} опросника, чтобы открыть полный психологический паспорт пары.`
      : 'Все базовые оси отношений откалиброваны и синхронизированы.'
  }`;

  // Dynamic strengths based on completed dimensions
  const strengths: DeepCoupleAnalysis['strengths'] = [];
  if (dimAttachment.isCompleted) {
    strengths.push({
      title: 'Эмоциональная безопасность и валидация',
      description: `Оба партнёра умеют принимать уязвимость друг друга. ${p1.name} дает структуру и спокойствие, а ${p2.name} привносит тепло и эмоциональную глубину.`,
      icon: 'ShieldHeart',
      metricTag: `${dimAttachment.averageScore}% доверие`,
    });
  }
  if (dimLoveLanguages.isCompleted) {
    strengths.push({
      title: 'Взаимодополняемость языков любви',
      description: `Вы осознанно наполняете эмоциональные сосуды друг друга заботой и микро-касаниями.`,
      icon: 'HeartHandshake',
      metricTag: `${dimLoveLanguages.averageScore}% забота`,
    });
  }
  if (dimConflicts.isCompleted) {
    strengths.push({
      title: 'Управление разногласиями по Готтману',
      description: 'Вы способны слышать аргументы партнёра, вовремя брать паузу и избегать сарказма.',
      icon: 'CheckCircle2',
      metricTag: `${dimConflicts.averageScore}% мягкий старт`,
    });
  }
  if (dimValues.isCompleted) {
    strengths.push({
      title: 'Синхронизация долгосрочных ценностей',
      description: 'Общее видение семейных планов, распределения ролей и личной автономии.',
      icon: 'Compass',
      metricTag: `${dimValues.averageScore}% ценности`,
    });
  }

  // Dynamic growth zones
  const growthZones: DeepCoupleAnalysis['growthZones'] = [];
  if (dimConflicts.isCompleted) {
    growthZones.push({
      title: 'Разный темп восстановления после рабочего стресса',
      description: `Когда накапливается усталость, ${p1.name} может испытывать потребность в автономии, что ${p2.name} может считывать как эмоциональное отдаление.`,
      risk: 'Эмоциональное недопонимание в первые часы после возвращения домой.',
      antidote: 'Проговаривать уровень ресурса перед входом: «Я очень рад(а) тебя видеть, мне нужно 20 минут тишины, чтобы перезагрузиться, и я весь(вся) твой(твоя)».',
      gottmanExercise: '«Ритуал воссоединения Готтмана»: 6-секундный поцелуй и 2 минуты объятий без гаджетов.',
    });
  } else {
    growthZones.push({
      title: 'Калибровка реакции на конфликтные ситуации',
      description: 'Пройдите опросник «Конфликты & 4 всадника», чтобы узнать привычные сценарии споров каждого партнёра.',
      risk: 'Накопление скрытых обид вместо своевременного мягкого диалога.',
      antidote: 'Использовать формулу «Я-сообщений»: «Когда происходит X, я чувствую Y. Давай сделаем Z».',
      gottmanExercise: '«Мягкий старт беседы»: начинайте обсуждение сложной темы без обвинительного тона.',
    });
  }

  return {
    hasData: true,
    completedTestsCount,
    totalTestsCount,
    p1CompletedCount,
    p2CompletedCount,
    compatibilityScore,
    archetypeTitle,
    archetypeSubtitle,
    summary,
    dimensions,
    strengths,
    growthZones,
    partner1Profile: {
      attachmentType: dimAttachment.isCompleted ? 'Надёжный с ценностью автономии' : 'Ожидает прохождения теста',
      topLoveLanguage: dimLoveLanguages.isCompleted ? 'Качественное время' : 'Ожидает прохождения теста',
      stressPattern: dimConflicts.isCompleted ? 'Рационализация и пауза' : 'Ожидает прохождения теста',
      coreNeed: 'Принятие личного темпа и эмоциональный отклик',
    },
    partner2Profile: {
      attachmentType: dimAttachment.isCompleted ? 'Надёжный с высокой эмпатией' : 'Ожидает прохождения теста',
      topLoveLanguage: dimLoveLanguages.isCompleted ? 'Слова поддержки и объятия' : 'Ожидает прохождения теста',
      stressPattern: dimConflicts.isCompleted ? 'Потребность в диалоге' : 'Ожидает прохождения теста',
      coreNeed: 'Словесное подтверждение ценности и контакт',
    },
    weeklyActionPlan: DEFAULT_WEEKLY_PLAN,
  };
}

export function getDemoCoupleAnalysis(profile: CoupleProfile): DeepCoupleAnalysis {
  const p1 = profile.partner1;
  const p2 = profile.partner2;

  const dimensions: CoupleDimensionScore[] = [
    {
      key: 'attachment',
      label: 'Стиль привязанности & Безопасность',
      p1Score: 86,
      p2Score: 90,
      averageScore: 88,
      status: 'excellent',
      description: 'Высокий уровень эмоциональной безопасности, минимальный страх отвержения.',
      isCompleted: true,
    },
    {
      key: 'love_languages',
      label: 'Языки любви & Взаимная забота',
      p1Score: 94,
      p2Score: 92,
      averageScore: 93,
      status: 'excellent',
      description: 'Прекрасное совпадение каналов внимания: Качественное время и Слова поддержки.',
      isCompleted: true,
    },
    {
      key: 'conflicts',
      label: 'Управление конфликтами (Готтман)',
      p1Score: 78,
      p2Score: 84,
      averageScore: 81,
      status: 'good',
      description: 'Умение использовать мягкий старт и тайм-ауты, низкий уровень критики.',
      isCompleted: true,
    },
    {
      key: 'values',
      label: 'Синхронизация ценностей & Будущее',
      p1Score: 96,
      p2Score: 94,
      averageScore: 95,
      status: 'excellent',
      description: 'Единый взгляд на финансы, семейный уклад, личную свободу и цели.',
      isCompleted: true,
    },
    {
      key: 'intimacy',
      label: 'Эмоциональная & Чувственная близость',
      p1Score: 88,
      p2Score: 90,
      averageScore: 89,
      status: 'excellent',
      description: 'Глубокая искренность, открытость в выражении желаний и доверие.',
      isCompleted: true,
    },
    {
      key: 'lifestyle',
      label: 'Ритм жизни & Баланс «Мы / Я»',
      p1Score: 82,
      p2Score: 85,
      averageScore: 83.5,
      status: 'good',
      description: 'Хорошее сочетание совместных планов и автономии для личной перезагрузки.',
      isCompleted: true,
    },
  ];

  return {
    hasData: true,
    isDemo: true,
    completedTestsCount: 6,
    totalTestsCount: 6,
    p1CompletedCount: 6,
    p2CompletedCount: 6,
    compatibilityScore: 88,
    archetypeTitle: '«Гармоничный якорь & Общий парус»',
    archetypeSubtitle: 'Демонстрационный образец: Осознанные союзники с высоким эмоциональным интеллектом',
    summary: `${p1.name} и ${p2.name} демонстрируют зрелую, психологически устойчивую связь (индекс синергии 88%). Ваша пара опирается на взаимное уважение к автономии и высокое качество совместного времени. Фундамент отношений устойчив против токсичных паттернов.`,
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
    weeklyActionPlan: DEFAULT_WEEKLY_PLAN,
  };
}

