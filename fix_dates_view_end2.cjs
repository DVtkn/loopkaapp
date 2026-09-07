const fs = require('fs');
const file = 'src/components/DatesView.tsx';
let content = fs.readFileSync(file, 'utf8');

// we need to remove the extra </div> because it seems the `<PageLayout hideHeader>` wasn't wrapped properly or the start wrapper wasn't matched.
content = content.replace(/      <\/div>\n    <\/PageLayout>\n  \);\n};\n?$/, '    </PageLayout>\n  );\n};\n');

fs.writeFileSync(file, content, 'utf8');
