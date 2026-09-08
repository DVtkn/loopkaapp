export type HapticType = number | number[] | 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export const triggerHaptic = (pattern: HapticType = 50) => {
  if (typeof window !== 'undefined' && navigator && navigator.vibrate) {
    try {
      if (typeof pattern === 'string') {
        switch (pattern) {
          case 'light':
          case 'selection':
            navigator.vibrate(15);
            break;
          case 'medium':
            navigator.vibrate(40);
            break;
          case 'heavy':
            navigator.vibrate(70);
            break;
          case 'success':
            navigator.vibrate([30, 50, 30]);
            break;
          case 'warning':
          case 'error':
            navigator.vibrate([50, 100, 50, 100, 50]);
            break;
        }
      } else {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn('Haptics not supported or blocked');
    }
  }
};

export const triggerHapticSuccess = () => {
  triggerHaptic([30, 50, 30]);
};

export const triggerHapticWarning = () => {
  triggerHaptic([50, 100, 50, 100, 50]);
};
