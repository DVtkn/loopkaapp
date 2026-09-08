import { apiFetch } from './api';
import { PhotoMetadata } from '../types';
import { compressImage } from './imageCompressor';

// In-memory cache for loaded blob URLs
const photoBlobCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string | null>>();

/**
 * Получить Blob URL для отображения фотографии через авторизованный запрос
 */
export async function getPhotoBlobUrl(photoId: string): Promise<string | null> {
  if (!photoId) return null;

  // Проверяем кэш в оперативной памяти
  if (photoBlobCache.has(photoId)) {
    return photoBlobCache.get(photoId)!;
  }

  // Дедупликация одновременных параллельных запросов на одно и то же фото
  if (loadingPromises.has(photoId)) {
    return loadingPromises.get(photoId)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await apiFetch(`/api/photos/image/${photoId}`);
      if (!res.ok) {
        return null;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      photoBlobCache.set(photoId, objectUrl);
      return objectUrl;
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err);
      return null;
    } finally {
      loadingPromises.delete(photoId);
    }
  })();

  loadingPromises.set(photoId, fetchPromise);
  return fetchPromise;
}

/**
 * Освободить память для конкретного фото
 */
export function revokePhotoBlobUrl(photoId: string) {
  const url = photoBlobCache.get(photoId);
  if (url) {
    URL.revokeObjectURL(url);
    photoBlobCache.delete(photoId);
  }
}

/**
 * Очистить весь кэш Blob URL (например при размонтировании галереи или логауте)
 */
export function clearPhotoBlobCache() {
  for (const url of photoBlobCache.values()) {
    try {
      URL.revokeObjectURL(url);
    } catch {}
  }
  photoBlobCache.clear();
  loadingPromises.clear();
}

/**
 * Получить список метаданных фото пары
 */
export async function fetchCouplePhotos(
  coupleId: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ success: boolean; photos: PhotoMetadata[]; error?: string }> {
  try {
    const res = await apiFetch(`/api/photos/list/${coupleId}?limit=${limit}&offset=${offset}`);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, photos: [], error: data.error || 'Ошибка загрузки фото' };
    }
    return { success: true, photos: data.photos || [] };
  } catch (err: any) {
    return { success: false, photos: [], error: err.message || 'Ошибка сети' };
  }
}

/**
 * Загрузить фото пары с предварительным клиентским сжатием
 */
export async function uploadCouplePhoto(
  file: File,
  coupleId: string,
  caption?: string,
  onStatusChange?: (status: 'compressing' | 'uploading' | 'done') => void
): Promise<{ success: boolean; photo?: PhotoMetadata; error?: string }> {
  try {
    onStatusChange?.('compressing');

    // 1. Клиентское сжатие изображения (canvas, max 1600px, 0.75 jpeg)
    const compressedBlob = await compressImage(file);

    onStatusChange?.('uploading');

    // 2. Формирование multipart/form-data
    const formData = new FormData();
    formData.append('photo', compressedBlob, file.name || 'photo.jpg');
    formData.append('coupleId', coupleId);
    if (caption?.trim()) {
      formData.append('caption', caption.trim());
    }

    // 3. Отправка на сервер
    const res = await apiFetch('/api/photos/upload', {
      method: 'POST',
      body: formData,
      // ВАЖНО: не указывать 'Content-Type', браузер сам подставит boundary
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Не удалось загрузить фото' };
    }

    onStatusChange?.('done');
    return { success: true, photo: data.photo };
  } catch (err: any) {
    return { success: false, error: err.message || 'Ошибка при загрузке фото' };
  }
}

/**
 * Удалить фото из архива
 */
export async function deleteCouplePhoto(
  photoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await apiFetch(`/api/photos/${photoId}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Не удалось удалить фото' };
    }

    revokePhotoBlobUrl(photoId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Ошибка при удалении фото' };
  }
}
