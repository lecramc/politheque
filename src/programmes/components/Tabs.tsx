import { Link } from 'expo-router';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';
import { tv } from '@/src/core/web/tv';

/** Largeur de référence du soulignement, mis à l'échelle (transform uniquement). */
const BASE = 100;

/** Onglets soulignés (bleu uni), défilants horizontalement sur petit écran. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  hrefOf,
  navLabel,
  vertical = false,
  wrap = false,
}: {
  /** `count` : compteur facultatif à droite en liste verticale (« 30 », « 9 thèmes »). */
  tabs: { id: T; label: string; longLabel?: string; count?: string }[];
  /** `longLabel` : libellé complet à partir de 768 px (le court reste en dessous). */
  value: T;
  onChange?: (id: T) => void;
  /** Onglets-liens (vraies pages, indexables) : chaque onglet est un <a href>. */
  hrefOf?: (id: T) => string;
  /** Nom de la navigation quand les onglets sont des liens. */
  navLabel?: string;
  /** Desktop : liste verticale (colonne de gauche), sans soulignement animé. */
  vertical?: boolean;
  /**
   * Onglets sur plusieurs lignes (3 + 2 sous 768 px) au lieu d'un défilement horizontal que rien
   * n'annonce : aucun onglet n'est hors de l'écran. L'onglet actif porte son propre trait.
   */
  wrap?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const { timing } = useMotion();
  const layouts = useRef<Partial<Record<T, { x: number; width: number }>>>({});
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  // Tant que les onglets ne sont pas mesurés (rendu statique), l'onglet actif porte son trait.
  const [measured, setMeasured] = useState(false);

  const slideTo = (layout: { x: number; width: number }) => {
    x.value = withTiming(layout.x, timing(duration.open, 'inOut'));
    width.value = withTiming(layout.width, timing(duration.open, 'inOut'));
  };

  useEffect(() => {
    const layout = layouts.current[value];
    if (layout) slideTo(layout);
  }, [value]);

  const onTabLayout = (id: T) => (e: LayoutChangeEvent) => {
    const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    layouts.current[id] = layout;
    if (id !== value) return;
    if (measured) {
      // L'onglet actif passe en gras et change de largeur : on suit sans à-coup.
      slideTo(layout);
    } else {
      x.value = layout.x;
      width.value = layout.width;
      setMeasured(true);
    }
  };

  const underline = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value + width.value / 2 - BASE / 2 },
      { scaleX: width.value / BASE },
    ],
  }));

  if (vertical) {
    return (
      <View
        {...(hrefOf
          ? { role: 'navigation' as const, 'aria-label': navLabel }
          : { accessibilityRole: 'tablist' as const })}
        style={{
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          backgroundColor: colors.surface.primary,
          overflow: 'hidden',
        }}
      >
        {tabs.map((tab, index) => {
          const active = tab.id === value;
          const item = (
            <Pressable
              key={tab.id}
              {...(hrefOf
                ? {
                    accessibilityRole: 'link' as const,
                    'aria-current': active ? ('page' as const) : undefined,
                  }
                : {
                    onPress: () => onChange?.(tab.id),
                    accessibilityRole: 'tab' as const,
                    accessibilityState: { selected: active },
                    'aria-selected': active,
                  })}
              ring="inside"
              hoverStyle={active ? undefined : { backgroundColor: colors.surface.hover }}
              style={{
                minHeight: 48,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: effects.spacing.xs,
                paddingHorizontal: 18,
                borderTopWidth: index === 0 ? 0 : 1,
                borderLeftWidth: 4,
                borderTopColor: colors.surface.border.primary,
                borderLeftColor: active ? colors.tint : 'transparent',
                backgroundColor: active ? colors.tintSoft : 'transparent',
              }}
            >
              <TabText
                tab={tab}
                style={{
                  ...(active ? fonts.bold : fonts.regular),
                  fontSize: 16,
                  color: active ? colors.tint : colors.text.primary,
                }}
              />
              {tab.count ? (
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>{tab.count}</Text>
              ) : null}
            </Pressable>
          );
          return hrefOf ? (
            <Link key={tab.id} href={hrefOf(tab.id) as never} asChild>
              {item}
            </Link>
          ) : (
            item
          );
        })}
      </View>
    );
  }

  if (wrap) {
    return (
      <View
        {...(hrefOf
          ? { role: 'navigation' as const, 'aria-label': navLabel }
          : { accessibilityRole: 'tablist' as const })}
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          borderBottomWidth: 1,
          borderColor: colors.surface.border.primary,
        }}
      >
        {tabs.map((tab) => {
          const active = tab.id === value;
          const item = (
            <Pressable
              key={tab.id}
              {...(hrefOf
                ? {
                    accessibilityRole: 'link' as const,
                    'aria-current': active ? ('page' as const) : undefined,
                  }
                : {
                    onPress: () => onChange?.(tab.id),
                    accessibilityRole: 'tab' as const,
                    accessibilityState: { selected: active },
                    'aria-selected': active,
                  })}
              ring="inside"
              hoverStyle={{
                backgroundColor: colors.surface.hover,
                borderTopLeftRadius: effects.borderRadius.xs,
                borderTopRightRadius: effects.borderRadius.xs,
              }}
              style={styles.wrapPressable}
            >
              <View
                style={[
                  styles.wrapLabel,
                  { borderBottomColor: active ? colors.tint : 'transparent' },
                ]}
              >
                <TabText
                  tab={tab}
                  style={{
                    ...(active ? fonts.bold : fonts.regular),
                    // Quatre onglets sur 375 px : 14 px évite de couper « Programme » en deux.
                    fontSize: tabs.length > 3 ? 14 : 16,
                    textAlign: 'center',
                    color: active ? colors.tint : colors.text.secondary,
                  }}
                />
              </View>
            </Pressable>
          );
          // La largeur vient d'une classe (StyleSheet) : la CSS peut la surcharger, pas un style en ligne.
          return (
            <View
              key={tab.id}
              {...tv('tab-wrap')}
              style={tabs.length > 3 ? styles.wrapItemQuarter : styles.wrapItem}
            >
              {hrefOf ? (
                <Link href={hrefOf(tab.id) as never} asChild>
                  {item}
                </Link>
              ) : (
                item
              )}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ borderBottomWidth: 1, borderColor: colors.surface.border.primary }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // Un ensemble de liens n'est pas un tablist : c'est une navigation.
        {...(hrefOf
          ? { role: 'navigation' as const, 'aria-label': navLabel }
          : { accessibilityRole: 'tablist' as const })}
      >
        {tabs.map((tab) => {
          const active = tab.id === value;
          const item = (
            <Pressable
              key={tab.id}
              onLayout={onTabLayout(tab.id)}
              {...(hrefOf
                ? {
                    accessibilityRole: 'link' as const,
                    'aria-current': active ? ('page' as const) : undefined,
                  }
                : {
                    onPress: () => onChange?.(tab.id),
                    accessibilityRole: 'tab' as const,
                    accessibilityState: { selected: active },
                    'aria-selected': active,
                  })}
              ring="inside"
              hoverStyle={{
                backgroundColor: colors.surface.hover,
                borderTopLeftRadius: effects.borderRadius.xs,
                borderTopRightRadius: effects.borderRadius.xs,
              }}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                paddingHorizontal: 14,
                borderBottomWidth: 3,
                borderColor: active && !measured ? colors.tint : 'transparent',
              }}
            >
              <TabText
                tab={tab}
                style={{
                  ...(active ? fonts.bold : fonts.regular),
                  fontSize: 16,
                  color: active ? colors.tint : colors.text.secondary,
                }}
              />
            </Pressable>
          );
          return hrefOf ? (
            <Link key={tab.id} href={hrefOf(tab.id) as never} asChild>
              {item}
            </Link>
          ) : (
            item
          );
        })}
        {measured ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: BASE,
                height: 3,
                backgroundColor: colors.tint,
              },
              underline,
            ]}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

