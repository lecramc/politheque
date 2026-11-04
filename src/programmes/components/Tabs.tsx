import { Link } from 'expo-router';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';

/** Largeur de référence du soulignement, mis à l'échelle (transform uniquement). */
const BASE = 100;

/** Onglets soulignés (bleu uni), défilants horizontalement sur petit écran. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  hrefOf,
  navLabel,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange?: (id: T) => void;
  /** Onglets-liens (vraies pages, indexables) : chaque onglet est un <a href>. */
  hrefOf?: (id: T) => string;
  /** Nom de la navigation quand les onglets sont des liens. */
  navLabel?: string;
}) {
  const { colors, fonts } = useTheme();
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
              hoverStyle={{ backgroundColor: colors.surface.hover }}
              style={{
                minHeight: 48,
                justifyContent: 'center',
                paddingHorizontal: 14,
                borderBottomWidth: 3,
                borderColor: active && !measured ? colors.tint : 'transparent',
              }}
            >
              <Text
                style={{
                  ...(active ? fonts.bold : fonts.regular),
                  fontSize: 16,
                  color: active ? colors.tint : colors.text.secondary,
                }}
              >
                {tab.label}
              </Text>
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
