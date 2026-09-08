import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Plus,
  Trash2,
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  Download,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { PhotoMetadata } from '../types';
import {
  fetchCouplePhotos,
  uploadCouplePhoto,
  deleteCouplePhoto,
  getPhotoBlobUrl,
  clearPhotoBlobCache,
} from '../utils/photoApi';
import { useCouple } from '../context/CoupleContext';
import { triggerHaptic } from '../utils/haptics';

interface PhotoCardProps {
  photo: PhotoMetadata;
  onClick: () => void;
  partnerNameMap: Record<string, string>;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onClick, partnerNameMap }) => {
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
            <span className="truncate max-w-[90px]">{authorDisplayName}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PhotoArchive: React.FC = () => {
  const { currentUser, coupleProfile, currentPartnerId, addFeedItem } = useCouple();

  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload modal & states
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'done'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Lightbox view & delete dialog
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [lightboxBlobUrl, setLightboxBlobUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canonical coupleId
  const myLogin = (currentUser?.login || '').toLowerCase().trim().replace(/^@/, '');
  const partnerLogin = (currentUser?.partnerLogin || '').toLowerCase().trim().replace(/^@/, '');
  const coupleId = partnerLogin ? [myLogin, partnerLogin].sort().join('_') : myLogin;

  const partnerNameMap: Record<string, string> = {
    [myLogin]: currentUser?.name || myLogin,
    [partnerLogin]: coupleProfile.partner2.name || partnerLogin,
    alex: 'Алексей',
    masha: 'Мария',
  };

  const loadPhotos = useCallback(async () => {
    if (!coupleId) return;
    setLoadingList(true);
    setErrorMessage(null);
    const res = await fetchCouplePhotos(coupleId);
    if (res.success) {
      setPhotos(res.photos);
    } else {
      setErrorMessage(res.error || 'Не удалось загрузить архив фото');
    }
    setLoadingList(false);
  }, [coupleId]);

  useEffect(() => {
    loadPhotos();
    return () => {
      clearPhotoBlobCache();
    };
  }, [loadPhotos]);

  // Handle selected photo for Lightbox
  useEffect(() => {
    if (selectedPhoto) {
      getPhotoBlobUrl(selectedPhoto.id).then((url) => {
        setLightboxBlobUrl(url);
      });
    } else {
      setLightboxBlobUrl(null);
      setShowDeleteConfirm(false);
    }
  }, [selectedPhoto]);

  // Handle file select
  const handleFilePicked = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Пожалуйста, выберите файл изображения (JPEG, PNG или WebP)');
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setIsUploadOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFilePicked(file);
    }
    e.target.value = '';
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFilePicked(file);
    }
  };

  const closeUploadModal = () => {
    if (uploadStatus === 'compressing' || uploadStatus === 'uploading') return;
    setIsUploadOpen(false);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
    setCaption('');
    setUploadStatus('idle');
    setUploadError(null);
  };

  // Perform upload
  const handleStartUpload = async () => {
    if (!selectedFile || !coupleId) return;

    setUploadError(null);
    const res = await uploadCouplePhoto(selectedFile, coupleId, caption, (status) => {
      setUploadStatus(status);
    });

    if (res.success && res.photo) {
      triggerHaptic('success');
      setPhotos((prev) => [res.photo!, ...prev]);

      // Add event to moments feed
      addFeedItem({
        author: currentPartnerId,
        type: 'photo',
        title: 'Новое фото в архиве пары',
        subtitle: caption.trim() ? caption.trim() : 'Добавлен памятный момент',
      });

      closeUploadModal();
    } else {
      triggerHaptic('error');
      setUploadStatus('idle');
      setUploadError(res.error || 'Ошибка при загрузке фото');
    }
  };

  // Delete photo
  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    setIsDeleting(true);
    const res = await deleteCouplePhoto(selectedPhoto.id);
    setIsDeleting(false);

    if (res.success) {
      triggerHaptic('success');
      setPhotos((prev) => prev.filter((p) => p.id !== selectedPhoto.id));
      setSelectedPhoto(null);
      setShowDeleteConfirm(false);
    } else {
      triggerHaptic('error');
      alert(res.error || 'Не удалось удалить фото');
    }
  };

  // Download photo from lightbox
  const handleDownload = () => {
    if (!lightboxBlobUrl || !selectedPhoto) return;
    const a = document.createElement('a');
    a.href = lightboxBlobUrl;
    a.download = `loop-memory-${selectedPhoto.id.slice(0, 8)}.jpg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Top Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--text)]">Фотоархив пары</h2>
          </div>
          <p className="text-xs text-[var(--text-2)] leading-relaxed max-w-md">
            Защищённое хранилище памятных снимков. Доступно только вам и вашему партнёру.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[var(--accent)] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить фото</span>
        </button>
      </div>

      {/* Drag & Drop Upload Zone (Visible if photos exist or as alternate zone) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex items-center justify-center gap-3 ${
          isDragging
            ? 'border-[var(--accent)] bg-[var(--accent)]/10 scale-[0.99]'
            : 'border-[var(--divider)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)]'
        }`}
      >
        <UploadCloud className="w-5 h-5 text-[var(--text-2)]" />
        <span className="text-xs text-[var(--text-2)] font-medium">
          Перетащите фото сюда или нажмите для выбора из галереи
        </span>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={loadPhotos}
            className="text-[11px] underline font-bold cursor-pointer"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Photos Grid or Loading or Empty State */}
      {loadingList ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="aspect-square rounded-2xl bg-[var(--surface-2)] animate-pulse border border-[var(--divider)]"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center rounded-3xl bg-[var(--surface)] border border-[var(--divider)] border-dashed">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[var(--text)] mb-1">Здесь будут ваши воспоминания</h3>
          <p className="text-xs text-[var(--text-2)] max-w-sm mb-5 leading-relaxed">
            Снимки со свиданий, романтических поездок и тёплых моментов. Фотографии надёжно шифруются и хранятся в вашей паре.
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-[var(--accent)] text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 cursor-pointer hover:opacity-95 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Загрузить первое фото</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => setSelectedPhoto(photo)}
              partnerNameMap={partnerNameMap}
            />
          ))}
        </div>
      )}

      {/* MODAL: Upload Photo & Preview */}
      <AnimatePresence>
        {isUploadOpen && (
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
                  onClick={closeUploadModal}
                  disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                  className="p-1.5 rounded-full hover:bg-[var(--surface-2)] text-[var(--text-2)] transition-colors"
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
                  onClick={closeUploadModal}
                  disabled={uploadStatus === 'compressing' || uploadStatus === 'uploading'}
                  className="py-2.5 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleStartUpload}
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
        )}
      </AnimatePresence>

      {/* MODAL: Fullscreen Lightbox & Delete confirmation */}
      <AnimatePresence>
        {selectedPhoto && (
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
                    {new Date(selectedPhoto.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-2)] font-medium">
                    {partnerNameMap[selectedPhoto.uploaderLogin?.toLowerCase()] || `@${selectedPhoto.uploaderLogin}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDownload}
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
                    onClick={() => setSelectedPhoto(null)}
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
                    alt={selectedPhoto.caption || 'Фото пары'}
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
              {selectedPhoto.caption && (
                <div className="p-3.5 sm:p-4 bg-[var(--surface)] border-t border-[var(--divider)]">
                  <p className="text-xs sm:text-sm text-[var(--text)] font-medium leading-relaxed">
                    {selectedPhoto.caption}
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
                        onClick={handleDeletePhoto}
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
        )}
      </AnimatePresence>
    </div>
  );
};
