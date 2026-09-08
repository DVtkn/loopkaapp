const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /        <\/section>\n        \)}/g;
const replacement = `        </section>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardView.tsx', content);
