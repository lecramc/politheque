import React, { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { theme as baseTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useColorStyle } from '@/components/webTheme';
import { Only } from '@/src/core/components/Only';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { tv } from '@/src/core/web/tv';

const styles = StyleSheet.create({
  stanceCell: { alignItems: 'flex-start', flexShrink: 0 },
  // Titre « regular » : gras sous 768 px (cette classe), graisse normale ensuite (règle CSS
  // `title-regular`). Doit venir de StyleSheet pour que la feuille puisse la surcharger.
  titleBoldBelowMd: { ...baseTheme.fonts.bold },
  titleBold: { ...baseTheme.fonts.bold },
  title: { fontSize: 16 },
  titleRegularLine: { lineHeight: 23 },
  subtitle: { fontSize: 14 },
  card: {
    borderWidth: 1,
    borderRadius: baseTheme.effects.borderRadius.small,
    overflow: 'hidden',
  },
  flat: { borderBottomWidth: 1 },
  flatLast: { borderBottomWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingVertical: 12,
  },
  // Carte : l'anneau de focus intérieur suit le rayon de la carte (pas d'angles vifs).
  headerCard: {
    paddingHorizontal: baseTheme.effects.spacing.md,
    borderRadius: baseTheme.effects.borderRadius.small,
  },
  texts: { flex: 1, gap: baseTheme.effects.spacing.xxs },
  stanceBelow: { alignSelf: 'flex-start', marginTop: 6 },
  body: { paddingBottom: baseTheme.effects.spacing.md, gap: baseTheme.effects.spacing.sm },
  bodyCard: { paddingHorizontal: baseTheme.effects.spacing.md },
  hidden: { display: 'none' },
  moving: { overflow: 'hidden' },
  movingBody: { position: 'absolute', top: 0, left: 0, right: 0 },
});

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
  stance,
  titleWeight = 'bold',
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /**
   * Position du parti (badge `inline`) : sous le titre sous 768 px, cellule fixe de 152 px à droite
   * ensuite. Rendue ouverte comme fermée. Les autres usages gardent `trailing`.
   */
  stance?: ReactNode;
  /** `regular` pour les longues listes d'affirmations (30 titres en gras font une page lourde). */
  titleWeight?: 'regular' | 'bold';
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
  const c = useColorStyle();
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

  const bodyPadding = [styles.body, flat ? null : styles.bodyCard];

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
          ? [
              last ? styles.flatLast : styles.flat,
              c((p) => ({ borderColor: p.surface.border.primary })),
            ]
          : [
              styles.card,
              c((p) => ({
                backgroundColor: p.surface.primary,
                borderColor: p.surface.border.primary,
              })),
            ]
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
          style={[styles.header, flat ? null : styles.headerCard]}
        >
          {leading}
          <View style={styles.texts}>
            <Text
              {...(titleWeight === 'bold' ? {} : tv('title-regular'))}
              style={[
                titleWeight === 'bold' ? styles.titleBold : styles.titleBoldBelowMd,
                styles.title,
                titleWeight === 'bold' ? null : styles.titleRegularLine,
                c((p) => ({ color: p.text.primary })),
              ]}
            >
              {title}
            </Text>
            {subtitle && !open ? (
              // Jamais tronqué : une liste de partis doit traiter chacun de la même façon.
              <Text style={[styles.subtitle, c((p) => ({ color: p.text.secondary }))]}>
                {subtitle}
              </Text>
            ) : null}
            {/* Sous 768 px : la position sous l'affirmation, alignée sur son début. */}
            {stance ? (
              <Only below="md" style={styles.stanceBelow}>
                {stance}
              </Only>
            ) : null}
          </View>
          {/* À partir de 768 px : cellule fixe à droite, ouverte comme fermée. */}
          {stance && Platform.OS === 'web' ? (
            <View {...tv('only-from-md', 'stance-cell')} style={styles.stanceCell}>
              {stance}
            </View>
          ) : null}
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
        <View id={bodyId} aria-hidden style={[bodyPadding, styles.hidden]}>
          {children}
        </View>
      ) : null}
      {phase === 'moving' ? (
        <Animated.View style={[styles.moving, bodyStyle]}>
          <View onLayout={onContentLayout} style={[bodyPadding, styles.movingBody]}>
            {children}
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
