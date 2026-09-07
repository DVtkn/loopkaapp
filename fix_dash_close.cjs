const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/    <\/div>\n  \);\n};\n?$/, '    </PageLayout>\n  );\n};\n');
fs.writeFileSync(file, content, 'utf8');
