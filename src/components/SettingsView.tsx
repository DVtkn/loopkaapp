import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Activity,
  Bot,
  Heart,
  Sun,
  Moon,
  Bell,
  BellRing,
  Shield,
  Download,
  Trash2,
  ChevronRight,
  Share2,
  CheckCircle2,
  Copy,
  Smartphone,
  Send,
  AlertCircle,
  User,
  Sliders,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { getPushStatus, requestPushPermission, triggerLocalTestPush, PushStatus } from '../utils/pushManager';
import { IOSInstallPrompt } from './IOSInstallPrompt';
import { UserProfileCabinet } from './UserProfileCabinet';

export const SettingsView: React.FC = () => {
  const {
    currentPartnerId,
    setCurrentPartnerId,
    coupleProfile,
    currentUser,
    daysTogether,
    theme,
    setTheme,
    font,
    setFont,
    triggerConfetti,
    loadDemoCouple,
    resetCoupleData,
    updatePartnerNames,
  } = useCouple();

  const [activeTab, setActiveTab] = useState<'cabinet' | 'system' | 'about'>('cabinet');

  const partner1 = coupleProfile.partner1;
  const partner2 = coupleProfile.partner2;
  const currentPartner = currentPartnerId === 'partner1' ? partner1 : partner2;
  const otherPartner = currentPartnerId === 'partner1' ? partner2 : partner1;

  // Notification States
  const [pushStatus, setPushStatus] = useState<PushStatus>(getPushStatus());
  const [dailyQuestionPush, setDailyQuestionPush] = useState<boolean>(true);
  const [weeklyPulsePush, setWeeklyPulsePush] = useState<boolean>(true);
  const [testPushSuccess, setTestPushSuccess] = useState<boolean>(false);
  const [showIOSHelper, setShowIOSHelper] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showExportSuccess, setShowExportSuccess] = useState<boolean>(false);

  useEffect(() => {
    setPushStatus(getPushStatus());
  }, []);

  const handleEnablePush = async () => {
    if (pushStatus.isIOS && !pushStatus.isStandalone) {
      setShowIOSHelper(true);
    }
    try {
      const result = await requestPushPermission(currentUser?.id, coupleProfile?.id);
      setPushStatus(getPushStatus());
      if (result === 'granted') {
        triggerConfetti();
        await triggerLocalTestPush(
          'Loop • Уведомления включены',
          'Теперь вы не пропустите романтические инвайты и синхронизацию с партнёром.'
        );
      }
    } catch (err) {
      console.warn('Push enable error:', err);
    }
  };

  const handleTestNotification = async () => {
    const success = await triggerLocalTestPush(
      'Loop • Тестовое уведомление',
      `${otherPartner?.name || 'Партнёр'} оставил(а) для вас тёплую реакцию в Loop`
    );
    if (success) {
      setTestPushSuccess(true);
      setTimeout(() => setTestPushSuccess(false), 3500);
    }
  };

  const handleCopyLinkCode = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(coupleProfile.linkCode).catch(() => {});
      }
    } catch {
      // safe fallback
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleExportData = () => {
    try {
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(
          JSON.stringify(
            {
              coupleProfile,
              exportedAt: new Date().toISOString(),
              appName: 'Loop Pro',
            },
            null,
            2
          )
        );
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `loop-couple-${coupleProfile.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.warn('Export error:', err);
    }

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto w-full space-y-4 pb-16 animate-fadeIn">
      {/* Top Segmented Sub-Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[var(--surface-2)] rounded-2xl border border-[var(--divider)] mb-2">
        <button
          onClick={() => setActiveTab('cabinet')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'cabinet'
              ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Личный кабинет</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'system'
              ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs'
              : 'text-[var(--text-2)] hover:text-[var(--text)]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Уведомления & Тема</span>
        </button>
      </div>

      {activeTab === 'cabinet' ? (
        <UserProfileCabinet />
      ) : (
        <div className="space-y-4 animate-fadeIn">
          {/* System Settings & Notifications Header */}
          <div className="pt-1">
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--text)]">
              Уведомления и оформление
            </h2>
            <p className="text-xs text-[var(--text-2)] mt-0.5">
              Настройка push-уведомлений, темы интерфейса и экспорта
            </p>
          </div>

          {/* Quick Partner Switch Pill */}
          <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <span className="text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider block mb-2">
              Переключение активного партнёра (тестирование)
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--divider)]">
              <button
                onClick={() => setCurrentPartnerId('partner1')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentPartnerId === 'partner1'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <span>{partner1.name}</span>
              </button>
              <button
                onClick={() => setCurrentPartnerId('partner2')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentPartnerId === 'partner2'
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <span>{partner2.name}</span>
              </button>
            </div>
          </div>

          {/* Theme Selection */}
          <div>
            <p className="text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider px-1 mb-2">
              Тема оформления
            </p>
            <div className="grid grid-cols-2 gap-2 bg-[var(--surface-2)] p-1 rounded-2xl border border-[var(--divider)]">
              <button
                onClick={() => setTheme('aurora')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  theme === 'aurora'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Aurora (Светлая)</span>
              </button>
              <button
                onClick={() => setTheme('night')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  theme === 'night'
                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Night (Тёмная)</span>
              </button>
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider">
                Шрифт приложения
              </p>
              <span className="text-[10px] font-semibold text-[var(--accent)]">
                {font === 'inter' ? 'Instagram (Inter) — Выбран' : font === 'system' ? 'Apple SF Pro' : font === 'golos' ? 'Golos Text' : 'Manrope'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[var(--surface-2)] p-1.5 rounded-2xl border border-[var(--divider)]">
              <button
                type="button"
                onClick={() => setFont('inter')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  font === 'inter'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs border border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
                style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
              >
                <span className="text-sm font-black">Aa</span>
                <span className="text-[11px] truncate">Instagram (Inter)</span>
              </button>

              <button
                type="button"
                onClick={() => setFont('system')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  font === 'system'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs border border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
                style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                <span className="text-sm font-extrabold">Aa</span>
                <span className="text-[11px] truncate">Apple SF Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setFont('golos')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  font === 'golos'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs border border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
                style={{ fontFamily: "'Golos Text', sans-serif" }}
              >
                <span className="text-sm font-extrabold">Aa</span>
                <span className="text-[11px] truncate">Golos Text</span>
              </button>

              <button
                type="button"
                onClick={() => setFont('manrope')}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                  font === 'manrope'
                    ? 'bg-[var(--surface)] text-[var(--accent)] shadow-xs border border-[var(--accent)]/30 ring-1 ring-[var(--accent)]/20'
                    : 'text-[var(--text-2)] hover:text-[var(--text)]'
                }`}
                style={{ fontFamily: "'Manrope', sans-serif" }}
              >
                <span className="text-sm font-extrabold">Aa</span>
                <span className="text-[11px] truncate">Manrope</span>
              </button>
            </div>
          </div>

          {/* Уведомления & Web Push (iOS / Android) */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <p className="text-[11px] font-bold text-[var(--text-2)] uppercase tracking-wider">
                Push-уведомления (iOS / Android)
              </p>
              <span className="text-[10px] font-semibold text-[var(--accent)]">
                {pushStatus.permission === 'granted' ? 'Активны' : 'Требуют настройки'}
              </span>
            </div>

            <div className="rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs divide-y divide-[var(--divider)] overflow-hidden">
              {/* Main Permission Toggle */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text)]">
                      Системные Web Push
                    </span>
                    <p className="text-[11px] text-[var(--text-2)]">
                      {pushStatus.permission === 'granted'
                        ? 'Уведомления разрешены для этого устройства'
                        : 'Нажмите, чтобы включить мгновенные уведомления'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {pushStatus.permission !== 'granted' ? (
                    <>
                      <button
                        onClick={handleTestNotification}
                        className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold border border-[var(--divider)] hover:opacity-80 transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>{testPushSuccess ? 'Отправлено!' : 'Тест'}</span>
                      </button>
                      <button
                        onClick={handleEnablePush}
                        className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all"
                      >
                        Включить
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleTestNotification}
                      className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] text-[var(--text)] text-xs font-bold border border-[var(--divider)] hover:opacity-80 transition-all flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>{testPushSuccess ? 'Отправлено!' : 'Тест на iPhone'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* iPhone Special helper row */}
              {pushStatus.isIOS && !pushStatus.isStandalone && (
                <div className="p-3.5 bg-indigo-500/10 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Smartphone className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] leading-snug">
                      Для работы пушей на iPhone добавьте Loop на экран «Домой» через кнопку «Поделиться».
                    </span>
                  </div>
                  <button
                    onClick={() => setShowIOSHelper(true)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-bold text-[11px] shrink-0"
                  >
                    Инструкция
                  </button>
                </div>
              )}

              {/* Question of day toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)]">Напоминание «Вопрос дня» (19:00)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDailyQuestionPush(!dailyQuestionPush)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    dailyQuestionPush ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)] border border-[var(--divider)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                      dailyQuestionPush ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Weekly pulse toggle */}
              <div className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)]">Синхронизация недели (Пт 20:00)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyPulsePush(!weeklyPulsePush)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    weeklyPulsePush ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)] border border-[var(--divider)]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${
                      weeklyPulsePush ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Export and Reset */}
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs divide-y divide-[var(--divider)] overflow-hidden">
            <button
              onClick={handleExportData}
              className="w-full p-4 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[var(--text-2)]" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[var(--text)]">Экспорт данных пары</div>
                  <div className="text-[11px] text-[var(--text-2)]">Скачать JSON-архив ответов и динамики</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-2)]" />
            </button>

            {/* Load demo */}
            <div
              onClick={loadDemoCouple}
              className="p-3.5 flex items-center justify-between hover:bg-[var(--surface-2)]/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)]">Загрузить демо-пример пары</span>
                  <p className="text-[10px] text-[var(--text-2)]">Заполненные тесты, графики и свидания для ознакомления</p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-500">Загрузить</span>
            </div>

            {/* Privacy */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text)]">Сквозная приватность пары</span>
                  <p className="text-[10px] text-[var(--text-2)]">Секретные бронирования вишлиста скрыты от владельца</p>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      
      {/* SEGMENT 3: ПРО ПРИЛОЖЕНИЕ (ДЕТАЛИ) */}
      {activeTab === 'about' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs">
            <h3 className="text-lg font-black text-[var(--text)] mb-3">О Loop</h3>
            <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed mb-4">
              Короткие опросники, общий психологический радар и ИИ-ассистент — чтобы быть ближе, а не на расстоянии вытянутой руки.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">Книга партнёра</h4>
                  <p className="text-xs text-[var(--text-2)]">Хотелки, вкусы и настроение — партнёр перестаёт гадать.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">Совместный отчёт и радар</h4>
                  <p className="text-xs text-[var(--text-2)]">Интерактивный радар совместимости, сильные стороны и точки роста.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text)]">ИИ-психолог Сова</h4>
                  <p className="text-xs text-[var(--text-2)]">Помогает разобрать ссору и найти бережные слова.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Modal Helper if triggered */}
      <IOSInstallPrompt forceOpen={showIOSHelper} onClose={() => setShowIOSHelper(false)} />
    </div>
  );
};
