const fs = require('fs');
const file = 'src/components/UsView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The logic inside UsView is huge. I will just output a simplified version that imports UI components and PageLayout, and only contains Passport, Challenges, Photobook.

const newCode = `import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart, Sparkles, BookOpen, Gift, CheckCircle2, Clock, ChevronRight, Plus, Trash2, Lock, Eye, Activity, Layers, ArrowRight, ArrowLeft, X, Share2, Flower2, Download, Calendar, Camera, Image, Compass
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { RelationshipRadar } from './RelationshipRadar';
import { triggerHaptic } from '../utils/haptics';
import { PageLayout } from './ui/PageLayout';
import { SectionCard } from './ui/SectionCard';
import { ActionRow } from './ui/ActionRow';
import { MetricChip } from './ui/MetricChip';

export const UsView: React.FC = () => {
  const {
    currentPartnerId, coupleProfile, daysTogether, formattedTimeTogether, pulseHistory,
    tests, usSubTab, setUsSubTab, setActiveTab, currentUser, dateInvites, feedItems, challenges, toggleChallenge
  } = useCouple();

  const partner1 = coupleProfile.partner1;
  const partner2 = coupleProfile.partner2;
  const currentPartner = currentPartnerId === 'partner1' ? partner1 : partner2;
  const otherPartner = currentPartnerId === 'partner1' ? partner2 : partner1;

  const completedTestsList = tests.filter(t => t.partner1Done || t.partner2Done);
  const testsCompleted = completedTestsList.length;
  const totalDates = dateInvites.filter(i => i.status === 'CONFIRMED').length;
  const feedCount = feedItems.length;
  const isPaired = !!currentUser?.partnerLogin;

  const [photobookPhotos, setPhotobookPhotos] = useState<{url: string, date: string, caption: string}[]>([]);

  // Filter out the old tabs that are now separate views
  const safeTab = (usSubTab === 'tests' || usSubTab === 'book') ? 'passport' : usSubTab;

  return (
    <PageLayout title="Мы" hideHeader>
      <div className="pt-1 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
          {isPaired ? \`Вы и \${otherPartner?.name || 'Партнер'}\` : 'Вы и Партнер'}
        </h1>
        <p className="text-sm text-[var(--text-2)] font-medium mt-1">
          {isPaired ? \`Вместе \${formattedTimeTogether}\` : 'Свяжите аккаунты, чтобы начать'}
        </p>
      </div>

      <div className="px-4 sm:px-6 sticky top-0 bg-[var(--bg)]/95 backdrop-blur-md z-10 py-3 -mx-4 sm:-mx-6 sm:px-6 border-b border-[var(--divider)]">
        <div className="flex bg-[var(--surface-2)] p-1 rounded-2xl gap-1 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setUsSubTab('passport')}
            className={\`flex-1 whitespace-nowrap py-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer \${
              safeTab === 'passport' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }\`}
          >
            Паспорт
          </button>
          <button
            onClick={() => setUsSubTab('challenges')}
            className={\`flex-1 whitespace-nowrap py-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer \${
              safeTab === 'challenges' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }\`}
          >
            Испытания
          </button>
          <button
            onClick={() => setUsSubTab('photobook')}
            className={\`flex-1 whitespace-nowrap py-1.5 px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer \${
              safeTab === 'photobook' ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs' : 'text-[var(--text-2)] hover:text-[var(--text)]'
            }\`}
          >
            Фотобудка
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-8">
        {safeTab === 'photobook' && (
          <SectionCard title="Фотобудка пары">
            <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] border-dashed">
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] flex items-center justify-center mb-3 shadow-xs border border-[var(--divider)] text-[var(--text-2)]">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-1">Фотобудка пуста</h3>
              <p className="text-xs text-[var(--text-2)] max-w-xs mb-4 leading-relaxed">
                Загружайте сюда любимые совместные фотографии, чтобы сохранить яркие моменты.
              </p>
              <button className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-semibold rounded-xl flex items-center gap-2">
                <Plus className="w-4 h-4" /> Добавить фото
              </button>
            </div>
          </SectionCard>
        )}

        {safeTab === 'passport' && (
          <div className="space-y-4">
            <SectionCard title="Сводка союза" icon={<Heart className="w-5 h-5 text-rose-500 fill-rose-500" />}>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col p-3 rounded-2xl bg-[var(--surface-2)]">
                  <span className="text-lg font-black text-[var(--text)]">{totalDates}</span>
                  <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Свиданий</span>
                </div>
                <div className="flex flex-col p-3 rounded-2xl bg-[var(--surface-2)]">
                  <span className="text-lg font-black text-[var(--text)]">{testsCompleted}</span>
                  <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Тестов</span>
                </div>
                <div className="flex flex-col p-3 rounded-2xl bg-[var(--surface-2)]">
                  <span className="text-lg font-black text-[var(--text)]">{feedCount}</span>
                  <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Моментов</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Психологический анализ">
              <div className="space-y-3">
                <ActionRow
                  title="Психологические тесты"
                  subtitle="Познайте друг друга глубже"
                  icon={<Compass className="w-5 h-5 text-indigo-500" />}
                  onClick={() => setActiveTab('tests')}
                  action={<ChevronRight className="w-5 h-5 text-[var(--text-2)]" />}
                />
                <ActionRow
                  title="Радар совместимости"
                  subtitle="Ваш ИИ-отчет об отношениях"
                  icon={<Activity className="w-5 h-5 text-rose-500" />}
                  onClick={() => setActiveTab('report')}
                  action={<ChevronRight className="w-5 h-5 text-[var(--text-2)]" />}
                />
              </div>
            </SectionCard>

            <SectionCard title="База заботы">
              <ActionRow
                title="Книга заботы (CareBase)"
                subtitle="Желания, любимые цветы и еда"
                icon={<Gift className="w-5 h-5 text-amber-500" />}
                onClick={() => setActiveTab('care')}
                action={<ChevronRight className="w-5 h-5 text-[var(--text-2)]" />}
              />
            </SectionCard>
          </div>
        )}

        {safeTab === 'challenges' && (
          <SectionCard title="Испытания недели">
            <div className="space-y-3 mt-2">
              {challenges.map((challenge) => {
                const myDone = currentPartnerId === 'partner1' ? challenge.partner1Completed : challenge.partner2Completed;
                const theirDone = currentPartnerId === 'partner1' ? challenge.partner2Completed : challenge.partner1Completed;
                const bothDone = myDone && theirDone;

                return (
                  <div key={challenge.id} className={\`p-4 rounded-xl border \${bothDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--surface-2)] border-[var(--divider)]'}\`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--text-2)]">Неделя {challenge.week}</span>
                          <MetricChip label={\`+\${challenge.xpReward} XP\`} variant={bothDone ? 'success' : 'accent'} />
                        </div>
                        <h4 className="text-sm font-bold text-[var(--text)] mb-1">{challenge.title}</h4>
                        <p className="text-xs text-[var(--text-2)]">{challenge.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => { toggleChallenge(challenge.id); triggerHaptic('light'); }}
                            className={\`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors \${myDone ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--surface)] text-[var(--text-2)] hover:text-[var(--text)]'}\`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {myDone ? 'Я выполнил(а)' : 'Отметить'}
                          </button>
                          
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={theirDone ? 'text-emerald-500 font-semibold' : 'text-[var(--text-2)]'}>
                              {otherPartner?.name || 'Партнёр'}:
                            </span>
                            {theirDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-[var(--text-2)]" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}
      </div>
    </PageLayout>
  );
};
`;

fs.writeFileSync(file, newCode, 'utf8');
console.log('UsView rewritten');