/** Libellé d'onglet ; `longLabel` (complet) à partir de 768 px, le libellé court en dessous. */
function TabText({
  tab,
  style,
}: {
  tab: { label: string; longLabel?: string };
  style: StyleProp<TextStyle>;
}) {
  if (!tab.longLabel || Platform.OS !== 'web') return <Text style={style}>{tab.label}</Text>;
  return (
    <>
      <Text {...tv('only-below-md')} style={style}>
        {tab.label}
      </Text>
      <Text {...tv('only-from-md')} style={style}>
        {tab.longLabel}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  // Trois onglets par ligne ; la feuille CSS libère la largeur dès 768 px (une seule ligne).
  wrapItem: { flexGrow: 1, flexBasis: '33.33%' },
  // Quatre onglets (fiche parti) : une seule ligne dès l'écran de 375 px.
  wrapItemQuarter: { flexGrow: 1, flexBasis: '25%' },
  wrapPressable: { minHeight: 48, justifyContent: 'center' },
  wrapLabel: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderBottomWidth: 3,
  },
});

/** Contenu d'un onglet : fondu à chaque changement (passer l'id de l'onglet en `id`). */
export function TabPanel({
  id,
  style,
  children,
}: {
  id: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  return (
    <Enter key={id} kind="fade" duration={duration.open} style={style}>
      {children}
    </Enter>
  );
}
