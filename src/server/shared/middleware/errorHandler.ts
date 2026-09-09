import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.ts";
import { isDatabaseError } from "../errors/index.ts";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error("Необработанная ошибка API", { path: req.path, method: req.method }, err);

  if (isDatabaseError(err) || (process.env.NODE_ENV === "production" && isDatabaseError(err))) {
    return res.status(503).json({
      error: "Сервис временно недоступен, попробуйте через минуту",
      code: "DB_UNAVAILABLE",
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Внутренняя ошибка сервера";

  return res.status(statusCode).json({
    error: message,
    code: err.code || "INTERNAL_ERROR",
  });
}
