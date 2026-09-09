import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Venue } from '../../types.ts';
import { IconColorTheme } from '../ColoredIcon.tsx';

interface CategoryOption {
  id: Venue['category'];
  label: string;
  icon: any;
  color: IconColorTheme;
}

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  onAddVenue: (venueData: {
    name: string;
    city: string;
    category: Venue['category'];
    vibe: string;
    priceLevel: Venue['priceLevel'];
    address: string;
    rating: number;
    description: string;
    bookingUrl?: string;
  }) => void;
}

export const AddVenueModal: React.FC<AddVenueModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddVenue,
}) => {
  const [newVenueName, setNewVenueName] = useState<string>('');
  const [newVenueCategory, setNewVenueCategory] = useState<Venue['category']>('restaurant');
  const [newVenueVibe, setNewVenueVibe] = useState<string>('Уютный романтический вечер');
  const [newVenuePrice, setNewVenuePrice] = useState<Venue['priceLevel']>('₽₽');
  const [newVenueAddress, setNewVenueAddress] = useState<string>('');
  const [newVenueDescription, setNewVenueDescription] = useState<string>('');
  const [newVenueLink, setNewVenueLink] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    onAddVenue({
      name: newVenueName.trim(),
      city: 'Москва',
      category: newVenueCategory,
      vibe: newVenueVibe.trim() || 'Уютный романтический вечер',
      priceLevel: newVenuePrice,
      address: newVenueAddress.trim() || 'Центр города',
      rating: 5.0,
      description: newVenueDescription.trim() || 'Любимое место пары',
      bookingUrl: newVenueLink.trim() || undefined,
    });

    setNewVenueName('');
    setNewVenueVibe('Уютный романтический вечер');
    setNewVenueAddress('');
    setNewVenueDescription('');
    setNewVenueLink('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 border border-[var(--divider)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">Добавить место пары</h3>
              <p className="text-[11px] text-[var(--text-2)]">+30 XP в копилку рейтинга пары</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
              Название места *
            </label>
            <input
              type="text"
              required
              value={newVenueName}
              onChange={(e) => setNewVenueName(e.target.value)}
              placeholder="Например: Кафе «Утро», ресторан «Север»"
              className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
                Категория
              </label>
              <select
                value={newVenueCategory}
                onChange={(e) => setNewVenueCategory(e.target.value as Venue['category'])}
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
                Уровень цен
              </label>
              <select
                value={newVenuePrice}
                onChange={(e) => setNewVenuePrice(e.target.value as Venue['priceLevel'])}
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none"
              >
                <option value="₽">₽ (Демократично)</option>
                <option value="₽₽">₽₽ (Средний)</option>
                <option value="₽₽₽">₽₽₽ (Премиум)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
              Атмосфера / Вайб
            </label>
            <input
              type="text"
              value={newVenueVibe}
              onChange={(e) => setNewVenueVibe(e.target.value)}
              placeholder="Приглушённый свет, живая музыка, уют"
              className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
              Адрес / Район
            </label>
            <input
              type="text"
              value={newVenueAddress}
              onChange={(e) => setNewVenueAddress(e.target.value)}
              placeholder="Улица, дом или ориентир"
              className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
              Заметка / Почему сюда хочется
            </label>
            <textarea
              rows={2}
              value={newVenueDescription}
              onChange={(e) => setNewVenueDescription(e.target.value)}
              placeholder="Наши любимые десерты, красивый вид из окна..."
              className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-[var(--text-2)] block mb-1">
              Ссылка на сайт / меню (опционально)
            </label>
            <input
              type="url"
              value={newVenueLink}
              onChange={(e) => setNewVenueLink(e.target.value)}
              placeholder="https://..."
              className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            Сохранить место (+30 XP)
          </button>
        </form>
      </div>
    </div>
  );
};
