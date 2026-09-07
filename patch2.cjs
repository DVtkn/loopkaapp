const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `        <AnimatePresence initial={false}>
          <motion.div
            key={isChatTab ? 'chat' : activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col min-h-0 h-full w-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>`;

code = code.replace(/<AnimatePresence initial=\{false\}>[\s\S]*?<\/AnimatePresence>/, replacement);
fs.writeFileSync('src/App.tsx', code);
