import React, { useState } from 'react';
import { Venue } from '../../types.ts';

interface AcceptInviteModalProps {
  inviteId: string;
  defaultLocation?: string;
  venues: Venue[];
  onCancel: () => void;
  onSubmit: (
    id: string,
    date: string,
    time: string,
    location: string,
    bookingLink?: string,
    saveToVenues?: boolean
  ) => void;
}

export const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({
  inviteId,
  defaultLocation = '',
  venues,
  onCancel,
  onSubmit,
}) => {
  const [acceptDateVal, setAcceptDateVal] = useState<string>('');
  const [acceptTimeVal, setAcceptTimeVal] = useState<string>('');
  const [acceptVenueId, setAcceptVenueId] = useState<string>('');
  const [acceptCustomLocation, setAcceptCustomLocation] = useState<string>(defaultLocation);
  const [acceptSaveToVenues, setAcceptSaveToVenues] = useState<boolean>(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedV = venues.find((v) => v.id === acceptVenueId);
    const loc = selectedV ? selectedV.name : acceptCustomLocation || 'Любимое место';
    const link = selectedV?.bookingUrl;

    onSubmit(
      inviteId,
      acceptDateVal || 'Пятница',
      acceptTimeVal || '19:30',
      loc,
      link,
      acceptSaveToVenues
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[var(--divider)]">
      <h4 className="text-xs font-bold text-[var(--text)]">Согласование времени и локации:</h4>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">День</label>
          <input
            type="text"
            required
            value={acceptDateVal}
            onChange={(e) => setAcceptDateVal(e.target.value)}
            placeholder="Например: Пятница"
            className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">Время</label>
          <input
            type="text"
            value={acceptTimeVal}
            onChange={(e) => setAcceptTimeVal(e.target.value)}
            placeholder="19:00"
            className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">Место / Локация</label>
        <input
          type="text"
          required
          value={
            acceptVenueId
              ? venues.find((v) => v.id === acceptVenueId)?.name || ''
              : acceptCustomLocation
          }
          onChange={(e) => {
            setAcceptCustomLocation(e.target.value);
            setAcceptVenueId('');
          }}
          className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] text-xs border border-[var(--divider)] text-[var(--text)]"
        />
      </div>

      <label className="flex items-center gap-2 pt-1 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptSaveToVenues}
          onChange={(e) => setAcceptSaveToVenues(e.target.checked)}
          className="rounded accent-[var(--accent)]"
        />
        <span className="text-[11px] text-[var(--text-2)] font-medium">
          Сохранить в список «Места пары» (+30 XP)
        </span>
      </label>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold shadow-2xs cursor-pointer"
        >
          Подтвердить свидание (+50 XP)
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2.5 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-bold border border-[var(--divider)] cursor-pointer"
        >
          Отмена
        </button>
      </div>
    </form>
  );
};
