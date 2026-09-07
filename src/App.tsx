import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LandingView } from './components/LandingView';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { UsView } from './components/UsView';
import { DatesView } from './components/DatesView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { AchievementsModal } from './components/AchievementsModal';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { AmbientBackground } from './components/AmbientBackground';
import { NavigationTab } from './types';

const MainLayout: React.FC = () => {
  const { isOnboarded, currentUser, activeTab, setActiveTab } = useCouple();
  const [showAchievementsModal, setShowAchievementsModal] = useState<boolean>(false);

  // Hook to handle visualViewport height & keyboard open state like Telegram
  useEffect(() => {
    const isChat = activeTab === 'chat' || activeTab === 'owl';
    document.body.classList.toggle('in-chat-view', isChat);
  }, [activeTab]);

  useEffect(() => {
    const handleViewport = () => {
      const vv = window.visualViewport;
      if (vv) {
        document.documentElement.style.setProperty('--viewport-height', `${vv.height}px`);
        document.documentElement.style.setProperty('--viewport-offset-top', `${vv.offsetTop}px`);
        
        const isKeyboard =
          window.innerHeight - vv.height > 100 ||
          (typeof window.screen !== 'undefined' && window.screen.height - vv.height > 200 && vv.height < window.innerHeight * 0.88);

        document.body.classList.toggle('keyboard-open', !!isKeyboard);
        document.body.classList.toggle('keyboard-visible', !!isKeyboard);
      } else {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        document.documentElement.style.setProperty('--viewport-offset-top', '0px');
      }
    };

    handleViewport();
    window.visualViewport?.addEventListener('resize', handleViewport);
    window.visualViewport?.addEventListener('scroll', handleViewport);
    window.addEventListener('resize', handleViewport);
    window.addEventListener('orientationchange', handleViewport);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewport);
      window.visualViewport?.removeEventListener('scroll', handleViewport);
      window.removeEventListener('resize', handleViewport);
      window.removeEventListener('orientationchange', handleViewport);
    };
  }, []);

  // If user is not logged in / not onboarded yet, show AuthView (Login / Register with login & password)
  if (!isOnboarded || !currentUser) {
    return (
      <div className="h-full w-full text-[var(--text)] selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] transition-colors overflow-hidden relative">
        <AmbientBackground />
        <AuthView />
        <IOSInstallPrompt />
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'us':
      case 'tests':
      case 'report':
      case 'care':
        return <UsView />;
      case 'dates':
        return <DatesView />;
      case 'chat':
      case 'owl':
        return <ChatView />;
      case 'profile':
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  const isChatTab = activeTab === 'chat' || activeTab === 'owl';

  return (
    <div className="h-full w-full text-[var(--text)] flex font-sans selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] transition-colors overflow-hidden relative">
      {/* Dynamic Apple Ambient Aurora Mesh Background */}
      <AmbientBackground />
      
      {/* Desktop Sidebar & Mobile Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setActiveTab={setActiveTab}
        onOpenAchievements={() => setShowAchievementsModal(true)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0">
        {/* Top Header - Hidden in chat tab so chat has its own compact Telegram-style header */}
        {!isChatTab && (
          <Header
            onOpenAchievements={() => setShowAchievementsModal(true)}
            onOpenSettings={() => setActiveTab('profile')}
          />
        )}

        {/* View Content Area with Smooth Motion Transitions */}
        <main className={`flex-1 min-h-0 flex flex-col min-w-0 w-full mx-auto ${
          isChatTab
            ? 'max-w-xl overflow-hidden px-0 pb-0 h-full'
            : 'max-w-4xl px-4 sm:px-6 py-4 pb-[calc(86px+env(safe-area-inset-bottom,0px))] md:pb-8 overflow-y-auto'
        }`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isChatTab ? 'chat' : activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={isChatTab ? "flex-1 flex flex-col min-h-0 h-full w-full" : "w-full flex-1 flex flex-col"}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />

      {/* iOS Home Screen Install Helper Banner */}
      <IOSInstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <CoupleProvider>
      <MainLayout />
    </CoupleProvider>
  );
}
