import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware.ts";
import { logger } from "../utils/logger.ts";

/**
 * Генерирует канонический ключ пары: [login1, login2].sort().join('_')
 */
export function getPairKey(login: string, partnerLogin?: string | null): string {
  if (!partnerLogin) return login.toLowerCase().trim().replace(/^@/, "");
  return [
    login.toLowerCase().trim().replace(/^@/, ""),
    partnerLogin.toLowerCase().trim().replace(/^@/, ""),
  ]
    .sort()
    .join("_");
}

/**
 * Проверяет, входит ли пользователь в состав идентификатора пары (coupleId = login1_login2)
 */
export function isUserInCouple(coupleId: string, userLogin?: string): boolean {
  if (!coupleId || !userLogin) return false;
  const cleanUser = userLogin.toLowerCase().trim().replace(/^@/, "");
  const cleanCouple = coupleId.toLowerCase().trim();

  if (cleanCouple === cleanUser) return true;
  if (cleanCouple === `ai_${cleanUser}`) return true;

  if (
    cleanCouple.startsWith(`${cleanUser}_`) ||
    cleanCouple.endsWith(`_${cleanUser}`) ||
    cleanCouple.includes(`_${cleanUser}_`)
  ) {
    return true;
  }

  return false;
}

/**
 * Middleware для строгой проверки прав доступа к данным пары (защита от IDOR)
 */
export function requirePairOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const userLogin = req.user?.login;
  if (!userLogin) {
    return res.status(401).json({ error: "Необходима авторизация" });
  }

  // 1. Проверка по параметру :coupleId или :key в URL
  if (req.params?.coupleId || req.params?.key) {
    const targetId = req.params.coupleId || req.params.key;
    if (!isUserInCouple(targetId, userLogin)) {
      logger.security("Отказ в доступе (IDOR: params.coupleId/key)", {
        userLogin,
        targetCoupleId: targetId,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Нет доступа", code: "FORBIDDEN" });
    }
  }

  // 2. Проверка по полю coupleId в теле запроса
  if (req.body?.coupleId) {
    if (!isUserInCouple(req.body.coupleId, userLogin)) {
      logger.security("Отказ в доступе (IDOR: body.coupleId)", {
        userLogin,
        targetCoupleId: req.body.coupleId,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Нет доступа", code: "FORBIDDEN" });
    }
  }

  // 3. Проверка пары логинов в параметрах URL: /api/couple/data/:login1/:login2
  if (req.params?.login1 && req.params?.login2) {
    const l1 = req.params.login1.toLowerCase().trim().replace(/^@/, "");
    const l2 = req.params.login2.toLowerCase().trim().replace(/^@/, "");
    if (l1 !== userLogin && l2 !== userLogin) {
      logger.security("Отказ в доступе (IDOR: params.login1/login2)", {
        userLogin,
        target: `${l1}_${l2}`,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Нет доступа", code: "FORBIDDEN" });
    }
  }

  // 4. Проверка логинов в теле запроса: /api/couple/sync
  if (req.body?.login1) {
    const l1 = String(req.body.login1).toLowerCase().trim().replace(/^@/, "");
    const l2 = req.body.login2 ? String(req.body.login2).toLowerCase().trim().replace(/^@/, "") : null;
    if (l1 !== userLogin && l2 !== userLogin) {
      logger.security("Отказ в доступе (IDOR: body.login1/login2)", {
        userLogin,
        target: l2 ? `${l1}_${l2}` : l1,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Нет доступа", code: "FORBIDDEN" });
    }
  }

  // 5. Проверка параметра :login в URL (например /api/ai/messages/:login, /api/pair/status/:login)
  if (req.params?.login) {
    const paramLogin = req.params.login.toLowerCase().trim().replace(/^@/, "");
    if (paramLogin !== userLogin) {
      logger.security("Отказ в доступе (IDOR: params.login)", {
        userLogin,
        paramLogin,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Нет доступа", code: "FORBIDDEN" });
    }
  }

  next();
}
