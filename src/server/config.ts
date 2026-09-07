import dotenv from "dotenv";
import { logger } from "./logger.ts";

dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
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
  let jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.warn('JWT_SECRET is missing from environment. Using fallback (NOT safe for production).');
    jwtSecret = 'loop_secret_fallback_12345';
  }

  if (!process.env.GROQ_API_KEY) {
    logger.warn('GROQ_API_KEY is not configured in .env. AI will fallback to smart rule engine.');
  }

  return {
    port,
    nodeEnv,
    jwtSecret,
    groqApiKey: process.env.GROQ_API_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    allowedOrigins: parseAllowedOrigins(),
  };
}

export const config = loadConfig();
