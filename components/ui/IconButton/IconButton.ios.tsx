import { Button, Host } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  clipShape,
  controlSize,
  disabled as disabledModifier,
  frame,
  labelStyle,
} from '@expo/ui/swift-ui/modifiers';
import React from 'react';

import { useTheme } from '@/components/ThemeContext';
import { Icon } from '@/components/ui';
import { mapVariantToSwiftUIButtonStyle } from '@/components/ui/swiftui-button-utils';

import type { IconButtonProps, IconButtonSize } from './IconButton';

function mapSizeToControlSize(size: IconButtonSize): 'mini' | 'small' | 'regular' | 'large' {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
      return 'regular';
    case 'large':
    case 'xlarge':
      return 'large';
  }
}

function mapSizeToFrame(
  size: IconButtonSize,
  control: { small: number; medium: number; large: number }
) {
  switch (size) {
    case 'small':
      return control.small;
    case 'medium':
      return control.medium;
    case 'large':
    case 'xlarge':
      return control.large;
  }
}

export default function IconButtonIOS({
  name,
  systemImage,
  onPress,
  size = 'medium',
  variant = 'plain',
  disabled = false,
  style: _style,
  iconVariant: _iconVariant = 'primary',
}: IconButtonProps) {
  const { effects, theme } = useTheme();

  // Native SF Symbol button — cleanest approach, no Ionicons wrapper needed
  if (systemImage) {
    return (
      <Host matchContents colorScheme={theme}>
        <Button
          label={name}
          systemImage={systemImage as any}
          onPress={onPress}
          modifiers={[
            buttonStyle(mapVariantToSwiftUIButtonStyle(variant)),
            controlSize(mapSizeToControlSize(size)),
            labelStyle('iconOnly'),
            disabledModifier(disabled),
          ]}
        />
      </Host>
    );
  }

  // Fallback: Ionicons icon wrapped in a SwiftUI button
  const buttonPx = mapSizeToFrame(size, effects.sizes.button);
  return (
    <Host matchContents colorScheme={theme}>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle(mapVariantToSwiftUIButtonStyle(variant)),
          frame({ width: buttonPx, height: buttonPx }),
          clipShape('circle'),
          disabledModifier(disabled),
        ]}
      >
        <Icon name={name} size={size} style={{ paddingTop: 6, paddingLeft: 1 }} />
      </Button>
    </Host>
  );
}
