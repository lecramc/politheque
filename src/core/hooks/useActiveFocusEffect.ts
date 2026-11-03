import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Fires `effect` in two situations:
 *   1. When the screen gains navigation focus (tab switch, back navigation, etc.)
 *      — same trigger as `useFocusEffect` from expo-router.
 *   2. When the app returns to the foreground (`AppState → 'active'`) while the
 *      screen is already focused — the case `useFocusEffect` misses entirely
 *      (the screen is mounted and focused but the callback was already called).
 *
 * Usage mirrors `useFocusEffect`: wrap the callback in `useCallback`.
 * Any platform-specific delay (e.g. waiting for Android window focus after a
 * foreground return) is the caller's responsibility.
 *
 * @example
 * useActiveFocusEffect(
 *   useCallback(() => {
 *     checkSomething();
 *   }, [checkSomething])
 * );
 *
 * @param effect - Stable callback (wrap in `useCallback`). Not expected to
 *   return a cleanup — if you need focus-only cleanup, use `useFocusEffect`
 *   directly alongside this hook.
 */
export function useActiveFocusEffect(effect: () => void): void {
  const isFocused = useRef(false);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      effect();
      return () => {
        isFocused.current = false;
      };
    }, [effect])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isFocused.current) {
        effect();
      }
    });
    return () => sub.remove();
  }, [effect]);
}
