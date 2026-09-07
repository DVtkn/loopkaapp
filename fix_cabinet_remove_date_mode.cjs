const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove destruct
content = content.replace("changePassword, isDateMode, setIsDateMode,", "changePassword,");

// Remove 4. App Settings
const target = `      {/* 4. App Settings */}
      <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--divider)] shadow-xs space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-[var(--text-2)]" />
          <h2 className="text-base font-extrabold text-[var(--text)]">Настройки приложения</h2>
        </div>

        {/* Date Mode Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--divider)] cursor-pointer hover:bg-[var(--surface-3)] transition-colors" onClick={() => setIsDateMode(!isDateMode)}>
          <div className="flex items-center gap-3">
            <div className={\`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-2xs border \${isDateMode ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--surface)] text-[var(--text-2)] border-[var(--divider)]'}\`}>
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
        </div>
      </div>

`;
content = content.replace(target, "");

fs.writeFileSync(file, content, 'utf8');
console.log('Cabinet Date Mode removed');
