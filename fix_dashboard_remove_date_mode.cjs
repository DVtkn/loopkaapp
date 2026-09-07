const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove isDateMode destruct
content = content.replace(/\s*isDateMode,?\n?/g, (match) => {
    if (match.includes('isDateMode')) return '';
    return match;
});

// 2. Remove wrapper 1
const target1 = `      {!isDateMode && (
        <>
      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}`;
const replace1 = `      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}`;
content = content.replace(target1, replace1);

const target1end = `        </>
      )}
      {/* 3. FAST ACTIONS & REACTIONS */}`;
const replace1end = `      {/* 3. FAST ACTIONS & REACTIONS */}`;
content = content.replace(target1end, replace1end);

// 3. Remove wrapper 2
const target2 = `      {!isDateMode && (
        <>
      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}`;
const replace2 = `      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}`;
content = content.replace(target2, replace2);

const target2end = `        </>
      )}
      {/* 3. Question of the Day Card */}`;
const replace2end = `      {/* 3. Question of the Day Card */}`;
content = content.replace(target2end, replace2end);

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard Date Mode removed');
