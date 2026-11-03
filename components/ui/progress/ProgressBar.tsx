// Progress bar driven by a real percentage (0–100).
// Use when the operation exposes an actual progress callback (e.g. upload, compression).
// The bar animates toward the target value on each `progress` update.
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0–100
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  const { colors, effects } = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: colors.surface.secondary,
          borderRadius: effects.borderRadius.round,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: colors.tint,
            borderRadius: effects.borderRadius.round,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 6, width: '100%', overflow: 'hidden' },
  fill: { height: '100%' },
});
