const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `    smallCravings,
    addMoodStatus,`;
const replacement = `    smallCravings,
    addMoodStatus,
    isDateMode,`;
content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Dashboard isDateMode');
