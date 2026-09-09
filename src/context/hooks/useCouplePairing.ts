import { useState } from 'react';
import { apiFetch } from '../../utils/api.ts';
import { UserAccount, PairRequest } from '../../types.ts';
import { safeGetStorage, safeSetStorage } from '../../utils/safeStorage.ts';

export interface UseCouplePairingProps {
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  accountsDb: Record<string, UserAccount & { password?: string }>;
  setAccountsDb: React.Dispatch<React.SetStateAction<Record<string, UserAccount & { password?: string }>>>;
  triggerConfetti: () => void;
  addFeedItem: (item: { author: 'system'; type: 'heart'; title: string; subtitle: string }) => void;
  fetchCoupleDataRef: React.MutableRefObject<(() => Promise<void>) | undefined>;
}

export interface UseCouplePairingReturn {
  pairRequests: PairRequest[];
  setPairRequests: React.Dispatch<React.SetStateAction<PairRequest[]>>;
  incomingRequests: PairRequest[];
  outgoingRequests: PairRequest[];
  sendPairRequestByLogin: (targetLogin: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  acceptPairRequest: (partnerLogin: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  rejectPairRequest: (partnerLogin: string) => Promise<void>;
  disconnectPair: () => Promise<void>;
}

export function useCouplePairing({
  currentUser,
  setCurrentUser,
  accountsDb,
  setAccountsDb,
  triggerConfetti,
  addFeedItem,
  fetchCoupleDataRef,
}: UseCouplePairingProps): UseCouplePairingReturn {
  const [pairRequests, setPairRequests] = useState<PairRequest[]>(() => {
    return safeGetStorage('together_pair_requests', []);
  });

  const incomingRequests = pairRequests.filter(
    (r) => currentUser && r.toLogin.toLowerCase() === currentUser.login.toLowerCase() && r.status === 'PENDING'
  );

  const outgoingRequests = pairRequests.filter(
    (r) => currentUser && r.fromLogin.toLowerCase() === currentUser.login.toLowerCase() && r.status === 'PENDING'
  );

  const sendPairRequestByLogin = async (
    targetLogin: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Необходимо войти в аккаунт' };

    const myLogin = currentUser.login.toLowerCase();
    const cleanTarget = targetLogin.trim().toLowerCase().replace(/^@/, '');

    if (!cleanTarget) {
      return { success: false, error: 'Введите логин партнёра' };
    }

    if (myLogin === cleanTarget) {
      return { success: false, error: 'Нельзя создать пару с самим собой' };
    }

    try {
      const res = await apiFetch('/api/pair/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromLogin: myLogin, toLogin: cleanTarget }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка отправки запроса' };
      }

      if (data.status === 'paired' && data.user && data.partner) {
        const safeMe: UserAccount = data.user;
        const safePartner: UserAccount = data.partner;
        const updatedDb = {
          ...accountsDb,
          [myLogin]: { ...accountsDb[myLogin], ...safeMe },
          [cleanTarget]: { ...accountsDb[cleanTarget], ...safePartner },
        };
        setAccountsDb(updatedDb);
        safeSetStorage('together_accounts_registry', updatedDb);
        setCurrentUser(safeMe);

        triggerConfetti();
        addFeedItem({
          author: 'system',
          type: 'heart',
          title: `Вы теперь в паре с @${cleanTarget}!`,
          subtitle: 'Общее пространство для гармонии и сближения активировано',
        });

        return {
          success: true,
          message: data.message || `Поздравляем! Вы и @${cleanTarget} теперь пара`,
        };
      }

      const newRequest: PairRequest = {
        id: 'pr_' + Date.now(),
        fromLogin: myLogin,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatarEmoji,
        toLogin: cleanTarget,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      const updatedRequests = [
        ...pairRequests.filter(
          (r) => !(r.fromLogin.toLowerCase() === myLogin && r.toLogin.toLowerCase() === cleanTarget)
        ),
        newRequest,
      ];

      setPairRequests(updatedRequests);
      safeSetStorage('together_pair_requests', updatedRequests);

      return {
        success: true,
        message: data.message || `Запрос на добавление отправлен пользователю @${cleanTarget}!`,
      };
    } catch {
      return { success: false, error: 'Ошибка соединения с сервером. Попробуйте снова.' };
    }
  };

  const acceptPairRequest = async (
    partnerLogin: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'Необходимо войти в аккаунт' };

    const myLogin = currentUser.login.toLowerCase();
    const cleanPartner = partnerLogin.trim().toLowerCase().replace(/^@/, '');

    try {
      const res = await apiFetch('/api/pair/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromLogin: cleanPartner, toLogin: myLogin }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Ошибка принятия запроса' };
      }

      const safeMe: UserAccount =
        data.me || data.user || { ...currentUser, partnerLogin: cleanPartner, pairedAt: new Date().toISOString() };
      const safePartner: UserAccount = data.partner || { login: cleanPartner, name: cleanPartner, avatarEmoji: 'user' };

      const updatedDb = {
        ...accountsDb,
        [myLogin]: { ...accountsDb[myLogin], ...safeMe },
        [cleanPartner]: { ...accountsDb[cleanPartner], ...safePartner },
      };
      setAccountsDb(updatedDb);
      safeSetStorage('together_accounts_registry', updatedDb);

      setCurrentUser(safeMe);

      const updatedRequests = pairRequests.map((r) => {
        if (
          (r.fromLogin.toLowerCase() === cleanPartner && r.toLogin.toLowerCase() === myLogin) ||
          (r.fromLogin.toLowerCase() === myLogin && r.toLogin.toLowerCase() === cleanPartner)
        ) {
          return { ...r, status: 'ACCEPTED' as const };
        }
        return r;
      });
      setPairRequests(updatedRequests);
      safeSetStorage('together_pair_requests', updatedRequests);

      triggerConfetti();

      setTimeout(() => {
        fetchCoupleDataRef.current?.();
      }, 500);

      addFeedItem({
        author: 'system',
        type: 'heart',
        title: `Вы теперь в паре с @${cleanPartner}!`,
        subtitle: 'Общее пространство для гармонии и сближения активировано',
      });

      return {
        success: true,
        message: data.message || `Поздравляем! Вы и @${cleanPartner} теперь пара`,
      };
    } catch {
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  };

  const rejectPairRequest = async (partnerLogin: string) => {
    if (!currentUser) return;
    const myLogin = currentUser.login.toLowerCase();
    const cleanPartner = partnerLogin.trim().toLowerCase().replace(/^@/, '');

    const updatedRequests = pairRequests.map((r) => {
      if (r.fromLogin.toLowerCase() === cleanPartner && r.toLogin.toLowerCase() === myLogin) {
        return { ...r, status: 'REJECTED' as const };
      }
      return r;
    });
    setPairRequests(updatedRequests);
    safeSetStorage('together_pair_requests', updatedRequests);

    try {
      apiFetch('/api/pair/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromLogin: cleanPartner, toLogin: myLogin }),
      }).catch(() => {});
    } catch {}
  };

