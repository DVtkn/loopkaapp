const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove Header and Navigation from App.tsx rendering
const startToRemove = `      {/* Desktop Sidebar & Mobile Bottom Navigation */}`;
const endToRemove = `      {/* Main App Container */}`;

const startIdx = content.indexOf(startToRemove);
const endIdx = content.indexOf(endToRemove) + endToRemove.length;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

const headerToRemove = `{/* Top Header - Hidden in chat tab so chat has its own compact Telegram-style header */}
        {!isChatTab && (
          <Header
            onOpenAchievements={() => setShowAchievementsModal(true)}
            onOpenSettings={() => setActiveTab('profile')}
          />
        )}`;

content = content.replace(headerToRemove, '');

const achievementsToRemove = `<AnimatePresence>
        {showAchievementsModal && (
          <AchievementsModal onClose={() => setShowAchievementsModal(false)} />
        )}
      </AnimatePresence>`;

content = content.replace(achievementsToRemove, '');

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx layout fixed');
