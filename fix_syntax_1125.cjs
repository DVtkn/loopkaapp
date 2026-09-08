const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /          <\/AnimatePresence>\s*<\/section>\s*{\/\* ============================================================ \*\//;
const replacement = `          </AnimatePresence>\n        </section>\n        )}\n        {/* ============================================================ */`;

const match = content.match(regex);
if (match) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardView.tsx', content);
  console.log('Fixed line 1125!');
} else {
  console.log('Not found');
}
