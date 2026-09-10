import {
  CoupleProfile,
  PulseEntry,
  Challenge,
  TestCategory,
  SmallCraving,
  FlowerPreference,
  WishlistItem,
  Venue,
  DateInvite,
  MoodHistoryItem,
  Achievement,
  Gender,
} from '../types';

export function createFreshCoupleProfile(
  partner1Name: string = 'Партнёр 1',
  partner2Name: string = 'Партнёр 2',
  startDate: string = '',
  city: string = 'Москва',
  gender1?: Gender,
  gender2?: Gender,
  partner1Login?: string,
  partner2Login?: string
): CoupleProfile {
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const cleanLogin1 = partner1Login ? partner1Login.toLowerCase().replace(/^@/, '').trim() : '';
  const cleanLogin2 = partner2Login ? partner2Login.toLowerCase().replace(/^@/, '').trim() : '';

  return {
    id: 'c-' + Date.now(),
    status: 'ACTIVE',
    linkCode: `LOOP-${randomCode}`,
    startDate: startDate || '',
    city: city || 'Москва',
    level: 1,
    levelName: 'Первый шаг',
    testsCompletedCount: 0,
    partner1: {
      id: 'partner1',
      name: partner1Name.trim() || 'Партнёр 1',
      avatar: gender1 === 'male' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: '',
      login: cleanLogin1 || ('p1_' + Math.random().toString(36).substring(7)),
      gender: gender1,
      birthDate: '',
      loveLanguage: 'Пройдите тест',
      attachmentStyle: 'Пройдите тест ECR',
      currentMood: undefined,
    },
    partner2: {
      id: 'partner2',
      name: partner2Name.trim() || 'Партнёр 2',
      avatar: gender2 === 'male' ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      email: '',
      login: cleanLogin2 || ('p2_' + Math.random().toString(36).substring(7)),
      gender: gender2,
      birthDate: '',
      loveLanguage: 'Пройдите тест',
      attachmentStyle: 'Пройдите тест ECR',
      currentMood: undefined,
    },
  };
}

export function getFreshTests(): TestCategory[] {
  return initialTests.map((t) => ({
    ...t,
    partner1Done: false,
    partner2Done: false,
  }));
}

export function getFreshChallenges(): Challenge[] {
  return initialChallenges.map((c) => ({
    ...c,
    partner1Completed: false,
    partner2Completed: false,
    completedAt: undefined,
  }));
}

export const initialCoupleProfile: CoupleProfile = {
  id: 'c-7729',
  status: 'ACTIVE',
  linkCode: 'TOGETHER-7492',
  startDate: '',
  city: 'Москва',
  level: 1,
  levelName: 'Первый шаг',
  testsCompletedCount: 0,
  partner1: {
    id: 'partner1',
    name: 'Партнёр 1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: '',
    login: '',
    birthDate: '',
    loveLanguage: 'Пройдите тест',
    attachmentStyle: 'Пройдите тест',
    currentMood: undefined,
  },
  partner2: {
    id: 'partner2',
    name: 'Партнёр 2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    email: '',
    login: '',
    birthDate: '',
    loveLanguage: 'Пройдите тест',
    attachmentStyle: 'Пройдите тест',
    currentMood: undefined,
  },
};

export const initialPulseHistory: PulseEntry[] = [];

export const initialChallenges: Challenge[] = [
  {
    id: 'ch-1',
    title: '20 минут «Бесшумного свидания»',
    description: 'Выпейте вместе чай или вино без телефонов и ноутбуков, глядя друг другу в глаза и делясь 3 благодарностями за неделю.',
    category: 'intimacy',
    week: 34,
    partner1Completed: false,
    partner2Completed: false,
    rewardPoints: 50,
  },
  {
    id: 'ch-2',
    title: 'Практика «Мягкого старта» по Готтману',
    description: 'Если возникнет просьба или недовольство, начните фразу со слов: «Мне важно...» или «Я чувствую...», избегая обвинительного «Ты всегда...».',
    category: 'gottman',
    week: 34,
    partner1Completed: false,
    partner2Completed: false,
    rewardPoints: 75,
  },
  {
    id: 'ch-3',
    title: 'Микро-сюрприз на языке любви партнёра',
    description: 'Сделайте маленькое действие, которое попадает в главный язык любви вашего партнёра (записка с комплиментом или неожиданный кофе).',
    category: 'communication',
    week: 33,
    partner1Completed: false,
    partner2Completed: false,
    rewardPoints: 50,
  },
];

