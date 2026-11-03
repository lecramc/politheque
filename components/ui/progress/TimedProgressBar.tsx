// Progress bar driven by an estimated duration.
// Use when there is no real progress percentage available (e.g. decryption, PIN validation).
// The bar animates from 0 to 100% over `duration` ms, independently of the actual operation.
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { View } from '@/components/Themed';

interface TimedProgressBarProps {
  duration?: number; // ms — total animation duration (default: 3000)
}

export default function TimedProgressBar({ duration = 3000 }: TimedProgressBarProps) {
  const { colors, effects } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
    return () => progressAnim.stopAnimation();
  }, []);

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.surface.tertiary, borderRadius: effects.borderRadius.small },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: colors.tint,
            borderRadius: effects.borderRadius.small,
            transform: [{ scaleX: progressAnim }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', height: 4, overflow: 'hidden' },
  fill: { height: '100%', width: '100%', transformOrigin: 'left' },
});
