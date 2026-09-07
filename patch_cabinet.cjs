const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `      {/* 4. Settings & Security */}`;
const replacement = `      {/* 4. Settings & Security */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-[var(--text-2)]" />
          <h2 className="text-base font-extrabold text-[var(--text)]">Настройки</h2>
        </div>

        {/* Date Mode Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] cursor-pointer" onClick={() => setIsDateMode(!isDateMode)}>
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${isDateMode ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--text-2)]'}\`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-[var(--text)]">Режим свидания</div>
              <div className="text-[10px] font-medium text-[var(--text-2)]">Минималистичный интерфейс</div>
            </div>
          </div>
          <div className={\`w-12 h-6 rounded-full p-1 transition-colors \${isDateMode ? 'bg-[var(--accent)]' : 'bg-[var(--divider)]'}\`}>
            <div className={\`w-4 h-4 bg-white rounded-full shadow-sm transition-transform \${isDateMode ? 'translate-x-6' : 'translate-x-0'}\`} />
          </div>
        </div>`;

content = content.replace(target, replacement);

const importTarget = `import { useCouple } from '../context/CoupleContext';`;
const importReplacement = `import { useCouple } from '../context/CoupleContext';
import { Moon } from 'lucide-react';`;

if (!content.includes('Moon')) {
    content = content.replace(importTarget, importReplacement);
}

const destructTarget = `  const {
    currentUser,
    isPaired,
    allUsers,
    authLogout,
    updateUserProfile,
    updateCoupleStartDate,
    sendPairRequestByLogin,
    acceptPairRequest,
    rejectPairRequest,
    disconnectPair,
    incomingRequests,
    outgoingRequests,
    changePassword,
  } = useCouple();`;
  
const destructReplacement = `  const {
    currentUser,
    isPaired,
    allUsers,
    authLogout,
    updateUserProfile,
    updateCoupleStartDate,
    sendPairRequestByLogin,
    acceptPairRequest,
    rejectPairRequest,
    disconnectPair,
    incomingRequests,
    outgoingRequests,
    changePassword,
    isDateMode,
    setIsDateMode,
  } = useCouple();`;

content = content.replace(destructTarget, destructReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Cabinet patched successfully');
