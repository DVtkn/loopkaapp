const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

const destructTarget = `    incomingRequests,
  } = useCouple();`;
const destructReplacement = `    incomingRequests,
    isDateMode,
  } = useCouple();`;
content = content.replace(destructTarget, destructReplacement);

const topMetricsTarget = `      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}`;
const topMetricsReplacement = `      {/* 2. Top Row Metric Cards: Streak, Mood & Partner Status */}
      {!isDateMode && (`;

content = content.replace(topMetricsTarget, topMetricsReplacement);

const endTopMetricsTarget = `      {/* 3. FAST ACTIONS & REACTIONS */}`;
const endTopMetricsReplacement = `      )}
      {/* 3. FAST ACTIONS & REACTIONS */}`;

content = content.replace(endTopMetricsTarget, endTopMetricsReplacement);

const gamesTarget = `      {/* 5. GAMIFICATION & FEATURES QUICK LAUNCH HUB */}`;
const gamesReplacement = `      {/* 5. GAMIFICATION & FEATURES QUICK LAUNCH HUB */}
      {!isDateMode && (`;

content = content.replace(gamesTarget, gamesReplacement);

const endGamesTarget = `      {/* 3. Question of the Day Card */}`;
const endGamesReplacement = `      )}
      {/* 3. Question of the Day Card */}`;

content = content.replace(endGamesTarget, endGamesReplacement);

const quizTarget = `      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}`;
const quizReplacement = `      {/* 4. DAILY COUPLE QUIZ: Игра дня «Кто из нас двоих...» */}
      {!isDateMode && (`;

content = content.replace(quizTarget, quizReplacement);

const endQuizTarget = `      {/* 5. GAMIFICATION & FEATURES QUICK LAUNCH HUB */}`;
const endQuizReplacement = `      )}
      {/* 5. GAMIFICATION & FEATURES QUICK LAUNCH HUB */}`;

content = content.replace(endQuizTarget, endQuizReplacement);

// Let's also hide the Couple Feed in date mode? Actually Couple Feed might be cute for a date (memories). Or hide it. Let's hide it.
const feedTarget = `      {/* 4. Couple Feed (Лента пары) */}`;
const feedReplacement = `      {/* 4. Couple Feed (Лента пары) */}
      {!isDateMode && (`;

content = content.replace(feedTarget, feedReplacement);

const endFeedTarget = `      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}`;
const endFeedReplacement = `      )}
      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}`;

content = content.replace(endFeedTarget, endFeedReplacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard Date Mode patched');
