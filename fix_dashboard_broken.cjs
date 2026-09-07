const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace `{! && (` and `<>`
content = content.replace(/\{\!\s*&&\s*\(/g, '');
content = content.replace(/<>\s*/g, '');
content = content.replace(/<\/>\s*\)\}/g, '');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed broken dashboard fragments');
