import { Host, Picker as SwiftPicker, Text as SwiftText } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';
import React from 'react';

import { useTheme } from '@/components/ThemeContext';

import type { PickerProps } from './index';

export default function PickerIOS({
  value,
  options,
  onChange,
  variant = 'segmented',
  style,
}: PickerProps) {
  const { theme } = useTheme();

  return (
    <Host matchContents style={style} colorScheme={theme}>
      <SwiftPicker
        selection={value}
        onSelectionChange={(selected) => {
          onChange(selected as string);
        }}
        modifiers={[pickerStyle(variant)]}
      >
        {options.map((opt) => (
          <SwiftText key={opt.value} modifiers={[tag(opt.value)]}>
            {opt.label}
          </SwiftText>
        ))}
      </SwiftPicker>
    </Host>
  );
}
