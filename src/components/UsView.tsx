import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar } from 'recharts';
import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  BookOpen,
  Gift,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Eye,
  Activity,
  Layers,
  ArrowRight,
  ArrowLeft,
  X,
  Share2,
  Flower2,
  Download,
  Calendar,
  Camera,
  Image,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { UsSubTab, TestCategory, Question } from '../types';
import { RelationshipRadar } from './RelationshipRadar';

import { triggerHaptic } from '../utils/haptics';

export const UsView: React.FC = () => {
  const {
    currentPartnerId,
    coupleProfile,
    daysTogether, formattedTimeTogether,
    pulseHistory,
    smallCravings,
    addCraving,
    toggleCraving,
    wishlist,
    addWishlistItem,
    toggleSecretReserve,
    deleteWishlistItem,
    flowerPreferences,
    tests,
    submitTestAnswers,
    triggerConfetti,
    usSubTab,
    setUsSubTab,
    currentUser,
    dateInvites,
    feedItems,
    addFeedItem,
    challenges,
    toggleChallenge
  } = useCouple();

  const partner1 = coupleProfile.partner1;
  const partner2 = coupleProfile.partner2;
  const currentPartner = currentPartnerId === 'partner1' ? partner1 : partner2;
  const otherPartner = currentPartnerId === 'partner1' ? partner2 : partner1;

  
  const completedTestsList = tests.filter(t => t.partner1Done || t.partner2Done);
  const testsCompleted = completedTestsList.length;
  const myTestsCompleted = tests.filter(t => currentPartnerId === 'partner1' ? t.partner1Done : t.partner2Done).length;
  const partnerTestsCompleted = tests.filter(t => currentPartnerId === 'partner1' ? t.partner2Done : t.partner1Done).length;
  const bothTestsCompleted = tests.filter(t => t.partner1Done && t.partner2Done).length;
  const totalDates = dateInvites.filter(i => i.status === 'CONFIRMED').length;
  const feedCount = feedItems.length;
  
  // Basic gamification calculation
  const totalScore = (testsCompleted * 50) + (totalDates * 100) + (feedCount * 10);
  
  const activityData = totalScore === 0 ? [
    { name: 'Нед 1', score: 0 },
    { name: 'Нед 2', score: 0 },
    { name: 'Нед 3', score: 0 },
    { name: 'Нед 4', score: 0 }
  ] : [
    { name: 'Нед 1', score: Math.round(totalScore * 0.2) },
    { name: 'Нед 2', score: Math.round(totalScore * 0.4) },
    { name: 'Нед 3', score: Math.round(totalScore * 0.7) },
    { name: 'Нед 4', score: totalScore }
  ];
  
  // Compute strength data only from real progress
  const strengthData = [
    { subject: 'Эмпатия', A: testsCompleted > 0 ? Math.min(100, 50 + (testsCompleted * 15)) : 0, fullMark: 100 },
    { subject: 'Свидания', A: Math.min(100, totalDates * 25), fullMark: 100 },
    { subject: 'Открытость', A: Math.min(100, feedCount * 10), fullMark: 100 },
    { subject: 'Доверие', A: testsCompleted > 0 ? Math.min(100, 45 + (testsCompleted * 12)) : 0, fullMark: 100 },
    { subject: 'Внимание', A: Math.min(100, (testsCompleted * 20) + (feedCount * 5)), fullMark: 100 },
  ];

  const isPaired = !!currentUser?.partnerLogin;

  const [photobookPhotos, setPhotobookPhotos] = useState<{url: string, date: string, caption: string}[]>([]);

  // Book tab states
  const [showAddCraving, setShowAddCraving] = useState<boolean>(false);
  const [newCravingText, setNewCravingText] = useState<string>('');
  const [newCravingCat, setNewCravingCat] = useState<'treat' | 'drink' | 'touch' | 'help' | 'other'>('treat');

  const [showAddGift, setShowAddGift] = useState<boolean>(false);
  const [giftTitle, setGiftTitle] = useState<string>('');
  const [giftPrice, setGiftPrice] = useState<string>('');
  const [giftCategory, setGiftCategory] = useState<'gift' | 'experience' | 'clothing' | 'gadget' | 'home'>('gift');

  // Test Runner State
  const [activeTest, setActiveTest] = useState<TestCategory | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [testJustFinished, setTestJustFinished] = useState<TestCategory | null>(null);

  // Report Modal state
  const [showFullReport, setShowFullReport] = useState<boolean>(false);

  const handleStartTest = (test: TestCategory) => {
    setActiveTest(test);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setTestJustFinished(null);
    const mainEl = document.querySelector("main");
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo(0, 0);
    
    
  };

  const handleSelectOption = (questionId: string, value: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeTest) return;
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitTestAnswers(activeTest.id, userAnswers);
      setTestJustFinished(activeTest);
      setActiveTest(null);
      triggerConfetti();
    }
  };

  const handleAddCravingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCravingText.trim()) return;
    addCraving(newCravingText.trim(), newCravingCat);
    setNewCravingText('');
    setShowAddCraving(false);
  };

  const handleAddGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftTitle.trim()) return;
    addWishlistItem({
      title: giftTitle.trim(),
      priceEstimate: giftPrice.trim() || 'от 1 500 ₽',
      category: giftCategory,
    });
    setGiftTitle('');
    setGiftPrice('');
    setShowAddGift(false);
  };

  const otherPartnerFlowers = flowerPreferences[otherPartner.id] || {
    favoriteFlowers: [],
    dislikedFlowers: [],
    idealBouquetDescription: '',
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-3 pb-8 animate-fadeIn">
      
      {/* 1. Header Title */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)]">
          Мы
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-2)] font-medium mt-0.5">
          {isPaired
            ? `Вместе ${formattedTimeTogether} • ${partner1.name} и ${partner2.name}`
            : `${currentUser?.name || currentUser?.login} • Ожидание подключения партнёра`}
        </p>
      </div>

      {/* 2. Top Segmented Control (Паспорт / Книга партнёра / Тесты и отчёт) */}
      <div className="flex bg-[var(--surface-2)] p-1 rounded-2xl border border-[var(--divider)] gap-1 flex-wrap">
        <button
          onClick={() => setUsSubTab('passport')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            usSubTab === 'passport'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Паспорт
        </button>
        <button
          onClick={() => setUsSubTab('book')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            usSubTab === 'book'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Книга
        </button>
        <button
          onClick={() => setUsSubTab('tests')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            usSubTab === 'tests'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Тесты
        </button>

        <button
          onClick={() => setUsSubTab('challenges')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            usSubTab === 'challenges'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Челленджи
        </button>
        <button
          onClick={() => setUsSubTab('photobook')}
          className={`flex-1 whitespace-nowrap py-1.5 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            usSubTab === 'photobook'
              ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          Альбом
        </button>

      </div>

      
      
      {/* SEGMENT: PHOTOBOOK */}
      {usSubTab === 'photobook' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-[var(--surface)] rounded-3xl p-5 border border-[var(--divider)] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-[var(--text)]">Наш фотоальбом</h3>
                <p className="text-sm text-[var(--text-2)]">Сохраняйте самые тёплые моменты, чтобы в конце года экспортировать их в памятную книгу.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-sm hover:bg-[var(--accent-hover)] transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Загрузить фото</span>
                </button>
                <input 
                  type="file" 
                  id="photo-upload" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPhotobookPhotos(prev => [{ url, date: new Date().toISOString(), caption: '' }, ...prev]);
                      addFeedItem({
                        author: currentPartnerId,
                        type: 'photo',
                        title: 'Новое фото в альбоме',
                        subtitle: 'Совместное воспоминание',
                        imageUrl: url,
                      });
                    }
                  }} 
                />
              </div>
            </div>

            {photobookPhotos.length === 0 ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-[var(--surface-2)] border-2 border-dashed border-[var(--divider)] flex items-center justify-center mb-4 text-[var(--text-2)]">
                  <Image className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-[var(--text)] mb-2">Альбом пока пуст</h4>
                <p className="text-sm text-[var(--text-2)] max-w-sm mb-4">Загрузите ваши первые совместные фотографии, чтобы начать заполнять памятную книгу.</p>
                <button 
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="px-5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-[var(--text)] font-semibold hover:bg-[var(--surface-3)] transition-colors cursor-pointer"
                >
                  Выбрать фото
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {photobookPhotos.map((photo, idx) => (
                    <div key={idx} className="flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--divider)] overflow-hidden group shadow-sm transition-all hover:shadow-md">
                      <div className="aspect-square relative overflow-hidden bg-[var(--surface-2)]">
                        <img src={photo.url} alt="Memory" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8 pointer-events-none">
                           <span className="text-white text-[10px] font-semibold">{new Date(photo.date).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => {
                            triggerHaptic(30);
                            setPhotobookPhotos(prev => prev.filter((_, i) => i !== idx));
                          }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 cursor-pointer shadow-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 border-t border-[var(--divider)] bg-[var(--surface)]">
                        <input
                          type="text"
                          placeholder="Добавить подпись..."
                          value={photo.caption}
                          onChange={(e) => {
                            const newCaption = e.target.value;
                            setPhotobookPhotos(prev => prev.map((p, i) => i === idx ? { ...p, caption: newCaption } : p));
                          }}
                          className="w-full bg-transparent text-xs text-[var(--text)] font-medium placeholder-[var(--text-2)] focus:outline-none focus:border-b focus:border-[var(--accent)] transition-colors pb-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t border-[var(--divider)] flex justify-end">
                  <button
                    onClick={() => {
                      alert('Открывается генерация памятной фотокниги года... В реальном приложении здесь будет PDF-экспорт.');
                      window.print();
                    }}
                    className="py-2.5 px-5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--divider)] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[var(--text)]" />
                    <span className="text-sm font-semibold text-[var(--text)]">Экспорт памятной фотокниги (PDF)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEGMENT 1: ПАСПОРТ ПАРЫ */}
      {usSubTab === 'passport' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Couple Passport Card with Gamification */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            {isPaired ? (
              <div className="flex -space-x-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white font-bold text-2xl flex items-center justify-center ring-4 ring-[var(--surface)] shadow-md z-10">
                  {partner1.name ? partner1.name[0].toUpperCase() : 'Я'}
                </div>
                <div className="w-16 h-16 rounded-full bg-pink-500 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-[var(--surface)] shadow-md z-0">
                  {partner2.name ? partner2.name[0].toUpperCase() : 'П'}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-white font-bold text-2xl flex items-center justify-center ring-4 ring-[var(--surface)] shadow-md">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : (currentUser?.login ? currentUser.login[0].toUpperCase() : 'Я')}
                </div>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--divider)] text-[var(--text-2)] flex flex-col items-center justify-center text-xs font-semibold bg-[var(--surface-2)]">
                  <span>+</span>
                  <span className="text-[10px]">Партнёр</span>
                </div>
              </div>
            )}

            <h3 className="text-xl font-bold text-[var(--text)] mb-1">
              {isPaired ? `${partner1.name} и ${partner2.name}` : `${currentUser?.name || currentUser?.login} (Пока без пары)`}
            </h3>
            {isPaired ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--divider)] mt-2">
                <span className="text-[10px] uppercase font-bold text-[var(--text-2)] tracking-wider">Уровень гармонии:</span>
                <span className="text-xs font-black text-[var(--accent)]">{coupleProfile.levelName} ({Math.floor(totalScore/100)} лвл)</span>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-2)] mt-1 max-w-xs">
                Подключите партнёра в профиле по логину, чтобы открыть совместный паспорт и сравнительную аналитику
              </p>
            )}
            
            <div className="grid grid-cols-3 w-full gap-2 mt-4 pt-4 border-t border-[var(--divider)]">
              <div className="flex flex-col">
                <span className="text-lg font-black text-[var(--text)]">{totalDates}</span>
                <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Свиданий</span>
              </div>
              <div className="flex flex-col border-x border-[var(--divider)]">
                <span className="text-lg font-black text-[var(--text)]">{testsCompleted}</span>
                <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Тестов</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-[var(--text)]">{feedCount}</span>
                <span className="text-[10px] text-[var(--text-2)] uppercase font-bold tracking-wide">Моментов</span>
              </div>
            </div>

            {/* Smart Reminders */}
            {isPaired && (
              <div className="w-full mt-4 pt-4 border-t border-[var(--divider)] text-left">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Важные даты
                  </h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">Годовщина</p>
                        <p className="text-xs text-[var(--text-2)]">Через 3 месяца (14 декабря)</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--divider)] text-xs font-semibold">Напомнить</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text)]">День рождения партнёра</p>
                        <p className="text-xs text-[var(--text-2)]">Через 14 дней (16 сентября)</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-[var(--surface)] border border-[var(--divider)] text-xs font-semibold text-[var(--accent)] border-[var(--accent)]/30">Активно</span>
                  </div>
                </div>
              </div>
            )}

            
          </div>
          
          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 gap-4">
            {/* Radar Chart / Harmony Profile */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Профиль гармонии
                </h4>
                {testsCompleted > 0 && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Пройдено тестов: {testsCompleted}
                  </span>
                )}
              </div>

              {testsCompleted === 0 ? (
                <div className="py-6 px-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-extrabold text-[var(--text)] mb-1">
                    Профиль гармонии пока не рассчитан
                  </h5>
                  <p className="text-xs text-[var(--text-2)] max-w-sm mb-4 leading-relaxed">
                    Пройдите психологические тесты («Стили привязанности», «5 языков любви» и др.), чтобы Сова составила многомерный радар совместимости вашей пары.
                  </p>
                  <button
                    onClick={() => setUsSubTab('tests')}
                    className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>Пройти первый тест</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={strengthData}>
                      <PolarGrid stroke="var(--divider)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-2)', fontSize: 10, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Пара" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Growth Points */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-4">
              <h4 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                Точки роста
              </h4>
              
              {testsCompleted === 0 ? (
                <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)] text-center">
                  <p className="text-xs text-[var(--text-2)] leading-relaxed">
                    Персональные психологические рекомендации и сильные стороны формируются после прохождения тестов на привязанность, языки любви и стиль конфликтов.
                  </p>
                  <button
                    onClick={() => setUsSubTab('tests')}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Перейти к тестам</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                    <span className="text-[10px] font-bold text-[var(--accent-2)] uppercase">Для пары</span>
                    <p className="text-sm font-bold text-[var(--text)] mt-1">
                      {bothTestsCompleted > 0
                        ? 'Качественное совместное время: проводите свидания без гаджетов'
                        : 'Ожидается прохождение тестов вторым партнёром для полного сопоставления'}
                    </p>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                    <span className="text-[10px] font-bold text-amber-500 uppercase">Личная точка ({partner1.name})</span>
                    <p className="text-sm font-bold text-[var(--text)] mt-1">Инициатива: чаще предлагать свидания и активности первым(ой).</p>
                  </div>
                  <div className="p-3 bg-[var(--surface-2)] rounded-xl border border-[var(--divider)]">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Личная точка ({partner2.name})</span>
                    <p className="text-sm font-bold text-[var(--text)] mt-1">Открытость: делиться переживаниями до того, как они накопятся.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Line Chart */}
            <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
              <h4 className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-4">
                Динамика активности
              </h4>
              {totalScore === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-2)]">
                  Активность начнёт отображаться по мере прохождения тестов, свиданий и публикации моментов.
                </div>
              ) : (
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--divider)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} dot={{ fill: 'var(--surface)', stroke: 'var(--accent)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: КНИГА ПАРТНЁРА */}
      {usSubTab === 'book' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Partner Cravings */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Хотелки {otherPartner.name}
                </span>
                <p className="text-xs text-[var(--text-2)]">Мелочи, которые сделают день счастливее</p>
              </div>
              <button
                onClick={() => setShowAddCraving(!showAddCraving)}
                className="w-7 h-7 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center border border-[var(--divider)] hover:opacity-80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddCraving && (
              <form onSubmit={handleAddCravingSubmit} className="p-3 mb-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
                <input
                  type="text"
                  value={newCravingText}
                  onChange={(e) => setNewCravingText(e.target.value)}
                  placeholder="Какао с зефирками, массаж, прогулка..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold"
                  >
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCraving(false)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--text-2)] text-xs font-semibold"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {smallCravings.length > 0 ? (
              <div className="space-y-2">
                {smallCravings.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => toggleCraving(c.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      c.fulfilled
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[var(--surface-2)]/60 border-[var(--divider)] text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        c.fulfilled ? 'bg-emerald-500 text-white' : 'border border-[var(--divider)]'
                      }`}>
                        {c.fulfilled && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-bold truncate ${c.fulfilled ? 'line-through opacity-70' : ''}`}>
                        {c.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--text-2)] shrink-0 ml-2">
                      {c.fulfilled ? 'Исполнено' : 'Ждёт'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-2)] rounded-xl bg-[var(--surface-2)]/40">
                Пока нет хотелок. Добавьте то, чем партнёр может порадовать вас сегодня!
              </div>
            )}
          </div>

          {/* Favorite Things Section */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider block mb-2">
              Любимое {otherPartner.name}
            </span>
            {otherPartnerFlowers.favoriteFlowers && otherPartnerFlowers.favoriteFlowers.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {otherPartnerFlowers.favoriteFlowers.map((f, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5">
                    <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>{f}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-2)] italic">
                Партнёр ещё не указал любимые цветы и предпочтения во вкладке «Забота».
              </p>
            )}
          </div>

          {/* Gift Ideas & Wishlist with Secret Reservation */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  Идеи подарков & Вишлист
                </span>
                <p className="text-xs text-[var(--text-2)]">Секретное бронирование без спойлеров</p>
              </div>
              <button
                onClick={() => setShowAddGift(!showAddGift)}
                className="w-7 h-7 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center border border-[var(--divider)] hover:opacity-80"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddGift && (
              <form onSubmit={handleAddGiftSubmit} className="p-3 mb-3 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-2">
                <input
                  type="text"
                  value={giftTitle}
                  onChange={(e) => setGiftTitle(e.target.value)}
                  placeholder="Название подарка или впечатления..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  value={giftPrice}
                  onChange={(e) => setGiftPrice(e.target.value)}
                  placeholder="Ориентировочная цена (2 500 ₽)..."
                  className="w-full px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold">
                    Сохранить в вишлист
                  </button>
                  <button type="button" onClick={() => setShowAddGift(false)} className="px-3 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--text-2)] text-xs font-semibold">
                    Отмена
                  </button>
                </div>
              </form>
            )}

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-2)] mb-1">
                        <span>{item.category}</span>
                        <span className="text-[var(--accent)]">{item.priceEstimate}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] mb-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--divider)]">
                      <button
                        onClick={() => toggleSecretReserve(item.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                          item.isSecretReserved
                            ? 'bg-rose-500 text-white'
                            : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] hover:bg-[var(--accent)] hover:text-white'
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>{item.isSecretReserved ? 'Забронировано вами' : 'Секретная бронь'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[var(--text-2)] rounded-xl bg-[var(--surface-2)]/40">
                Вишлист пока пуст. Сохраняйте идеи подарков, чтобы партнёр знал о ваших желаниях!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEGMENT 3: ТЕСТЫ И ОТЧЁТ */}
      {usSubTab === 'tests' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Radar Report Card using Recharts */}
          <RelationshipRadar
            onStartTest={(testId) => {
              const test = tests.find(t => t.id === testId);
              if (test) handleStartTest(test);
            }}
          />

          {/* List of Relationship Tests */}
          <div
            id="tests-list-block"
            className="rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs divide-y divide-[var(--divider)] overflow-hidden"
          >
            <div className="p-3.5 bg-[var(--surface-2)]/30 flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text)]">Методики и опросники</span>
              <span className="text-[10px] text-[var(--text-2)]">10–15 минут</span>
            </div>

            {tests.map((t) => {
              const done = t.partner1Done && t.partner2Done;
              const pending = t.partner1Done || t.partner2Done;
              return (
                <div
                  key={t.id}
                  onClick={() => handleStartTest(t)}
                  className="p-3.5 flex items-center justify-between hover:bg-[var(--surface-2)]/40 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] truncate">{t.title}</h4>
                    </div>
                    <p className="text-[11px] text-[var(--text-2)] truncate mt-0.5">{t.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                      done
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : pending
                        ? 'bg-amber-500/15 text-amber-600'
                        : 'bg-[var(--surface-2)] text-[var(--text-2)]'
                    }`}>
                      {done ? 'Пройден' : pending ? 'Ждёт партнёра' : 'Начать'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-2)]" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Active Test Quiz Flow */}
      {activeTest && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          <div 
            onClick={() => setActiveTest(null)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />
          <div className="relative z-10 w-full max-w-lg bg-[var(--surface-solid)] rounded-t-[28px] sm:rounded-3xl p-5 border border-[var(--divider)] shadow-2xl space-y-0  flex flex-col pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp mt-auto sm:mt-0 max-h-[80dvh]">
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="flex flex-col shrink-0 mb-4 gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
                    Вопрос {currentQuestionIndex + 1} из {activeTest.questions.length}
                  </span>
                  <h3 className="text-base font-extrabold text-[var(--text)]">{activeTest.title}</h3>
                </div>
                <button onClick={() => setActiveTest(null)} className="p-1.5 -mr-1.5 rounded-full text-[var(--text-2)] hover:bg-[var(--surface-2)] transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentQuestionIndex + 1) / activeTest.questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
              {/* Question Text */}
              <div className="py-2">
                <p className="text-sm sm:text-base font-bold text-[var(--text)] leading-snug">
                  {activeTest.questions[currentQuestionIndex]?.text}
                </p>
              </div>

              {/* Question Options */}
              <div className="space-y-2">
                {activeTest.questions[currentQuestionIndex]?.options.map((opt, idx) => {
                  const qId = activeTest.questions[currentQuestionIndex].id;
                  const isSelected = userAnswers[qId] === opt.value;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(qId, opt.value)}
                      className={`w-full p-3 rounded-2xl text-left text-xs sm:text-sm font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm scale-[1.01]'
                          : 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--divider)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--divider)] shrink-0">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[var(--text-2)] hover:bg-[var(--surface-2)] disabled:opacity-30 transition-colors"
              >
                Назад
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
              >
                {currentQuestionIndex === activeTest.questions.length - 1 ? 'Завершить тест' : 'Далее'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 4: ИСПЫТАНИЯ НЕДЕЛИ */}
      {usSubTab === 'challenges' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">Испытания недели</h3>
            <p className="text-sm text-[var(--text-2)] mb-5">
              Выполняйте парные квесты для укрепления связи и зарабатывайте совместный XP. 
              Чтобы испытание засчиталось, его должны отметить оба партнёра.
            </p>

            <div className="space-y-3">
              {challenges.map(challenge => {
                const myDone = currentPartnerId === 'partner1' ? challenge.partner1Completed : challenge.partner2Completed;
                const partnerDone = currentPartnerId === 'partner1' ? challenge.partner2Completed : challenge.partner1Completed;
                const bothDone = myDone && partnerDone;
                
                return (
                  <div key={challenge.id} className={`p-4 rounded-xl border ${bothDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[var(--surface-2)] border-[var(--divider)]'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[var(--text-2)]">Неделя {challenge.week}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent)] text-white shadow-xs">
                            +{challenge.rewardPoints} XP
                          </span>
                        </div>
                        <h4 className={`text-base font-bold ${bothDone ? 'text-emerald-500' : 'text-[var(--text)]'}`}>{challenge.title}</h4>
                        <p className="text-xs text-[var(--text-2)] mt-1 mb-3">{challenge.description}</p>
                        
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => toggleChallenge(challenge.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              myDone 
                                ? 'bg-emerald-500 text-white shadow-sm scale-[1.02]' 
                                : 'bg-[var(--surface)] border border-[var(--divider)] text-[var(--text)] hover:border-emerald-500/40 hover:bg-emerald-500/5'
                            }`}
                          >
                            {myDone ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-[var(--text-2)] opacity-30" />}
                            <span>Я выполнил(а)</span>
                          </button>
                          
                          <div className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border ${
                            partnerDone
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-[var(--surface)] border-[var(--divider)] text-[var(--text-2)] opacity-70'
                          }`}>
                            {partnerDone ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-[var(--text-2)] opacity-30" />}
                            <span>Партнёр</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {challenges.length === 0 && (
                <div className="p-4 text-center text-xs text-[var(--text-2)] rounded-xl bg-[var(--surface-2)]/40">
                  Пока нет активных испытаний. Они появятся позже!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Confetti Finished Modal */}
      {testJustFinished && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center">
          <div 
            onClick={() => setTestJustFinished(null)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-fadeIn" 
          />
          <div className="relative z-10 w-full max-w-md bg-[var(--surface-solid)] rounded-t-[28px] sm:rounded-3xl p-5 border border-[var(--divider)] shadow-2xl text-center space-y-3 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+1rem))] animate-slideUp mt-auto sm:mt-0 max-h-[80dvh]">
            <div className="w-10 h-1 rounded-full bg-[var(--divider)] mx-auto sm:hidden mb-3 shrink-0" />
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)]">Тест успешно пройден!</h3>
            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">
              Ваши ответы сохранены и добавлены в совместный радар пары «{testJustFinished.title}».
            </p>
            <div className="pt-3">
              <button
                onClick={() => setTestJustFinished(null)}
                className="w-full py-3 rounded-2xl bg-[var(--accent)] text-white text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
              >
                Отлично
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
