import { useState } from 'react';
import { TimeCapsule, DailyCoupleQuiz, DeepTalkCard, PartnerId, CoupleProfile, UserAccount } from '../../types.ts';
import { DAILY_QUIZ_QUESTIONS, DEEP_TALK_CARDS } from '../../data/gamificationData.ts';
import { safeGetStorage, safeSetStorage } from '../../utils/safeStorage.ts';

export interface FeedItem {
  id: string;
  author: PartnerId | 'system';
  type: 'sparkle' | 'heart' | 'pin' | 'flame' | 'test' | 'photo';
  title: string;
  subtitle: string;
  timeAgo: string;
  icon?: string;
  imageUrl?: string;
}

export interface UseCoupleDailyProps {
  currentUser: UserAccount | null;
  coupleProfile: CoupleProfile;
  currentPartnerId: PartnerId;
  triggerConfetti: () => void;
}

export interface UseCoupleDailyReturn {
  timeCapsules: TimeCapsule[];
  setTimeCapsules: React.Dispatch<React.SetStateAction<TimeCapsule[]>>;
  addTimeCapsule: (title: string, content: string, unlockDate: string, category: TimeCapsule['category']) => void;
  openTimeCapsule: (id: string) => void;
  dailyQuiz: DailyCoupleQuiz;
  setDailyQuiz: React.Dispatch<React.SetStateAction<DailyCoupleQuiz>>;
  submitDailyQuizAnswer: (choice: 'me' | 'partner' | 'both') => void;
  deepCards: DeepTalkCard[];
  questionAnswer: string | null;
  setQuestionAnswer: React.Dispatch<React.SetStateAction<string | null>>;
  answerQuestionOfDay: (ans: string) => void;
  feedItems: FeedItem[];
  setFeedItems: React.Dispatch<React.SetStateAction<FeedItem[]>>;
  addFeedItem: (item: Omit<FeedItem, 'id' | 'timeAgo'>) => void;
  clearFeed: () => void;
}

