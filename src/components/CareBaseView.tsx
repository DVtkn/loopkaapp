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
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { SmallCraving, WishlistItem } from '../types';
import { ColoredIcon, MoodBadge, IconColorTheme } from './ColoredIcon';
import { PageLayout } from './ui/PageLayout';

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
    toggleSecretReserve,
    deleteWishlistItem,
    moodHistory,
    addMoodStatus,
    setActiveTab,
  } = useCouple();

  const [activeCareTab, setActiveCareTab] = useState<'cravings' | 'flowers' | 'wishlist' | 'mood'>(
    'cravings'
  );

  // New Craving State
  const [newCravingTitle, setNewCravingTitle] = useState<string>('');
  const [newCravingCategory, setNewCravingCategory] = useState<SmallCraving['category']>('treat');

  // New Wishlist State
  const [showWishlistModal, setShowWishlistModal] = useState<boolean>(false);
  const [wishlistTitle, setWishlistTitle] = useState<string>('');
  const [wishlistPrice, setWishlistPrice] = useState<string>('');
  const [wishlistCategory, setWishlistCategory] = useState<WishlistItem['category']>('gift');
  const [wishlistUrl, setWishlistUrl] = useState<string>('');
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
    addCraving(newCravingTitle, newCravingCategory);
    setNewCravingTitle('');
  };

  const handleCreateWishlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishlistTitle.trim()) return;
    addWishlistItem({
      title: wishlistTitle,
      priceEstimate: wishlistPrice || undefined,
      category: wishlistCategory,
      url: wishlistUrl || undefined,
      note: wishlistNote || undefined,
    });
    setShowWishlistModal(false);
    setWishlistTitle('');
    setWishlistPrice('');
    setWishlistNote('');
    setWishlistUrl('');
  };

  const getCravingIcon = (cat: SmallCraving['category']): { icon: any; color: IconColorTheme } => {
    switch (cat) {
      case 'treat':
        return { icon: Utensils, color: 'rose' };
      case 'drink':
        return { icon: Coffee, color: 'amber' };
      case 'touch':
        return { icon: Heart, color: 'coral' };
      case 'help':
        return { icon: HandHeart, color: 'teal' };
      default:
        return { icon: Sparkles, color: 'purple' };
    }
  };

  return (
    <PageLayout title="База заботы" subtitle="Шпаргалка внимания и радости" onBack={() => setActiveTab('us')}>
      <div className="space-y-6">
        {/* 1. Header Banner */}
      <div className="rounded-3xl bg-[var(--surface)] border border-[var(--divider)] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
              <Heart className="w-3.5 h-3.5 fill-[var(--accent)] text-[var(--accent)]" />
              <span>Шпаргалка заботы о любимом человеке</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text)]">
              База заботы о {otherPartner.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)] max-w-2xl leading-relaxed">
              Здесь собраны приятные мелочи: любимые напитки, сладости, предпочтения в цветах, виш-лист и актуальное настроение. Радуйте без повода и повышайте рейтинг пары!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs shrink-0 flex items-center gap-3">
            <MoodBadge mood={otherPartner.currentMood.label} size="md" />
            <div>
              <p className="text-[11px] text-[var(--text-2)] font-medium">Настроение {otherPartner.name}:</p>
              <p className="font-bold text-[var(--text)] text-sm">{otherPartner.currentMood.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-[var(--surface)] p-2 rounded-2xl border border-[var(--divider)] shadow-xs overflow-x-auto scrollbar-none">
        <button
          id="care-tab-cravings"
          onClick={() => setActiveCareTab('cravings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeCareTab === 'cravings'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Хотелки-мелочи ({smallCravings.length})</span>
        </button>

        <button
          id="care-tab-flowers"
          onClick={() => setActiveCareTab('flowers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeCareTab === 'flowers'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Flower2 className="w-4 h-4" />
          <span>Любимые цветы</span>
        </button>

        <button
          id="care-tab-wishlist"
          onClick={() => setActiveCareTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeCareTab === 'wishlist'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>Виш-лист подарков ({wishlist.length})</span>
        </button>

        <button
          id="care-tab-mood"
          onClick={() => setActiveCareTab('mood')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeCareTab === 'mood'
              ? 'bg-[var(--accent)] text-white shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>История настроения</span>
        </button>
      </div>

      {/* 3. Tab Content */}

      {/* 3.1 CRAVINGS TAB */}
      {activeCareTab === 'cravings' && (
        <div className="space-y-5">
          {/* Add Craving Form */}
          <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--divider)] shadow-xs">
            <h3 className="font-black text-[var(--text)] text-sm mb-3">
              Добавить маленькую хотелку или спонтанную радость
            </h3>
            <form onSubmit={handleCreateCraving} className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="craving-title-input"
                type="text"
                value={newCravingTitle}
                onChange={(e) => setNewCravingTitle(e.target.value)}
                placeholder="Шоколадный эклер, капучино, массаж..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
              />
              <select
                value={newCravingCategory}
                onChange={(e) => setNewCravingCategory(e.target.value as any)}
                className="px-3 py-2.5 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl focus:outline-none text-[var(--text)]"
              >
                <option value="treat">Вкусняшка</option>
                <option value="drink">Напиток</option>
                <option value="touch">Массаж / Тактильность</option>
                <option value="help">Помощь</option>
                <option value="other">Другое</option>
              </select>
              <button
                id="add-craving-btn"
                type="submit"
                className="px-5 py-2.5 bg-[var(--accent)] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить (+20 XP)</span>
              </button>
            </form>
          </div>

          {/* Cravings Grid */}
          {smallCravings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {smallCravings.map((craving) => {
                const authorName = craving.addedBy === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name;
                const { icon: CIcon, color: cColor } = getCravingIcon(craving.category);

                return (
                  <div
                    key={craving.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      craving.fulfilled
                        ? 'bg-[var(--surface-2)]/60 border-[var(--divider)] text-[var(--text-2)]'
                        : 'bg-[var(--surface)] border-[var(--divider)] shadow-xs hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ColoredIcon icon={CIcon} color={cColor} size="sm" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-2)] block mb-0.5">
                          Добавлено: {authorName}
                        </span>
                        <h4
                          className={`text-sm font-bold ${
                            craving.fulfilled ? 'line-through text-[var(--text-2)]' : 'text-[var(--text)]'
                          }`}
                        >
                          {craving.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      id={`toggle-craving-${craving.id}`}
                      onClick={() => toggleCraving(craving.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        craving.fulfilled
                          ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20'
                          : 'bg-[var(--surface-2)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white border border-[var(--divider)]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{craving.fulfilled ? 'Порадовал(а)' : 'Порадовать (+40 XP)'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-2xl p-8 border border-[var(--divider)] text-center">
              <p className="text-sm font-bold text-[var(--text)]">Список хотелок пуст</p>
              <p className="text-xs text-[var(--text-2)] mt-1">Добавьте первую маленькую радость в форме выше</p>
            </div>
          )}
        </div>
      )}

      {/* 3.2 FLOWERS TAB */}
      {activeCareTab === 'flowers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Partner's Flowers Guide */}
          <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--divider)] shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--divider)]">
              <ColoredIcon icon={Flower2} color="rose" size="md" />
              <div>
                <h3 className="font-black text-[var(--text)] text-base">
                  Цветочный гид: {otherPartner.name}
                </h3>
                <p className="text-xs text-[var(--text-2)]">Точные подсказки перед заказом букета</p>
              </div>
            </div>

            {/* Favorite Flowers */}
            <div>
              <span className="text-xs font-bold text-[var(--text)] block mb-2">
                Любимые цветы и зелень:
              </span>
              <div className="flex flex-wrap gap-2">
                {partnerFlowerPrefs.favoriteFlowers.map((f, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Disliked Flowers */}
            <div>
              <span className="text-xs font-bold text-[var(--text)] block mb-2">
                Лучше не дарить:
              </span>
              <div className="flex flex-wrap gap-2">
                {partnerFlowerPrefs.dislikedFlowers.map((f, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] border border-[var(--divider)] text-xs font-medium"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Colors & Style */}
            <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] space-y-2 text-xs text-[var(--text)]">
              <p>
                <strong>Цветовая гамма:</strong>{' '}
                {partnerFlowerPrefs.colorPreferences.join(', ')}
              </p>
              <p>
                <strong>Идеальный букет:</strong>{' '}
                {partnerFlowerPrefs.idealBouquetDescription}
              </p>
              <p>
                <strong>Уход за цветами:</strong>{' '}
                {partnerFlowerPrefs.careNotes}
              </p>
            </div>
          </div>

          {/* Florist Quick Note */}
          <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--divider)] shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wide block">
                Готовый текст для флориста
              </span>
              <h4 className="text-base font-bold text-[var(--text)]">
                Скопируйте в один клик при заказе в салоне:
              </h4>
              <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] text-xs text-[var(--text)] leading-relaxed italic">
                «Здравствуйте! Соберите, пожалуйста, нежный растрёпанный букет в пастельных тонах с пионами/пионовидными розами и веточками эвкалипта. Без классических красных роз и гвоздик. Упаковка в матовую кальку или крафт.»
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--divider)] flex items-center justify-between text-xs text-[var(--text-2)]">
              <span>Добавьте записку с тёплыми словами от руки</span>
              <span className="font-bold text-[var(--accent)]">+50 XP в рейтинг пары</span>
            </div>
          </div>
        </div>
      )}

      {/* 3.3 WISHLIST TAB */}
      {activeCareTab === 'wishlist' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-[var(--text)] text-base">Виш-лист подарков</h3>
              <p className="text-xs text-[var(--text-2)]">
                Секретное бронирование позволяет подготовить сюрприз так, чтобы партнёр не догадался
              </p>
            </div>
            <button
              id="add-wishlist-modal-btn"
              onClick={() => setShowWishlistModal(true)}
              className="px-4 py-2 bg-[var(--accent)] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить желание</span>
            </button>
          </div>

          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((item) => {
                const authorName =
                  item.addedBy === 'partner1' ? coupleProfile.partner1.name : coupleProfile.partner2.name;
                const isMine = item.addedBy === currentPartnerId;

                return (
                  <div
                    key={item.id}
                    className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--divider)] shadow-xs flex flex-col justify-between"
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-40 object-cover"
                      />
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded-lg border border-[var(--accent)]/20">
                            {authorName}
                          </span>
                          {item.priceEstimate && (
                            <span className="text-xs font-bold text-[var(--text)] font-mono">
                              {item.priceEstimate}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-[var(--text)] text-sm mb-1.5">
                          {item.title}
                        </h4>
                        {item.note && (
                          <p className="text-xs text-[var(--text-2)] italic mb-3">
                            «{item.note}»
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[var(--divider)] flex items-center justify-between gap-2">
                        {!isMine ? (
                          <button
                            onClick={() => toggleSecretReserve(item.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              item.isSecretReserved
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-[var(--surface-2)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)]'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>{item.isSecretReserved ? 'Забронировано вами' : 'Забронировать втайне'}</span>
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--text-2)] italic">Ваше желание</span>
                        )}

                        <button
                          onClick={() => deleteWishlistItem(item.id)}
                          className="p-1.5 text-[var(--text-2)] hover:text-rose-500 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-2xl p-8 border border-[var(--divider)] text-center">
              <p className="text-sm font-bold text-[var(--text)]">Виш-лист пока пуст</p>
              <p className="text-xs text-[var(--text-2)] mt-1">Нажмите «Добавить желание», чтобы сохранить подарок или мечту</p>
            </div>
          )}
        </div>
      )}

      {/* 3.4 MOOD TAB (7-Day Trend) */}
      {activeCareTab === 'mood' && (
        <div className="bg-[var(--surface)] rounded-2xl p-6 sm:p-7 border border-[var(--divider)] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--divider)]">
            <div>
              <h3 className="font-black text-[var(--text)] text-base">
                История настроения за 7 дней
              </h3>
              <p className="text-xs text-[var(--text-2)]">
                Помогает вовремя заметить усталость партнёра и проявить тепло
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Other Partner History */}
            <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)]">
              <h4 className="font-bold text-[var(--text)] text-sm mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {otherPartner.name} (Последние отметки):
              </h4>
              {moodHistory.filter((m) => m.partnerId === otherPartnerId).length > 0 ? (
                <div className="space-y-2">
                  {moodHistory
                    .filter((m) => m.partnerId === otherPartnerId)
                    .slice(0, 5)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--divider)] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <MoodBadge mood={m.label} size="sm" />
                          <div>
                            <p className="font-bold text-[var(--text)]">{m.label}</p>
                            {m.note && <p className="text-[11px] text-[var(--text-2)] italic">«{m.note}»</p>}
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--text-2)]">{m.date}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-2)] italic py-2">Пока нет отметок настроения</p>
              )}
            </div>

            {/* Current Partner History */}
            <div className="p-5 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)]">
              <h4 className="font-bold text-[var(--text)] text-sm mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                {currentPartner.name} (Последние отметки):
              </h4>
              {moodHistory.filter((m) => m.partnerId === currentPartnerId).length > 0 ? (
                <div className="space-y-2">
                  {moodHistory
                    .filter((m) => m.partnerId === currentPartnerId)
                    .slice(0, 5)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-3 bg-[var(--surface)] rounded-xl border border-[var(--divider)] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <MoodBadge mood={m.label} size="sm" />
                          <div>
                            <p className="font-bold text-[var(--text)]">{m.label}</p>
                            {m.note && <p className="text-[11px] text-[var(--text-2)] italic">«{m.note}»</p>}
                          </div>
                        </div>
                        <span className="text-[10px] text-[var(--text-2)]">{m.date}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-2)] italic py-2">Пока нет отметок настроения</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Wishlist Modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--divider)] space-y-4 animate-fadeIn">
            <h3 className="text-base font-black text-[var(--text)]">
              Добавить подарок в виш-лист
            </h3>
            <form onSubmit={handleCreateWishlistItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1">
                  Название подарка / впечатления:
                </label>
                <input
                  type="text"
                  required
                  value={wishlistTitle}
                  onChange={(e) => setWishlistTitle(e.target.value)}
                  placeholder="Книга, спа-процедура, шарф..."
                  className="w-full px-3.5 py-2.5 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">
                    Ориентир цены:
                  </label>
                  <input
                    type="text"
                    value={wishlistPrice}
                    onChange={(e) => setWishlistPrice(e.target.value)}
                    placeholder="3 000 ₽"
                    className="w-full px-3.5 py-2.5 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-2)] mb-1">
                    Категория:
                  </label>
                  <select
                    value={wishlistCategory}
                    onChange={(e) => setWishlistCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl focus:outline-none text-[var(--text)]"
                  >
                    <option value="gift">Подарок</option>
                    <option value="experience">Впечатление</option>
                    <option value="home">Для дома</option>
                    <option value="gadget">Гаджет</option>
                    <option value="clothing">Одежда</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-2)] mb-1">
                  Ссылка или заметка:
                </label>
                <input
                  type="text"
                  value={wishlistNote}
                  onChange={(e) => setWishlistNote(e.target.value)}
                  placeholder="Цвет, размер или магазин"
                  className="w-full px-3.5 py-2.5 text-xs bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl text-[var(--text)] focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWishlistModal(false)}
                  className="w-1/2 py-2.5 text-xs font-bold text-[var(--text-2)] bg-[var(--surface-2)] rounded-xl hover:text-[var(--text)]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 text-xs font-bold text-white bg-[var(--accent)] hover:opacity-95 rounded-xl shadow-sm"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  );
};
