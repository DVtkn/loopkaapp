const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /          <\/AnimatePresence>\n        <\/section>/;
const replacement = `          </AnimatePresence>\n        </section>\n        )}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/DashboardView.tsx', content);
