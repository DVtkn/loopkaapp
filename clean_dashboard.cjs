const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Strip ALL `{!isDateMode && (` that I added
content = content.replace(/      \{\!isDateMode && \(\n/g, '');

// Strip the closing `)}` I added before sections
content = content.replace(/      \)\}\n      \{\/\* 3\. FAST ACTIONS/g, '      {/* 3. FAST ACTIONS');
content = content.replace(/      \)\}\n      \{\/\* 3\. Question of/g, '      {/* 3. Question of');
content = content.replace(/      \)\}\n      \{\/\* 5\. GAMIFICATION/g, '      {/* 5. GAMIFICATION');
content = content.replace(/      \)\}\n      \{\/\* MODAL 1/g, '      {/* MODAL 1');

fs.writeFileSync(file, content, 'utf8');
console.log('Cleaned Dashboard');
