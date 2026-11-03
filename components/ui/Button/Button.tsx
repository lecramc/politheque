import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Icon } from '@/components/ui/Icon';

import { ThemedButton } from './ThemedButton';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'brand';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  color?: string;
  // Leading icon next to the label — an Ionicons name. iOS resolves it to the
  // native SF Symbol via icon-symbol-map; the RN path renders the Ionicons.
  icon?: string;
  // À activer quand le bouton vit sur une surface NATIVE (BottomSheet) : il suit
  // alors le thème système (systemColors) au lieu du toggle app, comme la sheet.
  onGlass?: boolean;
};

const heightBySize: Record<ButtonSize, 'small' | 'medium' | 'large'> = {
  small: 'small',
  medium: 'medium',
  large: 'large',
};

/**
 * Button — opinionated, semantic action trigger.
 *
 * Use for labeled primary actions: form submit, confirm, delete, sign in.
 * On iOS 26 renders a native SwiftUI button (Liquid Glass, tint, role).
 *
 * Do NOT use when:
 * - The pressable area wraps arbitrary layout (card, row, icon) — use Pressable.
 *
 * For a leading icon, pass `icon` (an Ionicons name) — iOS maps it to the native
 * SF Symbol — not icon children, which the native SwiftText drops.
 *
 * Rule of thumb: if you would write <button type="submit"> on the web → Button.
 */
export default function Button({
  onPress,
  children,
  disabled = false,
  loading = false,
  variant = 'secondary',
  size = 'large',
  fullWidth = true,
  color,
  icon,
  onGlass = false,
}: ButtonProps) {
  const { colors, effects, fonts, systemColors } = useTheme();
  // Sur une surface native (sheet) → palette système ; sinon toggle app.
  const palette = onGlass ? systemColors : colors;
  const isDisabled = disabled || loading;
  const sizeProps = {
    width: fullWidth ? ('full' as const) : ('fit' as const),
    height: heightBySize[size],
  };

  if (variant === 'brand') {
    if (isDisabled) {
      return (
        <ThemedButton
          variant="secondary"
          size={sizeProps}
          padding="none"
          disabled
          accessibilityRole="button"
          accessibilityState={{ disabled: true, busy: loading }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: !fullWidth ? effects.spacing.md : 0,
            backgroundColor: palette.surface.glass,
            borderColor: palette.surface.border.primary,
            opacity: 1,
            shadowOpacity: 0,
            elevation: 0,
          }}
        >
          {loading ? (
            <ActivityIndicator color={palette.text.disabled} />
          ) : (
            <Text
              style={{
                fontSize: effects.sizes.text.body,
                ...fonts.bold,
                color: palette.text.disabled,
                letterSpacing: -0.3,
              }}
            >
              {children}
            </Text>
          )}
        </ThemedButton>
      );
    }
    return (
      <ThemedButton
        variant="tint"
        onPress={onPress}
        size={sizeProps}
        padding="none"
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: effects.spacing.xs,
          paddingHorizontal: !fullWidth ? effects.spacing.md : 0,
          backgroundColor: 'transparent',
          overflow: 'hidden',
          borderWidth: 0,
          shadowColor: palette.shadow.color,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 30,
          shadowOpacity: 1,
        }}
      >
        <LinearGradient
          colors={colors.ctaGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            {icon ? <Icon name={icon} size="small" variant="onColor" /> : null}
            <Text
              style={{
                fontSize: effects.sizes.text.body,
                ...fonts.bold,
                color: palette.text.onColor,
                letterSpacing: -0.3,
              }}
            >
              {children}
            </Text>
          </>
        )}
      </ThemedButton>
    );
  }

  return (
    <ThemedButton
      variant={variant}
      onPress={onPress}
      size={sizeProps}
      padding="none"
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: effects.spacing.xs,
        paddingHorizontal: !fullWidth ? effects.spacing.md : 0,
        ...(color ? { backgroundColor: color } : null),
      }}
    >
      {loading ? (
        <ActivityIndicator color={color ? colors.text.onColor : undefined} />
      ) : (
        <>
          {icon ? <Icon name={icon} size="small" variant={color ? 'onColor' : 'primary'} /> : null}
          <Text style={color ? { color: colors.text.onColor } : undefined}>{children}</Text>
        </>
      )}
    </ThemedButton>
  );
}