export const initialTests: TestCategory[] = [
  // S1: Стили привязанности
  {
    id: 'TEST-S1',
    slug: 'attachment-style',
    title: 'Стили привязанности (ECR)',
    subtitle: 'Как вы строите близость и реагируете на дистанцию',
    methodology: 'scientific',
    categoryKey: 'attachment',
    levelRequired: 1,
    estimatedMinutes: 5,
    questionsCount: 6,
    description: 'Определяет тип привязанности каждого партнёра (надёжный, тревожный, избегающий) по теории Джона Боулби. Выявляет триггеры дистанции и потребности в безопасности.',
    scientificBasis: 'Методика Experiences in Close Relationships (ECR-R) & Теория Боулби',
    iconName: 'ShieldHeart',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-s1-1',
        text: 'Когда мой партнёр погружён в свои дела или эмоционально отдаляется, я начинаю беспокоиться о наших отношениях.',
        type: 'scale',
        options: [
          { label: 'Совсем не про меня', value: 1, categoryScores: { anxiety: 1 } },
          { label: 'Редко', value: 2, categoryScores: { anxiety: 2 } },
          { label: 'Иногда', value: 3, categoryScores: { anxiety: 3 } },
          { label: 'Часто', value: 4, categoryScores: { anxiety: 4 } },
          { label: 'Абсолютно точно', value: 5, categoryScores: { anxiety: 5 } },
        ],
      },
      {
        id: 'q-s1-2',
        text: 'Мне легко и комфортно открываться партнёру и просить о помощи или поддержке в уязвимые моменты.',
        type: 'scale',
        options: [
          { label: 'Очень сложно', value: 1, categoryScores: { security: 1, avoidance: 5 } },
          { label: 'Скорее сложно', value: 2, categoryScores: { security: 2, avoidance: 4 } },
          { label: 'Нейтрально', value: 3, categoryScores: { security: 3, avoidance: 3 } },
          { label: 'Легко', value: 4, categoryScores: { security: 4, avoidance: 2 } },
          { label: 'Очень легко', value: 5, categoryScores: { security: 5, avoidance: 1 } },
        ],
      },
      {
        id: 'q-s1-3',
        text: 'Во время спора или эмоционального напряжения мне хочется побыть одному в тишине, чтобы восстановиться.',
        type: 'scale',
        options: [
          { label: 'Нет, хочу сразу всё выяснить', value: 1, categoryScores: { anxiety: 4, avoidance: 1 } },
          { label: 'Скорее выяснить', value: 2, categoryScores: { anxiety: 3, avoidance: 2 } },
          { label: 'Зависит от ситуации', value: 3, categoryScores: { security: 4 } },
          { label: 'Да, нужна пауза', value: 4, categoryScores: { avoidance: 4 } },
          { label: 'Всегда закрываюсь', value: 5, categoryScores: { avoidance: 5 } },
        ],
      },
      {
        id: 'q-s1-4',
        text: 'Я уверен(а), что мой партнёр ценит меня и останется рядом, даже если у нас случаются разногласия.',
        type: 'scale',
        options: [
          { label: 'Постоянно сомневаюсь', value: 1, categoryScores: { security: 1, anxiety: 5 } },
          { label: 'Иногда сомневаюсь', value: 2, categoryScores: { security: 2, anxiety: 3 } },
          { label: 'В целом верю', value: 4, categoryScores: { security: 4 } },
          { label: 'Полная уверенность', value: 5, categoryScores: { security: 5 } },
        ],
      },
      {
        id: 'q-s1-5',
        text: 'Если партнёр проявляет чрезмерную заботу или настойчивость, я чувствую лёгкое давление на личную свободу.',
        type: 'scale',
        options: [
          { label: 'Никогда, обожаю заботу', value: 1, categoryScores: { avoidance: 1 } },
          { label: 'Редко', value: 2, categoryScores: { avoidance: 2 } },
          { label: 'Иногда бывает', value: 3, categoryScores: { avoidance: 3 } },
          { label: 'Да, ценю автономию', value: 5, categoryScores: { avoidance: 5 } },
        ],
      },
      {
        id: 'q-s1-6',
        text: 'Что для вас главное условие спокойствия в паре?',
        type: 'single',
        options: [
          { label: 'Знать, что мы на связи и в согласии', value: 'connection', categoryScores: { intimacy: 5 } },
          { label: 'Иметь личное время и свободу без обид', value: 'space', categoryScores: { boundaries: 5 } },
          { label: 'Понятные совместные планы на будущее', value: 'predictability', categoryScores: { future: 5 } },
          { label: 'Тёплая тактильность и ласковые слова', value: 'touch', categoryScores: { intimacy: 5 } },
        ],
      },
    ],
  },

  // S2: Пять языков любви
  {
    id: 'TEST-S2',
    slug: 'five-love-languages',
    title: 'Пять языков любви',
    subtitle: 'Как вы понимаете и дарите любовь',
    methodology: 'scientific',
    categoryKey: 'intimacy',
    levelRequired: 1,
    estimatedMinutes: 6,
    questionsCount: 5,
    description: 'Классическая диагностика по Гэри Чепмену: Слова поддержки, Качественное время, Подарки, Акты заботы, Физические прикосновения.',
    scientificBasis: 'Концепция пяти языков любви Гэри Чепмена',
    iconName: 'HeartHandshake',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-s2-1',
        text: 'После тяжёлого рабочего дня мне приятнее всего получить от партнёра:',
        type: 'single',
        options: [
          { label: 'Тёплые слова «Ты молодец, я горжусь тобой» (Слова)', value: 'words', categoryScores: { words: 5 } },
          { label: 'Приготовленный ужин или заваренный чай (Забота)', value: 'acts', categoryScores: { acts: 5 } },
          { label: 'Крепкие долгие объятия и массаж плеч (Прикосновения)', value: 'touch', categoryScores: { touch: 5 } },
          { label: 'Возможность посидеть вместе и спокойно поговорить без гаджетов (Время)', value: 'time', categoryScores: { time: 5 } },
          { label: 'Любимое пирожное или приятный сюрприз (Подарки)', value: 'gifts', categoryScores: { gifts: 5 } },
        ],
      },
      {
        id: 'q-s2-2',
        text: 'Что ранит вас сильнее всего в поведении любимого человека?',
        type: 'single',
        options: [
          { label: 'Критика, холодные или язвительные слова', value: 'words_hurt', categoryScores: { words: 5 } },
          { label: 'Постоянное отвлечение на телефон, когда мы вместе', value: 'time_hurt', categoryScores: { time: 5 } },
          { label: 'Отказ от тактильности или дистанцирование тела', value: 'touch_hurt', categoryScores: { touch: 5 } },
          { label: 'Забытые обещания и нежелание помочь в быту', value: 'acts_hurt', categoryScores: { acts: 5 } },
          { label: 'Игнорирование важных для меня дат и праздников', value: 'gifts_hurt', categoryScores: { gifts: 5 } },
        ],
      },
      {
        id: 'q-s2-3',
        text: 'Идеальный подарок для меня — это:',
        type: 'single',
        options: [
          { label: 'Билеты на совместную поездку или концерт (Время)', value: 'time', categoryScores: { time: 5 } },
          { label: 'Вещь, которую я давно хотел(а) и о которой невзначай упомянул(а) (Подарки)', value: 'gifts', categoryScores: { gifts: 5 } },
          { label: 'Письмо или открытка с искренними чувствами (Слова)', value: 'words', categoryScores: { words: 5 } },
          { label: 'Сертификат в спа на массаж для двоих (Прикосновения)', value: 'touch', categoryScores: { touch: 5 } },
          { label: 'Помощь с ремонтом/организацией того, что у меня не получалось (Забота)', value: 'acts', categoryScores: { acts: 5 } },
        ],
      },
      {
        id: 'q-s2-4',
        text: 'Когда партнёр спонтанно берет меня за руку на улице или обнимает со спины на кухне:',
        type: 'scale',
        options: [
          { label: 'Нейтрально', value: 1, categoryScores: { touch: 1 } },
          { label: 'Приятно', value: 3, categoryScores: { touch: 3 } },
          { label: 'Чувствую прилив счастья и спокойствия', value: 5, categoryScores: { touch: 5 } },
        ],
      },
      {
        id: 'q-s2-5',
        text: 'Я чувствую себя любимым(ой), когда мой партнёр берет на себя рутинную задачу без моих просьб.',
        type: 'scale',
        options: [
          { label: 'Не имеет большого значения', value: 1, categoryScores: { acts: 1 } },
          { label: 'Иногда приятно', value: 3, categoryScores: { acts: 3 } },
          { label: 'Это высшее проявление заботы', value: 5, categoryScores: { acts: 5 } },
        ],
      },
    ],
  },

  // S3: Четыре всадника Готтмана
  {
    id: 'TEST-S3',
    slug: 'gottman-four-horsemen',
    title: 'Четыре всадника Готтмана',
    subtitle: 'Паттерны коммуникации в разногласиях',
    methodology: 'scientific',
    categoryKey: 'conflicts',
    levelRequired: 2,
    estimatedMinutes: 7,
    questionsCount: 5,
    description: 'Выявляет наличие токсичных триггеров: Критика, Презрение, Защитная позиция, Стеноуоллинг (отгораживание) по методике Института Готтмана.',
    scientificBasis: 'Исследования Джона Готтмана (Gottman Institute)',
    iconName: 'Flame',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-s3-1',
        text: 'Случается ли вам во время ссоры использовать обобщения вроде «Ты вечно забываешь...» или «Ты никогда не слушаешь...»?',
        type: 'scale',
        options: [
          { label: 'Почти никогда, говорю о конкретном случае', value: 1, categoryScores: { criticism: 1, softness: 5 } },
          { label: 'Редко, когда очень устал(а)', value: 2, categoryScores: { criticism: 2, softness: 4 } },
          { label: 'Иногда срывается', value: 3, categoryScores: { criticism: 3 } },
          { label: 'Часто, потому что наболело', value: 5, categoryScores: { criticism: 5 } },
        ],
      },
      {
        id: 'q-s3-2',
        text: 'Когда партнёр говорит, что расстроен моим поступком, моя первая автоматическая реакция:',
        type: 'single',
        options: [
          { label: 'Я сразу начинаю объяснять логику своих действий и почему поступил именно так', value: 'defensiveness', categoryScores: { defensiveness: 5 } },
          { label: 'Спрашиваю, что именно задело больше всего, даже если внутренне не согласен', value: 'responsibility', categoryScores: { responsibility: 5 } },
          { label: 'Мне нужно время побыть одному, чтобы остыть и не наговорить лишнего', value: 'stonewalling', categoryScores: { stonewalling: 5 } },
          { label: 'Стараюсь сразу сгладить напряжение и перевести ситуацию на позитив', value: 'contempt', categoryScores: { contempt: 5 } },
        ],
      },
      {
        id: 'q-s3-3',
        text: 'Если эмоции зашкаливают и пульс учащается, умеете ли вы брать тайм-аут на 20 минут без обид?',
        type: 'scale',
        options: [
          { label: 'Нет, меня затягивает спор', value: 1, categoryScores: { stonewalling: 4 } },
          { label: 'Пытаюсь, но сложно успокоиться', value: 3, categoryScores: { responsibility: 3 } },
          { label: 'Да, спокойно говорим: «Давай сделаем паузу и вернёмся»', value: 5, categoryScores: { responsibility: 5 } },
        ],
      },
      {
        id: 'q-s3-4',
        text: 'Бывает ли так, что в споре проскальзывает сарказм, закатывание глаз или насмешка?',
        type: 'scale',
        options: [
          { label: 'Категорически нет, у нас уважительный тон', value: 1, categoryScores: { contempt: 1, respect: 5 } },
          { label: 'Крайне редко в состоянии крайнего стресса', value: 2, categoryScores: { contempt: 2 } },
          { label: 'Иногда случается сарказм', value: 4, categoryScores: { contempt: 4 } },
        ],
      },
      {
        id: 'q-s3-5',
        text: 'Насколько легко вам сказать искреннее «Прости, я был(а) не прав(а)» после эмоционального спора?',
        type: 'scale',
        options: [
          { label: 'Очень тяжело, мешает гордость', value: 1, categoryScores: { defensiveness: 4 } },
          { label: 'Требуется время, чтобы остыть', value: 3, categoryScores: { responsibility: 3 } },
          { label: 'Легко, потому что отношения важнее правоты', value: 5, categoryScores: { responsibility: 5, respect: 5 } },
        ],
      },
    ],
  },

  // C1: Наш идеальный день (Креативный)
  {
    id: 'TEST-C1',
    slug: 'ideal-day',
    title: 'Наш идеальный день',
    subtitle: 'Синхронизация биоритмов, отдыха и желаний',
    methodology: 'creative',
    categoryKey: 'lifestyle',
    levelRequired: 2,
    estimatedMinutes: 4,
    questionsCount: 4,
    description: 'Партнёры моделируют идеальный совместный выходной: пробуждение, тип завтрака, дневная активность и атмосфера вечера.',
    scientificBasis: 'Lifestyle Compatibility Framework',
    iconName: 'Sparkles',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-c1-1',
        text: 'Идеальное утро субботы:',
        type: 'single',
        options: [
          { label: 'Проснуться в 08:30, пробежка или йога, бодрый кофе', value: 'active', categoryScores: { energetic: 5 } },
          { label: 'Валяться в кровати до 11:00, обниматься и никуда не спешить', value: 'cozy', categoryScores: { cozy: 5 } },
          { label: 'Сразу собраться и поехать завтракать в красивое городское кафе', value: 'gastro', categoryScores: { social: 5 } },
          { label: 'Завтрак на террасе за городом под пение птиц', value: 'nature', categoryScores: { nature: 5 } },
        ],
      },
      {
        id: 'q-c1-2',
        text: 'Дневное совместное занятие мечты:',
        type: 'single',
        options: [
          { label: 'Прогулка по выставкам, книжным лавкам и тайным улочкам', value: 'culture', categoryScores: { culture: 5 } },
          { label: 'Поездка на велосипедах или хайкинг на природе', value: 'sport', categoryScores: { nature: 5 } },
          { label: 'Домашний кулинарный эксперимент и просмотр любимого сериала', value: 'home', categoryScores: { cozy: 5 } },
          { label: 'Шопинг, спа или поход в классное атмосферное место', value: 'wellness', categoryScores: { social: 5 } },
        ],
      },
      {
        id: 'q-c1-3',
        text: 'Идеальное завершение дня:',
        type: 'single',
        options: [
          { label: 'Ужин при свечах с бокалом вина и разговорами по душам', value: 'romantic', categoryScores: { intimacy: 5 } },
          { label: 'Встреча с общими друзьями или настольные игры', value: 'friends', categoryScores: { social: 5 } },
          { label: 'Совместная ванна с пеной и полный релакс под тихую музыку', value: 'relax', categoryScores: { intimacy: 5 } },
        ],
      },
      {
        id: 'q-c1-4',
        text: 'Какое соотношение времени «вместе» и «наедине с собой» для вас идеально в выходные?',
        type: 'single',
        options: [
          { label: '90% вместе — обожаю каждую минуту вдвоём', value: 'all_together', categoryScores: { closeness: 5 } },
          { label: '70% вместе, 30% на свои хобби/чтение (золотая середина)', value: 'balanced', categoryScores: { balance: 5 } },
          { label: '50% вместе, 50% автономии для перезагрузки', value: 'independent', categoryScores: { autonomy: 5 } },
        ],
      },
    ],
  },

  // S4: Треугольник любви Стернберга
  {
    id: 'TEST-S4',
    slug: 'sternberg-love-triangle',
    title: 'Треугольник любви Стернберга',
    subtitle: 'Баланс страсти, эмоциональной близости и обязательств',
    methodology: 'scientific',
    categoryKey: 'intimacy',
    levelRequired: 3,
    estimatedMinutes: 5,
    questionsCount: 4,
    description: 'Определяет пропорции трёх фундаментальных компонентов любви по Роберту Стернбергу.',
    scientificBasis: 'Triangular Theory of Love (Robert Sternberg)',
    iconName: 'Compass',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-s4-1',
        text: 'Я чувствую глубокую душевную связь и могу доверить партнёру любые тайны.',
        type: 'scale',
        options: [
          { label: '1 - Редко', value: 1 },
          { label: '2', value: 2 },
          { label: '3 - Умеренно', value: 3 },
          { label: '4', value: 4 },
          { label: '5 - Абсолютно', value: 5 },
        ],
      },
      {
        id: 'q-s4-2',
        text: 'Между нами сохраняется сильное физическое притяжение и романтический трепет.',
        type: 'scale',
        options: [
          { label: '1 - Угасло', value: 1 },
          { label: '2', value: 2 },
          { label: '3 - Волнообразно', value: 3 },
          { label: '4', value: 4 },
          { label: '5 - Очень ярко', value: 5 },
        ],
      },
      {
        id: 'q-s4-3',
        text: 'Я твердо намерен(а) преодолевать любые трудности и строить совместное будущее.',
        type: 'scale',
        options: [
          { label: '1 - Не уверен(а)', value: 1 },
          { label: '2', value: 2 },
          { label: '3 - Скорее да', value: 3 },
          { label: '4', value: 4 },
          { label: '5 - Полная решимость', value: 5 },
        ],
      },
      {
        id: 'q-s4-4',
        text: 'Какой компонент сейчас требует наибольшего внимания и бережной подпитки в вашей паре?',
        type: 'single',
        options: [
          { label: 'Страсть и новизна впечатлений', value: 'passion' },
          { label: 'Глубокие душевные разговоры без спешки', value: 'intimacy' },
          { label: 'Четкие совместные цели и договоренности', value: 'commitment' },
        ],
      },
    ],
  },

  // D1: Семейные сценарии
  {
    id: 'TEST-D1',
    slug: 'family-scripts',
    title: 'Семейные сценарии и роли',
    subtitle: 'Установки из детства и родительские модели отношений',
    methodology: 'deep',
    categoryKey: 'values',
    levelRequired: 4,
    estimatedMinutes: 8,
    questionsCount: 4,
    description: 'Исследует привычки выражения эмоций, распределения ролей и решения конфликтов, унаследованные из родительских семей.',
    scientificBasis: 'Семейная системная психотерапия (Боуэн, Сатир)',
    iconName: 'GitBranch',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-d1-1',
        text: 'Как в вашей родительской семье обычно выражались гнев и обида?',
        type: 'single',
        options: [
          { label: 'Бурно, с повышенными тонами, но быстро остывали', value: 'expressive' },
          { label: 'Молчанием, холодным игнорированием и обидами днями', value: 'silent' },
          { label: 'Спокойным обсуждением причин за столом', value: 'calm' },
          { label: 'Эмоции подавлялись, делали вид, что всё отлично', value: 'suppressed' },
        ],
      },
      {
        id: 'q-d1-2',
        text: 'Какая финансовая модель была привычна у ваших родителей?',
        type: 'single',
        options: [
          { label: 'Общий общий котёл, все траты согласовывались', value: 'common' },
          { label: 'Один партнёр полностью управлял бюджетом', value: 'one_leader' },
          { label: 'Раздельные кошельки и личная финансовая автономия', value: 'split' },
          { label: 'Постоянная экономия из страха перед неизвестностью', value: 'scarcity' },
        ],
      },
      {
        id: 'q-d1-3',
        text: 'Замечаете ли вы, что в стрессе копируете поведение одного из родителей?',
        type: 'scale',
        options: [
          { label: 'Никогда, осознанно делаю иначе', value: 1 },
          { label: 'Иногда с удивлением ловлю себя на этом', value: 3 },
          { label: 'Часто повторяю похожие фразы или реакции', value: 5 },
        ],
      },
      {
        id: 'q-d1-4',
        text: 'Какую главную ценность из родительской семьи вы хотите сохранить в вашей паре?',
        type: 'single',
        options: [
          { label: 'Традиции совместных ужинов и праздников', value: 'traditions' },
          { label: 'Взаимную поддержку в карьере и начинаниях', value: 'support' },
          { label: 'Безусловное уважение к личному пространству', value: 'respect' },
          { label: 'Чувство юмора и легкость в быту', value: 'humor' },
        ],
      },
    ],
  },

  // D2: Стили разрешения конфликтов (Томас-Килманн)
  {
    id: 'TEST-D2',
    slug: 'conflict-resolution-styles',
    title: 'Стили разрешения конфликтов',
    subtitle: 'Как вы ведёте себя в острых ситуациях',
    methodology: 'deep',
    categoryKey: 'conflicts',
    levelRequired: 3,
    estimatedMinutes: 6,
    questionsCount: 5,
    description: 'Определяет вашу стратегию в конфликте: соперничество, сотрудничество, компромисс, избегание или приспособление. Помогает понять, почему некоторые споры заходят в тупик.',
    scientificBasis: 'Инструмент Томаса-Килманна (TKI)',
    iconName: 'Swords',
    partner1Done: false,
    partner2Done: false,
    questions: [
      {
        id: 'q-d2-1',
        text: 'Когда возникает острое разногласие, моя первая реакция:',
        type: 'single',
        options: [
          { label: 'Достаточно долго отстаиваю свою позицию, если уверен(а) в её логике', value: 'competing', categoryScores: { assertiveness: 5, cooperativeness: 1 } },
          { label: 'Стараюсь досконально обсудить ситуацию, чтобы найти решение, устраивающее нас обоих на 100%', value: 'collaborating', categoryScores: { assertiveness: 5, cooperativeness: 5 } },
          { label: 'Предлагаю найти золотую середину, чтобы каждый немного уступил и мы могли закрыть вопрос', value: 'compromising', categoryScores: { assertiveness: 3, cooperativeness: 3 } },
          { label: 'Стараюсь перевести тему, отшутиться или отложить сложный разговор на потом', value: 'avoiding', categoryScores: { assertiveness: 1, cooperativeness: 1 } },
          { label: 'Чаще всего соглашаюсь с мнением партнёра, чтобы не накалять обстановку и сохранить мир', value: 'accommodating', categoryScores: { assertiveness: 1, cooperativeness: 5 } },
        ],
      },
      {
        id: 'q-d2-2',
        text: 'Насколько для вас важно, чтобы последнее слово осталось за вами?',
        type: 'scale',
        options: [
          { label: 'Совсем не важно, важен мир', value: 1, categoryScores: { accommodating: 5 } },
          { label: 'Бывает важно, если я 100% прав', value: 3, categoryScores: { compromising: 3 } },
          { label: 'Очень важно, я тяжело переношу поражение', value: 5, categoryScores: { competing: 5 } },
        ],
      },
      {
        id: 'q-d2-3',
        text: 'Если партнёр предлагает решение, которое вам не нравится, но вы очень устали:',
        type: 'single',
        options: [
          { label: 'Всё равно буду спорить до конца', value: 'competing', categoryScores: { assertiveness: 5 } },
          { label: 'Предложу отложить разговор на завтра', value: 'avoiding', categoryScores: { cooperativeness: 2 } },
          { label: 'Соглашусь сейчас, но потом могу припомнить', value: 'accommodating', categoryScores: { cooperativeness: 4 } },
          { label: 'Предложу быстрый компромисс: «Давай сделаем наполовину по-твоему»', value: 'compromising', categoryScores: { assertiveness: 3, cooperativeness: 3 } },
        ],
      },
      {
        id: 'q-d2-4',
        text: 'Как вы относитесь к скрытому напряжению в паре (когда проблема есть, но не обсуждается)?',
        type: 'scale',
        options: [
          { label: 'Не выношу, нужно срочно всё выяснить', value: 1, categoryScores: { assertiveness: 5 } },
          { label: 'Могу терпеть какое-то время, обдумывая', value: 3, categoryScores: { avoidance: 3 } },
          { label: 'Предпочитаю не трогать, вдруг само пройдёт', value: 5, categoryScores: { avoidance: 5 } },
        ],
      },
      {
        id: 'q-d2-5',
        text: 'В идеальном конфликте партнёры должны:',
        type: 'single',
        options: [
          { label: 'Быть логичными и опираться только на факты', value: 'logic', categoryScores: { competing: 3, collaborating: 3 } },
          { label: 'В первую очередь заботиться о чувствах друг друга', value: 'feelings', categoryScores: { accommodating: 4, collaborating: 4 } },
          { label: 'Уметь вовремя остановиться и пойти на взаимные уступки', value: 'compromise', categoryScores: { compromising: 5 } },
        ],
      },
    ],
  },
];

