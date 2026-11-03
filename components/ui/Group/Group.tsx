import React, { ReactNode } from 'react';
import { StyleSheet, View as RNView, ViewStyle } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { View } from '@/components/Themed';

type GroupVariant = 'primary' | 'glass';

type GroupProps = {
  children: ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: GroupVariant;
};

export default function Group({
  children,
  style,
  disabled = false,
  variant = 'primary',
}: GroupProps) {
  const { colors, effects, systemColors } = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);

  const isGlass = variant === 'glass';
  const glassColors = isGlass ? systemColors : colors;

  const containerStyle = [
    styles.container,
    {
      borderRadius: effects.borderRadius.input,
      borderColor: isGlass ? glassColors.surface.border.transparent : colors.surface.border.primary,
      backgroundColor: isGlass ? glassColors.surface.transparent : colors.surface.secondary,
      opacity: disabled ? effects.opacity.disabled : 1,
    },
    style,
  ];

  const separatorStyle = [
    styles.separator,
    { backgroundColor: isGlass ? glassColors.surface.border.glass : colors.surface.border.primary },
  ];

  // For the glass variant, use RNView to avoid the opaque background
  // injected by the themed View from Themed.tsx.
  const ContainerView = isGlass ? RNView : View;

  return (
    <ContainerView style={containerStyle}>
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < items.length - 1 && <View style={separatorStyle} />}
        </React.Fragment>
      ))}
    </ContainerView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 14,
  },
});
