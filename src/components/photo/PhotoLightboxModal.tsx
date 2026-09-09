import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Download, Trash2, X, Loader2 } from 'lucide-react';
import { PhotoMetadata } from '../../types.ts';

interface PhotoLightboxModalProps {
  photo: PhotoMetadata | null;
  lightboxBlobUrl: string | null;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
  partnerNameMap: Record<string, string>;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;
  isDeleting: boolean;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  photo,
  lightboxBlobUrl,
  onClose,
  onDownload,
  onDelete,
  partnerNameMap,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeleting,
}) => {
  if (!photo) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[var(--surface)] border border-[var(--divider)] overflow-hidden shadow-2xl"
        >
          {/* Top Controls */}
          <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-[var(--divider)] bg-[var(--surface)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--text-2)]" />
              <span className="text-xs text-[var(--text)] font-semibold">
                {new Date(photo.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] font-medium">
                {partnerNameMap[photo.uploaderLogin?.toLowerCase()] || `@${photo.uploaderLogin}`}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onDownload}
                title="Скачать фото"
                className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                title="Удалить фото"
                className="p-2 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                title="Закрыть"
                className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Photo Area */}
          <div className="relative flex-1 min-h-[300px] max-h-[65vh] flex items-center justify-center bg-black/90 p-2 overflow-hidden">
            {lightboxBlobUrl ? (
              <img
                src={lightboxBlobUrl}
                alt={photo.caption || 'Фото пары'}
                className="max-w-full max-h-[65vh] object-contain rounded-lg select-none"
              />
            ) : (
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Загрузка полного изображения...</span>
              </div>
            )}
          </div>

          {/* Caption Footer */}
          {photo.caption && (
            <div className="p-3.5 sm:p-4 bg-[var(--surface)] border-t border-[var(--divider)]">
              <p className="text-xs sm:text-sm text-[var(--text)] font-medium leading-relaxed">
                {photo.caption}
              </p>
            </div>
          )}

          {/* Delete Confirmation Alert Sub-modal */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
              <div className="w-full max-w-xs rounded-2xl bg-[var(--surface)] border border-[var(--divider)] p-5 text-center shadow-xl space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--text)] mb-1">Удалить это фото?</h4>
                  <p className="text-[11px] text-[var(--text-2)] leading-relaxed">
                    Фотография будет навсегда удалена из архива вашей пары. Это действие нельзя отменить.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="py-2 px-3 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="py-2 px-3 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Да, удалить'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
