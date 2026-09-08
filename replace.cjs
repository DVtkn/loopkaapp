const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const targetStr = `          <StatTile 
            icon={<MoodBadge
              mood={currentUser?.currentMood?.emoji || currentPartner.currentMood?.emoji || 'calm'}
              showLabel={false}
              size="md"
            />}
            value={currentUser?.currentMood?.label || currentPartner.currentMood?.label || 'Спокойствие'}
            label="Моё настроение"
            color="var(--accent)"
            onClick={() => setShowMoodPicker(true)}
          />`;

const replacementStr = `          <StatTile 
            icon={<MoodBadge
              mood={currentUser?.currentMood?.emoji || currentPartner.currentMood?.emoji || 'calm'}
              showLabel={false}
              size="md"
            />}
            value={currentUser?.currentMood?.label || currentPartner.currentMood?.label || 'Спокойствие'}
            label="Настроение"
            color="var(--accent)"
          />`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/DashboardView.tsx', content);
console.log("Replaced");
