import { z } from "zod";

export const loginSchema = z
  .string()
  .min(3, "Логин должен быть не короче 3 символов")
  .max(20, "Логин не должен превышать 20 символов")
  .regex(/^[a-zA-Zа-яА-Я0-9_]+$/, "Логин может содержать только буквы, цифры и _")
  .transform((v) => v.toLowerCase().replace(/^@/, ""));

export const passwordSchema = z
  .string()
  .min(6, "Пароль должен быть не короче 6 символов")
  .max(100, "Пароль слишком длинный");

export const registerSchema = z.object({
  login: loginSchema,
  password: passwordSchema,
  name: z.string().min(1, "Имя обязательно").max(50, "Имя слишком длинное").optional(),
});

export const loginRequestSchema = z.object({
  login: loginSchema,
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Старый пароль обязателен"),
  newPassword: passwordSchema,
});

export const resetPasswordSchema = z.object({
  login: loginSchema,
  newPassword: passwordSchema,
  secretKey: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  gender: z.enum(["male", "female"]).optional().nullable(),
  avatarEmoji: z.string().max(30).optional(),
  city: z.string().max(100).optional().nullable(),
  startDate: z.string().max(30).optional().nullable(),
  loveLanguage: z.string().max(50).optional().nullable(),
  attachmentStyle: z.string().max(50).optional().nullable(),
  currentMood: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const pairRequestSchema = z.object({
  fromLogin: loginSchema,
  toLogin: loginSchema,
});

export const pairAcceptSchema = z.object({
  fromLogin: loginSchema,
  toLogin: loginSchema,
});

export const pairRejectSchema = z.object({
  fromLogin: loginSchema,
  toLogin: loginSchema,
});

export const pairDisconnectSchema = z.object({
  login: loginSchema,
});

export const coupleSyncSchema = z.object({
  login1: loginSchema,
  login2: loginSchema.optional().nullable(),
  coupleId: z.string().optional().nullable(),
  payload: z.record(z.string(), z.unknown()),
});

export const chatMessageCreateSchema = z.object({
  coupleId: z.string().min(3).max(100),
  senderLogin: loginSchema,
  text: z.string().min(1, "Сообщение не может быть пустым").max(2000, "Сообщение слишком длинное"),
});

export const aiChatMessageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.string().min(1).max(20),
      content: z.string().min(1).max(4000),
    })
  ).min(1, "Список сообщений не может быть пустым"),
  userLogin: loginSchema.optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const aiReportSchema = z.object({
  coupleProfile: z.record(z.string(), z.unknown()).optional(),
  radarScores: z.record(z.string(), z.unknown()).optional(),
});

export const aiDateIdeaSchema = z.object({
  budget: z.string().max(50).optional(),
  vibe: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  coupleProfile: z.record(z.string(), z.unknown()).optional(),
});

export const touchEventSchema = z.object({
  senderLogin: loginSchema,
  senderName: z.string().min(1).max(50),
  targetLogin: loginSchema,
  actionType: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(200).optional(),
  icon: z.string().max(50).optional(),
  iconBg: z.string().max(100).optional(),
  iconColor: z.string().max(100).optional(),
  customNote: z.string().max(500).optional(),
});

export const loginParamSchema = z.object({
  login: loginSchema,
});

export const coupleIdParamSchema = z.object({
  coupleId: z.string().min(3).max(100),
});

export const pairLoginsParamSchema = z.object({
  login1: loginSchema,
  login2: loginSchema,
});
