const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /События пары сегодня/g;
const replacement = `{isPaired ? 'События пары сегодня' : 'События сегодня'}`;
content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardView.tsx', content);