export function useCoupleDaily({
  currentUser,
  coupleProfile,
  currentPartnerId,
  triggerConfetti,
}: UseCoupleDailyProps): UseCoupleDailyReturn {
  const [timeCapsules, setTimeCapsules] = useState<TimeCapsule[]>(() => {
    return safeGetStorage('together_time_capsules', [
      {
        id: 'tc-initial-1',
        title: 'Наше секретное обещание на годовщину',
        content: 'Никогда не ложиться спать обиженными и каждый месяц устраивать хотя бы одно свидание-сюрприз!',
        authorLogin: 'dmitry',
        authorName: 'Дмитрий',
        unlockDate: '2026-12-31',
        isOpened: false,
        category: 'promise',
        createdAt: new Date().toISOString(),
      },
    ]);
  });

  const [dailyQuiz, setDailyQuiz] = useState<DailyCoupleQuiz>(() => {
    const defaultQ = DAILY_QUIZ_QUESTIONS[0];
    const saved = safeGetStorage<Partial<DailyCoupleQuiz> | null>('together_daily_quiz', null);
    if (!saved) {
      return {
        id: defaultQ.id,
        question: defaultQ.question,
        options: [
          { key: 'me', label: 'Я' },
          { key: 'partner', label: 'Партнёр' },
          { key: 'both', label: 'Оба одинаково' },
        ],
        category: defaultQ.category,
      };
    }
    return {
      id: saved.id || defaultQ.id,
      question: saved.question || defaultQ.question,
      options:
        saved.options && saved.options.length > 0
          ? saved.options
          : [
              { key: 'me', label: 'Я' },
              { key: 'partner', label: 'Партнёр' },
              { key: 'both', label: 'Оба одинаково' },
            ],
      category: saved.category || defaultQ.category,
      partner1Answer: saved.partner1Answer,
      partner2Answer: saved.partner2Answer,
      isMatch: saved.isMatch,
    };
  });

  const deepCards = DEEP_TALK_CARDS;

  const [questionAnswer, setQuestionAnswer] = useState<string | null>(() => {
    return safeGetStorage('together_q_answer', null);
  });

  const [feedItems, setFeedItems] = useState<FeedItem[]>(() => {
    const feed = safeGetStorage<FeedItem[]>('together_feed', []);
    return feed.filter(
      (item) =>
        item.id !== 'f1' &&
        item.id !== 'f2' &&
        item.id !== 'f3' &&
        !item.title.includes('Добро пожаловать') &&
        !item.subtitle?.includes('Серия ответов 12 дней')
    );
  });

  const addFeedItem = (item: Omit<FeedItem, 'id' | 'timeAgo'>) => {
    const newItem: FeedItem = {
      ...item,
      id: 'feed-' + Date.now(),
      timeAgo: 'только что',
    };
    setFeedItems((prev) => {
      const updated = [newItem, ...prev.slice(0, 19)];
      safeSetStorage('together_feed', updated);
      return updated;
    });
  };

  const clearFeed = () => {
    setFeedItems([]);
    safeSetStorage('together_feed', []);
  };

  const answerQuestionOfDay = (ans: string) => {
    setQuestionAnswer(ans);
    safeSetStorage('together_q_answer', ans);
    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `${
        currentPartnerId === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name
      } ответил(а) на вопрос дня`,
      subtitle: ans.length > 40 ? ans.slice(0, 40) + '...' : ans,
    });
  };

  const addTimeCapsule = (title: string, content: string, unlockDate: string, category: TimeCapsule['category']) => {
    const senderName =
      currentUser?.name || (currentPartnerId === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name);
    const senderLogin = currentUser?.login || (currentPartnerId === 'partner1' ? 'partner1' : 'partner2');

    const newCapsule: TimeCapsule = {
      id: `tc-${Date.now()}`,
      title,
      content,
      authorLogin: senderLogin,
      authorName: senderName,
      unlockDate,
      isOpened: false,
      category,
      createdAt: new Date().toISOString(),
    };

    setTimeCapsules((prev) => {
      const updated = [newCapsule, ...prev];
      safeSetStorage('together_time_capsules', updated);
      return updated;
    });

    addFeedItem({
      author: currentPartnerId,
      type: 'sparkle',
      title: `${senderName} запечатал(а) Капсулу Времени`,
      subtitle: `«${title}» — откроется ${unlockDate}`,
    });

    triggerConfetti();
  };

  const openTimeCapsule = (id: string) => {
    setTimeCapsules((prev) => {
      const updated = prev.map((c) =>
        c.id === id ? { ...c, isOpened: true, openedAt: new Date().toISOString() } : c
      );
      safeSetStorage('together_time_capsules', updated);
      return updated;
    });
    triggerConfetti();
  };

  const submitDailyQuizAnswer = (choice: 'me' | 'partner' | 'both') => {
    const isPartner1 = currentPartnerId === 'partner1';
    setDailyQuiz((prev) => {
      const p1 = isPartner1 ? choice : prev.partner1Answer;
      const p2 = !isPartner1 ? choice : prev.partner2Answer;

      let isMatch = false;
      if (p1 && p2) {
        if (p1 === 'both' && p2 === 'both') isMatch = true;
        else if (p1 === 'me' && p2 === 'partner') isMatch = true;
        else if (p1 === 'partner' && p2 === 'me') isMatch = true;
      }

      const updated: DailyCoupleQuiz = {
        ...prev,
        partner1Answer: p1,
        partner2Answer: p2,
        isMatch,
      };

      safeSetStorage('together_daily_quiz', updated);
      return updated;
    });

    addFeedItem({
      author: currentPartnerId,
      type: 'sparkle',
      title: `Ответ в игре «Кто из нас...»`,
      subtitle: `Вопрос: ${dailyQuiz.question}`,
    });
    triggerConfetti();
  };

  return {
    timeCapsules,
    setTimeCapsules,
    addTimeCapsule,
    openTimeCapsule,
    dailyQuiz,
    setDailyQuiz,
    submitDailyQuizAnswer,
    deepCards,
    questionAnswer,
    setQuestionAnswer,
    answerQuestionOfDay,
    feedItems,
    setFeedItems,
    addFeedItem,
    clearFeed,
  };
}
