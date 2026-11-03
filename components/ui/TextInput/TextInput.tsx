import React, { useRef, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon } from '@/components/Themed';

type SizeKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type TextInputProps2 = TextInputProps & {
  label?: string;
  error?: string;
  leftIcon?: string;
  // Slot trailing (symétrique de leftIcon) — ex. chip de type destinataire.
  rightAccessory?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'plain';
  disabled?: boolean;
  grouped?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  size?: SizeKey;
  spacingY?: 'none' | 'sm' | 'md';
  // Opt-in: highlight the focus border with the brand tint (e.g. OTP code field).
  focusAccent?: boolean;
};

const SIZE_PRESETS: Record<
  SizeKey,
  { minHeight: number; fontSize: number; paddingV: number; paddingH: number; iconSize: number }
> = {
  xs: { minHeight: 36, fontSize: 14, paddingV: 6, paddingH: 10, iconSize: 16 },
  sm: { minHeight: 42, fontSize: 15, paddingV: 8, paddingH: 12, iconSize: 18 },
  md: { minHeight: 46, fontSize: 16, paddingV: 10, paddingH: 14, iconSize: 20 },
  lg: { minHeight: 54, fontSize: 17, paddingV: 12, paddingH: 16, iconSize: 22 },
  xl: { minHeight: 62, fontSize: 18, paddingV: 14, paddingH: 18, iconSize: 24 },
};

function getVariantColors(colors: any, variant: 'primary' | 'secondary' | 'glass' | 'plain') {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.surface.primary,
        defaultBorderColor: colors.surface.border.primary,
      };
    case 'glass':
      return {
        backgroundColor: colors.surface.glass,
        defaultBorderColor: colors.surface.border.primary,
      };
    case 'plain':
      return { backgroundColor: 'transparent', defaultBorderColor: 'transparent' };
    case 'secondary':
    default:
      return {
        backgroundColor: colors.surface.secondary,
        defaultBorderColor: colors.surface.border.primary,
      };
  }
}

export const TextInput: React.FC<TextInputProps2> = ({
  label,
  error,
  leftIcon,
  rightAccessory,
  variant = 'secondary',
  disabled = false,
  grouped = false,
  style,
  containerStyle,
  accessibilityLabel,
  size = 'md',
  spacingY = 'none',
  focusAccent = false,
  ...props
}) => {
  const { colors, effects, systemColors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const preset = SIZE_PRESETS[size];
  const isPlain = variant === 'plain';
  // Le variant glass est destiné aux surfaces natives qui suivent le système
  // (BottomSheet) → ses couleurs viennent de systemColors, comme Group glass.
  const palette = variant === 'glass' ? systemColors : colors;
  const { backgroundColor, defaultBorderColor } = getVariantColors(palette, variant);

  const dynamicBorderColor = isFocused
    ? focusAccent
      ? colors.tint
      : palette.surface.border.secondary
    : error
      ? palette.accent.error
      : isPlain
        ? palette.surface.border.glass
        : defaultBorderColor;

  const commonContainerStyle: ViewStyle = {
    minHeight: preset.minHeight,
    paddingVertical: preset.paddingV,
    paddingHorizontal: preset.paddingH,
  };

  const groupedContainerStyle: ViewStyle = {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  };

  const plainContainerStyle: ViewStyle = {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: dynamicBorderColor,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  };

  const boxedContainerStyle: ViewStyle = {
    backgroundColor,
    borderWidth: focusAccent && isFocused ? 1.5 : StyleSheet.hairlineWidth,
    borderColor: dynamicBorderColor,
    borderRadius: effects.borderRadius.input,
    ...(isFocused
      ? { shadowColor: colors.shadow.color, ...effects.shadow.sm, elevation: 2 }
      : { shadowOpacity: 0, elevation: 0 }),
  };

  const spacingMap = { none: 0, sm: effects.spacing.sm, md: effects.spacing.md } as const;

  const containerStyles = [
    styles.container,
    commonContainerStyle,
    grouped ? groupedContainerStyle : isPlain ? plainContainerStyle : boxedContainerStyle,
    disabled && {
      opacity: effects.opacity.disabled,
      backgroundColor: isPlain || grouped ? 'transparent' : palette.surface.disabled,
    },
    containerStyle,
  ];

  return (
    <View
      style={[styles.wrapper, { marginVertical: spacingMap[spacingY] }]}
      pointerEvents="box-none"
    >
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color: palette.text.primary,
              fontSize: effects.sizes.text.label,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={containerStyles}
        pointerEvents="box-none"
        onStartShouldSetResponder={() => false}
      >
        {leftIcon ? (
          <Icon name={leftIcon} size={preset.iconSize as any} style={styles.leftIcon} />
        ) : null}

        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: disabled ? palette.text.disabled : palette.text.primary,
              fontSize: preset.fontSize,
            },
            style,
          ]}
          placeholderTextColor={palette.text.secondary}
          selectionColor={colors.tint}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          underlineColorAndroid="transparent"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled }}
          {...props}
        />

        {rightAccessory ?? null}
      </View>

      {error ? <Text style={[styles.error, { color: palette.accent.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 0,
  },
  input: { flex: 1, paddingVertical: 0, paddingHorizontal: 0 },
  label: { marginBottom: 6, fontWeight: '500', letterSpacing: 0.1 },
  leftIcon: { marginRight: 6 },
  error: { marginTop: 6, fontSize: 13, fontWeight: '400' },
});
