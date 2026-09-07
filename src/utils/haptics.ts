export const triggerHaptic = (pattern: number | number[] = 50) => {
  if (typeof window !== 'undefined' && navigator && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
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
