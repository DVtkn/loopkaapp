import { pgTable, text, timestamp, boolean, jsonb, integer, real, unique, index, customType } from 'drizzle-orm/pg-core';

export const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return 'bytea';
  },
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  login: text('login').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  gender: text('gender'), // 'male' | 'female'
  avatarEmoji: text('avatar_emoji').notNull().default('sparkles'),
  partnerLogin: text('partner_login'),
  pairedAt: text('paired_at'),
  startDate: text('start_date'),
  city: text('city'),
  loveLanguage: text('love_language'),
  attachmentStyle: text('attachment_style'),
  currentMood: jsonb('current_mood'), // { emoji, label, note, updatedAt }
  lastActiveAt: text('last_active_at'),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  partnerLoginIdx: index('users_partner_login_idx').on(t.partnerLogin),
}));

export const pairRequests = pgTable('pair_requests', {
  id: text('id').primaryKey(),
  fromLogin: text('from_login').notNull(),
  fromName: text('from_name').notNull(),
  fromAvatar: text('from_avatar').notNull(),
  toLogin: text('to_login').notNull(),
  status: text('status').notNull(), // 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: text('created_at').notNull(),
}, (t) => ({
  fromToIdx: index('pair_requests_from_to_idx').on(t.fromLogin, t.toLogin),
  toLoginIdx: index('pair_requests_to_login_idx').on(t.toLogin),
  statusIdx: index('pair_requests_status_idx').on(t.status),
}));

export const coupleData = pgTable('couple_data', {
  id: text('id').primaryKey(), // using the 'login1_login2' sorted key
  data: jsonb('data').notNull(),
  lastUpdatedAt: text('last_updated_at').notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: text('id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  senderLogin: text('sender_login').notNull(),
  role: text('role').notNull(), // 'partner1', 'partner2', 'ai'
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  coupleCreatedIdx: index('chat_messages_couple_created_idx').on(t.coupleId, t.createdAt),
  senderIdx: index('chat_messages_sender_login_idx').on(t.senderLogin),
}));

export const relationshipMetrics = pgTable('relationship_metrics', {
  id: text('id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  metricDate: text('metric_date').notNull(), // YYYY-MM-DD
  radarScores: jsonb('radar_scores').notNull(), // { trust, communication, passion, sharedValues, care, dailyLife }
  moodAverage: real('mood_average'),
  moodEntriesCount: integer('mood_entries_count').default(0),
  interactionCount: integer('interaction_count').default(0),
  quizCompleted: boolean('quiz_completed').default(false),
  streakDays: integer('streak_days').default(0),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  unq: unique().on(t.coupleId, t.metricDate)
}));

export const aiInsights = pgTable('ai_insights', {
  id: text('id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  type: text('type').notNull(), // 'weekly' | 'risk_alert'
  content: jsonb('content').notNull(),
  periodStart: text('period_start').notNull(),
  periodEnd: text('period_end').notNull(),
  createdAt: text('created_at').notNull(),
}, (t) => ({
  coupleCreatedIdx: index('ai_insights_couple_created_idx').on(t.coupleId, t.createdAt),
}));

export const photos = pgTable('photos', {
  id: text('id').primaryKey(),
  coupleId: text('couple_id').notNull(),
  uploaderLogin: text('uploader_login').notNull(),
  imageBytes: bytea('image_bytes').notNull(),
  mimeType: text('mime_type').notNull(),
  caption: text('caption'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  coupleIdIdx: index('photos_couple_id_idx').on(t.coupleId),
  createdAtIdx: index('photos_created_at_idx').on(t.createdAt),
}));

