const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const targetStr = `  const quickActionsItems: CarouselItem[] = [`;

const replacementStr = `  const quickActionsItems: CarouselItem[] = [
    {
      id: 'mood',
      icon: <SmilePlus className="w-5 h-5" />,
      title: 'Моё настроение',
      onClick: () => setShowMoodPicker(true),
      color: 'var(--accent)'
    },`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/DashboardView.tsx', content);
console.log("Replaced");
