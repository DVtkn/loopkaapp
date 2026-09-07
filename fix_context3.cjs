const fs = require('fs');
const file = 'src/context/CoupleContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const [screen, setScreenState] = useState<AppScreen>(() => {
  const [isDateMode, setIsDateModeState] = useState<boolean>(() => {
    return safeGetStorage('loop_date_mode', false);
  });

  const setIsDateMode = (val: boolean) => {
    setIsDateModeState(val);
    safeSetStorage('loop_date_mode', val);
  };
    return safeGetStorage('together_screen', 'app');
  });`;

const replacement = `  const [screen, setScreenState] = useState<AppScreen>(() => {
    return safeGetStorage('together_screen', 'app');
  });

  const [isDateMode, setIsDateModeState] = useState<boolean>(() => {
    return safeGetStorage('loop_date_mode', false);
  });

  const setIsDateMode = (val: boolean) => {
    setIsDateModeState(val);
    safeSetStorage('loop_date_mode', val);
  };`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Context body');
