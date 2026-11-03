import React from 'react';
import { View as DefaultView, ViewStyle } from 'react-native';

import { useTheme } from '../ThemeContext';

export interface ThemedContainerProps {
  variant?: 'primary' | 'secondary' | 'glass';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ThemedContainer({
  variant = 'primary',
  style,
  children,
  ...props
}: ThemedContainerProps) {
  const { colors, effects } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: effects.borderRadius.large,
      borderWidth: 0.5,
      overflow: 'hidden',
      shadowColor: colors.shadow.color,
      ...effects.shadow.sm,
    };

    const variantStyle: ViewStyle = (() => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: colors.background.primary,
            borderColor: colors.surface.border.glass,
          };
        case 'secondary':
          return {
            backgroundColor: colors.background.secondary,
            borderColor: colors.surface.border.glass,
          };
        case 'glass':
          return {
            backgroundColor: colors.surface.glass,
            borderColor: colors.surface.border.glass,
            shadowOpacity: 0.08,
          };
        default:
          return {};
      }
    })();

    return {
      ...baseStyle,
      ...variantStyle,
    };
  };

  return (
    <DefaultView style={[getContainerStyle(), style]} {...props}>
      {children}
    </DefaultView>
  );
}
