const fs = require('fs');

const datesFile = 'src/components/DatesView.tsx';
let datesContent = fs.readFileSync(datesFile, 'utf8');

// Replace the main div wrapper with PageLayout in DatesView
datesContent = datesContent.replace(
  'return (\n    <div className="max-w-xl mx-auto w-full space-y-4 pb-8 animate-fadeIn">',
  'return (\n    <PageLayout title="Свидания" hideHeader>\n      <div className="max-w-xl mx-auto w-full space-y-4 pb-8 animate-fadeIn">'
);

if (!datesContent.includes('import { PageLayout }')) {
  datesContent = datesContent.replace(
    "import React, { useState } from 'react';",
    "import React, { useState } from 'react';\nimport { PageLayout } from './ui/PageLayout';"
  );
}
fs.writeFileSync(datesFile, datesContent, 'utf8');

const chatFile = 'src/components/ChatView.tsx';
let chatContent = fs.readFileSync(chatFile, 'utf8');

// The main div for chat is probably `<div className="flex flex-col h-full w-full bg-[var(--bg)]">` or similar. Let's check it.
