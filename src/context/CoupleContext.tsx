import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  PartnerId,
  CoupleProfile,
  PulseEntry,
  Challenge,
  TestCategory,
  SmallCraving,
  FlowerPreference,
  WishlistItem,
  Venue,
  DateInvite,
  DateReview,
  XPEntry,
  MoodHistoryItem,
  AIMessage,
  Achievement,
  AppTheme,
  AppFont,
  AppScreen,
  UsSubTab,
  DatesSubTab,
  OwlMode,
  UserAccount,
  PairRequest,
  NavigationTab,
  LoveTap,
  TimeCapsule,
  DailyCoupleQuiz,
  DeepTalkCard, ChatMessage,
} from '../types';
import {
  initialCoupleProfile,
  initialPulseHistory,
  initialChallenges,
  initialTests,
  initialSmallCravings,
  initialFlowerPreferences,
  initialWishlist,
  initialVenues,
  initialDateInvites,
  initialMoodHistory,
  initialAchievements,
  createFreshCoupleProfile,
  getFreshTests,
  getFreshChallenges,
} from '../data/mockData';
import {
  DATE_WHEEL_OPTIONS,
  DEEP_TALK_CARDS,
  DAILY_QUIZ_QUESTIONS,
} from '../data/gamificationData';
import { safeGetStorage, safeSetStorage } from '../utils/safeStorage';
import { getCoupleLevelInfo } from '../utils/rankingEngine';
import { dispatchInAppNotification, playNotificationSound, triggerSystemPush } from '../utils/pushManager';

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

