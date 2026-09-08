const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /        {isPaired \? \([\s\S]*?group-hover:translate-x-0\.5 shrink-0" \/>\n          <\/section>/;
const replacement = `          </section>\n        )}`;

const match = content.match(regex);
if (match) {
  content = content.replace(regex, match[0] + '\n        )}');
  fs.writeFileSync('src/components/DashboardView.tsx', content);
  console.log('Fixed line 830!');
} else {
  console.log('Not found');
}
