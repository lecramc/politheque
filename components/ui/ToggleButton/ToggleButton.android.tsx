import { Host, Switch, SwitchColors } from '@expo/ui/jetpack-compose';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';

import type { ToggleButtonProps, ToggleVariant } from './ToggleButton';

function mapVariantColors(variant: ToggleVariant, colors: any): SwitchColors {
  const checkedTrack = variant === 'secondary' ? colors.surface.primary : colors.tint;
  return {
    checkedTrackColor: checkedTrack,
    checkedThumbColor: colors.background.primary,
    uncheckedTrackColor: variant === 'plain' ? 'transparent' : colors.surface.secondary,
    uncheckedThumbColor: colors.background.primary,
    uncheckedBorderColor: colors.surface.border?.secondary,
  };
}

export default function ToggleButtonAndroid({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  label,
  size: _size = 'medium',
  variant = 'primary',
  style,
  testID,
}: ToggleButtonProps) {
  const { colors, theme } = useTheme();
  const isControlled = typeof value === 'boolean';
  const [internal, setInternal] = useState<boolean>(defaultValue);
  const checked = isControlled ? (value as boolean) : internal;

  useEffect(() => {
    if (!isControlled) return;
    setInternal(value as boolean);
  }, [isControlled, value]);

  const onChange = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <View
      style={[styles.root, style]}
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled }}
      testID={testID}
    >
      <Host matchContents colorScheme={theme}>
        <Switch
          value={checked}
          onCheckedChange={onChange}
          enabled={!disabled}
          colors={mapVariantColors(variant, colors)}
        />
      </Host>
      {label ? <Text style={[styles.label, { color: colors.text.primary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
});
