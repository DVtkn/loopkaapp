import React, { useState } from 'react';
import { Settings, Moon, ChevronRight, ArrowLeft,
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
import { ActionRow } from './ui/ActionRow';
import { SectionCard } from './ui/SectionCard';
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
    <div className="space-y-4">
      <SectionCard id="profile" title="Мой профиль">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--divider)] rounded-xl px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button onClick={handleSaveName} className="p-2 bg-[var(--accent)] text-white rounded-xl">
                  <Check className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-[var(--text)]">{currentUser.name}</div>
                  <div className="text-sm text-[var(--text-2)]">@{currentUser.login}</div>
                </div>
                <button onClick={() => setIsEditingName(true)} className="p-2 text-[var(--text-2)] hover:text-[var(--accent)] rounded-xl bg-[var(--surface-2)]">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard id="couple" title="Наш союз">
        
        {coupleProfile.partner2 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)]">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-[var(--accent)] fill-[var(--accent)]" />
                <div>
                  <div className="text-sm font-bold text-[var(--text)]">Вы в союзе с {coupleProfile.partner2.name}</div>
                  <div className="text-xs text-[var(--text-2)]">@{coupleProfile.partner2.login}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDisconnectModal(true)}
              className="w-full py-3 rounded-xl border border-red-500/30 text-red-500 font-semibold text-sm hover:bg-red-500/10 transition-colors"
            >
              Разорвать союз
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] text-center">
              <UserPlus className="w-8 h-8 mx-auto text-[var(--text-2)] mb-2" />
              <p className="text-sm font-medium text-[var(--text)] mb-4">Вы пока не в союзе.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Логин партнера"
                  value={targetPartnerLogin}
                  onChange={(e) => setTargetPartnerLogin(e.target.value)}
                  className="flex-1 bg-[var(--surface)] border border-[var(--divider)] rounded-xl px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
                />
                <button
                  onClick={() => sendPairRequestByLogin(targetPartnerLogin)}
                  className="px-4 bg-[var(--accent)] text-white font-semibold text-sm rounded-xl"
                >
                  Связать
                </button>
              </div>
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard id="system" title="Система">
        
        <button onClick={() => setShowPasswordChange(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] hover:bg-[var(--surface-3)] transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--surface)] flex items-center justify-center border border-[var(--divider)] shadow-xs">
              <Lock className="w-5 h-5 text-[var(--text)]" />
            </div>
            <div className="text-sm font-semibold text-[var(--text)]">Изменить пароль</div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--text-2)]" />
        </button>

        <button onClick={authLogout} className="w-full flex items-center justify-between p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] hover:bg-[var(--surface-3)] transition-colors active:scale-[0.98]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-xs">
              <LogOut className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-sm font-semibold text-red-500">Выйти из аккаунта</div>
          </div>
        </button>
      </SectionCard>
    </div>
  );
};
