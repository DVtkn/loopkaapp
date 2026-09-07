const fs = require('fs');
const file = 'src/components/UserProfileCabinet.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { Settings, Moon }')) {
    content = content.replace(`import {
  User,
  Copy,
  CheckCircle2,
  Heart,
  Users,
  Sparkles,
  Lock,
  LogOut,
  AlertTriangle,
  KeyRound,
  Edit2,
  Check,
  Calendar,
  ArrowRight
} from 'lucide-react';`, `import {
  User,
  Copy,
  CheckCircle2,
  Heart,
  Users,
  Sparkles,
  Lock,
  LogOut,
  AlertTriangle,
  KeyRound,
  Edit2,
  Check,
  Calendar,
  ArrowRight,
  Settings,
  Moon
} from 'lucide-react';`);
}

// Ensure `isDateMode, setIsDateMode` are in useCouple destructuring
if (!content.includes('isDateMode,')) {
    const target = `    incomingRequests,
    outgoingRequests,
    changePassword,
  } = useCouple();`;
    const replacement = `    incomingRequests,
    outgoingRequests,
    changePassword,
    isDateMode,
    setIsDateMode,
  } = useCouple();`;
    content = content.replace(target, replacement);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Cabinet fixed');
