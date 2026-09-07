import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Sparkles,
  Heart,
  ShieldCheck,
  Zap,
  TrendingUp,
  Wine,
  MessageCircle,
  CheckCircle2,
  Check,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Users,
  Compass,
  Star,
  Activity,
  Layers,
  HeartHandshake,
  Target,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCouple } from '../context/CoupleContext';
import { computeCoupleRatingAnalytics, COUPLE_LEVELS } from '../utils/rankingEngine';
import { ColoredIcon, ColoredAvatar, IconColorTheme } from './ColoredIcon';

interface CoupleRatingWidgetProps {
  onNavigateToTests?: () => void;
  onNavigateToDates?: () => void;
  onNavigateToChat?: () => void;
  className?: string;
}

type RatingTab = 'chart' | 'categories' | 'levels' | 'history';

export const CoupleRatingWidget: React.FC<CoupleRatingWidgetProps> = ({
  onNavigateToTests,
  onNavigateToDates,
  onNavigateToChat,
  className = '',
}) => {
  const {
    coupleProfile,
    tests,
    pulseHistory,
    moodHistory,
    challenges,
    dateInvites,
    smallCravings,
    loveTaps,
    coupleXP,
    xpHistory,
    currentPartnerId,
    sendLoveTap,
    triggerConfetti,
    addCoupleXP,
  } = useCouple();

  const [activeTab, setActiveTab] = useState<RatingTab>('chart');
  const [chartMetric, setChartMetric] = useState<'total' | 'partners' | 'categories'>('total');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const p1 = coupleProfile.partner1;
  const p2 = coupleProfile.partner2;
  const p1Name = p1.name || 'Партнёр 1';
  const p2Name = p2.name || 'Партнёр 2';

  // Compute rich rating analytics
  const analytics = useMemo(() => {
    return computeCoupleRatingAnalytics({
      xpHistory,
      totalXP: coupleXP,
      tests,
      dateInvites,
      smallCravings,
      loveTaps,
      pulseHistory,
      challenges,
      p1Name,
      p2Name,
    });
  }, [
    xpHistory,
    coupleXP,
    tests,
    dateInvites,
    smallCravings,
    loveTaps,
    pulseHistory,
    challenges,
    p1Name,
    p2Name,
  ]);

  const levelInfo = analytics.levelInfo;

  // Quick Action Handler for Rating Boost
  const handleQuickBoost = (type: 'tap' | 'test' | 'date' | 'mood') => {
    if (type === 'tap') {
      sendLoveTap('thinking', 'Отправлено быстрое касание для рейтинга');
      setToastMessage('Рейтинг пополнен! Отправлено касание партнёру (+10 XP)');
    } else if (type === 'test') {
      if (onNavigateToTests) onNavigateToTests();
    } else if (type === 'date') {
      if (onNavigateToDates) onNavigateToDates();
    }
    triggerConfetti();
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div
      id="couple-rating-widget"
      className={`rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-sm backdrop-blur-xl overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-3 bg-[var(--accent)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-center"
          >
            <Sparkles className="w-4 h-4" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-5 sm:p-7 border-b border-[var(--divider)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Title & Level Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                Общий рейтинг активности пары
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text)] tracking-tight">
                {analytics.totalXP.toLocaleString('ru-RU')}{' '}
                <span className="text-sm font-semibold text-[var(--text-secondary)]">XP</span>
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Crown className="w-3.5 h-3.5" />
                Ранг {levelInfo.level}: {levelInfo.levelName}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
              Рейтинг растёт от совместных действий: прохождения тестов, свиданий, быстрых реакций и заботы.
            </p>
          </div>

          {/* Level Progress Bar Card */}
          <div className="min-w-[280px] p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text)]">
                Прогресс до ранга «{levelInfo.nextLevelName}»
              </span>
              <span className="text-[var(--accent)] font-bold">{levelInfo.progressPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-[var(--divider)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 rounded-full"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
              <span>{levelInfo.currentXP} XP</span>
              <span>{levelInfo.xpToNext > 0 ? `Ещё ${levelInfo.xpToNext} XP` : 'Максимальный ранг!'}</span>
            </div>
          </div>
        </div>

        {/* Mutual Balance & Partner Contribution Strip */}
        <div className="mt-6 pt-6 border-t border-[var(--divider)] grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Partner 1 Info */}
          <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)]">
            <ColoredAvatar avatar={p1.avatar} name={p1Name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)] truncate">{p1Name}</span>
                <span className="text-xs font-bold text-rose-500">{analytics.partner1Percent}%</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {analytics.partner1XP.toLocaleString('ru-RU')} XP вклада
              </p>
            </div>
          </div>

          {/* Balance Bar & Synergy */}
          <div className="md:col-span-4 px-2 space-y-2 text-center">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-secondary)]">
              <span>Вклад партнёров</span>
              <span className="text-emerald-500 font-bold">{analytics.balanceStatus}</span>
            </div>
            <div className="h-2.5 w-full bg-[var(--divider)] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${analytics.partner1Percent}%` }}
                className="h-full bg-rose-500 transition-all duration-700"
              />
              <div
                style={{ width: `${analytics.partner2Percent}%` }}
                className="h-full bg-indigo-500 transition-all duration-700"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
              <HeartHandshake className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Индекс синергии: <strong className="text-[var(--text)]">{analytics.synergyScore}%</strong></span>
            </div>
          </div>

          {/* Partner 2 Info */}
          <div className="md:col-span-4 flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--divider)]">
            <ColoredAvatar avatar={p2.avatar} name={p2Name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)] truncate">{p2Name}</span>
                <span className="text-xs font-bold text-indigo-500">{analytics.partner2Percent}%</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                {analytics.partner2XP.toLocaleString('ru-RU')} XP вклада
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 sm:px-7 pt-4 border-b border-[var(--divider)] flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'chart', label: 'Динамика роста', icon: TrendingUp },
            { id: 'categories', label: 'Источники рейтинга', icon: Layers },
            { id: 'levels', label: 'Шкала рангов', icon: Award },
            { id: 'history', label: 'История начислений', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RatingTab)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick boost trigger */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleQuickBoost('tap')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            +10 XP Касание
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 sm:p-7">
        {/* Tab 1: Chart */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Накопительный прогресс рейтинга
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  График отражает динамику активности пары по неделям
                </p>
              </div>

              {/* Chart Metric Selector */}
              <div className="flex items-center gap-1 bg-[var(--surface-hover)] p-1 rounded-xl border border-[var(--divider)]">
                {[
                  { id: 'total', label: 'Общий XP' },
                  { id: 'partners', label: 'По партнёрам' },
                  { id: 'categories', label: 'По сферам' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setChartMetric(m.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      chartMetric === m.id
                        ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Area Container */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMetric === 'total' ? (
                  <AreaChart data={analytics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="totalXpGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ff2d55" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--divider)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: 'var(--text)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Общий XP"
                      stroke="#ff2d55"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#totalXpGrad)"
                    />
                  </AreaChart>
                ) : chartMetric === 'partners' ? (
                  <AreaChart data={analytics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="p1Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff2d55" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="p2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--divider)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: 'var(--text)',
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="p1" name={p1Name} stroke="#ff2d55" strokeWidth={2} fill="url(#p1Grad)" />
                    <Area type="monotone" dataKey="p2" name={p2Name} stroke="#6366f1" strokeWidth={2} fill="url(#p2Grad)" />
                  </AreaChart>
                ) : (
                  <BarChart data={analytics.timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--divider)',
                        borderRadius: '16px',
                        fontSize: '12px',
                        color: 'var(--text)',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="tests" name="Тесты" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="dates" name="Свидания" fill="#ff2d55" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="reactions" name="Касания" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="care" name="Забота" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: Action Categories */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">
                Источники формирования рейтинга
              </h3>
              <span className="text-xs text-[var(--text-secondary)]">5 ключевых сфер</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {analytics.categories.map((cat) => {
                return (
                  <div
                    key={cat.key}
                    className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] flex flex-col justify-between gap-3 hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <ColoredIcon
                          icon={
                            cat.key === 'tests'
                              ? ShieldCheck
                              : cat.key === 'dates'
                              ? Wine
                              : cat.key === 'reactions'
                              ? Zap
                              : cat.key === 'care'
                              ? Heart
                              : Target
                          }
                          color={cat.color}
                          size="md"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text)]">{cat.title}</h4>
                          <p className="text-[11px] text-[var(--text-secondary)]">{cat.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[var(--text)]">
                        +{cat.points} <span className="text-[10px] text-[var(--text-secondary)]">XP</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] pt-2 border-t border-[var(--divider)]">
                      <span>{cat.xpPerAction}</span>
                      {cat.key === 'tests' && onNavigateToTests && (
                        <button
                          onClick={onNavigateToTests}
                          className="text-[var(--accent)] font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Пройти <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {cat.key === 'dates' && onNavigateToDates && (
                        <button
                          onClick={onNavigateToDates}
                          className="text-[var(--accent)] font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Свидания <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Levels Roadmap */}
        {activeTab === 'levels' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">Шкала рангов и преимуществ</h3>
              <span className="text-xs text-[var(--text-secondary)]">Уровни 1 — 6</span>
            </div>

            <div className="space-y-3">
              {COUPLE_LEVELS.map((lvl) => {
                const isCurrent = levelInfo.level === lvl.level;
                const isReached = analytics.totalXP >= lvl.minXP;

                return (
                  <div
                    key={lvl.level}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-xs'
                        : isReached
                        ? 'bg-[var(--surface-hover)] border-[var(--divider)] opacity-90'
                        : 'bg-[var(--surface-hover)]/50 border-[var(--divider)] opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ColoredIcon
                          icon={
                            lvl.level === 1
                              ? Sparkles
                              : lvl.level === 2
                              ? Heart
                              : lvl.level === 3
                              ? ShieldCheck
                              : lvl.level === 4
                              ? Flame
                              : lvl.level === 5
                              ? Crown
                              : Trophy
                          }
                          color={lvl.color}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--text)]">
                              Уровень {lvl.level}: {lvl.name}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[var(--accent)] text-white">
                                Текущий
                              </span>
                            )}
                            {isReached && !isCurrent && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            {lvl.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 min-w-[140px]">
                        <span className="text-xs font-bold text-[var(--text)]">
                          {lvl.minXP} — {lvl.maxXP} XP
                        </span>
                      </div>
                    </div>

                    {/* Perks list */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--divider)] flex flex-wrap gap-2">
                      {lvl.perks.map((perk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--divider)] flex items-center gap-1"
                        >
                          <Check className="w-3 h-3 text-[var(--accent)]" />
                          <span>{perk}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text)]">История активности пары</h3>
              <span className="text-xs text-[var(--text-secondary)]">Последние действия</span>
            </div>

            {xpHistory && xpHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {xpHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ColoredIcon
                        icon={
                          item.category === 'test'
                            ? ShieldCheck
                            : item.category === 'date'
                            ? Wine
                            : item.category === 'tap'
                            ? Zap
                            : item.category === 'mood'
                            ? Heart
                            : Target
                        }
                        color={
                          item.category === 'test'
                            ? 'indigo'
                            : item.category === 'date'
                            ? 'rose'
                            : item.category === 'tap'
                            ? 'gold'
                            : item.category === 'mood'
                            ? 'emerald'
                            : 'coral'
                        }
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--text)] truncate">
                          {item.reason}
                        </p>
                        <p className="text-[10px] text-[var(--text-secondary)]">
                          {new Date(item.timestamp).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[var(--accent)] flex-shrink-0">
                      +{item.points} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--surface-hover)] border border-[var(--divider)] text-xs text-[var(--text-secondary)]">
                Каждое ваше совместное действие будет отображаться здесь с начислением XP!
              </div>
            )}
          </div>
        )}

        {/* Quick Action Boost Bar */}
        <div className="mt-6 pt-5 border-t border-[var(--divider)] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Быстро прокачать рейтинг:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickBoost('tap')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Отправить реакцию (+10 XP)
            </button>

            {onNavigateToTests && (
              <button
                onClick={onNavigateToTests}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Пройти тест (+150 XP)
              </button>
            )}

            {onNavigateToDates && (
              <button
                onClick={onNavigateToDates}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--surface-hover)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--divider)] flex items-center gap-1.5 transition-colors"
              >
                <Wine className="w-3.5 h-3.5 text-rose-500" />
                Запланировать свидание (+100 XP)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
