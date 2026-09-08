export type PartnerId = 'partner1' | 'partner2';
export type Gender = 'male' | 'female';

export interface UserPartner {
  id: PartnerId;
  name: string;
  avatar: string;
  email: string;
  login: string;
  gender?: Gender;
  birthDate?: string;
  loveLanguage: string;
  attachmentStyle: string;
  currentMood: {
    emoji: string;
    label: string;
    note: string;
    updatedAt: string;
  };
  lastActiveAt?: string;
}

export interface CoupleProfile {
  id: string;
  status: 'ACTIVE' | 'PENDING';
  linkCode: string;
  startDate: string; // e.g. "2023-04-15"
  city: string;
  partner1: UserPartner;
  partner2: UserPartner;
  level: number; // 1 to 5
  levelName: string;
  testsCompletedCount: number;
}

export interface PulseEntry {
  id: string;
  week: number;
  year: number;
  date: string;
  closeness: number; // 1-10
  constructiveness: number; // 1-10
  comment: string;
  author: PartnerId;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'communication' | 'intimacy' | 'fun' | 'gottman' | 'adventure';
  week: number;
  partner1Completed: boolean;
  partner2Completed: boolean;
  completedAt?: string;
  rewardPoints: number;
}

export type QuestionType = 'single' | 'scale' | 'dilemma';

export interface QuestionOption {
  label: string;
  value: string | number;
  categoryScores?: Record<string, number>;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  isPrivate?: boolean;
  tip?: string;
}

export interface TestCategory {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  methodology: 'scientific' | 'creative' | 'deep';
  categoryKey: string;
  levelRequired: number;
  estimatedMinutes: number;
  questionsCount: number;
  description: string;
  scientificBasis: string;
  iconName: string;
  questions: Question[];
  partner1Done: boolean;
  partner2Done: boolean;
}

export interface TestResult {
  testId: string;
  partnerId: PartnerId;
  answers: Record<string, any>;
  scores: Record<string, number>;
  completedAt: string;
}

export interface SmallCraving {
  id: string;
  title: string;
  category: 'treat' | 'drink' | 'touch' | 'help' | 'other';
  addedBy: PartnerId;
  forPartner: PartnerId;
  fulfilled: boolean;
  fulfilledAt?: string;
  createdAt: string;
}

export interface FlowerPreference {
  favoriteFlowers: string[];
  dislikedFlowers: string[];
  colorPreferences: string[];
  careNotes: string;
  idealBouquetDescription: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  priceEstimate?: string;
  url?: string;
  imageUrl?: string;
  category: 'gift' | 'experience' | 'clothing' | 'gadget' | 'home';
  note?: string;
  addedBy: PartnerId;
  isSecretReserved: boolean;
  reservedBy?: PartnerId;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  city?: string;
  category: 'restaurant' | 'cafe' | 'park' | 'culture' | 'cinema' | 'spa' | 'bar' | 'other' | 'outdoor' | 'cozy';
  vibe?: string;
  priceLevel?: '₽' | '₽₽' | '₽₽₽' | '₽₽₽₽';
  address?: string;
  phone?: string;
  bookingUrl?: string;
  rating?: number;
  imageUrl?: string;
  description?: string;
  recommendedFor?: string;
  addedBy?: PartnerId;
  createdAt?: string;
}

export type InviteStatus = 'PENDING' | 'PROPOSED' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED';

export interface DateReview {
  id?: string;
  rating: number; // 1 to 5
  impressions: string;
  photos: string[];
  reviewedAt: string;
  reviewedBy: PartnerId;
}

export interface DateInvite {
  id: string;
  senderId: PartnerId;
  recipientId: PartnerId;
  status: InviteStatus;
  invitationNote: string;
  chosenDate?: string;
  chosenTime?: string;
  chosenLocation?: string;
  chosenLink?: string;
  venueId?: string;
  completed?: boolean;
  completedAt?: string;
  review?: DateReview;
  createdAt: string;
}

export interface XPEntry {
  id: string;
  points: number;
  reason: string;
  category: 'date' | 'test' | 'tap' | 'mood' | 'challenge' | 'craving' | 'bonus';
  timestamp: string;
  partnerId?: PartnerId;
}

