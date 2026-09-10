import dotenv from "dotenv";
import { logger } from "./logger.ts";

dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  openrouterApiKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  allowedOrigins: string[];
}

function parseAllowedOrigins(): string[] {
  const custom = process.env.ALLOWED_ORIGINS;
  if (custom) {
    return custom.split(',').map((o) => o.trim()).filter(Boolean);
  }
  return [
    'http://localhost:3000',
    'http://localhost:5173',
  ];
}

export function loadConfig(): ServerConfig {
  const port = 3000; // Strictly port 3000 as mandated by environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProd = nodeEnv === 'production';
  let jwtSecret = process.env.JWT_SECRET;

  if (isProd) {
    if (!jwtSecret || jwtSecret === 'loop_secret_fallback_12345' || jwtSecret.trim() === '') {
      const errMsg = 'FATAL: В production-режиме (NODE_ENV=production) обязательно наличие валидной переменной JWT_SECRET (без плейсхолдеров). Запуск сервера отклонён.';
      logger.error(errMsg);
      throw new Error(errMsg);
    }
    const hasDb = Boolean(
      process.env.DATABASE_URL?.trim() ||
      process.env.NEON_DATABASE_URL?.trim() ||
      process.env.MY_DATABASE_URL?.trim() ||
      process.env.SQL_HOST?.trim()
    );
    if (!hasDb) {
      const errMsg = 'FATAL: В production-режиме (NODE_ENV=production) обязательно наличие переменной DATABASE_URL / NEON_DATABASE_URL. Запуск сервера отклонён.';
      logger.error(errMsg);
      throw new Error(errMsg);
    }
  } else {
    if (!jwtSecret) {
      logger.warn('JWT_SECRET is missing from environment. Using fallback (NOT safe for production).');
      jwtSecret = 'loop_secret_fallback_12345';
    }
  }

  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    logger.warn('OPENROUTER_API_KEY is not configured in .env. AI psychologist (Sova) will return 503.');
  }

  return {
    port,
    nodeEnv,
    jwtSecret,
    openrouterApiKey: OPENROUTER_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    allowedOrigins: parseAllowedOrigins(),
  };
}

export const config = loadConfig();
