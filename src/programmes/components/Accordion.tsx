import React, { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useHydrated } from '@/src/core/hooks/useHydrated';

/** Bloc repliable : titre + phrase-clé fermé, détail ouvert. */
export function Accordion({
  title,
  subtitle,
  leading,
  trailing,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  children,
  flat = false,
  last = false,
  headingLevel = 3,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onToggle?: (open: boolean) => void;
  children: ReactNode;
  /** Sans carte, pour une liste dans un conteneur existant. */
  flat?: boolean;
  /** Variante plate : dernière ligne du conteneur, sans bordure basse. */
  last?: boolean;
  /** Niveau de titre de l'en-tête dans la structure de la page (h2 à h4). */
  headingLevel?: 2 | 3 | 4;
}) {
  const { colors, effects, fonts } = useTheme();
  const { timing } = useMotion();
  // L'identifiant généré diffère entre le HTML statique et le premier rendu client (frontière de
  // Suspense d'Expo Router) : il n'est posé qu'après l'hydratation.
  const generatedId = useId();
  const bodyId = useHydrated() ? generatedId : undefined;
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? localOpen;
  const toggle = () => {
    setLocalOpen(!open);
    onToggle?.(!open);
  };

  // Hors animation, le contenu ouvert est dans le flux (hauteur naturelle). Fermé, il reste
  // monté sur le web, masqué par display:none : présent dans le HTML (indexable), mais ni
  // visible, ni focalisable, ni lu par un lecteur d'écran.
  const [phase, setPhase] = useState<'open' | 'closed' | 'moving'>(open ? 'open' : 'closed');
  const progress = useSharedValue(open ? 1 : 0);
  const contentHeight = useSharedValue(0);
  const previous = useRef(open);

  useEffect(() => {
    if (previous.current === open) return;
    previous.current = open;
    setPhase('moving');
    const target = open ? 1 : 0;
    const config = open ? timing(duration.open, 'out') : timing(duration.close, 'in');
    progress.value = withTiming(target, config, (done) => {
      if (done) runOnJS(setPhase)(target === 1 ? 'open' : 'closed');
    });
  }, [open, progress, timing]);

  const onContentLayout = (e: LayoutChangeEvent) => {
    contentHeight.value = e.nativeEvent.layout.height;
  };

  const bodyPadding = {
    paddingHorizontal: flat ? 0 : effects.spacing.md,
    paddingBottom: effects.spacing.md,
    gap: effects.spacing.sm,
  };

  const bodyStyle = useAnimatedStyle(() => ({
    height: contentHeight.value * progress.value,
    opacity: progress.value,
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));

  return (
    <View
      style={
        flat
          ? { borderBottomWidth: last ? 0 : 1, borderColor: colors.surface.border.primary }
          : {
              backgroundColor: colors.surface.primary,
              borderWidth: 1,
              borderColor: colors.surface.border.primary,
              borderRadius: effects.borderRadius.small,
              overflow: 'hidden',
            }
      }
    >
      <View role="heading" aria-level={headingLevel}>
        <Pressable
          large
          onPress={toggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          aria-expanded={open}
          aria-controls={bodyId}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            minHeight: 56,
            paddingHorizontal: flat ? 0 : effects.spacing.md,
            paddingVertical: 12,
          }}
        >
          {leading}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ ...fonts.bold, fontSize: 16, color: colors.text.primary }}>{title}</Text>
            {subtitle && !open ? (
              <Text style={{ fontSize: 14, color: colors.text.secondary }} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {trailing}
          <Animated.View style={chevronStyle}>
            <Icon name="chevron-down" variant="onGlass" size="small" />
          </Animated.View>
        </Pressable>
      </View>
      {phase === 'open' ? (
        <View id={bodyId} onLayout={onContentLayout} style={bodyPadding}>
          {children}
        </View>
      ) : null}
      {phase === 'closed' && Platform.OS === 'web' ? (
        <View id={bodyId} aria-hidden style={[bodyPadding, { display: 'none' }]}>
          {children}
        </View>
      ) : null}
      {phase === 'moving' ? (
        <Animated.View style={[{ overflow: 'hidden' }, bodyStyle]}>
          <View
            onLayout={onContentLayout}
            style={[bodyPadding, { position: 'absolute', top: 0, left: 0, right: 0 }]}
          >
            {children}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
