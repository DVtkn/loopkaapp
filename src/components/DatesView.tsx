import React, { useState } from 'react';
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
  Sparkle,
  Wine,
  Coffee,
  TreePine,
  Film,
  Sun,
  Flame,
  Gamepad2,
  Compass,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCouple } from '../context/CoupleContext';
import { Venue } from '../types';
import { ColoredIcon, IconColorTheme } from './ColoredIcon';
import { triggerHaptic } from '../utils/haptics';
import { TRUTHS, DARES } from '../data/truthDare';
import { DEEP_TALKS, SPICY_18, THIS_OR_THAT } from '../data/gamesData';

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
    coupleLevelInfo,
    addCoupleXP,
    triggerConfetti,
  } = useCouple();

  const currentPartner = currentPartnerId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
  const otherPartner = currentPartnerId === 'partner1' ? coupleProfile.partner2 : coupleProfile.partner1;

  // --- Invite Form State ---
  const [inviteNote, setInviteNote] = useState<string>('Приглашаю тебя провести этот особенный вечер вдвоём');
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [customLocationName, setCustomLocationName] = useState<string>('');
  const [inviteDate, setInviteDate] = useState<string>('');
  const [inviteTime, setInviteTime] = useState<string>('');
  const [inviteSentSuccess, setInviteSentSuccess] = useState<boolean>(false);

  // --- Add Venue Modal / Form State ---
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

  // Games State
  const [activeGame, setActiveGame] = useState<'truth_dare' | 'deep_talks' | 'spicy' | 'this_or_that' | null>(null);
  const [tdCurrentPlayer, setTdCurrentPlayer] = useState<string>('');
  const [tdAction, setTdAction] = useState<'truth' | 'dare' | null>(null);
  const [tdCardText, setTdCardText] = useState<string>('');
  
  const [simpleGameText, setSimpleGameText] = useState<string>('');

  const handleDrawSimpleCard = (gameMode: 'deep_talks' | 'spicy' | 'this_or_that') => {
    triggerHaptic(50);
    let arr: string[] = [];
    if (gameMode === 'deep_talks') arr = DEEP_TALKS;
    else if (gameMode === 'spicy') arr = SPICY_18;
    else if (gameMode === 'this_or_that') arr = THIS_OR_THAT;
    
    setSimpleGameText(arr[Math.floor(Math.random() * arr.length)]);
  };
  const handleDrawCard = (type: 'truth' | 'dare') => {
    triggerHaptic(50);
    setTdAction(type);
    const arr = type === 'truth' ? TRUTHS : DARES;
    setTdCardText(arr[Math.floor(Math.random() * arr.length)]);
  };

  const handleNextPlayer = () => {
    triggerHaptic([30, 30]);
    setTdAction(null);
    setTdCurrentPlayer(tdCurrentPlayer === currentPartner?.name ? otherPartner?.name : currentPartner?.name);
  };

  // Category presets with custom Lucide colored icons
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
    setTimeout(() => {
      setInviteSentSuccess(false);
      setInviteNote('Приглашаю тебя провести этот особенный вечер вдвоём');
      setSelectedVenueId('');
      setCustomLocationName('');
      setInviteDate('');
      setInviteTime('');
      setDatesSubTab('history');
    }, 1800);
  };

  const handleCreateVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVenueName.trim()) return;

    addVenue({
      name: newVenueName.trim(),
      city: 'Москва',
      category: newVenueCategory,
      vibe: newVenueVibe.trim() || 'Уютно и романтично',
      priceLevel: newVenuePrice,
      address: newVenueAddress.trim() || 'Центр города',
      rating: 5.0,
      description: newVenueDescription.trim() || 'Любимое место пары',
      bookingUrl: newVenueLink.trim() || undefined,
    });

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

    setAcceptingId(null);
    setAcceptDateVal('');
    setAcceptTimeVal('');
    setAcceptVenueId('');
    setAcceptCustomLocation('');
    setAcceptLinkVal('');
  };

  const handleAddPhotoToReview = () => {
    if (reviewPhotoUrl.trim()) {
      setReviewPhotos((prev) => [...prev, reviewPhotoUrl.trim()]);
      setReviewPhotoUrl('');
    }
  };

  const handleSamplePhoto = (sampleUrl: string) => {
    setReviewPhotos((prev) => [...prev, sampleUrl]);
  };

  const handleSaveReview = (inviteId: string) => {
    completeAndReviewDate(
      inviteId,
      reviewRating,
      reviewNotes.trim() || 'Прекрасно провели время вместе!',
      reviewPhotos
    );
    setReviewingInviteId(null);
    setReviewRating(5);
    setReviewNotes('');
    setReviewPhotos([]);
  };

  return (
    <PageLayout title="Свидания" hideHeader>
      <div className="max-w-xl mx-auto w-full space-y-4 pb-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Свидания & Места
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-2)] font-normal mt-0.5">
            Планируйте романтику, копите XP и сохраняйте тёплые воспоминания
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
          <Award className="w-4 h-4" />
          <span className="text-xs font-semibold">{coupleXP} XP</span>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex bg-[var(--surface-2)] p-1 rounded-2xl border border-[var(--divider)] gap-1 flex-wrap">
        <button
          onClick={() => setDatesSubTab('invite')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            datesSubTab === 'invite'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Пригласить
        </button>
        <button
          onClick={() => setDatesSubTab('places')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
            datesSubTab === 'places'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Места пары
          {venues.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-white">
              {venues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setDatesSubTab('history')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
            datesSubTab === 'history'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          История
        </button>
        <button
          onClick={() => setDatesSubTab('games')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
            datesSubTab === 'games'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Игры

          {dateInvites.some((d) => d.status === 'PENDING' && d.senderId !== currentPartnerId) && (
            <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* SEGMENT 1: ПРИГЛАСИТЬ НА СВИДАНИЕ */}
      {/* ========================================================= */}
      {datesSubTab === 'invite' && (
        <form onSubmit={handleSendInvite} className="space-y-4 animate-fadeIn">
          {/* Note Card */}
          <div className="p-4 space-y-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[var(--text-2)] uppercase tracking-wider">
                1. Романтическое послание
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <textarea
              value={inviteNote}
              onChange={(e) => setInviteNote(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {/* Place Selection */}
          <div className="p-4 space-y-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-[var(--text-2)] uppercase tracking-wider">
                2. Выбор локации (опционально)
              </span>
              <button
                type="button"
                onClick={() => setDatesSubTab('places')}
                className="text-[11px] text-[var(--accent)] font-bold hover:underline flex items-center gap-1"
              >
                + Добавить место
              </button>
            </div>

            {venues.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-2)] block">
                  Выбрать из вашего списка любимых мест:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {venues.map((v) => {
                    const isSelected = selectedVenueId === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVenueId(isSelected ? '' : v.id);
                          if (!isSelected) setCustomLocationName('');
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--text)] ring-1 ring-[var(--accent)]'
                            : 'bg-[var(--surface-2)] border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--text)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[var(--text)] truncate">
                            {v.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] font-mono font-bold">
                            {v.priceLevel}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-2)] truncate mt-0.5">{v.vibe}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Custom Location Field */}
            <div className="pt-2">
              <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                Свой вариант
              </label>
              <input
                type="text"
                value={customLocationName}
                onChange={(e) => {
                  setCustomLocationName(e.target.value);
                  if (e.target.value) setSelectedVenueId('');
                }}
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                Дата (желаемая)
              </label>
              <input
                type="text"
                value={inviteDate}
                onChange={(e) => setInviteDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                Время
              </label>
              <input
                type="text"
                value={inviteTime}
                onChange={(e) => setInviteTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* Submit Button */}
          {inviteSentSuccess ? (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs text-center flex items-center justify-center gap-2 shadow-md animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Приглашение отправлено {otherPartner.name}! (+20 XP)</span>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[var(--accent)] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Отправить приглашение {otherPartner.name}</span>
            </button>
          )}
        </form>
      )}

      {/* ========================================================= */}
      {/* SEGMENT 2: ИЗБРАННЫЕ МЕСТА ДЛЯ СВИДАНИЙ */}
      {/* ========================================================= */}
      {datesSubTab === 'places' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[var(--text-2)] uppercase tracking-wider">
              Любимые и желанные места ({venues.length})
            </span>
            <button
              onClick={() => setShowAddVenueModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:opacity-95 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить место</span>
            </button>
          </div>

          {venues.length === 0 ? (
            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-dashed border-[var(--divider)] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">Список мест пуст</h3>
                <p className="text-xs text-[var(--text-2)] mt-1 max-w-sm mx-auto">
                  Здесь сохраняются ваши любимые рестораны, смотровые площадки, уютные кофейни и
                  секретные уголки для свиданий.
                </p>
              </div>
              <button
                onClick={() => setShowAddVenueModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить первое место (+30 XP)</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {venues.map((venue) => {
                const categoryObj = categories.find((c) => c.id === venue.category);
                const CategoryIcon = categoryObj?.icon || MapPin;
                return (
                  <div
                    key={venue.id}
                    className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex flex-col justify-between space-y-3 hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <ColoredIcon
                            icon={CategoryIcon}
                            color={categoryObj?.color || 'rose'}
                            size="sm"
                          />
                          <div>
                            <h4 className="text-sm font-black text-[var(--text)] leading-tight">
                              {venue.name}
                            </h4>
                            <span className="text-[10px] font-semibold text-[var(--text-2)]">
                              {categoryObj?.label || 'Место'} • {venue.priceLevel}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteVenue(venue.id)}
                          className="text-[var(--text-2)] hover:text-rose-500 p-1 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {venue.vibe && (
                        <div className="mt-2.5">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                            {venue.vibe}
                          </span>
                        </div>
                      )}

                      {venue.description && (
                        <p className="text-xs text-[var(--text-2)] mt-2 line-clamp-2 leading-relaxed">
                          {venue.description}
                        </p>
                      )}

                      {venue.address && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--text-2)] mt-2 font-medium">
                          <MapPin className="w-3 h-3 shrink-0" />
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
                        onClick={() => {
                          setSelectedVenueId(venue.id);
                          setInviteNote(`Приглашаю тебя в наше особенное место: «${venue.name}»`);
                          setDatesSubTab('invite');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white text-[var(--text)] text-[11px] font-bold transition-all flex items-center gap-1"
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
      )}

      
      {/* ========================================================= */}
      {/* SEGMENT 4: ИГРЫ (ПРАВДА ИЛИ ДЕЙСТВИЕ) */}
      {/* ========================================================= */}
      {datesSubTab === 'games' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {!activeGame ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => {
                  triggerHaptic(50);
                  setActiveGame('truth_dare');
                  setTdCurrentPlayer(currentPartner?.name || 'Я');
                }}
                className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-1">Правда или Действие</h3>
                <p className="text-sm text-[var(--text-2)]">Выполняйте задания или отвечайте на каверзные вопросы.</p>
              </div>

              <div 
                onClick={() => {
                  triggerHaptic(50);
                  setActiveGame('deep_talks');
                  handleDrawSimpleCard('deep_talks');
                }}
                className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-1">Глубокие беседы</h3>
                <p className="text-sm text-[var(--text-2)]">Серьезные темы и искренние вопросы для сближения.</p>
              </div>

              <div 
                onClick={() => {
                  triggerHaptic(50);
                  setActiveGame('spicy');
                  handleDrawSimpleCard('spicy');
                }}
                className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-1">Пикантные вопросы</h3>
                <p className="text-sm text-[var(--text-2)]">Горячие темы (18+) для развития интимной близости.</p>
              </div>

              <div 
                onClick={() => {
                  triggerHaptic(50);
                  setActiveGame('this_or_that');
                  handleDrawSimpleCard('this_or_that');
                }}
                className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-1">Или / Или</h3>
                <p className="text-sm text-[var(--text-2)]">Быстрый опрос на предпочтения. Узнайте друг друга лучше!</p>
              </div>
            </div>
          ) : activeGame === 'truth_dare' ? (
            <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm relative min-h-[400px] flex flex-col">
              <button 
                onClick={() => setActiveGame(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--text-2)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-5 pt-4">
                <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded-full text-xs font-semibold uppercase tracking-wider">
                  Правда или Действие
                </span>
                <h3 className="text-2xl font-bold mt-4">
                  Ход игрока: <span className="text-[var(--accent)]">{tdCurrentPlayer}</span>
                </h3>
              </div>
              
              {!tdAction ? (
                <div className="grid grid-cols-2 gap-4 mt-auto mb-auto">
                  <button 
                    onClick={() => handleDrawCard('truth')}
                    className="aspect-square rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-600 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm group"
                  >
                    <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Правда</span>
                  </button>
                  <button 
                    onClick={() => handleDrawCard('dare')}
                    className="aspect-square rounded-3xl bg-rose-500/10 border-2 border-rose-500/20 hover:bg-rose-500 hover:text-white text-rose-600 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm group"
                  >
                    <Flame className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-lg">Действие</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-auto mb-auto animate-fadeIn">
                  <div className={`p-5 rounded-3xl border-2 w-full max-w-sm text-center shadow-lg ${tdAction === 'truth' ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white'}`}>
                    <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                      {tdAction === 'truth' ? <MessageCircle className="w-6 h-6 text-white" /> : <Flame className="w-6 h-6 text-white" />}
                    </div>
                    <p className="text-xl font-semibold leading-relaxed">
                      {tdCardText}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-6 w-full max-w-sm">
                    <button
                      onClick={() => {
                        addCoupleXP(tdAction === 'truth' ? 15 : 25, `${tdCurrentPlayer} выполнил(а) задание (${tdAction === 'truth' ? 'Правда' : 'Действие'})`, 'bonus');
                        triggerConfetti();
                        handleNextPlayer();
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors shadow-sm cursor-pointer"
                    >
                      Справился
                    </button>
                    <button
                      onClick={handleNextPlayer}
                      className="flex-1 px-4 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors shadow-sm cursor-pointer"
                    >
                      Отказался
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--surface)] p-5 rounded-3xl border border-[var(--divider)] shadow-sm relative min-h-[400px] flex flex-col">
              <button 
                onClick={() => setActiveGame(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--surface-2)] transition-colors text-[var(--text-2)] cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-5 pt-4">
                <span className="px-3 py-1 bg-[var(--surface-2)] text-[var(--text-2)] rounded-full text-xs font-semibold uppercase tracking-wider">
                  {activeGame === 'deep_talks' ? 'Глубокие беседы' : activeGame === 'spicy' ? 'Пикантные вопросы' : 'Или / Или'}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center mt-auto mb-auto animate-fadeIn">
                <div className={`p-8 rounded-3xl border w-full max-w-sm text-center shadow-lg relative overflow-hidden ${
                  activeGame === 'deep_talks' ? 'bg-emerald-500/10 border-emerald-500/30' : 
                  activeGame === 'spicy' ? 'bg-rose-500/10 border-rose-500/30' : 
                  'bg-amber-500/10 border-amber-500/30'
                }`}>
                  <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm ${
                    activeGame === 'deep_talks' ? 'bg-emerald-500 text-white' : 
                    activeGame === 'spicy' ? 'bg-rose-500 text-white' : 
                    'bg-amber-500 text-white'
                  }`}>
                    {activeGame === 'deep_talks' ? <MessageCircle className="w-7 h-7" /> : 
                     activeGame === 'spicy' ? <Flame className="w-7 h-7" /> : 
                     <Sparkles className="w-7 h-7" />}
                  </div>
                  
                  <p className="text-xl font-bold text-[var(--text)] leading-relaxed min-h-[100px] flex items-center justify-center">
                    {simpleGameText}
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
                  <button
                    onClick={() => {
                      addCoupleXP(5, 'Ответили на вопрос в игре', 'bonus');
                      if (activeGame !== null) {
                        handleDrawSimpleCard(activeGame as 'deep_talks' | 'spicy' | 'this_or_that');
                      }
                    }}
                    className={`px-6 py-4 rounded-xl text-white font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                      activeGame === 'deep_talks' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                      activeGame === 'spicy' ? 'bg-rose-500 hover:bg-rose-600' : 
                      'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    Следующий вопрос (+5 XP)
                  </button>
                  <button
                    onClick={() => setActiveGame(null)}
                    className="px-6 py-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] font-semibold text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                  >
                    Закончить игру
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* SEGMENT 3: ИСТОРИЯ СВИДАНИЙ, ОТЗЫВЫ & ФОТО */}
      {/* ========================================================= */}
      {datesSubTab === 'history' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[var(--text-2)] uppercase tracking-wider">
              Запланированные и завершённые свидания
            </span>
          </div>

          {dateInvites.length > 0 ? (
            <div className="space-y-4">
              {dateInvites.map((item) => {
                const sender = item.senderId === 'partner1' ? coupleProfile.partner1 : coupleProfile.partner2;
                const isMine = item.senderId === currentPartnerId;
                const isCompleted = !!item.completed || !!item.review;

                // 1. PENDING (Ожидает ответа)
                if (item.status === 'PENDING') {
                  if (isMine) {
                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] shadow-xs opacity-85"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
                            ⏳ Ожидает ответа от {otherPartner.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-2)]">
                            {new Date(item.createdAt).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[var(--text)] mt-1.5">
                          «{item.invitationNote}»
                        </p>
                        {item.chosenLocation && (
                          <div className="flex items-center gap-1 text-xs text-[var(--text-2)] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                            <span>{item.chosenLocation}</span>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-2xl bg-[var(--surface)] border-2 border-[var(--accent)] shadow-md space-y-3 animate-pulse-subtle"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-[var(--accent)] uppercase flex items-center gap-1 tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" /> Новое приглашение от {sender.name}
                          </span>
                          <span className="text-[10px] text-[var(--text-2)] font-mono">
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
                            className="mt-4 space-y-3 pt-3 border-t border-[var(--divider)]"
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
                                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                />
                              </div>
                            </div>

                            {venues.length > 0 && (
                              <div>
                                <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block mb-1">
                                  Выбрать из списка мест пары:
                                </label>
                                <select
                                  value={acceptVenueId}
                                  onChange={(e) => {
                                    setAcceptVenueId(e.target.value);
                                    if (e.target.value) setAcceptCustomLocation('');
                                  }}
                                  className="w-full p-2 rounded-xl bg-[var(--surface-2)] text-xs border border-[var(--divider)] text-[var(--text)]"
                                >
                                  <option value="">-- Ввести вручную или выбрать из мест --</option>
                                  {venues.map((v) => (
                                    <option key={v.id} value={v.id}>
                                      {v.name} ({v.priceLevel} • {v.vibe})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

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
                                className="w-full p-2 rounded-xl bg-[var(--surface-2)] text-xs border border-[var(--divider)] text-[var(--text)]"
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
                                Сохранить это место в наш список «Места пары» (+30 XP)
                              </span>
                            </label>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="submit"
                                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-sm"
                              >
                                Подтвердить свидание (+50 XP)
                              </button>
                              <button
                                type="button"
                                onClick={() => setAcceptingId(null)}
                                className="py-2.5 px-4 rounded-xl bg-[var(--surface-2)] text-[var(--text-2)] text-xs font-bold border border-[var(--divider)]"
                              >
                                Отмена
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => {
                              setAcceptingId(item.id);
                              setAcceptCustomLocation(item.chosenLocation || '');
                            }}
                            className="w-full py-3 rounded-xl bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 transition-opacity"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            <span>Принять приглашение и согласовать детали</span>
                          </button>
                        )}
                      </div>
                    );
                  }
                }

                // 2. CONFIRMED (Запланировано или Завершено)
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-[var(--accent)] animate-pulse'
                          }`}
                        />
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-[var(--text-2)]">
                            {item.chosenDate || 'Свидание'}{' '}
                            {item.chosenTime ? `в ${item.chosenTime}` : ''}
                          </span>
                          <h4 className="text-sm font-bold text-[var(--text)] mt-0.5">
                            {item.chosenLocation || 'Романтический вечер'}
                          </h4>
                        </div>
                      </div>

                      {isCompleted ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          Завершено
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                          Предстоит
                        </span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text)] italic">
                      «{item.invitationNote}»
                    </div>

                    {/* Review Block or Review Button */}
                    {item.review ? (
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/5 to-rose-500/5 border border-amber-500/20 space-y-2">
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
                            <span className="text-xs font-black text-amber-600 ml-1">
                              {item.review.rating}/5
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                            +200 XP получено
                          </span>
                        </div>

                        {item.review.impressions && (
                          <p className="text-xs text-[var(--text)] font-medium">
                            {item.review.impressions}
                          </p>
                        )}

                        {/* Photo gallery of date */}
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
                                onClick={() => setReviewingInviteId(null)}
                                className="text-[var(--text-2)] hover:text-[var(--text)]"
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
                                  className="p-1 hover:scale-110 transition-transform"
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
                              rows={2}
                              className="w-full p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                            />

                            {/* Add Photos */}
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-[var(--text-2)] uppercase block">
                                Фотографии и воспоминания:
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="url"
                                  value={reviewPhotoUrl}
                                  onChange={(e) => setReviewPhotoUrl(e.target.value)}
                                  className="flex-1 p-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                />
                                <button
                                  type="button"
                                  onClick={handleAddPhotoToReview}
                                  className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold"
                                >
                                  Добавить
                                </button>
                              </div>

                              {/* Quick sample photos for demo */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <span className="text-[10px] text-[var(--text-2)]">Образцы:</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSamplePhoto(
                                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80'
                                    )
                                  }
                                  className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]"
                                >
                                  Ресторан
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSamplePhoto(
                                      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&auto=format&fit=crop&q=80'
                                    )
                                  }
                                  className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]"
                                >
                                  Парк
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSamplePhoto(
                                      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80'
                                    )
                                  }
                                  className="px-2 py-0.5 rounded text-[10px] bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)] border border-[var(--divider)]"
                                >
                                  Кофейня
                                </button>
                              </div>

                              {reviewPhotos.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 pt-2">
                                  {reviewPhotos.map((ph, i) => (
                                    <div key={i} className="relative group">
                                      <img
                                        src={ph}
                                        alt="Uploaded preview"
                                        referrerPolicy="no-referrer"
                                        className="h-16 w-full object-cover rounded-lg border border-[var(--divider)]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReviewPhotos((prev) => prev.filter((_, idx) => idx !== i))
                                        }
                                        className="absolute -top-1 -right-1 p-0.5 bg-rose-500 text-white rounded-full shadow"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveReview(item.id)}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md"
                            >
                              Сохранить отзыв и получить XP ⭐
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingInviteId(item.id)}
                            className="w-full py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--accent)] hover:text-white text-[var(--text)] text-xs font-bold border border-[var(--divider)] transition-all flex items-center justify-center gap-1.5"
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
            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[var(--surface-2)] flex items-center justify-center text-[var(--accent)]">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text)]">История свиданий пока пуста</h4>
              <p className="text-xs text-[var(--text-2)] max-w-xs mx-auto">
                Отправьте приглашение во вкладке «Пригласить», чтобы запланировать ваше первое свидание!
              </p>
              <button
                onClick={() => setDatesSubTab('invite')}
                className="mt-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Пригласить на свидание</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD VENUE TO PLACES */}
      {/* ========================================================= */}
      {showAddVenueModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 border border-[var(--divider)] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[var(--text)]">Добавить место пары</h3>
                  <p className="text-[11px] text-[var(--text-2)] font-medium">
                    +30 XP в копилку рейтинга пары
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddVenueModal(false)}
                className="p-1 rounded-lg text-[var(--text-2)] hover:text-[var(--text)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                  Название места *
                </label>
                <input
                  type="text"
                  required
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
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
                  <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
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
                <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                  Атмосфера / Вайб
                </label>
                <input
                  type="text"
                  value={newVenueVibe}
                  onChange={(e) => setNewVenueVibe(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                  Адрес / Район
                </label>
                <input
                  type="text"
                  value={newVenueAddress}
                  onChange={(e) => setNewVenueAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                  Заметка / Почему сюда хочется
                </label>
                <textarea
                  rows={2}
                  value={newVenueDescription}
                  onChange={(e) => setNewVenueDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-[var(--text-2)] uppercase block mb-1">
                  Ссылка на сайт / меню (опционально)
                </label>
                <input
                  type="url"
                  value={newVenueLink}
                  onChange={(e) => setNewVenueLink(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[var(--accent)] text-white font-bold text-xs shadow-md hover:opacity-95 transition-all"
              >
                Сохранить место (+30 XP)
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </PageLayout>
  );
};
