const fs = require('fs');
const file = 'src/context/CoupleContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`  const [screen, setScreenState] = useState<AppScreen>(() => {
        isDateMode,
        setIsDateMode,`, `  const [screen, setScreenState] = useState<AppScreen>(() => {`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Context');
