/**
 * Клиентское сжатие фото перед загрузкой на сервер.
 * - Ограничение максимальной стороны: 1600px с сохранением соотношения сторон.
 * - Экспорт в canvas.toBlob('image/jpeg', 0.75).
 * - Если исходник < 300 КБ и не превышает 1600px — отдаётся как есть.
 * Цель: каждое фото в базе занимает ~150-400 КБ.
 */
export async function compressImage(file: File): Promise<Blob> {
  const MAX_DIMENSION = 1600;
  const QUALITY = 0.75;
  const SIZE_THRESHOLD_BYTES = 300 * 1024; // 300 KB

  // Если это не изображение, возвращаем как есть
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const isAllowedMime = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
      if (
        file.size <= SIZE_THRESHOLD_BYTES &&
        width <= MAX_DIMENSION &&
        height <= MAX_DIMENSION &&
        isAllowedMime
      ) {
        resolve(file);
        return;
      }

      let targetWidth = width;
      let targetHeight = height;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width >= height) {
          targetWidth = MAX_DIMENSION;
          targetHeight = Math.round((height * MAX_DIMENSION) / width);
        } else {
          targetHeight = MAX_DIMENSION;
          targetWidth = Math.round((width * MAX_DIMENSION) / height);
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
