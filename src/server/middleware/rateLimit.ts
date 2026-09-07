import rateLimit from "express-rate-limit";
import { Request, Response } from "express";
import { logger } from "../logger.ts";

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security("Превышен лимит регистрации", {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      error: "Слишком много попыток регистрации. Попробуйте через час.",
    });
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security("Превышен лимит попыток входа", {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      error: "Слишком много попыток входа. Попробуйте через 15 минут.",
    });
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security("Превышен лимит запросов к ИИ", {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      error: "Слишком много запросов к ИИ-психологу. Пожалуйста, сделайте небольшую паузу.",
    });
  },
});

export const pairLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.security("Превышен лимит парных операций", {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      error: "Слишком много запросов на соединение. Попробуйте позже.",
    });
  },
});
