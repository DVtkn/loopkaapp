import React, { useMemo } from 'react';
import {
  Sparkles,
  BookOpen,
  BarChart3,
  Bot,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { motion, type Variants } from 'motion/react';

interface LandingViewProps {
  onEnterApp: () => void;
}

// "Constellation" Hero Background
const ConstellationHero: React.FC = () => {
  const nodes = useMemo(() => [
    { id: 1, cx: 15, cy: 30, r: 4 },
    { id: 2, cx: 85, cy: 20, r: 6 },
    { id: 3, cx: 50, cy: 60, r: 5 },
    { id: 4, cx: 20, cy: 80, r: 3 },
    { id: 5, cx: 80, cy: 75, r: 4 },
  ], []);

  const lines = useMemo(() => [
    { id: '1-3', x1: 15, y1: 30, x2: 50, y2: 60 },
    { id: '2-3', x1: 85, y1: 20, x2: 50, y2: 60 },
    { id: '3-4', x1: 50, y1: 60, x2: 20, y2: 80 },
    { id: '3-5', x1: 50, y1: 60, x2: 80, y2: 75 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 z-0">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {lines.map((l) => (
          <line
            key={l.id}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="var(--accent)" strokeWidth="0.3"
            strokeOpacity="0.25"
          />
        ))}
        {nodes.map((n) => (
          <circle
            key={n.id}
            cx={n.cx} cy={n.cy} r={n.r}
            fill="var(--accent)"
            fillOpacity="0.4"
          />
        ))}
      </svg>
      {/* Soft gradient fades for top and bottom so it blends with background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" />
    </div>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({ onEnterApp }) => {
  const { theme, setTheme } = useCouple();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', bounce: 0.3, duration: 0.7 } }
  };

  const features = [
    { icon: BookOpen, title: 'Хотелки и вкусы в Книге заботы.' },
    { icon: BarChart3, title: 'Карта совместимости пары.' },
    { icon: Bot, title: 'Бережные слова от ИИ-психолога.' },
    { icon: MapPin, title: 'Умная подборка идей для свиданий.' },
  ];

  return (
    <div className="relative flex flex-col flex-1 max-w-xl mx-auto w-full pb-32">
      <ConstellationHero />

      {/* Top Bar */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 flex items-center justify-between py-4 mb-2 px-4 sm:px-1">
        <div className="flex items-center gap-2 font-bold text-lg text-[var(--text)]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-rose-600 text-white flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),_0_2px_10px_var(--accent-glow)]">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <span className="tracking-tight">Loop</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setTheme(theme === 'night' ? 'aurora' : 'night')}
          className="px-3 py-1.5 rounded-full bg-[var(--surface-2)]/60 backdrop-blur-md text-[var(--text)] text-xs font-semibold shadow-sm hover:bg-[var(--surface)] transition-colors border border-[var(--divider)] flex items-center gap-1.5"
        >
          {theme === 'night' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
        </motion.button>
      </motion.div>

      {/* Hero Content */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 flex flex-col gap-6 mt-4 px-4 sm:px-0">
        
        {/* Main Pitch */}
        <motion.div variants={itemVariants} className="mb-2">
          <p className="text-[11px] font-extrabold text-[var(--accent)] tracking-[0.15em] mb-3 ml-1 opacity-90">
            Пространство для пары
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--text)] leading-[1.05] mb-4">
            Всё о вас двоих.<br/>В одном месте.
          </h1>
          <p className="text-[15px] text-[var(--text-2)] leading-relaxed max-w-sm font-medium">
            От сближающих вопросов до совместных планов и советов ИИ-психолога.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mt-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="apple-glass-card p-4 flex flex-col gap-3 relative overflow-hidden group cursor-default"
              >
                {/* Subtle highlight gradient inside card */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-solid)]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--surface-3)] to-[var(--surface-2)] border border-[var(--divider)] flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-[13px] text-[var(--text)] leading-snug tracking-tight">
                  {f.title}
                </h3>
              </motion.div>
            );
          })}
        </motion.div>

        {/* 3 Steps / How it works - transformed into a frosted block */}
        <motion.div variants={itemVariants} className="mt-4 apple-glass-card p-5 relative overflow-hidden">
           {/* Glow behind */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--accent)]/15 blur-3xl pointer-events-none" />
          
          <h2 className="text-xl font-bold tracking-tight text-[var(--text)] mb-4 relative z-10">Три шага к гармонии</h2>
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-3)] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-[var(--divider)]">1</div>
              <p className="text-sm font-medium text-[var(--text)]">Пройдите исследования пары.</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-3)] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-[var(--divider)]">2</div>
              <p className="text-sm font-medium text-[var(--text)]">Откройте карту совместимости.</p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--surface-3)] font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-[var(--divider)]">3</div>
              <p className="text-sm font-medium text-[var(--text)]">Растите вместе каждый день.</p>
            </div>
          </div>
        </motion.div>
        
        {/* Quick Privacy Notice */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 mt-4 px-1 text-[11px] text-[var(--text-2)] font-medium justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Ответы видит только партнёр. Полная приватность.</span>
        </motion.div>

      </motion.div>

      {/* Floating Action Button */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ type: 'spring', bounce: 0.2, delay: 0.6 }}
        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="w-full max-w-xl pointer-events-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onEnterApp}
            className="w-full py-4 px-6 rounded-[22px] bg-gradient-to-b from-[var(--accent)] to-rose-600 text-white font-bold text-base shadow-[0_8px_32px_rgba(255,59,48,0.3),_inset_0_1px_1px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 border border-red-400/20"
          >
            <span className="tracking-wide">Открыть приложение</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
