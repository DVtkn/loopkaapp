const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace("import {", "import { Settings, Moon,");

// Add destructuring
content = content.replace("changePassword,", "changePassword, isDateMode, setIsDateMode,");

fs.writeFileSync(file, content, 'utf8');
console.log('Force fixed cabinet');
