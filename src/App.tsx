import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AuthView } from './components/AuthView';
import { DashboardView } from './components/DashboardView';
import { IOSInstallPrompt } from './components/IOSInstallPrompt';

// Dynamic Lazy Imports for Heavy Views (Code Splitting)
const UsView = lazy(() => import('./components/UsView').then(m => ({ default: m.UsView })));
const DatesView = lazy(() => import('./components/DatesView').then(m => ({ default: m.DatesView })));
const ChatView = lazy(() => import('./components/ChatView').then(m => ({ default: m.ChatView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const TestsView = lazy(() => import('./components/TestsView').then(m => ({ default: m.TestsView })));
const CareBaseView = lazy(() => import('./components/CareBaseView').then(m => ({ default: m.CareBaseView })));
const DeepTalkView = lazy(() => import('./components/DeepTalkView').then(m => ({ default: m.DeepTalkView })));

const ViewFallback = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
    <div className="w-8 h-8 border-3 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3"></div>
    <p className="text-sm text-[var(--text-2)] font-medium">Загрузка модуля...</p>
  </div>
);
import { AmbientBackground } from './components/AmbientBackground';
import { NavigationTab } from './types';
import { LoopLogo } from './components/LoopLogo';
import { AchievementsModal } from './components/AchievementsModal';
import { PartnerTouchToast } from './components/PartnerTouchToast';

const MainLayout: React.FC = () => {
  const { isOnboarded, currentUser, activeTab, setActiveTab, activePartnerTouch, dismissPartnerTouch, sendTouchAction } = useCouple();
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
        return <TestsView initialMode="catalog" />;
      case 'report':
        return <TestsView initialMode="report" />;
      case 'care':
        return <CareBaseView />;
      case 'deeptalk':
        return <DeepTalkView onBack={() => setActiveTab('us')} />;
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

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={isChatTab ? 'chat' : activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="flex-1 flex flex-col min-h-0 h-full w-full"
          >
            <Suspense fallback={<ViewFallback />}>
              {renderActiveView()}
            </Suspense>
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

      {/* Real-time Partner Touch In-App Toast */}
      <PartnerTouchToast
        touch={activePartnerTouch}
        onDismiss={dismissPartnerTouch}
        onSendBack={() => {
          sendTouchAction('hug', {
            title: `${currentUser.name} отправил(а) объятие в ответ`,
            subtitle: 'Взаимное нежное касание ❤️',
          });
          dismissPartnerTouch();
        }}
      />

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
