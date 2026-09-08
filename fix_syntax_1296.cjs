const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /          <\/section>\s*<\/div>\s*{\/\* ============================================================ \*\//;
const replacement = `          </section>\n        )}\n      </div>\n      {/* ============================================================ */`;

const match = content.match(regex);
if (match) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardView.tsx', content);
  console.log('Fixed line 1296!');
} else {
  console.log('Not found');
}