export const initialSmallCravings: SmallCraving[] = [];

export const initialFlowerPreferences: Record<string, FlowerPreference> = {
  partner1: {
    favoriteFlowers: [],
    dislikedFlowers: [],
    colorPreferences: [],
    careNotes: '',
    idealBouquetDescription: '',
  },
  partner2: {
    favoriteFlowers: [],
    dislikedFlowers: [],
    colorPreferences: [],
    careNotes: '',
    idealBouquetDescription: '',
  },
};

export const initialWishlist: WishlistItem[] = [];

export const initialVenues: Venue[] = [];

export const initialDateInvites: DateInvite[] = [];

export const initialMoodHistory: MoodHistoryItem[] = [];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-1',
    code: 'ACH-01',
    title: '«Первый шаг»',
    description: 'Оба партнёра успешно завершили свой первый тест совместимости.',
    icon: 'Sparkles',
    unlocked: false,
  },
  {
    id: 'ach-2',
    code: 'ACH-02',
    title: '«Синхронизация»',
    description: 'Совпадение взглядов ≥ 80% в тесте жизненных ценностей и идеального дня.',
    icon: 'Zap',
    unlocked: false,
  },
  {
    id: 'ach-3',
    code: 'ACH-03',
    title: '«Антидот Готтмана»',
    description: 'Успешное применение техники мягкого старта при решении спорного вопроса.',
    icon: 'ShieldCheck',
    unlocked: false,
  },
  {
    id: 'ach-4',
    code: 'ACH-04',
    title: '«Коллекционер глубин»',
    description: 'Пройдено более 5 психологических опросников разной глубины.',
    icon: 'Award',
    unlocked: false,
  },
  {
    id: 'ach-5',
    code: 'ACH-05',
    title: '«Хранители заботы»',
    description: 'Исполнено 10 маленьких желаний и хотелок любимого человека.',
    icon: 'Heart',
    unlocked: false,
  },
  {
    id: 'ach-6',
    code: 'ACH-06',
    title: '«Идеальное свидание»',
    description: 'Запланировано и проведено 5 свиданий через встроенный визард.',
    icon: 'MapPin',
    unlocked: false,
  },
];
