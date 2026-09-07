const fs = require('fs');
const file = 'src/components/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove Temperature Chart, Radar, DynamicsGamificationWidget, and XP widget
const targetStart = `      {/* 6. Relationship Temperature Chart (Recharts) */}`;
const targetEnd = `      {/* MODAL 1: Mood Picker Bottom Sheet (Instagram / iOS Style) */}`;

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + targetEnd + content.substring(endIndex + targetEnd.length);
  
  // 2. Remove imports for RelationshipTemperature, RelationshipRadar, DynamicsGamificationWidget
  content = content.replace(/import \{ RelationshipTemperature \} from '\.\/RelationshipTemperatureChart';\n/g, '');
  content = content.replace(/import \{ RelationshipRadar \} from '\.\/RelationshipRadar';\n/g, '');
  content = content.replace(/import \{ DynamicsGamificationWidget \} from "\.\/DynamicsGamificationWidget";\n/g, '');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Cleaned up Dashboard successfully');
} else {
  console.log('Targets not found');
}
