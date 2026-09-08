import crypto from "crypto";
import { createPool, isSqlConfigured } from "../../db/index.ts";
import { logger } from "../logger.ts";
import { readEmergencyFile, writeEmergencyFile } from "./storageService.ts";

export interface PhotoMetadata {
  id: string;
  coupleId: string;
  uploaderLogin: string;
  mimeType: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export interface PhotoWithBytes extends PhotoMetadata {
  imageBytes: Buffer;
}

export interface SavePhotoInput {
  id?: string;
  coupleId: string;
  uploaderLogin: string;
  imageBytes: Buffer;
  mimeType: string;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

/**
 * Валидация MIME-типа по реальным сигнатурам байтов (Magic Numbers)
 */
export function detectMimeType(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  // WebP: RIFF .... WEBP
  const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
  const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
  if (isRiff && isWebp) {
    return 'image/webp';
  }

  return null;
}

/**
 * Сервис хранения фотоархива (PhotoStorageService).
 * Инкапсулирует сохранение, чтение байтов и метаданных.
 * В будущем позволяет легко мигрировать на внешнее хранилище (GCS, S3, Cloudinary)
 * без изменения клиентского API.
 */
class PhotoStorageService {
  /**
   * Сохранить фото в базу данных (BYTEA) и вернуть только метаданные
   */
  async savePhoto(input: SavePhotoInput): Promise<PhotoMetadata> {
    const id = input.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const caption = input.caption?.trim() || null;
    const width = typeof input.width === 'number' ? input.width : null;
    const height = typeof input.height === 'number' ? input.height : null;

    let savedInPostgres = false;

    if (isSqlConfigured()) {
      try {
        const pool = createPool();
        if (pool) {
          await pool.query(
            `INSERT INTO photos (id, couple_id, uploader_login, image_bytes, mime_type, caption, width, height, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              id,
              input.coupleId,
              input.uploaderLogin,
              input.imageBytes,
              input.mimeType,
              caption,
              width,
              height,
            ]
          );
          savedInPostgres = true;
        }
      } catch (err) {
        logger.error("Ошибка сохранения фото в PostgreSQL, fallback на JSON", err, { id, coupleId: input.coupleId });
      }
    }

    // Зеркалирование / локальный fallback для устойчивости контейнера
    try {
      const store = readEmergencyFile();
      if (!store.photos) store.photos = [];
      
      store.photos.unshift({
        id,
        coupleId: input.coupleId,
        uploaderLogin: input.uploaderLogin,
        mimeType: input.mimeType,
        caption,
        width,
        height,
        createdAt: now,
        // Храним base64 в json только как резерв при недоступности SQL
        base64: input.imageBytes.toString('base64'),
      });

      // Ограничиваем локальный JSON резерв последними 50 фото, чтобы не раздувать файл
      if (store.photos.length > 50) {
        store.photos = store.photos.slice(0, 50);
      }

      writeEmergencyFile(store);
    } catch (err) {
      logger.warn("Не удалось записать фото в аварийный JSON-файл:", undefined, err);
    }

    const metadata: PhotoMetadata = {
      id,
      coupleId: input.coupleId,
      uploaderLogin: input.uploaderLogin,
      mimeType: input.mimeType,
      caption,
      width,
      height,
      createdAt: now,
    };

    return metadata;
  }

  /**
   * Получить список метаданных фото для пары (БЕЗ байтов)
   */
  async listPhotos(coupleId: string, limit: number = 100, offset: number = 0): Promise<PhotoMetadata[]> {
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);

    if (isSqlConfigured()) {
      try {
        const pool = createPool();
        if (pool) {
          const res = await pool.query(
            `SELECT id, couple_id as "coupleId", uploader_login as "uploaderLogin", 
                    mime_type as "mimeType", caption, width, height, created_at as "createdAt"
             FROM photos
             WHERE couple_id = $1
             ORDER BY created_at DESC
             LIMIT $2 OFFSET $3`,
            [coupleId, safeLimit, safeOffset]
          );

          return res.rows.map((r) => ({
            id: r.id,
            coupleId: r.coupleId,
            uploaderLogin: r.uploaderLogin,
            mimeType: r.mimeType,
            caption: r.caption,
            width: r.width,
            height: r.height,
            createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
          }));
        }
      } catch (err) {
        logger.error("Ошибка загрузки списка фото из PostgreSQL, fallback на JSON", err, { coupleId });
      }
    }

    // Fallback на локальный JSON
    try {
      const store = readEmergencyFile();
      const couplePhotos = (store.photos || [])
        .filter((p: any) => p.coupleId === coupleId)
        .slice(safeOffset, safeOffset + safeLimit)
        .map((p: any) => ({
          id: p.id,
          coupleId: p.coupleId,
          uploaderLogin: p.uploaderLogin,
          mimeType: p.mimeType,
          caption: p.caption || null,
          width: p.width || null,
          height: p.height || null,
          createdAt: p.createdAt,
        }));
      return couplePhotos;
    } catch {
      return [];
    }
  }

  /**
   * Получить метаданные одного фото (без байтов)
   */
  async getPhotoById(id: string): Promise<PhotoMetadata | null> {
    if (isSqlConfigured()) {
      try {
        const pool = createPool();
        if (pool) {
          const res = await pool.query(
            `SELECT id, couple_id as "coupleId", uploader_login as "uploaderLogin", 
                    mime_type as "mimeType", caption, width, height, created_at as "createdAt"
             FROM photos
             WHERE id = $1
             LIMIT 1`,
            [id]
          );

          if (res.rows.length > 0) {
            const r = res.rows[0];
            return {
              id: r.id,
              coupleId: r.coupleId,
              uploaderLogin: r.uploaderLogin,
              mimeType: r.mimeType,
              caption: r.caption,
              width: r.width,
              height: r.height,
              createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
            };
          }
        }
      } catch (err) {
        logger.error("Ошибка поиска фото в PostgreSQL", err, { id });
      }
    }

    // Fallback на локальный JSON
    try {
      const store = readEmergencyFile();
      const found = (store.photos || []).find((p: any) => p.id === id);
      if (found) {
        return {
          id: found.id,
          coupleId: found.coupleId,
          uploaderLogin: found.uploaderLogin,
          mimeType: found.mimeType,
          caption: found.caption || null,
          width: found.width || null,
          height: found.height || null,
          createdAt: found.createdAt,
        };
      }
    } catch {}

    return null;
  }

  /**
   * Получить бинарные данные (Buffer) фото и MIME-тип
   */
  async getPhotoBytes(id: string): Promise<{ buffer: Buffer; mimeType: string; coupleId: string; uploaderLogin: string } | null> {
    if (isSqlConfigured()) {
      try {
        const pool = createPool();
        if (pool) {
          const res = await pool.query(
            `SELECT id, couple_id as "coupleId", uploader_login as "uploaderLogin", 
                    image_bytes as "imageBytes", mime_type as "mimeType"
             FROM photos
             WHERE id = $1
             LIMIT 1`,
            [id]
          );

          if (res.rows.length > 0) {
            const r = res.rows[0];
            const buffer = Buffer.isBuffer(r.imageBytes)
              ? r.imageBytes
              : Buffer.from(r.imageBytes);

            return {
              buffer,
              mimeType: r.mimeType,
              coupleId: r.coupleId,
              uploaderLogin: r.uploaderLogin,
            };
          }
        }
      } catch (err) {
        logger.error("Ошибка чтения бинарных данных фото из PostgreSQL", err, { id });
      }
    }

    // Fallback на локальный JSON
    try {
      const store = readEmergencyFile();
      const found = (store.photos || []).find((p: any) => p.id === id);
      if (found && found.base64) {
        return {
          buffer: Buffer.from(found.base64, 'base64'),
          mimeType: found.mimeType,
          coupleId: found.coupleId,
          uploaderLogin: found.uploaderLogin,
        };
      }
    } catch {}

    return null;
  }

  /**
   * Удалить фото
   */
  async deletePhoto(id: string): Promise<boolean> {
    let deleted = false;

    if (isSqlConfigured()) {
      try {
        const pool = createPool();
        if (pool) {
          const res = await pool.query(`DELETE FROM photos WHERE id = $1`, [id]);
          if ((res.rowCount ?? 0) > 0) {
            deleted = true;
          }
        }
      } catch (err) {
        logger.error("Ошибка удаления фото из PostgreSQL", err, { id });
      }
    }

    // Удаление из аварийного JSON
    try {
      const store = readEmergencyFile();
      if (store.photos) {
        const initialLen = store.photos.length;
        store.photos = store.photos.filter((p: any) => p.id !== id);
        if (store.photos.length !== initialLen) {
          writeEmergencyFile(store);
          deleted = true;
        }
      }
    } catch {}

    return deleted;
  }
}

export const photoStorage = new PhotoStorageService();
