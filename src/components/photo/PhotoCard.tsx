import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageIcon, AlertCircle, Maximize2 } from 'lucide-react';
import { PhotoMetadata } from '../../types.ts';
import { getPhotoBlobUrl } from '../../utils/photoApi.ts';

interface PhotoCardProps {
  photo: PhotoMetadata;
  onClick: () => void;
  partnerNameMap: Record<string, string>;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, partnerNameMap }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    getPhotoBlobUrl(photo.id)
      .then((url) => {
        if (isMounted) {
          if (url) {
            setBlobUrl(url);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [photo.id]);

  const formattedDate = new Date(photo.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  const authorDisplayName = partnerNameMap[photo.uploaderLogin?.toLowerCase()] || `@${photo.uploaderLogin}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative rounded-2xl overflow-hidden aspect-square bg-[var(--surface-2)] border border-[var(--divider)] cursor-pointer shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-2)] animate-pulse">
          <ImageIcon className="w-6 h-6 text-[var(--text-2)] opacity-30 animate-bounce mb-1" />
          <span className="text-[10px] text-[var(--text-2)] opacity-60">Загрузка...</span>
        </div>
      )}

      {error && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-2)] p-2 text-center">
          <AlertCircle className="w-5 h-5 text-red-400 mb-1" />
          <span className="text-[10px] text-[var(--text-2)]">Не удалось открыть</span>
        </div>
      )}

      {blobUrl && (
        <img
          src={blobUrl}
          alt={photo.caption || 'Фото пары'}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
        />
      )}

      {/* Hover & Overlay details */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 text-white">
        <div className="flex justify-end">
          <span className="p-1 rounded-full bg-black/40 backdrop-blur-xs text-white/80">
            <Maximize2 className="w-3.5 h-3.5" />
          </span>
        </div>

        <div>
          {photo.caption && (
            <p className="text-xs font-semibold line-clamp-1 drop-shadow-sm mb-0.5">
              {photo.caption}
            </p>
          )}
          <div className="flex items-center justify-between text-[10px] text-white/80 font-medium">
            <span className="max-w-[90px]">{authorDisplayName}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
