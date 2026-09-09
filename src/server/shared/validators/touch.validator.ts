import { z } from "zod";
import { loginSchema } from "./auth.validator.ts";

export const touchEventSchema = z.object({
  senderLogin: loginSchema,
  senderName: z.string().max(50).optional(),
  targetLogin: loginSchema,
  actionType: z.string().min(1).max(50),
  title: z.string().max(100).optional(),
  subtitle: z.string().max(100).optional(),
  icon: z.string().max(50).optional(),
  iconBg: z.string().max(50).optional(),
  iconColor: z.string().max(50).optional(),
  customNote: z.string().max(200).optional(),
});
