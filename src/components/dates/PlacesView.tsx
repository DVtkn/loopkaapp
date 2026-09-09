import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Trash2, ExternalLink, Heart } from 'lucide-react';
import { Venue } from '../../types.ts';
import { PageLayout } from '../ui/PageLayout.tsx';
import { ColoredIcon, IconColorTheme } from '../ColoredIcon.tsx';
import { triggerHaptic } from '../../utils/haptics.ts';
import { AddVenueModal } from './AddVenueModal.tsx';
import { InviteBuilderModal } from './InviteBuilderModal.tsx';

interface CategoryOption {
  id: Venue['category'];
  label: string;
  icon: any;
  color: IconColorTheme;
}

interface PlacesViewProps {
  venues: Venue[];
  categories: CategoryOption[];
  currentPartnerId: string;
  partnerName: string;
  onBack: () => void;
  onAddVenue: (venueData: any) => void;
  onDeleteVenue: (id: string) => void;
  onInviteToVenue: (venue: Venue) => void;
  showAddVenueModal: boolean;
  setShowAddVenueModal: (show: boolean) => void;
  showInviteModal: boolean;
  setShowInviteModal: (show: boolean) => void;
  inviteNote: string;
  setInviteNote: (note: string) => void;
  selectedVenueId: string;
  setSelectedVenueId: (id: string) => void;
  customLocationName: string;
  setCustomLocationName: (name: string) => void;
  inviteDate: string;
  setInviteDate: (date: string) => void;
  inviteTime: string;
  setInviteTime: (time: string) => void;
  inviteSentSuccess: boolean;
  onSendInviteSubmit: (e: React.FormEvent) => void;
}

export const PlacesView: React.FC<PlacesViewProps> = ({
  venues,
  categories,
  currentPartnerId,
  partnerName,
  onBack,
  onAddVenue,
  onDeleteVenue,
  onInviteToVenue,
  showAddVenueModal,
  setShowAddVenueModal,
  showInviteModal,
  setShowInviteModal,
  inviteNote,
  setInviteNote,
  selectedVenueId,
  setSelectedVenueId,
  customLocationName,
  setCustomLocationName,
  inviteDate,
  setInviteDate,
  inviteTime,
  setInviteTime,
  inviteSentSuccess,
  onSendInviteSubmit,
}) => {
  const [placesCategoryFilter, setPlacesCategoryFilter] = useState<string>('all');

  const filteredVenues = useMemo(() => {
    if (placesCategoryFilter === 'all') return venues;
    return venues.filter((v) => v.category === placesCategoryFilter);
  }, [venues, placesCategoryFilter]);

  return (
    <PageLayout
      title="Места пары"
      subtitle="Любимые рестораны, кофейни и смотровые площадки"
      onBack={onBack}
    >
      <div className="space-y-4 pb-8 animate-fadeIn">
        {/* Top Actions: Counter & Add Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-2)]">
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
                        onClick={() => onDeleteVenue(venue.id)}
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
                        <span>{venue.address}</span>
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
                        {venue.addedBy === currentPartnerId ? 'Добавлено вами' : `Добавил(а) ${partnerName}`}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onInviteToVenue(venue)}
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

      <AddVenueModal
        isOpen={showAddVenueModal}
        onClose={() => setShowAddVenueModal(false)}
        categories={categories}
        onAddVenue={onAddVenue}
      />

      <InviteBuilderModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        partnerName={partnerName}
        inviteNote={inviteNote}
        setInviteNote={setInviteNote}
        selectedVenueId={selectedVenueId}
        setSelectedVenueId={setSelectedVenueId}
        customLocationName={customLocationName}
        setCustomLocationName={setCustomLocationName}
        inviteDate={inviteDate}
        setInviteDate={setInviteDate}
        inviteTime={inviteTime}
        setInviteTime={setInviteTime}
        venues={venues}
        inviteSentSuccess={inviteSentSuccess}
        onSubmit={onSendInviteSubmit}
      />
    </PageLayout>
  );
};
