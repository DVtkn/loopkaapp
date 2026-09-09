import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({
        error: "Ошибка валидации входных данных",
        code: "VALIDATION_ERROR",
        details: issues,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({
        error: "Ошибка валидации параметров запроса",
        code: "VALIDATION_ERROR",
        details: issues,
      });
    }
    req.params = result.data as any;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({
        error: "Ошибка валидации параметров строки запроса",
        code: "VALIDATION_ERROR",
        details: issues,
      });
    }
    req.query = result.data as any;
    next();
  };
}
