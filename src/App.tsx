import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { UsView } from './components/UsView';
import { DatesView } from './components/DatesView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { TestsView } from './components/TestsView';
import { ReportView } from './components/ReportView';
import { CareBaseView } from './components/CareBaseView';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';
import { AmbientBackground } from './components/AmbientBackground';
import { NavigationTab } from './types';
import { LoopLogo } from './components/LoopLogo';
import { AchievementsModal } from './components/AchievementsModal';

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
        return <UsView />;
      case 'tests':
        return <TestsView />;
      case 'report':
        return <ReportView onStartTest={() => setActiveTab('tests')} />;
      case 'care':
        return <CareBaseView />;
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
      
      {/* Sidebar Navigation for Desktop */}
      <div className="hidden md:flex shrink-0">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onTabChange={setActiveTab}
          onOpenAchievements={() => setShowAchievementsModal(true)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0">
        {!isChatTab && (
          <div className="shrink-0 z-10">
            <Header 
              onOpenAchievements={() => setShowAchievementsModal(true)}
              onOpenSettings={() => setActiveTab('profile')}
            />
          </div>
        )}

                <AnimatePresence initial={false}>
          <motion.div
            key={isChatTab ? 'chat' : activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0 h-full w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Navigation Tab Bar */}
        <div className="md:hidden shrink-0 z-10">
          <Navigation 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            onTabChange={setActiveTab}
            onOpenAchievements={() => setShowAchievementsModal(true)}
          />
        </div>
      </div>
      
      {/* iOS Home Screen Install Helper Banner */}
      <IOSInstallPrompt />

      <AnimatePresence>
        {showAchievementsModal && (
          <AchievementsModal 
            isOpen={showAchievementsModal} 
            onClose={() => setShowAchievementsModal(false)} 
          />
        )}
      </AnimatePresence>
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
