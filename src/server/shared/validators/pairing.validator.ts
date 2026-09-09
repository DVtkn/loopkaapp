import { z } from "zod";
import { loginSchema } from "./auth.validator.ts";

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
