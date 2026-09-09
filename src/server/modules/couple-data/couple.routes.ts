import { Router } from "express";
import { validateBody } from "../../shared/middleware/validation.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { coupleSyncSchema } from "../../shared/validators/couple.validator.ts";
import {
  syncCouplePayload,
  fetchCoupleDataByKey,
  fetchCoupleDataByLogins,
} from "./couple.service.ts";

export const coupleRouter = Router();

coupleRouter.post("/sync", requireAuth, requirePairOwnership, validateBody(coupleSyncSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { login1, login2, coupleId, payload } = req.body;
    const result = await syncCouplePayload(
      { login1, login2, coupleId, payload },
      req.user?.login
    );

    return res.json({
      status: "synced",
      key: result.key,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

coupleRouter.get("/data/:key", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const key = String(req.params.key || "").toLowerCase().trim();
    const data = await fetchCoupleDataByKey(key);
    return res.json({ data: data || null });
  } catch (err) {
    next(err);
  }
});

coupleRouter.get("/data/:login1/:login2", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await fetchCoupleDataByLogins(req.params.login1, req.params.login2);
    return res.json({ data: data || null });
  } catch (err) {
    next(err);
  }
});
