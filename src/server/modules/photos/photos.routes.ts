import { Router } from "express";
import multer from "multer";
import { photoUploadLimiter } from "../../shared/middleware/rateLimiter.ts";
import { requireAuth, AuthenticatedRequest } from "../../shared/middleware/auth.middleware.ts";
import { isUserInCouple, requirePairOwnership } from "../../shared/middleware/requirePairOwnership.ts";
import { photoStorage, detectMimeType } from "./photos.service.ts";
import { logger } from "../../shared/utils/logger.ts";

export const photoRouter = Router();

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

photoRouter.post(
  "/upload",
  photoUploadLimiter,
  requireAuth,
  (req, res, next) => {
    photoUpload.single("photo")(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({ error: "Размер файла превышает допустимый лимит 5 МБ" });
        }
        return res.status(400).json({ error: err.message || "Ошибка загрузки файла" });
      }
      next();
    });
  },
  async (req: AuthenticatedRequest, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Файл изображения не передан" });
      }

      const userLogin = req.user?.login;
      if (!userLogin) {
        return res.status(401).json({ error: "Необходима авторизация" });
      }

      const coupleId = req.body.coupleId ? String(req.body.coupleId).trim() : "";
      const caption = req.body.caption ? String(req.body.caption).trim() : undefined;
      const width = req.body.width ? parseInt(String(req.body.width), 10) : undefined;
      const height = req.body.height ? parseInt(String(req.body.height), 10) : undefined;

      if (!coupleId || !isUserInCouple(coupleId, userLogin)) {
        logger.security("Отказ в доступе: попытка загрузки фото в чужую пару (IDOR)", {
          userLogin,
          coupleId,
          ip: req.ip,
        });
        return res.status(403).json({ error: "Доступ запрещён: вы не состоите в этой паре" });
      }

      // Валидация MIME-типа по реальным сигнатурам байтов (Magic Bytes)
      const detectedMime = detectMimeType(file.buffer);
      if (!detectedMime) {
        return res.status(400).json({
          error: "Недопустимый формат файла. Поддерживаются только изображения JPEG, PNG и WebP",
        });
      }

      const photo = await photoStorage.savePhoto({
        coupleId,
        uploaderLogin: userLogin,
        imageBytes: file.buffer,
        mimeType: detectedMime,
        caption,
        width: !isNaN(width as number) ? width : null,
        height: !isNaN(height as number) ? height : null,
      });

      logger.info("Фото успешно загружено в архив пары", {
        photoId: photo.id,
        coupleId,
        uploaderLogin: userLogin,
        mimeType: photo.mimeType,
        sizeBytes: file.size,
      });

      return res.status(201).json({
        success: true,
        photo,
      });
    } catch (err: unknown) {
      logger.error("Критическая ошибка сохранения фото в архив", err);
      return res.status(500).json({ error: "Не удалось сохранить фото" });
    }
  }
);

photoRouter.get("/list/:coupleId", requireAuth, requirePairOwnership, async (req: AuthenticatedRequest, res) => {
  try {
    const coupleId = req.params.coupleId;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit as string, 10) || 100), 100);
    const offset = Math.max(0, parseInt(req.query.offset as string, 10) || 0);

    const photos = await photoStorage.listPhotos(coupleId, limit, offset);

    return res.json({
      success: true,
      photos,
    });
  } catch (err: unknown) {
    logger.error("Ошибка загрузки списка фото архива", err);
    return res.status(500).json({ error: "Не удалось получить список фото" });
  }
});

photoRouter.get("/image/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const photoId = req.params.id;
    const userLogin = req.user?.login;
    if (!userLogin) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const photo = await photoStorage.getPhotoBytes(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Фотография не найдена" });
    }

    if (!isUserInCouple(photo.coupleId, userLogin)) {
      logger.security("Несанкционированная попытка просмотра фото (IDOR)", {
        userLogin,
        photoId,
        targetCoupleId: photo.coupleId,
        ip: req.ip,
      });
      return res.status(403).json({ error: "Доступ к этой фотографии запрещён" });
    }

    res.setHeader("Content-Type", photo.mimeType);
    res.setHeader("Cache-Control", "private, max-age=86400");
    return res.end(photo.buffer);
  } catch (err: unknown) {
    logger.error("Ошибка выдачи файла фото", err);
    return res.status(500).json({ error: "Ошибка при получении изображения" });
  }
});

photoRouter.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const photoId = req.params.id;
    const userLogin = req.user?.login;
    if (!userLogin) {
      return res.status(401).json({ error: "Необходима авторизация" });
    }

    const photo = await photoStorage.getPhotoById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Фотография не найдена" });
    }

    const canDelete = isUserInCouple(photo.coupleId, userLogin) || photo.uploaderLogin === userLogin;
    if (!canDelete) {
      logger.security("Несанкционированная попытка удаления фото (IDOR)", {
        userLogin,
        photoId,
        targetCoupleId: photo.coupleId,
        ip: req.ip,
      });
      return res.status(403).json({ error: "У вас нет прав на удаление этой фотографии" });
    }

    await photoStorage.deletePhoto(photoId);

    logger.info("Фотография удалена из архива", {
      photoId,
      userLogin,
      coupleId: photo.coupleId,
    });

    return res.json({ success: true, message: "Фотография удалена" });
  } catch (err: unknown) {
    logger.error("Ошибка удаления фото из архива", err);
    return res.status(500).json({ error: "Не удалось удалить фотографию" });
  }
});
