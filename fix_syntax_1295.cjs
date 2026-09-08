const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');

const regex = /          <\/section>\r?\n      <\/div>/;
const replacement = `          </section>\n        )}\n      </div>`;

const match = content.match(regex);
if (match) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/DashboardView.tsx', content);
  console.log('Fixed line 1295!');
} else {
  console.log('Not found');
}
