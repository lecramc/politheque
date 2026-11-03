import React from 'react';
import {
  PressableProps,
  AccessibilityRole,
  AccessibilityState,
  Pressable as RNPressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

/**
 * Pressable — unstyled, composable touch target.
 *
 * Use when the pressable area wraps a layout you style yourself
 * (rows, cards, chips, camera controls, settings rows).
 * Provides opacity feedback on press (0.7) and disabled (0.5).
 *
 * Do NOT use for labeled CTAs — use Button instead.
 * Rule of thumb: if you are building the visual from scratch and just
 * need "make this tappable with press feedback", use Pressable.
 */
export const Pressable = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  style,
  pressedStyle,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  ...rest
}: Props) => {
  return (
    <RNPressable
      {...rest}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.5 : 1,
        },
        style,
        pressed && !disabled ? (pressedStyle ?? { opacity: 0.7 }) : null,
      ]}
    >
      {children}
    </RNPressable>
  );
};
