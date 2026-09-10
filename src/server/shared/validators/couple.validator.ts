import { z } from "zod";
import { loginSchema } from "./auth.validator.ts";

export const coupleSyncSchema = z.object({
  login1: loginSchema,
  login2: loginSchema.optional().nullable(),
  coupleId: z.string().optional().nullable(),
  payload: z.record(z.string(), z.unknown()),
});
