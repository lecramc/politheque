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
import { PressableHoverContext } from '@/components/ui/Pressable/hover-context';
import { hoverKind } from '@/src/core/web/hover-kind';

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
  /** Grandes surfaces (cartes, tuiles) : enfoncement plus discret, anneau de focus intérieur. */
  large?: boolean;
  /**
   * Anneau de focus clavier (web). `inside` : tracé à l'intérieur de la boîte, pour les zones
   * pleine largeur dans un conteneur `overflow: hidden` (accordéon, onglets, lignes de liste)
   * où un anneau extérieur serait rogné. Défaut : `inside` si `large`, sinon `outside`.
   */
  ring?: 'outside' | 'inside';
  /** Retour haptique léger à l'appui (natif uniquement). */
  haptic?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
};

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
  ring: ringPlacement,
  haptic = false,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  ...rest
}: Props) => {
  const { colors, effects } = useTheme();
  const { reduce } = useMotion();
  const keyboard = useKeyboardModality();
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const base = StyleSheet.flatten(style) ?? {};
  const interactive = !disabled;

  // L'élément courant (onglet actif, page en cours) ne réagit pas au survol : on sait où l'on est.
  const ariaCurrent = (rest as { 'aria-current'?: unknown })['aria-current'];
  const current =
    (ariaCurrent !== undefined && ariaCurrent !== false) ||
    accessibilityState?.selected === true ||
    (rest as { 'aria-selected'?: unknown })['aria-selected'] === true;

  let hover: ViewStyle | undefined;
  let textHover = false;
  if (isWeb && hovered && interactive && !current) {
    if (hoverStyle) {
      hover = StyleSheet.flatten(hoverStyle);
    } else {
      const kind = hoverKind(base, effects.spacing.sm);
      if (kind === 'border') hover = { borderColor: colors.tintBorder };
      else if (kind === 'surface')
        hover = {
          backgroundColor: colors.surface.hover,
          borderRadius: base.borderRadius ?? effects.borderRadius.xs,
        };
      else if (kind === 'filled') hover = { opacity: 0.92 };
      else {
        // Sans marge latérale, un fond serait collé aux lettres : soulignement et opacité.
        hover = { opacity: 0.8 };
        textHover = true;
      }
    }
  }

  const active = pressed && interactive;
  const scale = active && !reduce ? (large ? press.scaleLarge : press.scale) : 1;
  const ring = isWeb && focused && keyboard;
  const ringInside = (ringPlacement ?? (large ? 'inside' : 'outside')) === 'inside';

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
          cursor: disabled || current ? ('auto' as const) : ('pointer' as const),
          outlineStyle: 'solid' as const,
          outlineWidth: ring ? 2 : 0,
          outlineColor: ring ? colors.tint : 'transparent',
          outlineOffset: ringInside ? -2 : 2,
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
      <PressableHoverContext.Provider value={textHover}>{children}</PressableHoverContext.Provider>
    </AnimatedPressable>
  );
};
