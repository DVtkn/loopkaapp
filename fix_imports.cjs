const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

content = content.replace("  CheckCircle2,", "  CheckCircle2, SmilePlus,");
fs.writeFileSync('src/components/DashboardView.tsx', content);
console.log("Imports fixed");
