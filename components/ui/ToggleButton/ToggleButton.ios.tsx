import { Host, Toggle } from '@expo/ui/swift-ui';
import { tint, toggleStyle } from '@expo/ui/swift-ui/modifiers';
import React, { useEffect, useState } from 'react';

import { useTheme } from '@/components/ThemeContext';

import type { ToggleButtonProps, ToggleVariant } from './ToggleButton';

function mapVariantColor(variant: ToggleVariant, colors: any): string {
  switch (variant) {
    case 'primary':
      return colors.tint;
    case 'secondary':
      return colors.surface.primary;
    case 'plain':
    default:
      return colors.tint;
  }
}

export default function ToggleButtonIOS({
  value,
  defaultValue = false,
  onValueChange,
  disabled = false,
  label,
  size: _size = 'medium',
  variant = 'primary',
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
    <Host matchContents colorScheme={theme}>
      <Toggle
        isOn={checked}
        onIsOnChange={disabled ? undefined : onChange}
        label={label}
        testID={testID}
        modifiers={[toggleStyle('switch'), tint(mapVariantColor(variant, colors))]}
      />
    </Host>
  );
}
