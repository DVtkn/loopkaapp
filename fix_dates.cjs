const fs = require('fs');
const file = 'src/components/DatesView.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { PageLayout }')) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { PageLayout } from './ui/PageLayout';");
}
content = content.replace(/<div className="max-w-xl mx-auto w-full space-y-4 pb-12 animate-fadeIn">/g, '<PageLayout title="Свидания" hideHeader>');
content = content.replace(/    <\/div>\n  \);\n};\n?$/g, '    </PageLayout>\n  );\n};\n');

fs.writeFileSync(file, content, 'utf8');

const file2 = 'src/components/ChatView.tsx';
let content2 = fs.readFileSync(file2, 'utf8');
if (!content2.includes('import { PageLayout }')) {
  content2 = content2.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { PageLayout } from './ui/PageLayout';");
}
content2 = content2.replace(/<div className="flex flex-col h-full w-full bg-\[var\(--bg\)\]">/g, '<PageLayout hideHeader className="p-0 sm:p-0 sm:px-0">');
content2 = content2.replace(/    <\/div>\n  \);\n};\n?$/g, '    </PageLayout>\n  );\n};\n');
fs.writeFileSync(file2, content2, 'utf8');

console.log('Dates and Chat updated');