interface CoupleContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  font: AppFont;
  setFont: (f: AppFont) => void;
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  // Auth & Account
  currentUser: UserAccount | null;
  accountsDb: Record<string, UserAccount & { password?: string }>;
  allUsers: UserAccount[];
  authLogin: (login: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  authRegister: (login: string, pass: string, name?: string, gender?: 'male' | 'female', avatarEmoji?: string) => Promise<{ success: boolean; error?: string }>;
  authResetPassword: (login: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  authLogout: () => void;
  switchAccount: (login: string) => void;
  updateUserProfile: (fields: Partial<UserAccount>) => Promise<void>;
  updateCoupleStartDate: (date: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  // Pairing by Login
  incomingRequests: PairRequest[];
  outgoingRequests: PairRequest[];
  sendPairRequestByLogin: (targetLogin: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  acceptPairRequest: (partnerLogin: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  rejectPairRequest: (partnerLogin: string) => Promise<void>;
  disconnectPair: () => Promise<void>;
  // Legacy / Direct helpers
  createNewCouple: (partner1Name: string, partner2Name: string, startDate?: string) => void;
  joinCoupleByCode: (linkCode: string, myName: string) => void;
  loadDemoCouple: () => void;
  resetCoupleData: () => void;
  updatePartnerNames: (p1Name: string, p2Name: string, startDate: string) => void;
  // Tab Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  usSubTab: UsSubTab;
  setUsSubTab: (t: UsSubTab) => void;
  datesSubTab: DatesSubTab;
  setDatesSubTab: (t: DatesSubTab) => void;
  owlMode: OwlMode;
  setOwlMode: (m: OwlMode) => void;
  // Gamification & Features
  loveTaps: LoveTap[];
  sendLoveTap: (tapType: LoveTap['tapType'], customNote?: string) => void;
  timeCapsules: TimeCapsule[];
  addTimeCapsule: (title: string, content: string, unlockDate: string, category: TimeCapsule['category']) => void;
  openTimeCapsule: (id: string) => void;
  dailyQuiz: DailyCoupleQuiz;
  submitDailyQuizAnswer: (choice: 'me' | 'partner' | 'both') => void;
  deepCards: DeepTalkCard[];
  questionAnswer: string | null;
  answerQuestionOfDay: (ans: string) => void;
  feedItems: FeedItem[];
  addFeedItem: (item: Omit<FeedItem, 'id' | 'timeAgo'>) => void;
  clearFeed: () => void;
  currentPartnerId: PartnerId;
  setCurrentPartnerId: (id: PartnerId) => void;
  coupleProfile: CoupleProfile;
  updateCoupleProfile: (updates: Partial<CoupleProfile>) => void;
  pulseHistory: PulseEntry[];
  addPulseCheckin: (closeness: number, constructiveness: number, comment: string) => void;
  challenges: Challenge[];
  toggleChallenge: (id: string) => void;
  tests: TestCategory[];
  submitTestAnswers: (testId: string, answers: Record<string, any>) => void;
  smallCravings: SmallCraving[];
  addCraving: (title: string, category: SmallCraving['category']) => void;
  toggleCraving: (id: string) => void;
  flowerPreferences: Record<string, FlowerPreference>;
  updateFlowerPreferences: (partnerId: PartnerId, prefs: Partial<FlowerPreference>) => void;
  wishlist: WishlistItem[];
  addWishlistItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'addedBy' | 'isSecretReserved'>) => void;
  toggleSecretReserve: (id: string) => void;
  deleteWishlistItem: (id: string) => void;
  venues: Venue[];
  addVenue: (venue: Omit<Venue, 'id' | 'createdAt' | 'addedBy'>) => void;
  deleteVenue: (id: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  dateInvites: DateInvite[];
  createDateInvite: (note: string, venueId?: string, locationName?: string, chosenDate?: string, chosenTime?: string) => void;
  acceptDateInvite: (inviteId: string, date: string, time: string, location: string, link?: string, saveToVenues?: boolean) => void;
  completeAndReviewDate: (inviteId: string, rating: number, impressions: string, photos: string[]) => void;
  confirmDatePlan: (inviteId: string, location: string, dateStr: string) => void;
  coupleXP: number;
  xpHistory: XPEntry[];
  addCoupleXP: (points: number, reason: string, category?: XPEntry['category']) => void;
  coupleLevelInfo: ReturnType<typeof getCoupleLevelInfo>;
  moodHistory: MoodHistoryItem[];
  addMoodStatus: (emoji: string, label: string, severity: number, note?: string) => void;
  aiMessages: AIMessage[];
  sendAIMessage: (text: string) => Promise<void>;
  partnerMessages: ChatMessage[];
  sendPartnerMessage: (text: string, isAi?: boolean) => Promise<void>;
  isAITyping: boolean;
  unreadChatCount: number;
  clearUnreadChatCount: () => void;
  achievements: Achievement[];
  triggerConfetti: () => void;
  daysTogether: number;
  formattedTimeTogether: string;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

export const CoupleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPartnerId, setCurrentPartnerId] = useState<PartnerId>('partner1');

  const [theme, setThemeState] = useState<AppTheme>(() => {
    return safeGetStorage('together_theme', 'aurora');
  });

  const [font, setFontState] = useState<AppFont>(() => {
    return safeGetStorage('together_font', 'inter');
  });

  const [screen, setScreenState] = useState<AppScreen>(() => {
    return safeGetStorage('together_screen', 'app');
  });

  const [activeTab, setActiveTabState] = useState<NavigationTab>(() => {
    return safeGetStorage('together_active_tab', 'home');
  });

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState(tab);
    safeSetStorage('together_active_tab', tab);
  };

  const [usSubTab, setUsSubTab] = useState<UsSubTab>('passport');
  const [datesSubTab, setDatesSubTab] = useState<DatesSubTab>('wheel');
  const [owlMode, setOwlMode] = useState<OwlMode>('solo');

  // Gamification: Love Taps
  const [loveTaps, setLoveTaps] = useState<LoveTap[]>(() => {
    return safeGetStorage('together_love_taps', []);
  });

  // Gamification: Time Capsules
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

  // Gamification: Daily Couple Quiz
  const [dailyQuizIndex, setDailyQuizIndex] = useState<number>(0);
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
      options: saved.options && saved.options.length > 0 ? saved.options : [
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

  const initialFeed: FeedItem[] = [];

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

  const clearFeed = () => {
    setFeedItems([]);
    safeSetStorage('together_feed', []);
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    safeSetStorage('together_theme', t);
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', t);
        document.documentElement.classList.toggle('dark', t === 'night');
      }
    } catch {
      // safe
    }
  };

  const setFont = (f: AppFont) => {
    setFontState(f);
    safeSetStorage('together_font', f);
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-font', f);
        document.body.setAttribute('data-font', f);
      }
    } catch {
      // safe
    }
  };

  const setScreen = (s: AppScreen) => {
    setScreenState(s);
    safeSetStorage('together_screen', s);
  };

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'night');
      }
    } catch {
      // safe
    }
  }, [theme]);

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-font', font);
        document.body.setAttribute('data-font', font);
      }
    } catch {
      // safe
    }
  }, [font]);

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

  const answerQuestionOfDay = (ans: string) => {
    setQuestionAnswer(ans);
    safeSetStorage('together_q_answer', ans);
    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `${currentPartnerId === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name} ответил(а) на вопрос дня`,
      subtitle: ans.length > 40 ? ans.slice(0, 40) + '...' : ans,
    });
  };

  const defaultAccounts: Record<string, UserAccount & { password?: string }> = {};

  const [accountsDb, setAccountsDb] = useState<Record<string, UserAccount & { password?: string }>>(() => {
    const saved = safeGetStorage<Record<string, UserAccount & { password?: string }>>('together_accounts_registry', {});
    // Clean out demo accounts alex and masha
    const cleaned: Record<string, UserAccount & { password?: string }> = {};
    if (saved && typeof saved === 'object') {
      for (const [k, v] of Object.entries(saved)) {
        if (k !== 'alex' && k !== 'masha' && k !== 'ivan' && k !== 'olga' && v) {
          cleaned[k] = v;
        }
      }
    }
    return cleaned;
  });

  const [currentUser, setCurrentUserState] = useState<UserAccount | null>(() => {
    const saved = safeGetStorage<UserAccount | null>('together_current_user', null);
    if (saved && saved.login) return saved;
    return null;
  });

  const [pairRequests, setPairRequests] = useState<PairRequest[]>(() => {
    return safeGetStorage('together_pair_requests', []);
  });

  const [isOnboarded, setIsOnboardedState] = useState<boolean>(() => {
    return safeGetStorage('together_onboarded', false);
  });

  const setIsOnboarded = (val: boolean) => {
    setIsOnboardedState(val);
    safeSetStorage('together_onboarded', val);
  };

  const setCurrentUser = (user: UserAccount | null) => {
    setCurrentUserState(user);
    safeSetStorage('together_current_user', user);
    if (user) {
      setIsOnboarded(true);
    }
  };

  const allUsers = Object.values(accountsDb).map(({ password, ...u }) => u);

  const incomingRequests = pairRequests.filter(
    (r) => currentUser && r.toLogin.toLowerCase() === currentUser.login.toLowerCase() && r.status === 'PENDING'
  );

  const outgoingRequests = pairRequests.filter(
    (r) => currentUser && r.fromLogin.toLowerCase() === currentUser.login.toLowerCase() && r.status === 'PENDING'
  );

  // Sync profile when currentUser or accountsDb change
  useEffect(() => {
    if (!currentUser) return;
    const userInDb = accountsDb[currentUser.login.toLowerCase()] || currentUser;
    const partnerLogin = currentUser.partnerLogin ? currentUser.partnerLogin.toLowerCase() : (userInDb.partnerLogin ? userInDb.partnerLogin.toLowerCase() : null);
    const partnerInDb = partnerLogin ? accountsDb[partnerLogin] : null;

    setCoupleProfile((prev) => {
      return {
        ...prev,
        status: partnerLogin ? 'ACTIVE' : 'PENDING',
        startDate: userInDb.startDate || currentUser.startDate || prev.startDate,
        city: userInDb.city || currentUser.city || prev.city,
        partner1: {
          ...prev.partner1,
          id: 'partner1',
          name: userInDb.name || currentUser.name,
          login: userInDb.login || currentUser.login,
          gender: userInDb.gender || currentUser.gender,
          avatar: userInDb.avatarEmoji || currentUser.avatarEmoji || 'sparkles',
          loveLanguage: userInDb.loveLanguage || currentUser.loveLanguage || 'Пройдите тест',
          attachmentStyle: userInDb.attachmentStyle || currentUser.attachmentStyle || 'Пройдите тест',
          currentMood: userInDb.currentMood || currentUser.currentMood || prev.partner1.currentMood,
          lastActiveAt: userInDb.lastActiveAt || currentUser.lastActiveAt,
        },
        partner2: partnerInDb
          ? {
              ...prev.partner2,
              id: 'partner2',
              name: partnerInDb.name,
              login: partnerInDb.login,
              gender: partnerInDb.gender,
              avatar: partnerInDb.avatarEmoji,
              loveLanguage: partnerInDb.loveLanguage || 'Пройдите тест',
              attachmentStyle: partnerInDb.attachmentStyle || 'Пройдите тест',
              currentMood: partnerInDb.currentMood || prev.partner2.currentMood,
              lastActiveAt: partnerInDb.lastActiveAt,
            }
          : partnerLogin
          ? {
              ...prev.partner2,
              id: 'partner2',
              name: partnerLogin,
              login: partnerLogin,
              gender: undefined,
              avatar: 'sparkles',
              loveLanguage: 'Пройдите тест',
              attachmentStyle: 'Пройдите тест',
            }
          : {
              ...prev.partner2,
              id: 'partner2',
              name: 'Партнёр не подключён',
              login: '',
              avatar: 'user',
              loveLanguage: 'Ожидание',
              attachmentStyle: 'Ожидание',
            },
      };
    });
  }, [currentUser, accountsDb]);

  // Ensure non-demo accounts do not keep demo feed items
  useEffect(() => {
    if (!currentUser) return;
    const isDemo = currentUser.login.toLowerCase() === 'alex' || currentUser.login.toLowerCase() === 'masha';
    if (!isDemo) {
      setFeedItems((prev) => {
        const cleaned = prev.filter(
          (item) =>
            item.id !== 'f1' &&
            item.id !== 'f2' &&
            item.id !== 'f3' &&
            !item.title.includes('Мария') &&
            !item.title.includes('Добро пожаловать') &&
            !item.subtitle?.includes('Серия ответов 12 дней')
        );
        if (cleaned.length !== prev.length) {
          safeSetStorage('together_feed', cleaned);
          return cleaned;
        }
        return prev;
      });
    }
  }, [currentUser?.login]);

  // Global users background sync (runs even before login to keep accounts fresh)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await fetch('/api/auth/users');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.users)) {
            setAccountsDb((prev) => {
              let changed = false;
              const updated = { ...prev };
              data.users.forEach((u: UserAccount) => {
                const k = u.login.toLowerCase();
                if (!updated[k] || updated[k].name !== u.name || updated[k].avatarEmoji !== u.avatarEmoji || updated[k].partnerLogin !== u.partnerLogin) {
                  updated[k] = { ...updated[k], ...u };
                  changed = true;
                }
              });
              if (changed) {
                safeSetStorage('together_accounts_registry', updated);
                return updated;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // silent
      }
    };

    fetchAllUsers();
    const interval = setInterval(fetchAllUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Periodic background sync with server for users, pair status, and requests
  useEffect(() => {
    if (!currentUser) return;

    const syncWithServer = async () => {
      try {
        const cleanLogin = currentUser.login.toLowerCase();

        // 1. Fetch pair status and requests
        const statusRes = await fetch(`/api/pair/status/${cleanLogin}`);
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.user) {
            // Check if partner link changed on server
            if (statusData.user.partnerLogin !== currentUser.partnerLogin) {
              const prevPartner = currentUser.partnerLogin;
              setCurrentUserState(statusData.user);
              safeSetStorage('together_current_user', statusData.user);
              if (statusData.user.partnerLogin && !prevPartner) {
                dispatchInAppNotification({
                  title: 'Вы теперь в паре!',
                  body: `Вы успешно объединились с @${statusData.user.partnerLogin}`,
                  icon: 'heart',
                });
                triggerConfetti();
              }
            }
          }
          if (statusData.partner) {
            setAccountsDb((prev) => {
              const pLogin = statusData.partner.login.toLowerCase();
              if (JSON.stringify(prev[pLogin]) !== JSON.stringify(statusData.partner)) {
                const updated = { ...prev, [pLogin]: statusData.partner };
                safeSetStorage('together_accounts_registry', updated);
                return updated;
              }
              return prev;
            });
          }
          const incoming = statusData.incomingRequests || statusData.incoming || [];
          const outgoing = statusData.outgoingRequests || statusData.outgoing || [];
          const combined = [...incoming, ...outgoing];

          setPairRequests((prev) => {
            const currentPendingIds = prev.map((r) => r.id).sort().join(',');
            const newPendingIds = combined.map((r: any) => r.id).sort().join(',');

            // Check if there is a new incoming request that we haven't seen yet
            const prevIncomingIds = new Set(prev.filter((r) => r.toLogin.toLowerCase() === cleanLogin).map((r) => r.id));
            incoming.forEach((inReq: PairRequest) => {
              if (!prevIncomingIds.has(inReq.id)) {
                dispatchInAppNotification({
                  title: 'Запрос на объединение в пару',
                  body: `@${inReq.fromLogin} (${inReq.fromName}) приглашает вас стать парой в Loop`,
                  icon: 'heart',
                });
                playNotificationSound();
              }
            });

            if (currentPendingIds !== newPendingIds) {
              safeSetStorage('together_pair_requests', combined);
              return combined;
            }
            return prev;
          });
        
        // 1.5 Fetch partner messages
        if (statusData.user && statusData.user.partnerLogin) {
            const l1 = String(statusData.user.login).toLowerCase().replace(/^@/, "");
            const l2 = String(statusData.user.partnerLogin).toLowerCase().replace(/^@/, "");
            const coupleId = [l1, l2].sort().join("_");
            const msgsRes = await fetch(`/api/chat/messages/${coupleId}`);
            if (msgsRes.ok) {
              const msgsData = await msgsRes.json();
              setPartnerMessages(prev => {
                if (msgsData.messages && JSON.stringify(prev) !== JSON.stringify(msgsData.messages)) {
                    if (prev.length > 0 && msgsData.messages.length > prev.length) {
                        const lastMsg = msgsData.messages[msgsData.messages.length - 1];
                        if (lastMsg.senderLogin !== cleanLogin) {
                            dispatchInAppNotification({
                                title: lastMsg.senderLogin === 'ai' ? 'Сова' : `@${lastMsg.senderLogin}`,
                                body: lastMsg.content,
                                icon: lastMsg.senderLogin === 'ai' ? 'bot' : 'chat'
                            });
                            playNotificationSound();
                            setUnreadChatCount(c => c + 1);
                        }
                    }
                    return msgsData.messages;
                }
                return prev;
              });
            }
        }

        // 1.6 Fetch AI messages for currentUser from server
        if (cleanLogin) {
          try {
            const aiRes = await fetch(`/api/ai/messages/${cleanLogin}`);
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              if (Array.isArray(aiData.messages) && aiData.messages.length > 0) {
                setAIMessages((prev) => {
                  if (prev.length <= 1 || aiData.messages.length > prev.length) {
                    return aiData.messages;
                  }
                  return prev;
                });
              }
            }
          } catch (e) {
            // ignore network err
          }
        }
        }




        // 2. Fetch all users periodically to keep local registry fresh
        const usersRes = await fetch('/api/auth/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (Array.isArray(usersData.users)) {
            setAccountsDb((prev) => {
              let changed = false;
              const updated = { ...prev };
              usersData.users.forEach((u: UserAccount) => {
                const k = u.login.toLowerCase();
                if (!updated[k] || updated[k].name !== u.name || updated[k].avatarEmoji !== u.avatarEmoji || updated[k].partnerLogin !== u.partnerLogin) {
                  updated[k] = { ...updated[k], ...u };
                  changed = true;
                }
              });
              if (changed) {
                safeSetStorage('together_accounts_registry', updated);
                return updated;
              }
              return prev;
            });
          }
        }
      } catch (e) {
        // Safe silence for transient offline
      }
    };

    // Initial sync
    syncWithServer();

    // Polling interval every 3.5 seconds
    const interval = setInterval(syncWithServer, 3500);
    return () => clearInterval(interval);
  }, [currentUser?.login, currentUser?.partnerLogin]);

  // Auth: Register (Login + Password)
  const authRegister = async (
    login: string,
    pass: string,
    name?: string,
    gender?: 'male' | 'female',
    avatarEmoji?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanLogin = login.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = pass.trim();
    if (!cleanLogin || cleanLogin.length < 2) {
      return { success: false, error: 'Логин должен содержать минимум 2 символа' };
    }
    if (!cleanPass || cleanPass.length < 3) {
      return { success: false, error: 'Пароль должен содержать минимум 3 символа' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: cleanLogin,
          password: cleanPass,
          name: name?.trim() || cleanLogin,
          gender: gender,
          avatarEmoji: avatarEmoji || (gender === 'female' ? 'female' : gender === 'male' ? 'male' : 'user'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка при регистрации' };
      }

      const safeUser: UserAccount = data.user;
      let updatedDb = { ...accountsDb, [cleanLogin]: safeUser };
      if (data.partner) {
        updatedDb[data.partner.login.toLowerCase()] = data.partner;
      }
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      setCurrentUser(safeUser);
      setIsOnboarded(true);

      if (!data.alreadyExisted) {
        // Reset couple data to clean state for new user
        setTests(getFreshTests());
        setPulseHistory([]);
        setChallenges(getFreshChallenges());
        setSmallCravings([]);
        setWishlist([]);
        setDateInvites([]);
        setMoodHistory([]);
        setFeedItems([]);
        safeSetStorage('together_feed', []);
        setQuestionAnswer(null);
        safeSetStorage('together_q_answer', null);
        setCoupleProfile(createFreshCoupleProfile(safeUser.name, 'Партнёр не подключён', new Date().toISOString().split('T')[0], 'Москва', safeUser.gender));
        setAIMessages([
          {
            id: 'ai-init-new',
            role: 'model',
            content: `Приветствую вас, ${safeUser.name}! Я Сова — ваш персональный ИИ-психолог в Loop.\n\nЯ помогу вам понимать эмоции, проходить тесты на привязанность и находить гармонию в отношениях. О чём вы хотели бы поговорить сегодня?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } else {
        // Fetch pair status immediately for existing account
        fetch(`/api/pair/status/${cleanLogin}`)
          .then((r) => r.json())
          .then((statusData) => {
            if (statusData.incomingRequests) {
              setPairRequests((prev) => {
                const others = prev.filter((r) => r.toLogin.toLowerCase() !== cleanLogin);
                const merged = [...others, ...statusData.incomingRequests, ...(statusData.outgoingRequests || [])];
                safeSetStorage('together_pair_requests', merged);
                return merged;
              });
            }
          })
          .catch(() => {});
      }

      triggerConfetti();

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Не удалось связаться с сервером. Попробуйте снова.' };
    }
  };

  // Auth: Login (Login + Password)
  const authLogin = async (login: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanLogin = login.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = pass.trim();

    if (!cleanLogin || !cleanPass) {
      return { success: false, error: 'Заполните логин и пароль' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: cleanLogin, password: cleanPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Неверный логин или пароль' };
      }

      const safeUser: UserAccount = data.user;
      let updatedDb = { ...accountsDb, [cleanLogin]: safeUser };
      if (data.partner) {
        updatedDb[data.partner.login.toLowerCase()] = data.partner;
      }
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      setCurrentUser(safeUser);
      setIsOnboarded(true);
      triggerConfetti();

      // Fetch pair status immediately
      fetch(`/api/pair/status/${cleanLogin}`)
        .then((r) => r.json())
        .then((statusData) => {
          if (statusData.incomingRequests) {
            setPairRequests((prev) => {
              const others = prev.filter((r) => r.toLogin.toLowerCase() !== cleanLogin);
              const merged = [...others, ...statusData.incomingRequests, ...(statusData.outgoingRequests || [])];
              safeSetStorage('together_pair_requests', merged);
              return merged;
            });
          }
        })
        .catch(() => {});

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: 'Не удалось связаться с сервером. Проверьте подключение к сети.',
      };
    }
  };

  // Auth: Reset Password
  const authResetPassword = async (login: string, newPass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanLogin = login.trim().toLowerCase().replace(/^@/, '');
    const cleanNewPass = newPass.trim();

    if (!cleanLogin) return { success: false, error: 'Введите логин' };
    if (!cleanNewPass || cleanNewPass.length < 3) {
      return { success: false, error: 'Пароль должен содержать минимум 3 символа' };
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: cleanLogin, newPassword: cleanNewPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка сброса пароля' };
      }

      const safeUser: UserAccount = data.user;
      const updatedDb = { ...accountsDb, [cleanLogin]: safeUser };
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      setCurrentUser(safeUser);
      setIsOnboarded(true);
      triggerConfetti();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Не удалось связаться с сервером' };
    }
  };

  // Auth: Logout
  const authLogout = () => {
    setCurrentUserState(null);
    safeSetStorage('together_current_user', null);
    setIsOnboarded(false);
  };

  // Auth: Switch Account
  const switchAccount = (_targetLogin: string) => {
    authLogout();
  };

  // Auth: Update Profile
  
  const updateCoupleStartDate = async (date: string) => {
    if (!currentUser) return;
    const cleanLogin = currentUser.login.toLowerCase();
    const existing = accountsDb[cleanLogin];
    if (!existing) return;

    // Update current user
    const updated = { ...existing, startDate: date };
    let updatedDb = { ...accountsDb, [cleanLogin]: updated };
    setCurrentUser(updated);

    // Update partner if exists
    if (existing.partnerLogin) {
      const partnerLogin = existing.partnerLogin.toLowerCase();
      const existingPartner = accountsDb[partnerLogin];
      if (existingPartner) {
        const updatedPartner = { ...existingPartner, startDate: date };
        updatedDb = { ...updatedDb, [partnerLogin]: updatedPartner };
      }
    }

    setAccountsDb(updatedDb);
    safeSetStorage('together_accounts_registry', updatedDb);

    try {
      await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: cleanLogin, startDate: date }),
      });
      if (existing.partnerLogin) {
        await fetch('/api/auth/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login: existing.partnerLogin, startDate: date }),
        });
      }
    } catch {
      // ignore
    }
  };


  const updateUserProfile = async (fields: Partial<UserAccount>) => {
    if (!currentUser) return;
    const cleanLogin = currentUser.login.toLowerCase();
    const existing = accountsDb[cleanLogin];
    if (!existing) return;

    const updated: UserAccount & { password?: string } = {
      ...existing,
      ...fields,
      login: existing.login, // immutable
    };

    const updatedDb = { ...accountsDb, [cleanLogin]: updated };
    setAccountsDb(updatedDb);
    safeSetStorage('together_accounts_registry', updatedDb);

    const { password: _, ...safeUser } = updated;
    setCurrentUser(safeUser);

    // Call server
    try {
      fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: cleanLogin,
          ...fields,
        }),
      }).catch(() => {});
    } catch {}
  };

  // Auth: Change Password
  const changePassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Пользователь не авторизован' };
    const cleanLogin = currentUser.login.toLowerCase();
    const user = accountsDb[cleanLogin];
    if (!user) return { success: false, error: 'Аккаунт не найден' };

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: cleanLogin,
          oldPassword: oldPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка смены пароля' };
      }

      const updated = { ...user, password: newPass.trim() };
      const updatedDb = { ...accountsDb, [cleanLogin]: updated };
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  // Pairing: Send Pair Request by Login
  const sendPairRequestByLogin = async (
    targetLogin: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Необходимо войти в аккаунт' };

    const myLogin = currentUser.login.toLowerCase();
    const cleanTarget = targetLogin.trim().toLowerCase().replace(/^@/, '');

    if (!cleanTarget) {
      return { success: false, error: 'Введите логин партнёра' };
    }

    if (myLogin === cleanTarget) {
      return { success: false, error: 'Нельзя создать пару с самим собой' };
    }

    try {
      const res = await fetch('/api/pair/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromLogin: myLogin, toLogin: cleanTarget }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка отправки запроса' };
      }

      if (data.status === 'paired' && data.user && data.partner) {
        // Auto-paired immediately!
        const safeMe: UserAccount = data.user;
        const safePartner: UserAccount = data.partner;
        const updatedDb = {
          ...accountsDb,
          [myLogin]: { ...accountsDb[myLogin], ...safeMe },
          [cleanTarget]: { ...accountsDb[cleanTarget], ...safePartner },
        };
        setAccountsDb(updatedDb);
        safeSetStorage('together_accounts_registry', updatedDb);
        setCurrentUser(safeMe);

        triggerConfetti();
        addFeedItem({
          author: 'system',
          type: 'heart',
          title: `Вы теперь в паре с @${cleanTarget}!`,
          subtitle: 'Общее пространство для гармонии и сближения активировано',
        });

        return {
          success: true,
          message: data.message || `Поздравляем! Вы и @${cleanTarget} теперь пара`,
        };
      }

      // Pending request
      const newRequest: PairRequest = {
        id: 'pr_' + Date.now(),
        fromLogin: myLogin,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatarEmoji,
        toLogin: cleanTarget,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [
        ...pairRequests.filter(
          (r) => !(r.fromLogin.toLowerCase() === myLogin && r.toLogin.toLowerCase() === cleanTarget)
        ),
        newRequest,
      ];

      setPairRequests(updatedRequests);
      safeSetStorage('together_pair_requests', updatedRequests);

      return {
        success: true,
        message: data.message || `Запрос на добавление отправлен пользователю @${cleanTarget}!`,
      };
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером. Попробуйте снова.' };
    }
  };

  // Pairing: Accept Pair Request
  const acceptPairRequest = async (
    partnerLogin: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Необходимо войти в аккаунт' };

    const myLogin = currentUser.login.toLowerCase();
    const cleanPartner = partnerLogin.trim().toLowerCase().replace(/^@/, '');

    try {
      const res = await fetch('/api/pair/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myLogin, partnerLogin: cleanPartner }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка принятия запроса' };
      }

      const safeMe: UserAccount = data.user || { ...currentUser, partnerLogin: cleanPartner, pairedAt: new Date().toISOString() };
      const safePartner: UserAccount = data.partner || { login: cleanPartner, name: cleanPartner, avatarEmoji: 'user' };

      const updatedDb = {
        ...accountsDb,
        [myLogin]: { ...accountsDb[myLogin], ...safeMe },
        [cleanPartner]: { ...accountsDb[cleanPartner], ...safePartner },
      };
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      setCurrentUser(safeMe);

      // Clear matching pending requests
      const updatedRequests = pairRequests.map((r) => {
        if (
          (r.fromLogin.toLowerCase() === cleanPartner && r.toLogin.toLowerCase() === myLogin) ||
          (r.fromLogin.toLowerCase() === myLogin && r.toLogin.toLowerCase() === cleanPartner)
        ) {
          return { ...r, status: 'ACCEPTED' as const };
        }
        return r;
      });
      setPairRequests(updatedRequests);
      safeSetStorage('together_pair_requests', updatedRequests);

      triggerConfetti();

      addFeedItem({
        author: 'system',
        type: 'heart',
        title: `Вы теперь в паре с @${cleanPartner}!`,
        subtitle: 'Общее пространство для гармонии и сближения активировано',
      });

      return {
        success: true,
        message: data.message || `Поздравляем! Вы и @${cleanPartner} теперь пара`,
      };
    } catch (err) {
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  // Pairing: Reject Pair Request
  const rejectPairRequest = async (partnerLogin: string) => {
    if (!currentUser) return;
    const myLogin = currentUser.login.toLowerCase();
    const cleanPartner = partnerLogin.trim().toLowerCase().replace(/^@/, '');

    const updatedRequests = pairRequests.map((r) => {
      if (r.fromLogin.toLowerCase() === cleanPartner && r.toLogin.toLowerCase() === myLogin) {
        return { ...r, status: 'REJECTED' as const };
      }
      return r;
    });
    setPairRequests(updatedRequests);
    safeSetStorage('together_pair_requests', updatedRequests);

    try {
      fetch('/api/pair/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myLogin, partnerLogin: cleanPartner }),
      }).catch(() => {});
    } catch {}
  };

  // Pairing: Disconnect Pair
  const disconnectPair = async () => {
    if (!currentUser) return;
    const myLogin = currentUser.login.toLowerCase();
    const meInDb = accountsDb[myLogin];
    if (!meInDb) return;

    const oldPartnerLogin = meInDb.partnerLogin ? meInDb.partnerLogin.toLowerCase() : null;

    const updatedMe = { ...meInDb, partnerLogin: null, pairedAt: undefined };
    let updatedDb = { ...accountsDb, [myLogin]: updatedMe };

    if (oldPartnerLogin && accountsDb[oldPartnerLogin]) {
      const updatedOldPartner = { ...accountsDb[oldPartnerLogin], partnerLogin: null, pairedAt: undefined };
      updatedDb[oldPartnerLogin] = updatedOldPartner;
    }

    setAccountsDb(updatedDb);
    safeSetStorage('together_accounts_registry', updatedDb);

    const { password: _, ...safeMe } = updatedMe;
    setCurrentUser(safeMe);

    try {
      fetch('/api/pair/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: myLogin }),
      }).catch(() => {});
    } catch {}
  };

  const createNewCouple = (partner1Name: string, partner2Name: string, startDate?: string) => {
    const p1 = partner1Name.trim() || 'Партнёр 1';
    const p2 = partner2Name.trim() || 'Партнёр 2';
    const date = startDate || new Date().toISOString().split('T')[0];
    
    const freshProfile = createFreshCoupleProfile(p1, p2, date);
    setCoupleProfile(freshProfile);
    safeSetStorage('together_couple_profile', freshProfile);

    // Fresh tests (0 completed)
    const freshTestsList = getFreshTests();
    setTests(freshTestsList);
    safeSetStorage('together_tests', freshTestsList);

    // Fresh challenges
    const freshChalls = getFreshChallenges();
    setChallenges(freshChalls);
    safeSetStorage('together_challenges', freshChalls);

    // Clean initial feeds & states
    const starterFeed: FeedItem[] = [
      {
        id: 'f-start-1',
        author: 'system',
        type: 'sparkle',
        title: `Добро пожаловать в Loop, ${p1} и ${p2}!`,
        subtitle: 'Ваше приватное пространство для гармонии создано',
        timeAgo: 'только что',
      },
    ];
    setFeedItems(starterFeed);
    safeSetStorage('together_feed', starterFeed);

    // Empty pulse and history for new users
    setPulseHistory([]);
    safeSetStorage('together_pulse_history', []);

    setDateInvites([]);
    safeSetStorage('together_date_invites', []);

    setWishlist([]);
    safeSetStorage('together_wishlist', []);

    setSmallCravings([]);
    safeSetStorage('together_cravings', []);

    setQuestionAnswer(null);
    safeSetStorage('together_q_answer', null);

    const freshAIMessages: AIMessage[] = [
      {
        id: 'ai-init-1',
        role: 'model',
        content: `Здравствуйте, ${p1} и ${p2}! Я Сова — ваш персональный ИИ-психолог в приложении Loop.

Я помогу вам лучше понимать друг друга, исследовать психологические тесты (ECR, метод Готтмана, языки любви), планировать запоминающиеся свидания и бережно разрешать любые разногласия.

С чего бы вы хотели начать наше знакомство сегодня?`,
        timestamp: new Date().toISOString(),
      },
    ];
    setAIMessages(freshAIMessages);
    safeSetStorage('together_ai_messages', freshAIMessages);

    setCurrentPartnerId('partner1');
    setIsOnboarded(true);
    triggerConfetti();
  };

  const joinCoupleByCode = (linkCode: string, myName: string) => {
    const trimmedName = myName.trim() || 'Партнёр 2';
    setCoupleProfile((prev) => {
      const updated: CoupleProfile = {
        ...prev,
        linkCode: linkCode || prev.linkCode,
        partner2: {
          ...prev.partner2,
          name: trimmedName,
        },
      };
      safeSetStorage('together_couple_profile', updated);
      return updated;
    });

    setCurrentPartnerId('partner2');
    setIsOnboarded(true);
    triggerConfetti();
  };

  const loadDemoCouple = () => {
    setCoupleProfile(initialCoupleProfile);
    safeSetStorage('together_couple_profile', initialCoupleProfile);

    setPulseHistory(initialPulseHistory);
    safeSetStorage('together_pulse_history', initialPulseHistory);

    setChallenges(initialChallenges);
    safeSetStorage('together_challenges', initialChallenges);

    setTests(initialTests);
    safeSetStorage('together_tests', initialTests);

    setSmallCravings(initialSmallCravings);
    safeSetStorage('together_cravings', initialSmallCravings);

    setFlowerPreferences(initialFlowerPreferences);
    safeSetStorage('together_flowers', initialFlowerPreferences);

    setWishlist(initialWishlist);
    safeSetStorage('together_wishlist', initialWishlist);

    setDateInvites(initialDateInvites);
    safeSetStorage('together_date_invites', initialDateInvites);

    setMoodHistory(initialMoodHistory);
    safeSetStorage('together_mood_history', initialMoodHistory);

    setFeedItems(initialFeed);
    safeSetStorage('together_feed', initialFeed);

    const demoAIMessages: AIMessage[] = [
      {
        id: 'ai-init-1',
        role: 'model',
        content: `Здравствуйте! Я Сова — ваш персональный ИИ-психолог Loop.

Я помогу вам бережно разбирать любые ситуации, находить гармонию, понимать стили привязанности и языки любви в вашей паре.

О чём вы хотели бы поговорить сегодня?`,
        timestamp: new Date().toISOString(),
      },
    ];
    setAIMessages(demoAIMessages);
    safeSetStorage('together_ai_messages', demoAIMessages);

    setCurrentPartnerId('partner1');
    setIsOnboarded(true);
    triggerConfetti();
  };

  const resetCoupleData = () => {
    setIsOnboarded(false);
    safeSetStorage('together_onboarded', false);
  };

  const updatePartnerNames = (p1Name: string, p2Name: string, startDate: string) => {
    setCoupleProfile((prev) => {
      const updated: CoupleProfile = {
        ...prev,
        startDate: startDate || prev.startDate,
        partner1: {
          ...prev.partner1,
          name: p1Name.trim() || prev.partner1.name,
        },
        partner2: {
          ...prev.partner2,
          name: p2Name.trim() || prev.partner2.name,
        },
      };
      safeSetStorage('together_couple_profile', updated);
      return updated;
    });
  };

  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile>(() => {
    return safeGetStorage('together_couple_profile', initialCoupleProfile);
  });

  const [pulseHistory, setPulseHistory] = useState<PulseEntry[]>(() => {
    const data = safeGetStorage<PulseEntry[]>('together_pulse_history', []);
    return Array.isArray(data) ? data.filter((p) => !['p-1', 'p-2', 'p-3', 'p-4'].includes(p.id)) : [];
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const data = safeGetStorage<Challenge[]>('together_challenges', initialChallenges);
    return Array.isArray(data) ? data : initialChallenges;
  });

  const [tests, setTests] = useState<TestCategory[]>(() => {
    const data = safeGetStorage<TestCategory[]>('together_tests', initialTests);
    return Array.isArray(data) ? data : initialTests;
  });

  const [smallCravings, setSmallCravings] = useState<SmallCraving[]>(() => {
    const data = safeGetStorage<SmallCraving[]>('together_cravings', []);
    return Array.isArray(data) ? data.filter((c) => !['cr-1', 'cr-2', 'cr-3', 'cr-4'].includes(c.id)) : [];
  });

  const [flowerPreferences, setFlowerPreferences] = useState<Record<string, FlowerPreference>>(() => {
    return safeGetStorage('together_flowers', initialFlowerPreferences);
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const data = safeGetStorage<WishlistItem[]>('together_wishlist', []);
    return Array.isArray(data) ? data.filter((w) => !['w-1', 'w-2', 'w-3', 'w-4'].includes(w.id)) : [];
  });

  const [venues, setVenues] = useState<Venue[]>(() => {
    const data = safeGetStorage<Venue[]>('together_venues', []);
    return Array.isArray(data) ? data.filter((v) => !['v-1', 'v-2', 'v-3', 'v-4', 'v-5', 'v-6'].includes(v.id)) : [];
  });
  const [selectedCity, setSelectedCity] = useState<string>('Москва');

  const [coupleXP, setCoupleXP] = useState<number>(() => {
    return safeGetStorage('together_couple_xp', 0);
  });

  const [xpHistory, setXpHistory] = useState<XPEntry[]>(() => {
    return safeGetStorage('together_xp_history', []);
  });

  const coupleLevelInfo = getCoupleLevelInfo(coupleXP);

  const addCoupleXP = (points: number, reason: string, category: XPEntry['category'] = 'bonus') => {
    setCoupleXP((prev) => {
      const next = Math.max(0, prev + points);
      safeSetStorage('together_couple_xp', next);
      return next;
    });
    const entry: XPEntry = {
      id: `xp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      points,
      reason,
      category,
      timestamp: new Date().toISOString(),
      partnerId: currentPartnerId,
    };
    setXpHistory((prev) => {
      const updated = [entry, ...prev.slice(0, 49)];
      safeSetStorage('together_xp_history', updated);
      return updated;
    });
  };

  const addVenue = (venue: Omit<Venue, 'id' | 'createdAt' | 'addedBy'>) => {
    const newV: Venue = {
      ...venue,
      id: `v-${Date.now()}`,
      addedBy: currentPartnerId,
      createdAt: new Date().toISOString(),
    };
    setVenues((prev) => [newV, ...prev]);
    addCoupleXP(30, `Добавлено место в избранное: «${venue.name}»`, 'date');
    triggerConfetti();
  };

  const deleteVenue = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
  };

  const [dateInvites, setDateInvites] = useState<DateInvite[]>(() => {
    const data = safeGetStorage<DateInvite[]>('together_date_invites', []);
    return Array.isArray(data) ? data.filter((d) => !['inv-1'].includes(d.id)) : [];
  });

  const [moodHistory, setMoodHistory] = useState<MoodHistoryItem[]>(() => {
    const data = safeGetStorage<MoodHistoryItem[]>('together_mood_history', []);
    return Array.isArray(data) ? data.filter((m) => !['m-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6', 'm-7', 'm-8', 'm-9', 'm-10', 'm-11', 'm-12', 'm-13', 'm-14'].includes(m.id)) : [];
  });

  const [partnerMessages, setPartnerMessages] = useState<ChatMessage[]>([]);
  
  const sendPartnerMessage = async (text: string, isAi: boolean = false) => {
    if (!currentUser) return;
    const cleanMyLogin = currentUser.login.toLowerCase().replace(/^@/, "");
    const partnerLogin = currentUser.partnerLogin;
    const cleanPartnerLogin = partnerLogin ? partnerLogin.toLowerCase().replace(/^@/, "") : "";
    const targetCoupleId = cleanPartnerLogin
      ? [cleanMyLogin, cleanPartnerLogin].sort().join("_")
      : (coupleProfile?.id || 'default_couple');

    try {
      const msg = {
        id: crypto.randomUUID(),
        coupleId: targetCoupleId,
        senderLogin: isAi ? 'ai' : currentUser.login,
        role: isAi ? 'ai' : (currentPartnerId === 'partner1' ? 'partner1' : 'partner2'),
        content: text,
        createdAt: new Date().toISOString()
      };
      
      setPartnerMessages(prev => [...prev, msg as ChatMessage]);
      
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      
      // Check if we need to call AI
      if (!isAi && text.toLowerCase().includes('сов')) {
        // Simple trigger
        setTimeout(() => {
          sendPartnerMessage('Я здесь! Слышу вас. Как я могу помочь?', true);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [aiMessages, setAIMessages] = useState<AIMessage[]>(() => {
    const fallbackMessages: AIMessage[] = [
      {
        id: 'ai-init-1',
        role: 'model',
        content: `Здравствуйте! Я Сова — ваш персональный ИИ-психолог Loop.

Я помогу вам бережно разбирать любые ситуации, находить гармонию, понимать стили привязанности и языки любви в вашей паре.

О чём вы хотели бы поговорить сегодня?`,
        timestamp: new Date().toISOString(),
      },
    ];
    return safeGetStorage('together_ai_messages', fallbackMessages);
  });

  const [isAITyping, setIsAITyping] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(() => {
    return safeGetStorage('together_unread_chat', 0);
  });

  const clearUnreadChatCount = () => {
    setUnreadChatCount(0);
    safeSetStorage('together_unread_chat', 0);
  };

  useEffect(() => {
    if (activeTab === 'chat' || activeTab === 'owl') {
      setUnreadChatCount(0);
      safeSetStorage('together_unread_chat', 0);
    }
  }, [activeTab]);

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const data = safeGetStorage<Achievement[]>('together_achievements', initialAchievements);
    return Array.isArray(data) ? data : initialAchievements;
  });

  // Sync to localStorage safely
  useEffect(() => {
    safeSetStorage('together_couple_profile', coupleProfile);
  }, [coupleProfile]);

  useEffect(() => {
    safeSetStorage('together_pulse_history', pulseHistory);
  }, [pulseHistory]);

  useEffect(() => {
    safeSetStorage('together_challenges', challenges);
  }, [challenges]);

  useEffect(() => {
    safeSetStorage('together_tests', tests);
  }, [tests]);

  useEffect(() => {
    safeSetStorage('together_cravings', smallCravings);
  }, [smallCravings]);

  useEffect(() => {
    safeSetStorage('together_flowers', flowerPreferences);
  }, [flowerPreferences]);

  useEffect(() => {
    safeSetStorage('together_wishlist', wishlist);
  }, [wishlist]);

  useEffect(() => {
    safeSetStorage('together_venues', venues);
  }, [venues]);

  useEffect(() => {
    safeSetStorage('together_date_invites', dateInvites);
  }, [dateInvites]);

  useEffect(() => {
    safeSetStorage('together_mood_history', moodHistory);
  }, [moodHistory]);

  useEffect(() => {
    safeSetStorage('together_achievements', achievements);
  }, [achievements]);

  useEffect(() => {
    safeSetStorage('together_ai_messages', aiMessages);
  }, [aiMessages]);

  const triggerConfetti = () => {
    try {
      import('canvas-confetti')
        .then((module) => {
          const confettiFunc = module.default || module;
          if (typeof confettiFunc === 'function') {
            confettiFunc({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#e11d48', '#fb7185', '#f43f5e', '#fda4af', '#fecdd3'],
              disableForReducedMotion: true,
            });
          }
        })
        .catch(() => {
          // ignore error in restrictive iframe
        });
    } catch {
      // ignore
    }
  };

  // Days together calculation
  
  const getFormattedTimeTogether = () => {
    try {
      const start = new Date(coupleProfile.startDate);
      const now = new Date();
      if (now < start) return '0 дней';
      
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      const pluralize = (n, forms) => {
        const m10 = n % 10;
        const m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return forms[0];
        if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
        return forms[2];
      };

      const parts = [];
      if (years > 0) parts.push(years + ' ' + pluralize(years, ['год', 'года', 'лет']));
      if (months > 0) parts.push(months + ' ' + pluralize(months, ['месяц', 'месяца', 'месяцев']));
      if (days > 0 || parts.length === 0) parts.push(days + ' ' + pluralize(days, ['день', 'дня', 'дней']));
      
      return parts.join(' ');
    } catch {
      return getDaysTogether() + ' дней';
    }
  };


  const getDaysTogether = () => {
    try {
      const start = new Date(coupleProfile.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 482;
    }
  };

  const updateCoupleProfile = (updates: Partial<CoupleProfile>) => {
    setCoupleProfile((prev) => ({ ...prev, ...updates }));
  };

  const addPulseCheckin = (closeness: number, constructiveness: number, comment: string) => {
    const newEntry: PulseEntry = {
      id: `p-${Date.now()}`,
      week: 34,
      year: 2026,
      date: new Date().toISOString().split('T')[0],
      closeness,
      constructiveness,
      comment,
      author: currentPartnerId,
    };
    setPulseHistory((prev) => [newEntry, ...prev]);
    triggerConfetti();
  };

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== id) return ch;
        const p1Done = currentPartnerId === 'partner1' ? !ch.partner1Completed : ch.partner1Completed;
        const p2Done = currentPartnerId === 'partner2' ? !ch.partner2Completed : ch.partner2Completed;
        const bothDone = p1Done && p2Done;
        if (bothDone && (!ch.partner1Completed || !ch.partner2Completed)) {
          addCoupleXP(60, `Выполнено испытание: ${ch.title}`, 'challenge');
          triggerConfetti();
        }
        return {
          ...ch,
          partner1Completed: p1Done,
          partner2Completed: p2Done,
          completedAt: bothDone ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const submitTestAnswers = (testId: string, answers: Record<string, any>) => {
    let testTitle = 'Тест совместимости';
    setTests((prev) =>
      prev.map((t) => {
        if (t.id !== testId) return t;
        testTitle = t.title;
        const p1Done = currentPartnerId === 'partner1' ? true : t.partner1Done;
        const p2Done = currentPartnerId === 'partner2' ? true : t.partner2Done;
        return {
          ...t,
          partner1Done: p1Done,
          partner2Done: p2Done,
        };
      })
    );

    addCoupleXP(100, `Пройден тест «${testTitle}»`, 'test');

    // Update level if needed
    setCoupleProfile((prev) => {
      const completedCount = prev.testsCompletedCount + 1;
      let newLevel = prev.level;
      let newLevelName = prev.levelName;
      if (completedCount >= 8) {
        newLevel = 4;
        newLevelName = 'Мастерство';
      } else if (completedCount >= 5) {
        newLevel = 3;
        newLevelName = 'Глубина';
      } else if (completedCount >= 3) {
        newLevel = 2;
        newLevelName = 'Понимание';
      }
      return {
        ...prev,
        testsCompletedCount: completedCount,
        level: newLevel,
        levelName: newLevelName,
      };
    });

    triggerConfetti();
  };

  const addCraving = (title: string, category: SmallCraving['category']) => {
    const targetPartner: PartnerId = currentPartnerId === 'partner1' ? 'partner2' : 'partner1';
    const newCraving: SmallCraving = {
      id: `cr-${Date.now()}`,
      title,
      category,
      addedBy: currentPartnerId,
      forPartner: targetPartner,
      fulfilled: false,
      createdAt: new Date().toISOString(),
    };
    setSmallCravings((prev) => [newCraving, ...prev]);
  };

  const toggleCraving = (id: string) => {
    setSmallCravings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.fulfilled;
          if (nextState) triggerConfetti();
          return {
            ...item,
            fulfilled: nextState,
            fulfilledAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return item;
      })
    );
  };

  const updateFlowerPreferences = (partnerId: PartnerId, prefs: Partial<FlowerPreference>) => {
    setFlowerPreferences((prev) => ({
      ...prev,
      [partnerId]: { ...prev[partnerId], ...prefs },
    }));
  };

  const addWishlistItem = (item: Omit<WishlistItem, 'id' | 'createdAt' | 'addedBy' | 'isSecretReserved'>) => {
    const newItem: WishlistItem = {
      ...item,
      id: `w-${Date.now()}`,
      addedBy: currentPartnerId,
      isSecretReserved: false,
      createdAt: new Date().toISOString(),
    };
    setWishlist((prev) => [newItem, ...prev]);
  };

  const toggleSecretReserve = (id: string) => {
    setWishlist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.isSecretReserved;
          if (next) triggerConfetti();
          return {
            ...item,
            isSecretReserved: next,
            reservedBy: next ? currentPartnerId : undefined,
          };
        }
        return item;
      })
    );
  };

  const deleteWishlistItem = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));
  };

  const createDateInvite = (
    note: string,
    venueId?: string,
    locationName?: string,
    chosenDate?: string,
    chosenTime?: string
  ) => {
    const recipientId: PartnerId = currentPartnerId === 'partner1' ? 'partner2' : 'partner1';
    const newInvite: DateInvite = {
      id: `inv-${Date.now()}`,
      senderId: currentPartnerId,
      recipientId,
      status: 'PENDING',
      invitationNote: note,
      venueId,
      chosenLocation: locationName,
      chosenDate,
      chosenTime,
      createdAt: new Date().toISOString(),
    };
    setDateInvites((prev) => [newInvite, ...prev]);
    addCoupleXP(20, 'Создано приглашение на свидание', 'date');
    triggerConfetti();
  };

  const confirmDatePlan = (inviteId: string, location: string, dateStr: string) => {};
  const addMoodStatus = (emoji: string, label: string, severity: number, note?: string) => {
    addCoupleXP(15, `Отметка настроения: ${label}`, 'mood');
  };

  const acceptDateInvite = (
    inviteId: string,
    date: string,
    time: string,
    location: string,
    link?: string,
    saveToVenues?: boolean
  ) => {
    let matchedVenueId: string | undefined;
    if (saveToVenues && location && location.trim()) {
      const existing = venues.find(
        (v) => v.name.toLowerCase() === location.trim().toLowerCase()
      );
      if (!existing) {
        const newVenueId = `v-${Date.now()}`;
        const newVenue: Venue = {
          id: newVenueId,
          name: location.trim(),
          city: selectedCity || 'Москва',
          category: 'other',
          vibe: 'Добавлено при подтверждении свидания',
          priceLevel: '₽₽',
          address: location.trim(),
          rating: 5.0,
          description: `Особое место пары, согласованное на свидании ${date}`,
          bookingUrl: link,
          addedBy: currentPartnerId,
          createdAt: new Date().toISOString(),
        };
        setVenues((prev) => [newVenue, ...prev]);
        matchedVenueId = newVenueId;
      } else {
        matchedVenueId = existing.id;
      }
    }

    setDateInvites((prev) =>
      prev.map((inv) => {
        if (inv.id === inviteId) {
          const updated: DateInvite = {
            ...inv,
            status: 'CONFIRMED' as const,
            chosenDate: date,
            chosenTime: time,
            chosenLocation: location,
            chosenLink: link || inv.chosenLink,
            venueId: matchedVenueId || inv.venueId,
          };
          addFeedItem({
            author: currentPartnerId,
            type: 'sparkle',
            title: `Принял(а) приглашение на свидание!`,
            subtitle: `${date} в ${time} | ${location}`,
          });
          return updated;
        }
        return inv;
      })
    );
    addCoupleXP(50, `Согласовано свидание в ${location}`, 'date');
    triggerConfetti();
  };

  const completeAndReviewDate = (
    inviteId: string,
    rating: number,
    impressions: string,
    photos: string[]
  ) => {
    let dateLocation = 'Свидание';
    setDateInvites((prev) =>
      prev.map((inv) => {
        if (inv.id === inviteId) {
          dateLocation = inv.chosenLocation || 'Свидание';
          const review: DateReview = {
            id: `rev-${Date.now()}`,
            rating,
            impressions,
            photos,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentPartnerId,
          };
          return {
            ...inv,
            completed: true,
            status: 'CONFIRMED',
            review,
          };
        }
        return inv;
      })
    );

    const xpEarned = rating === 5 ? 200 : rating === 4 ? 150 : 100;
    addCoupleXP(xpEarned, `Свидание в «${dateLocation}» (${rating}⭐)`, 'date');
    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `Завершено свидание: ${dateLocation}`,
      subtitle: `Оценка ${rating}/5 ⭐ • ${impressions || 'Было незабываемо!'}`,
    });
    triggerConfetti();
  };
  const sendAIMessage = async (text: string) => {
    if (!text.trim()) return;

    const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      authorName: currentPartner.name,
    };

    const newHistory = [...aiMessages, userMsg];
    setAIMessages(newHistory);
    setIsAITyping(true);

    try {
      const payload = {
        messages: newHistory.slice(-15).map((m) => ({ role: m.role, content: m.content })),
        coupleContext: {
          daysTogether: getDaysTogether(),
        formattedTimeTogether: getFormattedTimeTogether(),
          compatibilityScore: 89,
          user1: coupleProfile.partner1,
          user2: coupleProfile.partner2,
          pulse: pulseHistory[0] || { closeness: 9, constructiveness: 8 },
        },
        currentPartner,
        userLogin: currentUser?.login,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Ошибка сервера ИИ');
      }

      const botMsg: AIMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content:
          data.reply ||
          'Я внимательно вас слушаю. Попробуйте сформулировать ваше переживание через технику «Я-высказывания».',
        timestamp: new Date().toISOString(),
      };
      setAIMessages((prev) => [...prev, botMsg]);

      if (activeTab !== 'chat' && activeTab !== 'owl') {
        setUnreadChatCount((c) => {
          const next = c + 1;
          safeSetStorage('together_unread_chat', next);
          return next;
        });
        triggerSystemPush(
          'Сова • Психолог Loop',
          botMsg.content.length > 80 ? botMsg.content.slice(0, 80) + '...' : botMsg.content,
          'owl-message',
          '/'
        );
      }
    } catch (err: any) {
      console.error('Failed to send AI message', err);
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Сова временно потеряла связь и не может ответить. Пожалуйста, проверьте настройки сервера или попробуйте позже.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setAIMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAITyping(false);
    }
  };

  const sendLoveTap = (tapType: LoveTap['tapType'], customNote?: string) => {
    const tapConfig: Record<LoveTap['tapType'], { label: string; emoji: string; title: string }> = {
      thinking: { label: 'Думаю о тебе', emoji: 'lightbulb', title: 'думает о вас прямо сейчас' },
      miss: { label: 'Скучаю', emoji: 'clock', title: 'очень скучает по вам' },
      support: { label: 'Нужна поддержка', emoji: 'lifebuoy', title: 'нуждается в вашей поддержке' },
      proud: { label: 'Горжусь тобой', emoji: 'award', title: 'гордится вашими успехами' },
      grateful: { label: 'Ценю тебя', emoji: 'heart', title: 'чувствует огромную благодарность к вам' },
      talk: { label: 'Хочу поговорить', emoji: 'message', title: 'хочет услышать ваш голос' },
    };

    const config = tapConfig[tapType] || tapConfig.thinking;
    const senderName = currentUser?.name || (currentPartnerId === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name);
    const senderLogin = currentUser?.login || (currentPartnerId === 'partner1' ? 'alex' : 'masha');

    const newTap: LoveTap = {
      id: `tap-${Date.now()}`,
      senderLogin,
      senderName,
      tapType,
      tapLabel: config.label,
      emoji: config.emoji,
      note: customNote,
      createdAt: new Date().toISOString(),
    };

    setLoveTaps((prev) => {
      const updated = [newTap, ...prev.slice(0, 29)];
      safeSetStorage('together_love_taps', updated);
      return updated;
    });

    addCoupleXP(5, `Быстрое внимание: ${config.label}`, 'tap');

    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `${senderName} ${config.title}`,
      subtitle: customNote || config.label,
    });

    triggerConfetti();
  };

  const addTimeCapsule = (title: string, content: string, unlockDate: string, category: TimeCapsule['category']) => {
    const senderName = currentUser?.name || (currentPartnerId === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name);
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

  return (
    <CoupleContext.Provider
      value={{
        theme,
        setTheme,
        font,
        setFont,
        screen,
        setScreen,
        isOnboarded,
        setIsOnboarded,
        activeTab,
        setActiveTab,
        currentUser,
        accountsDb,
        allUsers,
        authLogin,
        authRegister,
        authResetPassword,
        authLogout,
        switchAccount,
        updateUserProfile,
        updateCoupleStartDate,
        changePassword,
        incomingRequests,
        outgoingRequests,
        sendPairRequestByLogin,
        acceptPairRequest,
        rejectPairRequest,
        disconnectPair,
        createNewCouple,
        joinCoupleByCode,
        loadDemoCouple,
        resetCoupleData,
        updatePartnerNames,
        usSubTab,
        setUsSubTab,
        datesSubTab,
        setDatesSubTab,
        owlMode,
        setOwlMode,
        loveTaps,
        sendLoveTap,
        timeCapsules,
        addTimeCapsule,
        openTimeCapsule,
        dailyQuiz,
        submitDailyQuizAnswer,
        deepCards,
        questionAnswer,
        answerQuestionOfDay,
        feedItems,
        addFeedItem,
        clearFeed,
        currentPartnerId,
        setCurrentPartnerId,
        coupleProfile,
        updateCoupleProfile,
        pulseHistory,
        addPulseCheckin,
        challenges,
        toggleChallenge,
        tests,
        submitTestAnswers,
        smallCravings,
        addCraving,
        toggleCraving,
        flowerPreferences,
        updateFlowerPreferences,
        wishlist,
        addWishlistItem,
        toggleSecretReserve,
        deleteWishlistItem,
        venues,
        addVenue,
        deleteVenue,
        selectedCity,
        setSelectedCity,
        dateInvites,
        createDateInvite,
        acceptDateInvite,
        completeAndReviewDate,
        confirmDatePlan,
        coupleXP,
        xpHistory,
        addCoupleXP,
        coupleLevelInfo,
        moodHistory,
        addMoodStatus,
        aiMessages,
        sendAIMessage,
        partnerMessages,
        sendPartnerMessage,
        isAITyping,
        unreadChatCount,
        clearUnreadChatCount,
        achievements,
        triggerConfetti,
        daysTogether: getDaysTogether(),
        formattedTimeTogether: getFormattedTimeTogether(),
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const context = useContext(CoupleContext);
  if (!context) {
    throw new Error('useCouple must be used within CoupleProvider');
  }
  return context;
};
