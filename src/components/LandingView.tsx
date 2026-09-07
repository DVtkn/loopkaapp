import React from 'react';
import {
  Sparkles,
  BookOpen,
  Gift,
  BarChart3,
  Activity,
  Bot,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';

interface LandingViewProps {
  onEnterApp: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  const { theme, setTheme, coupleProfile } = useCouple();

  const features = [
    {
      icon: BookOpen,
      title: 'Книга партнёра',
      desc: 'Хотелки, вкусы и настроение — партнёр перестаёт гадать.',
    },
    {
      icon: Gift,
      title: 'Подарки без угадывания',
      desc: 'Партнёр сам пишет, что хочет — идеи уже под рукой.',
    },
    {
      icon: BarChart3,
      title: 'Совместный отчёт',
      desc: 'Пять опросников — общий радар по шести ключевым темам.',
    },
    {
      icon: Activity,
      title: 'Пульс отношений',
      desc: 'Три вопроса в неделю — заметить перемены заранее.',
    },
    {
      icon: Bot,
      title: 'ИИ-психолог Сова',
      desc: 'Помогает разобрать ссору и найти бережные слова.',
    },
    {
      icon: MapPin,
      title: 'Куда пойти',
      desc: 'Места и романтические маршруты под бюджет и вайб.',
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'Ответьте на опросники',
      desc: 'Пять психологических методик (Готтман, привязанность, языки любви). 10–15 минут. Ответы видит только партнёр.',
    },
    {
      num: 2,
      title: 'Получите совместный отчёт',
      desc: 'Интерактивный радар совместимости, сильные стороны и понятные шаги для роста пары.',
    },
    {
      num: 3,
      title: 'Двигайтесь с подсказками',
      desc: 'Недельный пульс, совместные челленджи, ИИ-ассистент Сова и умная подборка свиданий.',
    },
  ];

  return (
    <div className="flex flex-col flex-1 max-w-xl mx-auto w-full pb-16 animate-fadeIn">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between py-4 mb-2">
        <div className="flex items-center gap-2 font-bold text-lg text-[var(--text)]">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <span>Loop • Together</span>
        </div>

        <button
          onClick={() => setTheme(theme === 'night' ? 'aurora' : 'night')}
          className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-semibold hover:opacity-80 transition-opacity border border-[var(--divider)] flex items-center gap-1.5"
        >
          {theme === 'night' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
          <span>{theme === 'night' ? 'Ночная тема' : 'Светлая тема'}</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="my-3">
        <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-2">
          Для пар, которые хотят быть ближе
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] leading-tight mb-3">
          Не надо держать всё в голове
        </h1>
        <p className="text-base text-[var(--text-2)] leading-relaxed">
          Короткие опросники, общий психологический радар и ИИ-ассистент — чтобы быть ближе, а не на расстоянии вытянутой руки.
        </p>
      </div>

      {/* Feature Carousel */}
      <div className="my-6">
        <p className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider mb-3">
          Возможности
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 -mx-4 px-4 no-scrollbar scroll-smooth">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="flex-none w-48 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-[var(--text)] mb-1">{f.title}</h3>
                  <p className="text-xs text-[var(--text-2)] leading-snug">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* How it Works / 3 Steps */}
      <div className="my-4">
        <p className="text-xs font-bold text-[var(--text-2)] uppercase tracking-wider mb-4">
          Как это работает
        </p>
        <div className="space-y-4 relative">
          {steps.map((s, idx) => (
            <div key={idx} className="flex gap-3.5 relative">
              {idx < steps.length - 1 && (
                <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-[var(--divider)] -translate-x-1/2" />
              )}
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-sm">
                {s.num}
              </div>
              <div className="pt-0.5">
                <h4 className="font-bold text-sm text-[var(--text)] mb-1">{s.title}</h4>
                <p className="text-xs text-[var(--text-2)] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Callout Card */}
      <div className="my-6 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Начните с первого шага</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed">
          Первый опросник занимает меньше 10 минут. Ваши ответы видит только партнёр, и только когда вы оба будете готовы открыть результаты.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-4 z-20 pt-2 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)] to-transparent flex flex-col gap-2.5">
        <button
          id="landing-create-couple-btn"
          onClick={onEnterApp}
          className="w-full py-3.5 px-6 rounded-2xl bg-[var(--accent)] text-white font-bold text-base shadow-lg hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Открыть приложение</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
