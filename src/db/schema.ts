import { pgTable, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

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
  createdAt: text('created_at').notNull(),
});

export const pairRequests = pgTable('pair_requests', {
  id: text('id').primaryKey(),
  fromLogin: text('from_login').notNull(),
  fromName: text('from_name').notNull(),
  fromAvatar: text('from_avatar').notNull(),
  toLogin: text('to_login').notNull(),
  status: text('status').notNull(), // 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: text('created_at').notNull(),
});

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
});
