const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove the closing brace before 3. FAST ACTIONS
content = content.replace(`      )}
      {/* 3. FAST ACTIONS & REACTIONS */}`, `      {/* 3. FAST ACTIONS & REACTIONS */}`);

// 2. Add closing brace before 4. Couple Feed (to close 2. Top Row Metrics)
content = content.replace(`      {/* 4. Couple Feed (Лента пары) */}`, `      )}
      {/* 4. Couple Feed (Лента пары) */}`);

// 3. Remove closing brace before MODAL 1 (which was supposed to close 4. Couple Feed)
content = content.replace(`      )}
      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}`, `      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}`);

// 4. Add closing brace before 3. FAST ACTIONS (Wait, 4. Couple Feed is before 3. FAST ACTIONS)
// Ah! Wait! Let's check the original order:
// 2. Top Row
// 4. Couple Feed
// 3. FAST ACTIONS
// 4. DAILY COUPLE QUIZ
// 5. GAMIFICATION
// 3. Question of the Day Card
// MODAL 1

// Let's do a complete clean up of !isDateMode manually
