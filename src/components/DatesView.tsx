import React, { useState, useMemo } from 'react';
import { PageLayout } from './ui/PageLayout';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  Send,
  CheckCircle2,
  Plus,
  Star,
  Trash2,
  ExternalLink,
  Camera,
  X,
  Award,
  ChevronRight,
  Wine,
  Coffee,
  TreePine,
  Film,
  Sun,
  Flame,
  Gamepad2,
  Compass,
  MessageCircle,
  RotateCw,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCouple } from '../context/CoupleContext';
import { Venue } from '../types';
import { ColoredIcon, IconColorTheme } from './ColoredIcon';
import { triggerHaptic } from '../utils/haptics';
import { TRUTHS, DARES } from '../data/truthDare';
import { DEEP_TALKS, SPICY_18, THIS_OR_THAT } from '../data/gamesData';
import { StatTile, CarouselTile, ActionRow, PrimaryCTA, CarouselItem } from './ui/SystemBlocks';
import { DateWheel, DateIdea } from './DateWheel';

export const DatesView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    venues,
    addVenue,
    deleteVenue,
    dateInvites,
    createDateInvite,
    acceptDateInvite,
    completeAndReviewDate,
    datesSubTab,
    setDatesSubTab,
    addFeedItem,
    coupleXP,
    addCoupleXP,
    triggerConfetti,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;

  // Level 1 vs Level 2 View navigation
  // Initialize based on datesSubTab if it was opened from outside
  const [currentView, setCurrentView] = useState<'main' | 'places' | 'games'>(() => {
    if (datesSubTab === 'places') return 'places';
    if (datesSubTab === 'games') return 'games';
    return 'main';
  });

  // Category filter for places
  const [placesCategoryFilter, setPlacesCategoryFilter] = useState<string>('all');

  // --- Invite Form State (Modal) ---
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteNote, setInviteNote] = useState<string>('Приглашаю тебя провести этот особенный вечер вдвоём');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [inviteDate, setInviteDate] = useState<string>('');
  const [inviteTime, setInviteTime] = useState<string>('');
  const [inviteSentSuccess, setInviteSentSuccess] = useState<boolean>(false);

  // --- Add Venue Modal State ---
  const [showAddVenueModal, setShowAddVenueModal] = useState<boolean>(false);
  const [newVenueName, setNewVenueName] = useState<string>('');
  const [newVenueCategory, setNewVenueCategory] = useState<Venue['category']>('restaurant');
  const [newVenueVibe, setNewVenueVibe] = useState<string>('Уютный романтический вечер');
  const [newVenuePrice, setNewVenuePrice] = useState<Venue['priceLevel']>('₽₽');
  const [newVenueAddress, setNewVenueAddress] = useState<string>('');
  const [newVenueDescription, setNewVenueDescription] = useState<string>('');
  const [newVenueLink, setNewVenueLink] = useState<string>('');

  // --- For Accepting Invites ---
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptDateVal, setAcceptDateVal] = useState<string>('');
  const [acceptTimeVal, setAcceptTimeVal] = useState<string>('');
  const [acceptVenueId, setAcceptVenueId] = useState<string>('');
  const [acceptCustomLocation, setAcceptCustomLocation] = useState<string>('');
  const [acceptLinkVal, setAcceptLinkVal] = useState<string>('');
  const [acceptSaveToVenues, setAcceptSaveToVenues] = useState<boolean>(true);

  // --- For Reviewing Dates ---
  const [reviewingInviteId, setReviewingInviteId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState<string>('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  // --- Games State ---
  const [activeGame, setActiveGame] = useState<'truth_dare' | 'deep_talks' | 'spicy' | 'this_or_that' | null>(null);
  const [tdCurrentPlayer, setTdCurrentPlayer] = useState<string>('');
  const [tdAction, setTdAction] = useState<'truth' | 'dare' | null>(null);
  const [tdCardText, setTdCardText] = useState<string>('');
  const [simpleGameText, setSimpleGameText] = useState<string>('');

  const handleDrawSimpleCard = (gameMode: 'deep_talks' | 'spicy' | 'this_or_that') => {
    triggerHaptic('light');
    let arr: string[] = [];
    if (gameMode === 'deep_talks') arr = DEEP_TALKS;
    else if (gameMode === 'spicy') arr = SPICY_18;
    else if (gameMode === 'this_or_that') arr = THIS_OR_THAT;
    setSimpleGameText(arr[Math.floor(Math.random() * arr.length)]);
  };

  const handleDrawCard = (type: 'truth' | 'dare') => {
    triggerHaptic('light');
    setTdAction(type);
    const arr = type === 'truth' ? TRUTHS : DARES;
    setTdCardText(arr[Math.floor(Math.random() * arr.length)]);
  };

  const handleNextPlayer = () => {
    triggerHaptic('selection');
    setTdAction(null);
    setTdCurrentPlayer(tdCurrentPlayer === currentPartner?.name ? otherPartner?.name : currentPartner?.name);
  };

  // Category presets
  const categories: {
    id: Venue['category'];
    label: string;
    icon: any;
    color: IconColorTheme;
  }[] = [
    { id: 'restaurant', label: 'Ресторан', icon: Wine, color: 'rose' },
    { id: 'cafe', label: 'Кофейня', icon: Coffee, color: 'amber' },
    { id: 'park', label: 'Парк / Прогулка', icon: TreePine, color: 'emerald' },
    { id: 'cinema', label: 'Кино / Театр', icon: Film, color: 'indigo' },
    { id: 'outdoor', label: 'Крыша / Панорама', icon: Sun, color: 'gold' },
    { id: 'spa', label: 'СПА / Релакс', icon: Sparkles, color: 'teal' },
    { id: 'other', label: 'Особенное', icon: Compass, color: 'purple' },
  ];

  const dateFormats: CarouselItem[] = [
    {
      id: 'restaurant',
      title: 'Ресторан',
      icon: <Wine className="w-5 h-5" />,
      color: 'warmth',
      onClick: () => {
        setInviteNote('Приглашаю тебя на романтический ужин в красивый ресторан');
        setShowInviteModal(true);
      },
    },
    {
      id: 'cafe',
      title: 'Кофейня',
      icon: <Coffee className="w-5 h-5" />,
      color: 'mood',
      onClick: () => {
        setInviteNote('Давай сходим за кофе и вкусным десертом');
        setShowInviteModal(true);
      },
    },
    {
      id: 'park',
      title: 'Прогулка',
      icon: <TreePine className="w-5 h-5" />,
      color: 'care',
      onClick: () => {
        setInviteNote('Пойдём погуляем в красивом парке на свежем воздухе');
        setShowInviteModal(true);
      },
    },
    {
      id: 'cinema',
      title: 'Кино',
      icon: <Film className="w-5 h-5" />,
      color: 'gamification',
      onClick: () => {
        setInviteNote('Выберем фильм и проведём уютный вечер в кино');
        setShowInviteModal(true);
      },
    },
    {
      id: 'outdoor',
      title: 'Крыша',
      icon: <Sun className="w-5 h-5" />,
      color: 'time',
      onClick: () => {
        setInviteNote('Хочу встретить с тобой закат на панорамной крыше');
        setShowInviteModal(true);
      },
    },
    {
      id: 'spa',
      title: 'СПА',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'dialogue',
      onClick: () => {
        setInviteNote('Предлагаю расслабляющий день в СПА только для нас двоих');
        setShowInviteModal(true);
      },
    },
  ];

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const venueObj = venues.find((v) => v.id === selectedVenueId);
    const locName = venueObj ? venueObj.name : customLocationName || 'Наше особенное свидание';

    createDateInvite(
      inviteNote,
      selectedVenueId || undefined,
      locName,
      inviteDate || undefined,
      inviteTime || undefined
    );

    addFeedItem({
      author: currentPartnerId,
      type: 'heart',
      title: `Пригласил(а) на свидание в «${locName}»!`,
      subtitle: inviteNote,
    });

    setInviteSentSuccess(true);
    triggerHaptic('success');
    triggerConfetti();

    setTimeout(() => {
      setInviteSentSuccess(false);
      setShowInviteModal(false);
      setInviteNote('Приглашаю тебя провести этот особенный вечер вдвоём');
      setSelectedVenueId('');
      setCustomLocationName('');
      setInviteDate('');
      setInviteTime('');
    }, 1500);
  };

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    addVenue({
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

    triggerHaptic('success');
    setShowAddVenueModal(false);
    setNewVenueName('');
    setNewVenueVibe('Уютный романтический вечер');
    setNewVenueAddress('');
    setNewVenueDescription('');
    setNewVenueLink('');
  };

  const handleAcceptInviteSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const selectedV = venues.find((v) => v.id === acceptVenueId);
    const loc = selectedV ? selectedV.name : acceptCustomLocation || 'Любимое место';
    const link = selectedV?.bookingUrl || acceptLinkVal;

    acceptDateInvite(
      id,
      acceptDateVal || 'Пятница',
      acceptTimeVal || '19:30',
      loc,
      link,
      acceptSaveToVenues
    );

    triggerHaptic('success');
    triggerConfetti();
    setAcceptingId(null);
    setAcceptDateVal('');
    setAcceptTimeVal('');
    setAcceptVenueId('');
    setAcceptCustomLocation('');
    setAcceptLinkVal('');
  };

  const handleSaveReview = (inviteId: string) => {
    completeAndReviewDate(
      inviteId,
      reviewRating,
      reviewNotes.trim() || 'Прекрасно провели время вместе!',
      reviewPhotos
    );
    triggerHaptic('success');
    triggerConfetti();
    setReviewingInviteId(null);
    setReviewRating(5);
    setReviewNotes('');
    setReviewPhotos([]);
  };

  const filteredVenues = useMemo(() => {
    if (placesCategoryFilter === 'all') return venues;
    return venues.filter((v) => v.category === placesCategoryFilter);
  }, [venues, placesCategoryFilter]);

  // =========================================================================
  // LEVEL 2: МЕСТА И ЗАВЕДЕНИЯ (PUSH VIEW)
  // =========================================================================
  if (currentView === 'places') {
    return (
      <PageLayout
        title="Места пары"
        subtitle="Любимые рестораны, кофейни и смотровые площадки"
        onBack={() => {
          setCurrentView('main');
          setDatesSubTab('invite');
        }}
      >
        <div className="space-y-4 pb-8 animate-fadeIn">
          {/* Top Actions: Counter & Add Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider">
              Сохранённые места ({filteredVenues.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAddVenueModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить место (+30 XP)</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setPlacesCategoryFilter('all');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                placesCategoryFilter === 'all'
                  ? 'bg-[var(--surface-blush)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold'
                  : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]'
              }`}
            >
              Все ({venues.length})
            </button>
            {categories.map((cat) => {
              const count = venues.filter((v) => v.category === cat.id).length;
              const isActive = placesCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setPlacesCategoryFilter(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--surface-blush)] text-[var(--accent)] border border-[var(--accent)]/30 font-bold'
                      : 'bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && <span className="opacity-70 text-[11px]">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Venues Grid */}
          {filteredVenues.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[var(--surface)] border border-dashed border-[var(--divider)] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                  {placesCategoryFilter === 'all' ? 'Список мест пуст' : 'В этой категории пока нет мест'}
                </h3>
                <p className="text-xs text-[var(--text-2)] max-w-sm mx-auto leading-relaxed">
                  Сохраняйте любимые заведения, кофейни с вкусным рафом и романтические места для свиданий.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddVenueModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить первое место (+30 XP)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredVenues.map((venue) => {
                const categoryObj = categories.find((c) => c.id === venue.category);
                const CategoryIcon = categoryObj?.icon || MapPin;
                return (
                  <div
                    key={venue.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs flex flex-col justify-between space-y-3 hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <ColoredIcon
                            icon={CategoryIcon}
                            color={categoryObj?.color || 'rose'}
                            size="sm"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-[var(--text)] leading-tight">
                              {venue.name}
                            </h4>
                            <span className="text-[11px] font-medium text-[var(--text-2)]">
                              {categoryObj?.label || 'Место'} • {venue.priceLevel}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteVenue(venue.id)}
                          className="text-[var(--text-2)] hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {venue.vibe && (
                        <div>
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--surface-blush)] text-[var(--accent)]">
                            {venue.vibe}
                          </span>
                        </div>
                      )}

                      {venue.description && (
                        <p className="text-xs text-[var(--text-2)] line-clamp-2 leading-relaxed">
                          {venue.description}
                        </p>
                      )}

                      {venue.address && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-2)] font-medium">
                          <MapPin className="w-3 h-3 shrink-0 text-[var(--accent)]" />
                          <span className="truncate">{venue.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--divider)] flex items-center justify-between gap-2">
                      {venue.bookingUrl ? (
                        <a
                          href={venue.bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Ссылка</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-[var(--text-2)] font-medium">
                          {venue.addedBy === currentPartnerId ? 'Добавлено вами' : `Добавил(а) ${otherPartner.name}`}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVenueId(venue.id);
                          setInviteNote(`Приглашаю тебя в наше особенное место: «${venue.name}»`);
                          setShowInviteModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white text-[var(--text)] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Heart className="w-3 h-3" />
                        <span>Позвать сюда</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal: Add Venue */}
        {showAddVenueModal && renderAddVenueModal()}
        {showInviteModal && renderInviteModal()}
      </PageLayout>
    );
  }

  // =========================================================================
  // LEVEL 2: ИГРЫ ДЛЯ СВИДАНИЙ (PUSH VIEW)
  // =========================================================================
  if (currentView === 'games') {
    return (
      <PageLayout
        title={activeGame ? 'Игра для двоих' : 'Игры для свиданий'}
        subtitle={activeGame ? 'Интерактивный раунд сближения' : 'Правда или Действие, глубокие темы и 18+'}
        onBack={() => {
          if (activeGame) {
            setActiveGame(null);
          } else {
            setCurrentView('main');
            setDatesSubTab('invite');
          }
        }}
      >
        <div className="space-y-4 pb-8 animate-fadeIn">
          {!activeGame ? (
            <div className="space-y-4">
              {/* Stat grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatTile
                  icon={<Gamepad2 className="w-5 h-5" />}
                  value="4"
                  label="Формата игр"
                  color="gamification"
                />
                <StatTile
                  icon={<Sparkles className="w-5 h-5" />}
                  value="120+"
                  label="Интересных тем"
                  color="mood"
                />
              </div>

              {/* Game Cards List */}
              <div className="space-y-2.5">
                <div
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveGame('truth_dare');
                    setTdCurrentPlayer(currentPartner?.name || 'Я');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs hover:border-emerald-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-emerald-600 transition-colors">
                        Правда или Действие
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        Классическая игра с честными откровениями и милыми заданиями
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-2)] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveGame('spicy');
                    handleDrawSimpleCard('spicy');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-rose-500 transition-colors">
                        Пикантные вопросы 18+
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        Откровенные вопросы для страсти, фантазий и телесной близости
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-2)] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveGame('deep_talks');
                    handleDrawSimpleCard('deep_talks');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs hover:border-indigo-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-indigo-500 transition-colors">
                        Глубокие беседы
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        Вопросы о ценностях, мечтах, детстве и совместном будущем
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-2)] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>

                <div
                  onClick={() => {
                    triggerHaptic('selection');
                    setActiveGame('this_or_that');
                    handleDrawSimpleCard('this_or_that');
                  }}
                  className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-2xs hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text)] group-hover:text-amber-500 transition-colors">
                        Или / Или (Выборы)
                      </h4>
                      <p className="text-xs text-[var(--text-2)] mt-0.5">
                        Быстрые весёлые дилеммы: проверьте, совпадут ли ваши вкусы
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-2)] group-hover:translate-x-0.5 transition-transform shrink-0" />
                </div>
              </div>
            </div>
          ) : activeGame === 'truth_dare' ? (
            <div className="bg-[var(--surface)] p-5 sm:p-6 rounded-3xl border border-[var(--divider)] shadow-xs relative min-h-[420px] flex flex-col justify-between">
              <div className="text-center pt-2">
                <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded-full text-xs font-bold uppercase tracking-wider">
                  Правда или Действие
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--text)] mt-3">
                  Ход игрока: <span className="text-[var(--accent)]">{tdCurrentPlayer}</span>
                </h3>
              </div>

              {!tdAction ? (
                <div className="grid grid-cols-2 gap-4 my-auto py-6">
                  <button
                    type="button"
                    onClick={() => handleDrawCard('truth')}
                    className="aspect-square rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs group"
                  >
                    <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base sm:text-lg">Правда</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDrawCard('dare')}
                    className="aspect-square rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-2xs group"
                  >
                    <Flame className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-base sm:text-lg">Действие</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center my-auto py-4 animate-fadeIn">
                  <div
                    className={`p-6 sm:p-7 rounded-3xl border-2 w-full max-w-sm text-center shadow-md ${
                      tdAction === 'truth'
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'bg-rose-500 border-rose-400 text-white'
                    }`}
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                      {tdAction === 'truth' ? (
                        <MessageCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Flame className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <p className="text-base sm:text-lg font-bold leading-relaxed">
                      {tdCardText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 mt-6 w-full max-w-sm">
                    <button
                      type="button"
                      onClick={() => {
                        addCoupleXP(
                          tdAction === 'truth' ? 15 : 25,
                          `${tdCurrentPlayer} выполнил(а) задание (${tdAction === 'truth' ? 'Правда' : 'Действие'})`,
                          'bonus'
                        );
                        triggerConfetti();
                        handleNextPlayer();
                      }}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-2xs cursor-pointer active:scale-95 transition-all"
                    >
                      Справился (+{tdAction === 'truth' ? '15' : '25'} XP)
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPlayer}
                      className="py-3 px-4 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] text-xs cursor-pointer active:scale-95 transition-all"
                    >
                      Пропустить
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveGame(null)}
                  className="text-xs text-[var(--text-2)] hover:text-[var(--text)] font-semibold cursor-pointer"
                >
                  ← Выбрать другую игру
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--surface)] p-5 sm:p-6 rounded-3xl border border-[var(--divider)] shadow-xs relative min-h-[420px] flex flex-col justify-between">
              <div className="text-center pt-2">
                <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded-full text-xs font-bold uppercase tracking-wider">
                  {activeGame === 'deep_talks'
                    ? 'Глубокие беседы'
                    : activeGame === 'spicy'
                    ? 'Пикантные вопросы 18+'
                    : 'Или / Или'}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center my-auto py-4 animate-fadeIn">
                <div
                  className={`p-6 sm:p-8 rounded-3xl border w-full max-w-sm text-center shadow-md ${
                    activeGame === 'deep_talks'
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : activeGame === 'spicy'
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                      activeGame === 'deep_talks'
                        ? 'bg-indigo-500 text-white'
                        : activeGame === 'spicy'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {activeGame === 'deep_talks' ? (
                      <MessageCircle className="w-6 h-6" />
                    ) : activeGame === 'spicy' ? (
                      <Flame className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>

                  <p className="text-base sm:text-lg font-bold text-[var(--text)] leading-relaxed min-h-[80px] flex items-center justify-center">
                    {simpleGameText}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 mt-6 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      addCoupleXP(5, 'Ответили на вопрос в игре', 'bonus');
                      triggerHaptic('light');
                      if (activeGame !== null) {
                        handleDrawSimpleCard(activeGame as 'deep_talks' | 'spicy' | 'this_or_that');
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-2xs cursor-pointer active:scale-95 transition-all ${
                      activeGame === 'deep_talks'
                        ? 'bg-indigo-500 hover:bg-indigo-600'
                        : activeGame === 'spicy'
                        ? 'bg-rose-500 hover:bg-rose-600'
                        : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    Следующий вопрос (+5 XP)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGame(null)}
                    className="w-full py-2.5 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] hover:text-[var(--text)] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Закончить раунд
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  // =========================================================================
  // LEVEL 1: ГЛАВНЫЙ ЭКРАН СВИДАНИЙ (КОЛЕСО, CTA, PUSH-КАРТОЧКИ, ИСТОРИЯ)
  // =========================================================================
  return (
    <PageLayout title="Свидания" hideHeader>
      <div className="max-w-xl mx-auto w-full space-y-5 pb-10 animate-fadeIn">
        {/* Header with Title & XP Badge */}
        <div className="flex items-end justify-between pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
              Свидания & Романтика
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-2)] mt-0.5">
              Идеи, любимые места и тёплые воспоминания пары
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold">{coupleXP} XP</span>
          </div>
        </div>

        {/* 1. КОЛЕСО ИДЕЙ (Интерактивный элемент на главном уровне) */}
        <DateWheel
          onSelectIdea={(idea: DateIdea) => {
            setInviteNote(idea.inviteText);
            setShowInviteModal(true);
          }}
        />

        {/* 2. PRIMARY CTA: Пригласить на свидание (MODAL: создание) */}
        <PrimaryCTA
          icon={<Send className="w-5 h-5" />}
          title="Пригласить на свидание"
          subtitle={`Отправить инвайт для ${otherPartner.name}`}
          color="warmth"
          onClick={() => {
            triggerHaptic('selection');
            setShowInviteModal(true);
          }}
        />

        {/* 3. PUSH NAVIGATION CARDS: Места пары & Игры для двоих */}
        <div className="space-y-2.5">
          <ActionRow
            icon={<MapPin className="w-5 h-5" />}
            title="Места и заведения пары"
            value={`${venues.length} сохранённых локаций`}
            onClick={() => {
              triggerHaptic('selection');
              setCurrentView('places');
            }}
            color="warmth"
          />
          <ActionRow
            icon={<Gamepad2 className="w-5 h-5" />}
            title="Игры для свиданий"
            value="4 формата для сближения"
            onClick={() => {
              triggerHaptic('selection');
              setCurrentView('games');
            }}
            color="gamification"
          />
        </div>

        {/* 4. Carousel of date ideas */}
        <CarouselTile items={dateFormats} title="Популярные форматы свиданий" />

        {/* ========================================================= */}
        {/* 5. ИСТОРИЯ СВИДАНИЙ (Секция внизу этого же экрана) */}
        {/* ========================================================= */}
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-2)]">
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
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Ожидает ответа от {otherPartner.name}
                          </span>
                          <span className="text-[11px] text-[var(--text-3)]">
                            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text)]">
                          «{item.invitationNote}»
                        </p>
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
                          <span className="text-[10px] font-bold text-[var(--accent)] uppercase flex items-center gap-1 tracking-wider">
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
                          <form
                            onSubmit={(e) => handleAcceptInviteSubmit(e, item.id)}
                            className="space-y-3 pt-2 border-t border-[var(--divider)]"
                          >
                            <h4 className="text-xs font-bold text-[var(--text)]">
                              Согласование времени и локации:
                            </h4>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                                  День
                                </label>
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
                                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                                  Время
                                </label>
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
                              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                                Место / Локация
                              </label>
                              <input
                                type="text"
                                required
                                value={
                                  acceptVenueId
                                    ? venues.find((v) => v.id === acceptVenueId)?.name || ''
                                    : acceptCustomLocation || item.chosenLocation || ''
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
                                onClick={() => setAcceptingId(null)}
                                className="py-2.5 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-bold border border-[var(--divider)] cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAcceptingId(item.id);
                              setAcceptCustomLocation(item.chosenLocation || '');
                            }}
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
                          <span className="text-[10px] font-bold uppercase text-[var(--text-2)]">
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
                          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[var(--text)]">
                                Как прошло ваше свидание?
                              </h4>
                              <button
                                type="button"
                                onClick={() => setReviewingInviteId(null)}
                                className="text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Stars rating */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[var(--text-2)] mr-1">
                                Оценка:
                              </span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= reviewRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
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
                              onClick={() => handleSaveReview(item.id)}
                              className="w-full py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              Сохранить отзыв и получить XP ⭐
                            </button>
                          </div>
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
                onClick={() => setShowInviteModal(true)}
                className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Пригласить на свидание</span>
              </button>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* MODAL: CREATE DATE INVITE (ВЫЕЗД СНИЗУ ДЛЯ СОЗДАНИЯ СУЩНОСТИ) */}
        {/* ========================================================= */}
        {showInviteModal && renderInviteModal()}

        {/* ========================================================= */}
        {/* MODAL: ADD VENUE TO PLACES */}
        {/* ========================================================= */}
        {showAddVenueModal && renderAddVenueModal()}
      </div>
    </PageLayout>
  );

  // Helper renderers for modals to keep code clean and modular
  function renderInviteModal() {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[var(--surface)] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[var(--divider)] space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                  Приглашение на свидание
                </h3>
                <p className="text-[11px] text-[var(--text-2)]">
                  Для {otherPartner.name}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInviteModal(false)}
              className="p-1 text-[var(--text-2)] hover:text-[var(--text)] rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {inviteSentSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-[var(--text)]">
                Приглашение успешно отправлено!
              </h4>
              <p className="text-xs text-[var(--text-2)]">
                Партнёр получит уведомление и сможет согласовать время
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendInvite} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                  Текст приглашения *
                </label>
                <textarea
                  required
                  rows={3}
                  value={inviteNote}
                  onChange={(e) => setInviteNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              {venues.length > 0 && (
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                    Выбрать из списка сохранённых мест:
                  </label>
                  <select
                    value={selectedVenueId}
                    onChange={(e) => {
                      setSelectedVenueId(e.target.value);
                      if (e.target.value) setCustomLocationName('');
                    }}
                    className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] text-xs border border-[var(--divider)] text-[var(--text)] focus:outline-none"
                  >
                    <option value="">-- Выбрать место пары или ввести своё --</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.priceLevel})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                  Или укажите своё место
                </label>
                <input
                  type="text"
                  value={customLocationName}
                  onChange={(e) => {
                    setCustomLocationName(e.target.value);
                    setSelectedVenueId('');
                  }}
                  placeholder="Например: Панорамная крыша или парк"
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                    Желаемый день
                  </label>
                  <input
                    type="text"
                    value={inviteDate}
                    onChange={(e) => setInviteDate(e.target.value)}
                    placeholder="Пятница или 14 февраля"
                    className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                    Время
                  </label>
                  <input
                    type="text"
                    value={inviteTime}
                    onChange={(e) => setInviteTime(e.target.value)}
                    placeholder="19:30"
                    className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Отправить приглашение {otherPartner.name}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  function renderAddVenueModal() {
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
                <p className="text-[11px] text-[var(--text-2)]">
                  +30 XP в копилку рейтинга пары
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAddVenueModal(false)}
              className="p-1 rounded-lg text-[var(--text-2)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateVenue} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
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
  }
};
