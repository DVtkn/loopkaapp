const fs = require('fs');
const file = 'src/components/ChatView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { PageLayout }')) {
  content = content.replace(
    "import React, { useState, useEffect, useRef } from 'react';",
    "import React, { useState, useEffect, useRef } from 'react';\nimport { PageLayout } from './ui/PageLayout';"
  );
}

content = content.replace(
  'return (\n    <div className="flex flex-col flex-1 h-full min-h-0 w-full overflow-hidden bg-[var(--bg)]">',
  'return (\n    <PageLayout hideHeader className="p-0 sm:p-0 sm:px-0">\n      <div className="flex flex-col flex-1 h-full min-h-0 w-full overflow-hidden bg-[var(--bg)]">'
);

content = content.replace(
  /    <\/div>\n  \);\n};\n?$/,
  '      </div>\n    </PageLayout>\n  );\n};\n'
);

fs.writeFileSync(file, content, 'utf8');
