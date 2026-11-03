import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon } from '@/components/ui';

export type IconButtonVariant = 'primary' | 'secondary' | 'plain';
export type IconButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export type IconButtonProps = {
  name: string;
  /** SF Symbol name — used on iOS for a fully native button. Falls back to `name` (Ionicons) if not provided. */
  systemImage?: string;
  onPress?: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  iconVariant?: 'primary' | 'secondary' | 'onGlass';
};

export default function IconButton({
  name,
  onPress,
  size = 'medium',
  variant = 'plain',
  disabled = false,
  style,
  iconVariant = 'primary',
}: IconButtonProps) {
  const { colors, effects } = useTheme();
  const sizeKey = size === 'xlarge' ? 'large' : size;
  const px = effects.sizes.button[sizeKey];

  const variantStyle: ViewStyle =
    variant === 'primary'
      ? {
          backgroundColor: colors.surface.primary,
          borderColor: colors.surface.border?.primary,
          borderWidth: 1,
        }
      : variant === 'secondary'
        ? {
            backgroundColor: colors.surface.secondary,
            borderColor: colors.surface.border?.secondary,
            borderWidth: 1,
          }
        : {};

  return (
    <TouchableOpacity
      style={[
        {
          width: px,
          height: px,
          borderRadius: effects.borderRadius.round,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        variantStyle,
        style,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <Icon name={name} size={size} variant={iconVariant} />
    </TouchableOpacity>
  );
}
