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
  gender: z.enum(["male", "female"], { message: "Пол обязателен при регистрации (male/female)" }),
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
