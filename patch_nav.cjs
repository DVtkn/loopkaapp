const fs = require('fs');
const file = 'src/components/Navigation.tsx';
let content = fs.readFileSync(file, 'utf8');

const destructTarget = `    incomingRequests,
    unreadChatCount,
  } = useCouple();`;
const destructReplacement = `    incomingRequests,
    unreadChatCount,
    isDateMode,
  } = useCouple();`;
content = content.replace(destructTarget, destructReplacement);

const tabsTarget = `  const navItems: { id: NavigationTab; label: string; icon: React.FC<any>; count?: number; dot?: boolean; isAi?: boolean }[] = [
    { id: 'dashboard', label: 'Сегодня', icon: Home },
    { id: 'us', label: 'Мы', icon: Heart, count: activeChallengesCount > 0 ? activeChallengesCount : undefined },
    { id: 'dates', label: 'Свидания', icon: MapPin, count: unreadDateInvites > 0 ? unreadDateInvites : undefined },
    { id: 'chat', label: 'Чат', icon: MessageCircle, count: unreadChatCount > 0 ? unreadChatCount : undefined },
    { id: 'profile', label: 'Профиль', icon: User, count: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
  ];`;

const tabsReplacement = `  let navItems: { id: NavigationTab; label: string; icon: React.FC<any>; count?: number; dot?: boolean; isAi?: boolean }[] = [
    { id: 'dashboard', label: 'Сегодня', icon: Home },
    { id: 'us', label: 'Мы', icon: Heart, count: activeChallengesCount > 0 ? activeChallengesCount : undefined },
    { id: 'dates', label: 'Свидания', icon: MapPin, count: unreadDateInvites > 0 ? unreadDateInvites : undefined },
    { id: 'chat', label: 'Чат', icon: MessageCircle, count: unreadChatCount > 0 ? unreadChatCount : undefined },
    { id: 'profile', label: 'Профиль', icon: User, count: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
  ];
  
  if (isDateMode) {
    navItems = [
      { id: 'dashboard', label: 'Сегодня', icon: Home },
      { id: 'dates', label: 'Свидания', icon: MapPin, count: unreadDateInvites > 0 ? unreadDateInvites : undefined },
      { id: 'chat', label: 'Чат', icon: MessageCircle, count: unreadChatCount > 0 ? unreadChatCount : undefined },
      { id: 'profile', label: 'Настройки', icon: User, count: pendingRequestsCount > 0 ? pendingRequestsCount : undefined },
    ];
  }`;

content = content.replace(tabsTarget, tabsReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Nav patched successfully');