export interface MoodHistoryItem {
  id: string;
  partnerId: PartnerId;
  date: string;
  emoji: string;
  label: string;
  score: number; // 1-10
  note: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  authorName?: string;
  isError?: boolean;
}

export interface UserAccount {
  id: string;
  login: string; // e.g. "alex", "masha" (lowercase, unique)
  password?: string;
  name: string; // display name, e.g. "Алексей"
  gender?: Gender; // 'male' | 'female'
  avatarEmoji: string;
  partnerLogin: string | null; // login of paired partner, e.g. "masha"
  pairedAt?: string;
  startDate?: string;
  city?: string;
  loveLanguage?: string;
  attachmentStyle?: string;
  currentMood?: {
    emoji: string;
    label: string;
    note: string;
    updatedAt: string;
  };
  lastActiveAt?: string;
  createdAt: string;
}

export interface PairRequest {
  id: string;
  fromLogin: string;
  fromName: string;
  fromAvatar: string;
  toLogin: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface LoveTap {
  id: string;
  senderLogin: string;
  senderName: string;
  tapType: 'thinking' | 'miss' | 'support' | 'proud' | 'grateful' | 'talk';
  tapLabel: string;
  emoji: string;
  note?: string;
  createdAt: string;
}

export interface TimeCapsule {
  id: string;
  title: string;
  content: string;
  authorLogin: string;
  authorName: string;
  unlockDate: string; // YYYY-MM-DD
  isOpened: boolean;
  openedAt?: string;
  category: 'promise' | 'memory' | 'wish' | 'letter';
  createdAt: string;
}

export interface DailyCoupleQuiz {
  id: string;
  question: string;
  options: { key: 'me' | 'partner' | 'both'; label: string }[];
  partner1Answer?: 'me' | 'partner' | 'both';
  partner2Answer?: 'me' | 'partner' | 'both';
  isMatch?: boolean;
  category: string;
}

export interface DeepTalkCard {
  id: string;
  category: 'future' | 'intimacy' | 'memories' | 'fun' | 'dreams';
  categoryLabel: string;
  categoryColor: string;
  question: string;
  tip?: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export type AppTheme = 'aurora' | 'night';
export type AppFont = 'inter' | 'system' | 'golos' | 'manrope';
export type AppScreen = 'landing' | 'app';
export type UsSubTab = 'passport' | 'book' | 'tests' | 'challenges' | 'capsule' | 'cards' | 'photobook';
export type DatesSubTab = 'wheel' | 'invite' | 'places' | 'history' | 'games';
export type OwlMode = 'solo' | 'together';

export type NavigationTab =
  | 'home'
  | 'dashboard'
  | 'us'
  | 'dates'
  | 'chat'
  | 'owl'
  | 'profile'
  | 'settings'
  | 'tests'
  | 'report'
  | 'care';



export interface ChatMessage {
  id: string;
  coupleId: string;
  senderLogin: string;
  role: 'partner1' | 'partner2' | 'ai';
  content: string;
  isRead: boolean;
  createdAt: string;
}

// --- Analytics & Tracking ---
export interface RadarScores {
  trust: number;
  communication: number;
  passion: number;
  sharedValues: number;
  care: number;
  dailyLife: number;
}

export interface RelationshipMetricsSnapshot {
  id: string;
  coupleId: string;
  metricDate: string; // YYYY-MM-DD
  radarScores: RadarScores;
  moodAverage: number | null;
  moodEntriesCount: number;
  interactionCount: number;
  quizCompleted: boolean;
  streakDays: number;
  createdAt: string;
}

export interface AiInsightContent {
  weekSummary: string;
  improvements: string[];
  riskZones: string[];
  recommendation: string;
  conversationStarter: string;
}

export interface AiInsightRecord {
  id: string;
  coupleId: string;
  type: 'weekly' | 'risk_alert';
  content: AiInsightContent;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export interface PhotoMetadata {
  id: string;
  coupleId: string;
  uploaderLogin: string;
  mimeType: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

