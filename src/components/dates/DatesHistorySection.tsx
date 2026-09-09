import React from 'react';
import { Calendar, Clock, Sparkles, MapPin, Heart, Star } from 'lucide-react';
import { DateInvite, CoupleProfile, Venue } from '../../types.ts';
import { AcceptInviteModal } from './AcceptInviteModal.tsx';
import { ReviewDateModal } from './ReviewDateModal.tsx';

interface DatesHistorySectionProps {
  dateInvites: DateInvite[];
  currentPartnerId: string;
  coupleProfile: CoupleProfile;
  venues: Venue[];
  acceptingId: string | null;
  setAcceptingId: (id: string | null) => void;
  reviewingInviteId: string | null;
  setReviewingInviteId: (id: string | null) => void;
  onOpenInviteModal: () => void;
  onAcceptInviteSubmit: (
    id: string,
    date: string,
    time: string,
    location: string,
    bookingLink?: string,
    saveToVenues?: boolean
  ) => void;
  onSaveReview: (inviteId: string, rating: number, notes: string, photos: string[]) => void;
}

export const DatesHistorySection: React.FC<DatesHistorySectionProps> = ({
  dateInvites,
  currentPartnerId,
  coupleProfile,
  venues,
  acceptingId,
  setAcceptingId,
  reviewingInviteId,
  setReviewingInviteId,
  onOpenInviteModal,
  onAcceptInviteSubmit,
  onSaveReview,
}) => {
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--text-2)]">
            История свиданий ({dateInvites.length})
          </h3>
        </div>
      </div>

      {dateInvites.length > 0 ? (
        <div className="space-y-3.5">
          {dateInvites.map((item) => {
            const sender = item.senderId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
            const isMine = item.senderId === currentPartnerId;
            const isCompleted = !!item.completed || !!item.review;

            // 1. PENDING
            if (item.status === 'PENDING') {
              if (isMine) {
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] shadow-2xs space-y-1.5 opacity-90"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Ожидает ответа от {otherPartner.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-3)]">
                        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-[var(--text)]">«{item.invitationNote}»</p>
                    {item.chosenLocation && (
                      <div className="flex items-center gap-1 text-xs text-[var(--text-2)] pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                        <span>{item.chosenLocation}</span>
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border-2 border-[var(--accent)] shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[var(--accent)] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Новое приглашение от {sender.name}
                      </span>
                      <span className="text-[10px] text-[var(--text-3)]">
                        {new Date(item.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
                      <p className="text-sm font-bold text-[var(--text)] italic">
                        «{item.invitationNote}»
                      </p>
                      {item.chosenLocation && (
                        <p className="text-xs text-[var(--accent)] font-semibold mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>Предложенное место: {item.chosenLocation}</span>
                        </p>
                      )}
                    </div>

                    {acceptingId === item.id ? (
                      <AcceptInviteModal
                        inviteId={item.id}
                        defaultLocation={item.chosenLocation}
                        venues={venues}
                        onCancel={() => setAcceptingId(null)}
                        onSubmit={onAcceptInviteSubmit}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAcceptingId(item.id)}
                        className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span>Принять приглашение и выбрать время</span>
                      </button>
                    )}
                  </div>
                );
              }
            }

            // 2. CONFIRMED / COMPLETED
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent)] animate-pulse'
                      }`}
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[var(--text-2)]">
                        {item.chosenDate || 'Свидание'}{' '}
                        {item.chosenTime ? `в ${item.chosenTime}` : ''}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text)] mt-0.5">
                        {item.chosenLocation || 'Романтический вечер'}
                      </h4>
                    </div>
                  </div>

                  {isCompleted ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Завершено
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-blush)] text-[var(--accent)]">
                      Предстоит
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text)] italic">
                  «{item.invitationNote}»
                </div>

                {/* Review Block or Review Form */}
                {item.review ? (
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= item.review!.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                          {item.review.rating}/5
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        +200 XP получено
                      </span>
                    </div>

                    {item.review.impressions && (
                      <p className="text-xs text-[var(--text)] font-medium leading-relaxed">
                        {item.review.impressions}
                      </p>
                    )}

                    {item.review.photos && item.review.photos.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {item.review.photos.map((ph, idx) => (
                          <img
                            key={idx}
                            src={ph}
                            alt={`Фото со свидания ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="h-20 w-full object-cover rounded-xl border border-[var(--divider)] shadow-2xs"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-1">
                    {reviewingInviteId === item.id ? (
                      <ReviewDateModal
                        inviteId={item.id}
                        onClose={() => setReviewingInviteId(null)}
                        onSaveReview={onSaveReview}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewingInviteId(item.id)}
                        className="w-full py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white text-[var(--text)] text-xs font-bold border border-[var(--divider)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                        <span>Завершить свидание и оставить отзыв (+200 XP)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)]">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text)]">История свиданий пока пуста</h4>
          <p className="text-xs text-[var(--text-2)] max-w-xs mx-auto leading-relaxed">
            Крутите колесо или нажмите «Пригласить на свидание», чтобы организовать первое свидание!
          </p>
          <button
            type="button"
            onClick={onOpenInviteModal}
            className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Пригласить на свидание</span>
          </button>
        </div>
      )}
    </section>
  );
};
