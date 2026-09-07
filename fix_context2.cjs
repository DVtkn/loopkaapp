const fs = require('fs');
const file = 'src/context/CoupleContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  const [isDateMode, setIsDateModeState] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = safeStorage.getItem("loop_date_mode");
      return saved === "true";
    }
    return false;
  });

  const setIsDateMode = (val: boolean) => {
    setIsDateModeState(val);
    safeStorage.setItem("loop_date_mode", val ? "true" : "false");
  };`;

const replacement = `  const [isDateMode, setIsDateModeState] = useState<boolean>(() => {
    return safeGetStorage('loop_date_mode', false);
  });

  const setIsDateMode = (val: boolean) => {
    setIsDateModeState(val);
    safeSetStorage('loop_date_mode', val);
  };`;

content = content.replace(target, replacement);

// Make sure `isDateMode` and `setIsDateMode` are exported
if (!content.includes('isDateMode,')) {
    const returnTarget = `        screen,
        setScreen,`;
    const returnReplacement = `        screen,
        setScreen,
        isDateMode,
        setIsDateMode,`;
    content = content.replace(returnTarget, returnReplacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Context fixed');
