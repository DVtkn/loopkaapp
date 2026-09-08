import React from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Sparkles,
  Gift,
  CheckCircle2,
  Activity,
  Compass,
  Camera,
  ChevronRight,
  User,
  Calendar,
  Lock,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { PhotoArchive } from './PhotoArchive';
import { triggerHaptic } from '../utils/haptics';
import { PageLayout } from './ui/PageLayout';
import { ColoredAvatar } from './ColoredIcon';

export const UsView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    daysTogether,
    formattedTimeTogether,
    tests,
    usSubTab,
    setUsSubTab,
    setActiveTab,
    currentUser,
    dateInvites,
    feedItems,
    challenges,
    toggleChallenge,
  } = useCouple();

  const partner1 = coupleProfile.partner1;
  const partner2 = coupleProfile.partner2;
  const currentPartner = currentPartnerId === 'partner1' ? partner1 : partner2;
  const otherPartner = currentPartnerId === 'partner1' ? partner2 : partner1;

  const completedTestsList = tests.filter((t) => t.partner1Done || t.partner2Done);
  const testsCompleted = completedTestsList.length;
  const totalDates = dateInvites.filter((i) => i.status === 'CONFIRMED').length;
  const feedCount = feedItems.length;
  const isPaired = !!currentUser?.partnerLogin;

  const activeSubTab =
    usSubTab === 'tests' || usSubTab === 'book' ? 'passport' : usSubTab || 'passport';

  return (
    <PageLayout hideHeader>
      <div className="space-y-6 pb-6">
        
        {/* ============================================================ */}
        {/* TOP SEGMENTED SWITCHER (Fixed layout space, no negative margin overlap) */}
        {/* ============================================================ */}
        <div className="bg-[var(--surface-2)] p-1 rounded-2xl flex items-center gap-1 border border-[var(--divider)]/40">
          <button
            type="button"
            onClick={() => setUsSubTab('passport')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'passport'
                ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Паспорт пары
          </button>
          <button
            type="button"
            onClick={() => setUsSubTab('challenges')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'challenges'
                ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Испытания
          </button>
          <button
            type="button"
            onClick={() => setUsSubTab('photobook')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeSubTab === 'photobook'
                ? 'bg-[var(--surface-solid)] text-[var(--text)] shadow-xs'
                : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }`}
          >
            Фото и моменты
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ПАСПОРТ ПАРЫ (EDITORIAL RELATIONSHIP SPACE) */}
        {/* ============================================================ */}
        {activeSubTab === 'passport' && (
          <div className="space-y-6">
            
            {/* Core Editorial Hero: Days together & Couple presence */}
            <div className="p-6 sm:p-7 rounded-[28px] bg-[var(--surface)] border border-[var(--divider)] relative overflow-hidden space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                    История любви
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                    {isPaired ? `${currentPartner.name} & ${otherPartner.name}` : 'Вы и Партнёр'}
                  </h1>
                </div>

                {/* Overlapping Portraits */}
                <div className="flex items-center -space-x-3 shrink-0">
                  <div className="w-12 h-12 rounded-full ring-2 ring-[var(--surface-solid)] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center">
                    <ColoredAvatar avatar={currentPartner.avatar || 'sparkles'} name={currentPartner.name} size="md" />
                  </div>
                  <div className="w-12 h-12 rounded-full ring-2 ring-[var(--surface-solid)] overflow-hidden bg-[var(--surface-2)] flex items-center justify-center">
                    <ColoredAvatar avatar={otherPartner.avatar || 'heart'} name={otherPartner.name} size="md" />
                  </div>
                </div>
              </div>

              {/* Dominant Metric */}
              <div className="pt-2 border-t border-[var(--divider)]">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-[var(--text)] tracking-tight">
                    {isPaired ? Math.max(1, daysTogether) : 1}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[var(--accent)]">
                    {isPaired ? 'дней вместе' : 'день в Loop'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-2)] mt-1 font-normal">
                  {isPaired ? formattedTimeTogether : 'Подключите партнёра в профиле'}
                </p>
              </div>

              {/* Secondary stats inline (Editorial typography, not heavy cards) */}
              <div className="flex items-center gap-4 text-xs text-[var(--text-2)] font-medium pt-3 border-t border-[var(--divider)]">
                <span><strong className="text-[var(--text)] font-bold">{testsCompleted}</strong> из {tests.length} исследований</span>
                <span>•</span>
                <span><strong className="text-[var(--text)] font-bold">{totalDates}</strong> свиданий</span>
                <span>•</span>
                <span><strong className="text-[var(--text)] font-bold">{feedCount}</strong> воспоминаний</span>
              </div>
            </div>

            {/* Couple Discovery Tests — Refined Discovery Block */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-blush)] text-[var(--accent)] flex items-center justify-center">
                      <Heart className="w-4 h-4 fill-[var(--accent)]" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)]">
                      Исследования пары
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-2)] font-normal leading-relaxed pt-1">
                    Исследуйте языки любви, эмоциональную близость и точки гармонии через короткие совместные вопросы.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-3)]">
                  Пройдено: {testsCompleted} из {tests.length} исследований
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('tests')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--accent-hover)] transition-all cursor-pointer"
                >
                  <span>Исследовать</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Access to Key Couple Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 flex items-center justify-between transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--text)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">Карта совместимости</div>
                    <div className="text-xs text-[var(--text-2)]">Анализ 5 сфер отношений</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('care')}
                className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] hover:border-[var(--accent)]/40 flex items-center justify-between transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--text)] group-hover:text-[var(--accent)] flex items-center justify-center transition-colors">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--text)]">Книга заботы</div>
                    <div className="text-xs text-[var(--text-2)]">Вкусы, размеры и радости</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-3)] group-hover:text-[var(--accent)] transition-colors" />
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ИСПЫТАНИЯ (CLEAN INTERACTIVE CHECKLIST) */}
        {/* ============================================================ */}
        {activeSubTab === 'challenges' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] space-y-1">
              <h2 className="text-base font-bold text-[var(--text)]">
                Испытания и челленджи недели
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-2)]">
                Маленькие совместные шаги для укрепления близости. За каждое выполненное испытание начисляется +50 XP.
              </p>
            </div>

            <div className="space-y-2.5">
              {challenges.map((c) => {
                const myDone =
                  currentPartnerId === 'partner1'
                    ? c.partner1Completed
                    : c.partner2Completed;
                const partnerDone =
                  currentPartnerId === 'partner1'
                    ? c.partner2Completed
                    : c.partner1Completed;

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      toggleChallenge(c.id);
                      triggerHaptic('success');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      myDone
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-[var(--surface)] border-[var(--divider)] hover:border-[var(--accent)]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          myDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-[var(--surface-2)] text-[var(--text-3)]'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold truncate ${
                            myDone
                              ? 'line-through text-[var(--text-2)]'
                              : 'text-[var(--text)]'
                          }`}
                        >
                          {c.title}
                        </div>
                        <div className="text-xs text-[var(--text-3)] flex items-center gap-2 mt-0.5">
                          <span>{c.description || 'Совместное задание'}</span>
                          {partnerDone && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              • Партнёр выполнил
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        myDone
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-[var(--surface-2)] text-[var(--text-2)]'
                      }`}
                    >
                      {myDone ? 'Готово (+50 XP)' : '+50 XP'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ФОТО И МОМЕНТЫ (ALBUM TIMELINE) */}
        {/* ============================================================ */}
        {activeSubTab === 'photobook' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[var(--text)]">
                  Фотоархив и моменты
                </h2>
                <p className="text-xs text-[var(--text-2)]">
                  Ваши совместные фотографии и памятные даты
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('photo-upload-input');
                  if (input) input.click();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--accent-hover)] transition-all cursor-pointer shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Добавить фото</span>
              </button>
            </div>

            <PhotoArchive />
          </div>
        )}

      </div>
    </PageLayout>
  );
};
