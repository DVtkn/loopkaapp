import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePreview: string | null;
  caption: string;
  setCaption: (caption: string) => void;
  uploadStatus: 'idle' | 'compressing' | 'uploading' | 'done';
  uploadError: string | null;
  onUpload: () => void;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  filePreview,
  caption,
  setCaption,
  uploadStatus,
  uploadError,
  onUpload,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-sm rounded-3xl bg-[var(--surface)] border border-[var(--divider)] p-5 shadow-2xl space-y-4 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-sm font-bold text-[var(--text)]">Новое фото в архив</h3>
            </div>
            <button
              onClick={onClose}
              disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
              className="p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-2)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface-2)] border border-[var(--divider)]">
            {filePreview && (
              <img
                src={filePreview}
                alt="Предпросмотр"
                className="w-full h-full object-cover"
              />
            )}

            {/* Progress Overlay */}
            {(uploadStatus === 'compressing' || uploadStatus === 'uploading') && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)] mb-2" />
                <p className="text-xs font-bold">
                  {uploadStatus === 'compressing' ? 'Оптимизируем размер...' : 'Сохраняем в архив...'}
                </p>
                <p className="text-[10px] text-white/70 mt-1">
                  Сжимаем для быстрой загрузки на мобильных
                </p>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-2)] mb-1">
              Подпись к фото (опционально)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Где это было? Что запомнилось?"
              maxLength={120}
              disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
              className="w-full py-2 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] placeholder-[var(--text-2)]/50 focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>

          {uploadError && (
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[11px] font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
              className="py-2.5 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={onUpload}
              disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
              className="py-2.5 px-4 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {uploadStatus === 'compressing' || uploadStatus === 'uploading' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Сохранить</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
