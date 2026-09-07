const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { TestsView } from './components/TestsView';")) {
  content = content.replace(
    "import { SettingsView } from './components/SettingsView';",
    "import { SettingsView } from './components/SettingsView';\nimport { TestsView } from './components/TestsView';\nimport { ReportView } from './components/ReportView';\nimport { CareBaseView } from './components/CareBaseView';"
  );
}

const targetRender = `{activeTab === 'us' && <UsView />}`;
if (!content.includes("<TestsView />")) {
  content = content.replace(
    targetRender,
    `{activeTab === 'us' && <UsView />}\n              {activeTab === 'tests' && <TestsView />}\n              {activeTab === 'report' && <ReportView />}\n              {activeTab === 'carebase' && <CareBaseView />}`
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx updated');
