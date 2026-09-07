const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}`;
const replace1 = `      {!isDateMode && (
        <>
      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}`;

const target2 = `      {/* 3. FAST ACTIONS & REACTIONS */}`;
const replace2 = `        </>
      )}
      {/* 3. FAST ACTIONS & REACTIONS */}`;

const target3 = `      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}`;
const replace3 = `      {!isDateMode && (
        <>
      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}`;

const target4 = `      {/* 3. Question of the Day Card */}`;
const replace4 = `        </>
      )}
      {/* 3. Question of the Day Card */}`;

content = content.replace(target1, replace1);
content = content.replace(target2, replace2);
content = content.replace(target3, replace3);
content = content.replace(target4, replace4);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched Dashboard correctly');
