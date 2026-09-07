const fs = require('fs');
const file = 'src/components/DatesView.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  return (
    <PageLayout title="Свидания" hideHeader>`;

const replacement = `  return (
    <PageLayout title="Свидания" hideHeader>
      <div className="max-w-xl mx-auto w-full space-y-4 pb-12 animate-fadeIn">`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
