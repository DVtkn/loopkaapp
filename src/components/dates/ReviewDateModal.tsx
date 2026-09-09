import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

interface ReviewDateModalProps {
  inviteId: string;
  onClose: () => void;
  onSaveReview: (inviteId: string, rating: number, notes: string, photos: string[]) => void;
}

export const ReviewDateModal: React.FC<ReviewDateModalProps> = ({
  inviteId,
  onClose,
  onSaveReview,
}) => {
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewNotes, setReviewNotes] = useState<string>('');

  const handleSave = () => {
    onSaveReview(
      inviteId,
      reviewRating,
      reviewNotes.trim() || 'Прекрасно провели время вместе!',
      []
    );
  };

  return (
    <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-[var(--text)]">Как прошло ваше свидание?</h4>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stars rating */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-[var(--text-2)] mr-1">Оценка:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setReviewRating(star)}
            className="p-1 hover:scale-110 transition-transform cursor-pointer"
          >
            <Star
              className={`w-5 h-5 ${
                star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-amber-500 ml-1">
          {reviewRating === 5
            ? 'Превосходно! (+200 XP)'
            : reviewRating === 4
            ? 'Очень хорошо (+150 XP)'
            : 'Хорошо (+100 XP)'}
        </span>
      </div>

      {/* Impressions text */}
      <textarea
        value={reviewNotes}
        onChange={(e) => setReviewNotes(e.target.value)}
        placeholder="Поделитесь тёплыми впечатлениями..."
        rows={2}
        className="w-full p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
      />

      <button
        type="button"
        onClick={handleSave}
        className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-2xs cursor-pointer"
      >
        Сохранить отзыв и получить XP ⭐
      </button>
    </div>
  );
};
