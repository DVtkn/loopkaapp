import React, { useState } from 'react';
import {
  Coffee,
  Heart,
  Flower2,
  Gift,
  Smile,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  ExternalLink,
  Sparkles,
  Edit3,
  Utensils,
  HandHeart,
  HelpCircle,
  ShoppingBag,
  Home as HomeIcon,
  Smartphone,
  Shirt,
  Ticket,
  X,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { SmallCraving, WishlistItem } from '../types';
import { PageLayout } from './ui/PageLayout';
import { StatTile, CarouselTile, ActionRow, PrimaryCTA, CarouselItem } from './ui/SystemBlocks';
import { triggerHaptic } from '../utils/haptics';

export const CareBaseView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    smallCravings,
    addCraving,
    toggleCraving,
    flowerPreferences,
    updateFlowerPreferences,
    wishlist,
    addWishlistItem,
    deleteWishlistItem,
    setActiveTab,
    triggerConfetti,
  } = useCouple();

  // Modals state
  const [showAddCravingModal, setShowAddCravingModal] = useState<boolean>(false);
  const [showFlowersModal, setShowFlowersModal] = useState<boolean>(false);
  const [showWishlistModal, setShowWishlistModal] = useState<boolean>(false);

  // New Craving State
  const [newCravingTitle, setNewCravingTitle] = useState<string>('');
  const [newCravingCategory, setNewCravingCategory] = useState<SmallCraving['category']>('treat');

  // New Wishlist State
  const [wishlistTitle, setWishlistTitle] = useState<string>('');
  const [wishlistPrice, setWishlistPrice] = useState<string>('');
  const [wishlistCategory, setWishlistCategory] = useState<WishlistItem['category']>('gift');
  const [wishlistNote, setWishlistNote] = useState<string>('');

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;
  const otherPartnerId = currentPartnerId === 'partner1' ? 'partner2' : 'partner1';

  const partnerFlowerPrefs = flowerPreferences[otherPartnerId] || {
    favoriteFlowers: ['Пионы', 'Ромашки'],
    dislikedFlowers: ['Гвоздики'],
    colorPreferences: ['Пастельные тона'],
    careNotes: 'Менять воду раз в 2 дня',
    idealBouquetDescription: 'Воздушный букет в крафтовой бумаге',
  };

  const handleCreateCraving = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCravingTitle.trim()) return;
    addCraving(newCravingTitle.trim(), newCravingCategory);
    setNewCravingTitle('');
    setShowAddCravingModal(false);
    triggerHaptic(40);
    triggerConfetti();
  };

  const handleCreateWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistTitle.trim()) return;
    addWishlistItem({
      title: wishlistTitle.trim(),
      priceEstimate: wishlistPrice.trim() || undefined,
      category: wishlistCategory,
      note: wishlistNote.trim() || undefined,
    });
    setWishlistTitle('');
    setWishlistPrice('');
    setWishlistNote('');
    triggerHaptic(40);
  };

  const getCravingIcon = (cat: SmallCraving['category']) => {
    switch (cat) {
      case 'treat':
        return <Utensils className="w-5 h-5" />;
      case 'drink':
        return <Coffee className="w-5 h-5" />;
      case 'touch':
        return <Heart className="w-5 h-5" />;
      case 'help':
        return <HandHeart className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Convert cravings to CarouselItems
  const cravingItems: CarouselItem[] = smallCravings.map((c) => ({
    id: c.id,
    title: c.title,
    icon: getCravingIcon(c.category),
    color: c.fulfilled ? '#10b981' : '#f43f5e',
    onClick: () => {
      toggleCraving(c.id);
      triggerHaptic(50);
    },
  }));

  return (
    <PageLayout title="Книга заботы" onBack={() => setActiveTab('us')}>
      <div className="space-y-4 pt-1 pb-8">
        {/* Block 1: Stat-tile grid (facts only) */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            icon={<Coffee className="w-5 h-5 text-amber-500" />}
            value={String(smallCravings.length)}
            label="Хотелок сохранено"
          />
          <StatTile
            icon={<Gift className="w-5 h-5 text-rose-500" />}
            value={String(wishlist.length)}
            label="Подарков в вишлисте"
          />
        </div>

        {/* Block 2: Action-row group (max 2 rows) */}
        <div className="space-y-2">
          <ActionRow
            icon={<Flower2 className="w-5 h-5 text-rose-500" />}
            title="Любимые цветы"
            value={partnerFlowerPrefs.favoriteFlowers?.slice(0, 2).join(', ') || 'Посмотреть'}
            onClick={() => setShowFlowersModal(true)}
          />
          <ActionRow
            icon={<Gift className="w-5 h-5 text-amber-500" />}
            title="Виш-лист подарков"
            value={`${wishlist.length} желаний`}
            onClick={() => setShowWishlistModal(true)}
          />
        </div>

        {/* Block 3: Primary CTA (Single explicit CTA for adding user's own craving) */}
        <PrimaryCTA
          icon={<Plus className="w-6 h-6 text-[var(--accent)]" />}
          title="Добавить свою хотелку"
          subtitle="Партнёр сможет исполнить её и порадовать вас"
          onClick={() => setShowAddCravingModal(true)}
        />

        {/* Block 4: Partner cravings showcase or calm empty indicator */}
        {smallCravings.length > 0 ? (
          <CarouselTile items={cravingItems} title="Хотелки партнёра" />
        ) : (
          <div className="space-y-2 shrink-0 w-full overflow-hidden">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-3)] px-0.5">
              Хотелки партнёра
            </h3>
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] text-center">
              <p className="text-xs text-[var(--text-2)] font-medium">
                {otherPartner.name} пока не добавил(а) свои хотелки
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Add Craving */}
      {showAddCravingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--divider)] space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text)]">
                Добавить свою хотелку
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCravingModal(false)}
                className="p-1 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCraving} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                  Что вас порадует?
                </label>
                <input
                  type="text"
                  required
                  value={newCravingTitle}
                  onChange={(e) => setNewCravingTitle(e.target.value)}
                  placeholder="Шоколадный эклер, капучино, массаж плеч..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-2)] mb-1">
                  Категория
                </label>
                <select
                  value={newCravingCategory}
                  onChange={(e) => setNewCravingCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                >
                  <option value="treat">Вкусняшка</option>
                  <option value="drink">Напиток</option>
                  <option value="touch">Массаж / Тактильность</option>
                  <option value="help">Помощь</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCravingModal(false)}
                  className="w-1/2 py-2.5 text-xs font-bold text-[var(--text-2)] bg-[var(--surface-2)] rounded-xl hover:text-[var(--text)] cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-[var(--accent)] hover:opacity-95 rounded-xl shadow-xs cursor-pointer"
                >
                  Добавить (+20 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Flowers Details */}
      {showFlowersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--divider)] space-y-4 animate-fadeIn max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flower2 className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-[var(--text)]">
                  Цветы для {otherPartner.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFlowersModal(false)}
                className="p-1 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                <p className="font-semibold text-[var(--text-2)]">Любимые цветы:</p>
                <p className="text-sm font-bold text-[var(--text)] mt-0.5">
                  {partnerFlowerPrefs.favoriteFlowers?.join(', ') || 'Не указаны'}
                </p>
              </div>

              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                <p className="font-semibold text-[var(--text-2)]">Не любит:</p>
                <p className="text-sm font-medium text-rose-500 mt-0.5">
                  {partnerFlowerPrefs.dislikedFlowers?.join(', ') || 'Нет'}
                </p>
              </div>

              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                <p className="font-semibold text-[var(--text-2)]">Цветовая гамма:</p>
                <p className="text-sm font-medium text-[var(--text)] mt-0.5">
                  {partnerFlowerPrefs.colorPreferences?.join(', ') || 'Любые нежные'}
                </p>
              </div>

              <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                <p className="font-semibold text-[var(--text-2)]">Уход и заметка:</p>
                <p className="text-sm font-medium text-[var(--text)] mt-0.5">
                  {partnerFlowerPrefs.careNotes || 'Менять воду раз в два дня'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFlowersModal(false)}
              className="w-full py-2.5 text-xs font-bold text-white bg-[var(--accent)] rounded-xl shadow-xs cursor-pointer"
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Wishlist */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--divider)] space-y-4 animate-fadeIn max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-[var(--text)]">
                  Виш-лист подарков
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWishlistModal(false)}
                className="p-1 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of gifts */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {wishlist.length > 0 ? (
                wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[var(--text)]">{item.title}</p>
                      {item.priceEstimate && (
                        <p className="text-[11px] text-[var(--text-2)]">{item.priceEstimate}</p>
                      )}
                      {item.note && (
                        <p className="text-[11px] text-[var(--text-2)] italic">{item.note}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteWishlistItem(item.id)}
                      className="text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[var(--text-2)] text-center py-3 italic">
                  Виш-лист пока пуст
                </p>
              )}
            </div>

            {/* Add gift mini form */}
            <form onSubmit={handleCreateWishlistItem} className="space-y-2.5 pt-2 border-t border-[var(--divider)]">
              <p className="text-xs font-bold text-[var(--text)]">Добавить подарок</p>
              <input
                type="text"
                required
                value={wishlistTitle}
                onChange={(e) => setWishlistTitle(e.target.value)}
                placeholder="Книга, спа, духи..."
                className="w-full px-3 py-2 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={wishlistPrice}
                  onChange={(e) => setWishlistPrice(e.target.value)}
                  placeholder="Цена (напр. 3 000 ₽)"
                  className="w-full px-3 py-2 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                />
                <select
                  value={wishlistCategory}
                  onChange={(e) => setWishlistCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                >
                  <option value="gift">Подарок</option>
                  <option value="experience">Впечатление</option>
                  <option value="home">Для дома</option>
                  <option value="clothing">Одежда</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-[var(--accent)] hover:opacity-95 rounded-xl shadow-xs cursor-pointer"
              >
                Сохранить в виш-лист
              </button>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
