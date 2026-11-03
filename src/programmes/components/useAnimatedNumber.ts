/* global requestAnimationFrame, cancelAnimationFrame */
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/** Fait tendre une valeur vers sa cible (ease-out). Immédiat si « réduire les animations ». */
export const useAnimatedNumber = (target: number, duration = 500, delay = 0) => {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);

  useEffect(() => {
    if (reduceMotion) {
      setValue(target);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    const from = 0;
    const tick = (now: number) => {
      if (start === null) start = now + delay;
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(from + (target - from) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, delay, reduceMotion]);

  return value;
};
