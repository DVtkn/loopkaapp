const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `  const isChatTab = activeTab === 'chat' || activeTab === 'owl';

  return (
    <div className="h-full w-full text-[var(--text)] flex font-sans selection:bg-[var(--accent)]/20 selection:text-[var(--accent)] transition-colors overflow-hidden relative">
      {/* Dynamic Apple Ambient Aurora Mesh Background */}
      <AmbientBackground />
      
      {/* Sidebar Navigation for Desktop */}
      <div className="hidden md:flex shrink-0">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-0">
        {!isChatTab && (
          <div className="shrink-0 z-10">
            <Header />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isChatTab ? 'chat' : activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="flex-1 flex flex-col min-h-0 h-full w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Navigation Tab Bar */}
        <div className="md:hidden shrink-0 z-10">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
      
      {/* iOS Home Screen Install Helper Banner */}
      <IOSInstallPrompt />
    </div>
  );
};`;

code = code.replace(/const isChatTab = activeTab === 'chat' \|\| activeTab === 'owl';[\s\S]*?IOSInstallPrompt \/>\s*<\/div>\s*\);\s*};/, replacement);
fs.writeFileSync('src/App.tsx', code);
