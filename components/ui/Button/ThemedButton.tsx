import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { useTheme } from '../../ThemeContext';

export type VariantType = 'tint' | 'primary' | 'secondary' | 'tertiary' | 'danger';

type SizeHeight = NonNullable<ThemedTouchableOpacityProps['size']>['height'];
type SizeWidth = NonNullable<ThemedTouchableOpacityProps['size']>['width'];

type SizeHeightKey = NonNullable<SizeHeight>;
type SizeWidthKey = NonNullable<SizeWidth>;

export interface ThemedTouchableOpacityProps extends TouchableOpacityProps {
  variant?: VariantType;
  size?: {
    height?: 'small' | 'medium' | 'large' | 'full' | 'fit';
    width?: 'small' | 'medium' | 'large' | 'full' | 'fit';
  };
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export function ThemedButton({
  variant = 'primary',
  size = { height: 'medium', width: 'medium' },
  style,
  children,
  onPress,
  disabled = false,
  padding = 'none',
  ...props
}: ThemedTouchableOpacityProps) {
  const { colors, effects } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: effects.borderRadius.round,
      borderWidth: 0.5,
      shadowColor: colors.shadow.color,
      ...effects.shadow.sm,
      elevation: 2,
      opacity: disabled ? effects.opacity.disabled : 1,
    };

    const paddingStyle: ViewStyle = {
      padding: effects.spacing[padding],
    };

    const heightMap: Record<SizeHeightKey, number | undefined> = {
      small: effects.sizes.button.small,
      medium: effects.sizes.button.medium,
      large: effects.sizes.button.large,
      full: undefined,
      fit: undefined,
    };

    const widthMap: Record<SizeWidthKey, number | string | undefined> = {
      small: 120,
      medium: 180,
      large: 240,
      full: '100%',
      fit: undefined,
    };

    const sizeStyle: ViewStyle = {
      ...(size?.height ? { height: heightMap[size.height as SizeHeightKey] } : null),
      ...(size?.width ? { width: widthMap[size.width as SizeWidthKey] as any } : null),
    };

    const variantStyle: ViewStyle = (() => {
      switch (variant) {
        case 'tint':
          return {
            backgroundColor: colors.tint,
            borderColor: colors.tint,
          };
        case 'primary':
          return {
            backgroundColor: colors.surface.primary,
            borderColor: colors.surface.border.primary,
          };
        case 'secondary':
          return {
            backgroundColor: colors.surface.secondary,
            borderColor: colors.surface.border.secondary,
          };
        case 'tertiary':
          return {
            backgroundColor: colors.surface.tertiary,
            borderColor: colors.surface.border.tertiary,
          };
        case 'danger':
          return { backgroundColor: colors.accent.error, borderColor: colors.accent.error };
        default:
          return {};
      }
    })();

    return {
      ...sizeStyle,
      ...paddingStyle,
      ...baseStyle,
      ...variantStyle,
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
