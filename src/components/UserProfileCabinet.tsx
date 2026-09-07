import React, { useState } from 'react';
import {
  User,
  Copy,
  CheckCircle2,
  Heart,
  Users,
  Sparkles,
  Lock,
  LogOut,
  KeyRound,
  Shield,
  MapPin,
  Calendar,
  AlertTriangle,
  Send,
  UserPlus,
  X,
  Check,
  RefreshCw,
  Edit2,
  Smile,
  Save,
  ArrowRight,
  BrainCircuit,
  MessageCircleHeart,
  Info,
} from 'lucide-react';
import { useCouple } from '../context/CoupleContext';
import { LOVE_TAP_PRESETS, ColoredIcon } from './ColoredIcon';

export const UserProfileCabinet: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    changePassword,
    authLogout,
    allUsers,
    switchAccount,
    incomingRequests,
    outgoingRequests,
    sendPairRequestByLogin,
    acceptPairRequest,
    rejectPairRequest,
    disconnectPair,
    coupleProfile,
    updateCoupleStartDate,
    daysTogether, formattedTimeTogether,
    triggerConfetti,
    setActiveTab,
    setUsSubTab,
    sendLoveTap,
  } = useCouple();

  // Profile Edit States
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(currentUser?.name || '');
  const [startDateInput, setStartDateInput] = useState<string>(currentUser?.startDate || '2023-04-15');
  const [copiedLogin, setCopiedLogin] = useState<boolean>(false);

  // Pairing input
  const [targetPartnerLogin, setTargetPartnerLogin] = useState<string>('');
  const [pairMessage, setPairMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isPairingLoading, setIsPairingLoading] = useState<boolean>(false);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Disconnect Confirmation
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);

  if (!currentUser) return null;

  const [lastTapped, setLastTapped] = useState<string | null>(null);

  const handleLoveTap = (tap: typeof LOVE_TAP_PRESETS[0]) => {
    sendLoveTap(tap.type);
    setLastTapped(tap.label);
    setTimeout(() => setLastTapped(null), 2500);
  };

  const handleCopyLogin = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(`@${currentUser.login}`).catch(() => {});
      }
    } catch {}
    setCopiedLogin(true);
    setTimeout(() => setCopiedLogin(false), 2500);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    await updateUserProfile({ name: nameInput.trim() });
    setIsEditingName(false);
  };

  const handleSaveStartDate = async () => {
    await updateCoupleStartDate(startDateInput);
    triggerConfetti();
  };

  const handleSendPairRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairMessage(null);
    setIsPairingLoading(true);

    try {
      const res = await sendPairRequestByLogin(targetPartnerLogin);
      if (res.success) {
        setPairMessage({ text: res.message || 'Запрос отправлен!', isError: false });
        setTargetPartnerLogin('');
      } else {
        setPairMessage({ text: res.error || 'Ошибка отправки запроса', isError: true });
      }
    } catch (err: any) {
      setPairMessage({ text: err?.message || 'Ошибка сети', isError: true });
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleAcceptRequest = async (partnerLogin: string) => {
    const res = await acceptPairRequest(partnerLogin);
    if (res.success) {
      setPairMessage({ text: res.message || 'Пара создана!', isError: false });
    } else {
      setPairMessage({ text: res.error || 'Ошибка', isError: true });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    const res = await changePassword(oldPassword, newPassword);
    if (res.success) {
      setPasswordMsg({ text: 'Пароль успешно обновлен!', isError: false });
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordChange(false), 2000);
    } else {
      setPasswordMsg({ text: res.error || 'Ошибка изменения пароля', isError: true });
    }
  };

  const isPaired = !!currentUser.partnerLogin;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-4 pb-8 animate-fadeIn">
      {/* Title */}
      <div className="pt-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          Личный кабинет
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-2)] font-normal mt-0.5">
          Управление профилем, статус пары и персональные настройки
        </p>
      </div>

      {/* 1. Main Profile Card */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-4">
          {/* User Avatar with Initials */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-hover)] text-white font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
            {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--divider)] text-base font-semibold text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[var(--text)]">{currentUser.name}</h2>
                  <button
                    onClick={() => {
                      setNameInput(currentUser.name);
                      setIsEditingName(true);
                    }}
                    className="text-[var(--text-2)] hover:text-[var(--accent)] transition-colors p-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Login Badge with 1-Click Copy */}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--divider)] text-xs font-mono font-semibold text-[var(--accent)]">
                @{currentUser.login}
              </span>
              <button
                onClick={handleCopyLogin}
                className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--divider)] border border-[var(--divider)] text-xs font-semibold text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedLogin ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Копировать логин</span>
                  </>
                )}
              </button>
            </div>

            {/* Gender Account Type Selector */}
            <div className="mt-3 pt-3 border-t border-[var(--divider)]">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-2)]">
                  Тип аккаунта (Пол)
                </span>
                <span className="text-xs font-semibold text-[var(--text-2)]">
                  {currentUser.gender === 'female' ? 'Женский (Она)' : 'Мужской (Он)'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                <button
                  type="button"
                  onClick={() => updateUserProfile({ gender: 'male', avatarEmoji: 'male' })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentUser.gender !== 'female'
                      ? 'bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'bg-[var(--surface-2)] border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--text)]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Мужской (Он)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateUserProfile({ gender: 'female', avatarEmoji: 'female' })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    currentUser.gender === 'female'
                      ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'bg-[var(--surface-2)] border-[var(--divider)] text-[var(--text-2)] hover:text-[var(--text)]'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-rose-500" />
                  <span>Женский (Она)</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-[var(--text-2)] mt-2.5">
              {isPaired
                ? `В паре с @${currentUser.partnerLogin} • ${formattedTimeTogether} вместе`
                : 'Ожидание подключения партнёра'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Pairing Section (Связь с партнёром) */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--accent)] fill-[var(--accent)]" />
            <h2 className="text-base font-extrabold text-[var(--text)]">Связь с партнёром</h2>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isPaired
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}
          >
            {isPaired ? 'Пара активна' : 'Поиск партнёра'}
          </span>
        </div>

        {/* Status Messages */}
        {pairMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              pairMessage.isError
                ? 'bg-red-500/10 border border-red-500/20 text-red-500'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'
            }`}
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span>{pairMessage.text}</span>
          </div>
        )}

        {isPaired ? (
          /* Paired Card */
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[var(--accent)] text-white font-black text-base flex items-center justify-center shadow-xs">
                  {coupleProfile.partner2.name ? coupleProfile.partner2.name[0].toUpperCase() : 'P'}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[var(--text)]">
                    {coupleProfile.partner2.name}
                  </div>
                  <div className="text-xs font-mono text-[var(--accent)] font-semibold">
                    @{currentUser.partnerLogin}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDisconnectModal(true)}
                className="px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition-colors"
              >
                Разорвать связь
              </button>
            </div>

            {/* Anniversary Date Editor */}
            <div className="pt-3 border-t border-[var(--divider)] space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                  Дата начала отношений
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-2)] pointer-events-none" />
                  <input
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveStartDate}
                className="w-full py-2.5 rounded-xl bg-[var(--surface)] hover:bg-[var(--divider)] border border-[var(--divider)] text-xs font-bold text-[var(--text)] transition-colors flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Сохранить дату отношений</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Paired: Search & Add Form */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
              <p className="text-xs text-[var(--text-2)] leading-relaxed">
                Чтобы объединиться в пару, ваш партнёр должен создать аккаунт и сообщить вам свой логин (или ввести ваш).
              </p>

              <form onSubmit={handleSendPairRequest} className="mt-3 flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-2.5 font-bold text-xs text-[var(--text-2)]">@</span>
                  <input
                    type="text"
                    required
                    value={targetPartnerLogin}
                    onChange={(e) =>
                      setTargetPartnerLogin(e.target.value.toLowerCase().trim().replace(/^@/, ''))
                    }
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs font-semibold text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPairingLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Добавить</span>
                </button>
              </form>
            </div>

            {/* Incoming Requests */}
            {incomingRequests.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    Входящие запросы на создание пары
                  </span>
                  <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    {incomingRequests.length}
                  </span>
                </div>
                {incomingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-indigo-500/15 border border-rose-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fadeIn"
                  >
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white text-base flex items-center justify-center font-black shadow-sm flex-shrink-0">
                        {req.fromName ? req.fromName[0].toUpperCase() : 'P'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-[var(--text)] truncate">
                          {req.fromName} (@{req.fromLogin})
                        </div>
                        <div className="text-[11px] text-[var(--text-2)]">
                          Приглашает вас стать парой в Loop
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleAcceptRequest(req.fromLogin)}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 fill-white" />
                        <span>Принять предложение</span>
                      </button>
                      <button
                        onClick={() => rejectPairRequest(req.fromLogin)}
                        className="px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-[var(--text-2)] hover:text-rose-500 hover:bg-rose-500/10 text-xs font-bold transition-colors"
                      >
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Outgoing Requests */}
            {outgoingRequests.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)]">
                  Ожидают подтверждения:
                </span>
                {outgoingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--divider)] text-xs text-[var(--text-2)] flex items-center justify-between"
                  >
                    <span>Запрос отправлен пользователю <b>@{req.toLogin}</b></span>
                    <span className="text-[10px] text-amber-500 font-semibold">Ожидание...</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. My Psychological Passport & Fast Reactions */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-base font-extrabold text-[var(--text)]">Мой профиль</h2>
          </div>
        </div>

        {/* FAST REACTIONS: Fast Virtual Affection Bar */}
        {!!currentUser?.partnerLogin && (
          <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[var(--accent-2)] fill-[var(--accent-2)]" />
                Быстрые реакции
              </label>
              {lastTapped ? (
                <span className="text-[10px] font-bold text-emerald-500 animate-fadeIn flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Отправлено «{lastTapped}»
                </span>
              ) : (
                <span className="text-[10px] font-medium text-[var(--text-2)]">
                  Проявить внимание
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {LOVE_TAP_PRESETS.map((tap) => (
                <button
                  key={tap.type}
                  type="button"
                  onClick={() => handleLoveTap(tap)}
                  className="py-2.5 px-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--accent)]/15 hover:border-[var(--accent)]/40 border border-[var(--divider)] flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group shadow-xs"
                >
                  <div className="group-hover:scale-115 transition-transform">
                    <ColoredIcon icon={tap.icon} color={tap.color} size="md" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-center w-full truncate px-0.5">
                    {tap.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Psychological Traits with Direct Test Links */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-2)]">
              Психологический паспорт
            </span>
            <button
              type="button"
              onClick={() => {
                setUsSubTab('tests');
                setActiveTab('us');
              }}
              className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Все тесты</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Love Language Card */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] block">
                  Язык любви
                </span>
                <span className="text-sm font-extrabold text-[var(--text)] mt-1 block">
                  {currentUser.loveLanguage || 'Тест не пройден'}
                </span>
              </div>
              <div>
                {!currentUser.loveLanguage ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUsSubTab('tests');
                      setActiveTab('us');
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Пройти тест</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUsSubTab('tests');
                      setActiveTab('us');
                    }}
                    className="text-[11px] font-bold text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
                  >
                    Пересдать тест →
                  </button>
                )}
              </div>
            </div>

            {/* Attachment Style Card */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] block">
                  Стиль привязанности
                </span>
                <span className="text-sm font-extrabold text-[var(--text)] mt-1 block">
                  {currentUser.attachmentStyle || 'Тест не пройден'}
                </span>
              </div>
              <div>
                {!currentUser.attachmentStyle ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUsSubTab('tests');
                      setActiveTab('us');
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Пройти тест</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setUsSubTab('tests');
                      setActiveTab('us');
                    }}
                    className="text-[11px] font-bold text-[var(--text-2)] hover:text-[var(--accent)] transition-colors"
                  >
                    Пересдать тест →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Security & Logout */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--text-2)]" />
            <h2 className="text-base font-extrabold text-[var(--text)]">Безопасность</h2>
          </div>
        </div>

        {showPasswordChange ? (
          <form onSubmit={handleChangePassword} className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] space-y-3">
            {passwordMsg && (
              <div className={`p-2.5 rounded-xl text-xs font-semibold ${passwordMsg.isError ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {passwordMsg.text}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                Старый пароль
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-2)] mb-1">
                Новый пароль
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--divider)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold"
              >
                Сохранить пароль
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordChange(false)}
                className="px-3 py-2 rounded-xl bg-[var(--surface)] text-[var(--text-2)] text-xs font-bold"
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowPasswordChange(true)}
            className="w-full py-2.5 px-4 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--divider)] border border-[var(--divider)] text-xs font-bold text-[var(--text)] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[var(--text-2)]" />
              <span>Сменить пароль</span>
            </div>
            <span className="text-[10px] text-[var(--text-2)]">Изменить</span>
          </button>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={authLogout}
          className="w-full py-2.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-xs font-bold text-red-500 flex items-center justify-center gap-2 transition-colors mt-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта (@{currentUser.login})</span>
        </button>
      </div>

      {/* Disconnect Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--surface)] border border-[var(--divider)] rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-extrabold text-[var(--text)]">
                Разорвать связь с парой?
              </h3>
              <p className="text-xs text-[var(--text-2)] mt-1.5">
                Вы перестанете быть в паре с @{currentUser.partnerLogin}. Вы сможете в любой момент отправить новый запрос.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="py-2.5 rounded-xl bg-[var(--surface-2)] text-xs font-bold text-[var(--text)] hover:bg-[var(--divider)]"
              >
                Отмена
              </button>
              <button
                onClick={async () => {
                  await disconnectPair();
                  setShowDisconnectModal(false);
                }}
                className="py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600"
              >
                Разорвать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
