const fs = require('fs');
const file = 'src/components/DatesView.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/      <\/div>\n    <\/PageLayout>\n  \);\n};\n?$/, '    </PageLayout>\n  );\n};\n');
// Let's just fix whatever was originally wrong with DatesView.
// If it was missing a div, it means there's an open JSX tag somewhere inside it. 
// Maybe the first div replacement failed and we should undo it.
