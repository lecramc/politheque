import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  AccessibilityRole,
  AccessibilityState,
  GestureResponderEvent,
  Platform,
  PressableProps,
  Pressable as RNPressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { cssEasing, duration, press, useKeyboardModality, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);
const isWeb = Platform.OS === 'web';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  /** Objet de style (pas de tableau : sous Link asChild, le web plante). */
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  /** Style de survol (web). Par défaut : bordure ou fond qui s'éclaircit. */
  hoverStyle?: StyleProp<ViewStyle>;
  /** Grandes surfaces (cartes, tuiles) : enfoncement plus discret. */
  large?: boolean;
  /** Retour haptique léger à l'appui (natif uniquement). */
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

const isVisible = (color: unknown) =>
  typeof color === 'string' && color !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(color);

/**
 * Pressable — zone tappable sans style propre, avec un retour de mouvement commun :
 * appui (léger enfoncement + opacité), survol web (bordure ou fond qui s'éclaircit,
 * curseur pointer), anneau de focus clavier. Tout est en transitions CSS reanimated
 * (thread UI sur natif, CSS natif sur le web), désactivées en mouvement réduit.
 *
 * Transfert intégral des props (href, role…) : sous `<Link asChild>`, le rendu web
 * reste un vrai `<a href>`. Passer un `style` objet, jamais un tableau.
 *
 * Do NOT use for labeled CTAs — use Button instead.
 */
export const Pressable = ({
  children,
  onPress,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  disabled,
  style,
  pressedStyle,
  hoverStyle,
  large = false,
  haptic = false,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  ...rest
}: Props) => {
  const { colors } = useTheme();
  const { reduce } = useMotion();
  const keyboard = useKeyboardModality();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const base = StyleSheet.flatten(style) ?? {};
  const interactive = !disabled;

  let hover: ViewStyle | undefined;
  if (isWeb && hovered && interactive) {
    if (hoverStyle) hover = StyleSheet.flatten(hoverStyle);
    else if ((base.borderWidth ?? 0) > 0) hover = { borderColor: colors.tintBorder };
    else if (!isVisible(base.backgroundColor)) hover = { backgroundColor: colors.surface.hover };
    else hover = { opacity: 0.92 };
  }

  const active = pressed && interactive;
  const scale = active && !reduce ? (large ? press.scaleLarge : press.scale) : 1;
  const ring = isWeb && focused && keyboard;

  const animated = {
    ...base,
    ...hover,
    ...(active
      ? pressedStyle
        ? StyleSheet.flatten(pressedStyle)
        : { opacity: press.opacity }
      : null),
    ...(disabled ? { opacity: 0.5 } : null),
    transform: [...((base.transform as never[]) ?? []), { scale }],
    ...(isWeb
      ? {
          cursor: disabled ? ('auto' as const) : ('pointer' as const),
          outlineStyle: 'solid' as const,
          outlineWidth: ring ? 2 : 0,
          outlineColor: ring ? colors.tint : 'transparent',
          outlineOffset: 2,
        }
      : null),
    transitionProperty: ['transform', 'opacity', 'backgroundColor', 'borderColor'] as (
      | 'transform'
      | 'opacity'
      | 'backgroundColor'
      | 'borderColor'
    )[],
    transitionDuration: reduce ? 0 : active ? duration.press : duration.release,
    transitionTimingFunction: active ? cssEasing.out : cssEasing.inOut,
  };

  return (
    <AnimatedPressable
      {...rest}
      onPress={onPress}
      onPressIn={(e) => {
        setPressed(true);
        if (haptic && !isWeb) Haptics.selectionAsync().catch(() => undefined);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      onHoverIn={(e) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={animated}
    >
      {children}
    </AnimatedPressable>
  );
};
