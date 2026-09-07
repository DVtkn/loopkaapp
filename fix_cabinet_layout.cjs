const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add PageLayout import
content = content.replace("import { useCouple } from '../context/CoupleContext';", "import { useCouple } from '../context/CoupleContext';\nimport { PageLayout } from './ui/PageLayout';\nimport { ActionRow } from './ui/ActionRow';\nimport { SectionCard } from './ui/SectionCard';");

// Fix missing icons
content = content.replace("import { Settings, Moon,", "import { Settings, Moon, ChevronRight, ArrowLeft,");

// Wrap in PageLayout
content = content.replace(`<div className="flex-1 min-h-0 flex flex-col w-full max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-y-auto pb-24">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => setActiveTab('home')} className="p-2 -ml-2 rounded-xl text-[var(--text-2)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--text)]">Настройки</h1>
      </div>`, `<PageLayout title="Настройки профиля" onBack={() => setActiveTab('home')}>`);

content = content.replace(/<\/div>\n  \);\n};\n$/, "</PageLayout>\n  );\n};\n");

// Replace sections with SectionCard and ActionRow
content = content.replace(/<section aria-labelledby="profile-title" className="app-card p-5 space-y-4">\n\s*<h2 id="profile-title" className="text-sm font-semibold text-\[var\(--text-2\)\] uppercase tracking-wider">Мой профиль<\/h2>/g, `<SectionCard id="profile" title="Мой профиль">`);
content = content.replace(/<\/section>/g, `</SectionCard>`);

content = content.replace(/<section aria-labelledby="couple-title" className="app-card p-5 space-y-4">\n\s*<h2 id="couple-title" className="text-sm font-semibold text-\[var\(--text-2\)\] uppercase tracking-wider">Наш союз<\/h2>/g, `<SectionCard id="couple" title="Наш союз">`);

content = content.replace(/<section aria-labelledby="system-title" className="app-card p-5 space-y-3">\n\s*<h2 id="system-title" className="text-sm font-semibold text-\[var\(--text-2\)\] uppercase tracking-wider mb-2">Система<\/h2>/g, `<SectionCard id="system" title="Система">`);

fs.writeFileSync(file, content, 'utf8');
console.log('Cabinet layout updated');
