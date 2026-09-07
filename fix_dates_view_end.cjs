const fs = require('fs');
const file = 'src/components/DatesView.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will look at the end of the file and replace what's there
content = content.replace(/      <\/div>\n    <\/PageLayout>\n  \);\n};\n?$/, '      </div>\n    </PageLayout>\n  );\n};\n');

// Ah wait, it already ends with that. The issue is probably some missing closing tags. Let's see what's before.