  const disconnectPair = async () => {
    if (!currentUser) return;
    const myLogin = currentUser.login.toLowerCase();
    const meInDb = accountsDb[myLogin];
    if (!meInDb) return;

    const oldPartnerLogin = meInDb.partnerLogin ? meInDb.partnerLogin.toLowerCase() : null;

    const updatedMe = { ...meInDb, partnerLogin: null, pairedAt: undefined };
    let updatedDb = { ...accountsDb, [myLogin]: updatedMe };

    if (oldPartnerLogin && accountsDb[oldPartnerLogin]) {
      const updatedOldPartner = { ...accountsDb[oldPartnerLogin], partnerLogin: null, pairedAt: undefined };
      updatedDb[oldPartnerLogin] = updatedOldPartner;
    }

    setAccountsDb(updatedDb);
    safeSetStorage('together_accounts_registry', updatedDb);

    const { password: _, ...safeMe } = updatedMe;
    setCurrentUser(safeMe);

    try {
      apiFetch('/api/pair/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: myLogin }),
      }).catch(() => {});
    } catch {}
  };

  return {
    pairRequests,
    setPairRequests,
    incomingRequests,
    outgoingRequests,
    sendPairRequestByLogin,
    acceptPairRequest,
    rejectPairRequest,
    disconnectPair,
  };
}
