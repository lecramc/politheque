import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { View } from '@/components/Themed';
import { Text } from '@/components/Themed';

export type ToggleSize = 'small' | 'medium' | 'large';
export type ToggleVariant = 'primary' | 'secondary' | 'plain';

export type ToggleButtonProps = {
  value?: boolean;
  defaultValue?: boolean;
  onValueChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: ToggleSize;
  variant?: ToggleVariant;
  style?: ViewStyle;
  testID?: string;
};

export default function ToggleButton({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  label,
  size = 'medium',
  variant = 'primary',
  style,
  testID,
}: ToggleButtonProps) {
  const isControlled = typeof value === 'boolean';
  const [internal, setInternal] = useState<boolean>(defaultValue);
  const checked = isControlled ? (value as boolean) : internal;

  const { colors } = useTheme();

  const dims = useMemo(() => {
    switch (size) {
      case 'small':
        return { trackH: 22, trackW: 40, knob: 18, pad: 2 };
      case 'large':
        return { trackH: 32, trackW: 56, knob: 28, pad: 2 };
      case 'medium':
      default:
        return { trackH: 28, trackW: 50, knob: 24, pad: 2 };
    }
  }, [size]);

  const palette = useMemo(() => {
    switch (variant) {
      case 'primary':
        return {
          on: colors.tint,
          off: colors.surface.secondary,
          border: colors.surface.border?.secondary,
          knob: colors.background.primary,
        };
      case 'secondary':
        return {
          on: colors.surface.primary,
          off: colors.surface.secondary,
          border: colors.surface.border?.primary,
          knob: colors.background.primary,
        };
      case 'plain':
      default:
        return {
          on: colors.tint,
          off: 'transparent',
          border: colors.surface.border?.primary,
          knob: colors.background.primary,
        };
    }
  }, [variant, colors]);

  const toggle = () => {
    if (disabled) return;
    const next = !checked;
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const trackStyle: ViewStyle = {
    width: dims.trackW,
    height: dims.trackH,
    borderRadius: dims.trackH / 2,
    backgroundColor: checked ? palette.on : palette.off,
    borderWidth: variant === 'plain' ? 1 : 1,
    borderColor: palette.border,
    opacity: disabled ? 0.6 : 1,
  };

  const knobStyle: ViewStyle = {
    width: dims.knob,
    height: dims.knob,
    borderRadius: dims.knob / 2,
    backgroundColor: palette.knob,
    transform: [
      {
        translateX: checked ? dims.trackW - dims.knob - dims.pad : dims.pad,
      },
    ],
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={disabled}
      style={({ pressed }) => [styles.root, style, { opacity: pressed && !disabled ? 0.9 : 1 }]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      testID={testID}
    >
      <View style={[styles.track, trackStyle]}>
        <View style={[styles.knob, knobStyle]} />
      </View>
      {label ? <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    justifyContent: 'center',
    position: 'relative',
  },
  knob: {
    position: 'absolute',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
});
