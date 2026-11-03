import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/components/ThemeContext';
import { View } from '@/components/Themed';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';

// Single source of truth for Picker types lives in ./index.
import type { PickerProps } from './index';

const CONTAINER_PADDING = 2;
const SPRING_CONFIG = Platform.select({
  android: { stiffness: 350, damping: 75 },
  default: { stiffness: 500, damping: 80 },
});

export default function Picker({ value, options, onChange, disabled = false, style }: PickerProps) {
  const { colors, effects, fonts } = useTheme();

  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth =
    containerWidth > 0 ? (containerWidth - CONTAINER_PADDING * 3) / options.length : 0;

  const selectedIndex = options.findIndex((o) => o.value === value);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (segmentWidth === 0) return;

    translateX.value = withSpring(selectedIndex * segmentWidth, SPRING_CONFIG);
  }, [selectedIndex, segmentWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
      style={[
        {
          flexDirection: 'row',
          backgroundColor: colors.surface.tertiary,
          borderColor: colors.surface.border.primary,
          borderWidth: 1,
          borderRadius: effects.borderRadius.round,
          padding: CONTAINER_PADDING,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {/* Indicator */}
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: CONTAINER_PADDING,
              left: CONTAINER_PADDING,
              width: segmentWidth,
              height: '100%',
              backgroundColor: colors.surface.primary,
              borderRadius: effects.borderRadius.round,
            },
            indicatorStyle,
          ]}
        />
      )}

      {options.map((opt) => {
        const selected = opt.value === value;

        return (
          <Pressable
            key={opt.value}
            disabled={disabled}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              paddingVertical: effects.spacing.xs,
            }}
          >
            <Text
              style={[
                fonts.medium,
                {
                  fontSize: effects.sizes.text.label,
                  color: selected ? colors.text.strong : colors.text.secondary,
                },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
