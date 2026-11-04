import { Link, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { duration, useMotion } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';
import { APP_NAME } from '@/src/core/config/app';
import { Logo, Tricolore } from '@/src/programmes/components/Logo';
import { PageSkeleton } from '@/src/programmes/components/Skeleton';
import { hasReachedEnd } from '@/src/programmes/models/reach-end.service';

type Href = '/comprendre' | '/partis' | '/elections' | '/debats' | '/me-situer';

const NAV: { href: Href; label: string; icon: string }[] = [
  { href: '/comprendre', label: 'Comprendre', icon: 'book-outline' },
  { href: '/partis', label: 'Partis', icon: 'people-outline' },
  { href: '/elections', label: 'Élections', icon: 'calendar-outline' },
  { href: '/debats', label: 'Débats', icon: 'chatbubbles-outline' },
  { href: '/me-situer', label: 'Me situer', icon: 'compass-outline' },
];

export const CONTENT_MAX_WIDTH = 760;
const DESKTOP_BREAKPOINT = 768;
const TAB_BAR_HEIGHT = 64;
const ARC_WIDTH = 24;

export const useIsDesktop = () => useWindowDimensions().width >= DESKTOP_BREAKPOINT;

/** Petit arc au-dessus de l'onglet actif : le motif signature sert aussi de repère. */
function ActiveArc({ color }: { color: string }) {
  return (
    <View
      style={{
        width: ARC_WIDTH,
        height: 10,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderWidth: 3,
        borderBottomWidth: 0,
        borderColor: color,
      }}
    />
  );
}

/** Onglet quitté au dernier appui : la barre de la page suivante fait glisser l'arc depuis lui. */
let slideFrom: number | null = null;

function BottomTabBar() {
  const { colors, fonts } = useTheme();
  const { reduce, timing } = useMotion();
  const pathname = usePathname();
  const activeIndex = NAV.findIndex((item) => pathname.startsWith(item.href));
  // Calculé au premier rendu : l'arc fixe de l'onglet actif reste caché pendant le glissement.
  const [sliding, setSliding] = useState(
    () => !reduce && slideFrom !== null && activeIndex >= 0 && slideFrom !== activeIndex
  );
  const [from] = useState(slideFrom);
  const x = useSharedValue(-ARC_WIDTH * 4);

  useEffect(() => {
    slideFrom = null;
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    if (!sliding || from === null) return;
    const slot = e.nativeEvent.layout.width / NAV.length;
    const at = (index: number) => slot * (index + 0.5) - ARC_WIDTH / 2;
    x.value = at(from);
    x.value = withTiming(at(activeIndex), timing(duration.page, 'inOut'), (done) => {
      if (done) runOnJS(setSliding)(false);
    });
  };

  const arcStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      role="navigation"
      onLayout={onLayout}
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.surface.border.primary,
        },
      ]}
    >
      {NAV.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              accessibilityRole="link"
              aria-current={active ? 'page' : undefined}
              accessibilityLabel={item.label}
              onPress={() => {
                slideFrom = activeIndex >= 0 ? activeIndex : null;
              }}
              hoverStyle={{ backgroundColor: colors.surface.hover }}
              style={styles.tabItem}
            >
              <View style={{ height: 10 }}>
                {active && !sliding ? <ActiveArc color={colors.tint} /> : null}
              </View>
              <Icon name={item.icon} variant={active ? 'onGlass' : 'secondary'} size="medium" />
              <Text
                style={{
                  ...(active ? fonts.bold : fonts.regular),
                  fontSize: 12,
                  color: active ? colors.tint : colors.text.secondary,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
      {sliding ? (
        <Animated.View pointerEvents="none" style={[styles.slidingArc, arcStyle]}>
          <ActiveArc color={colors.tint} />
        </Animated.View>
      ) : null}
    </View>
  );
}

/**
 * Gabarit commun.
 * Mobile : en-tête mince (logo ou « Retour »), barre d'onglets en bas.
 * Desktop : navigation dans l'en-tête, colonne de lecture centrée.
 */
export function Page({
  children,
  loading,
  back,
  focus = false,
  wide = false,
  title,
  onReachEnd,
}: {
  /**
   * Appelé une seule fois par montage quand l'essentiel du contenu (hors pied de page) a été
   * vu : 85 % défilé, ou contenu entièrement visible. Ignoré pendant le chargement.
   */
  onReachEnd?: () => void;
  /** Titre de l'onglet du navigateur (référencement, partage). */
  title?: string;
  children: ReactNode;
  loading?: boolean;
  back?: { label: string; href: string };
  /** Mode focus (questionnaire) : pas de barre d'onglets. */
  focus?: boolean;
  wide?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const isDesktop = useIsDesktop();
  const pathname = usePathname();
  const maxWidth = wide && isDesktop ? 1120 : CONTENT_MAX_WIDTH;
  const showTabBar = !isDesktop && !focus;

  const measures = useRef({ offsetY: 0, viewportHeight: 0, contentHeight: 0 });
  const reached = useRef(false);
  const check = useCallback(() => {
    if (reached.current || loading || !onReachEnd) return;
    if (hasReachedEnd(measures.current)) {
      reached.current = true;
      onReachEnd();
    }
  }, [loading, onReachEnd]);
  // Le contenu change à la fin du chargement : on réévalue sans attendre un défilement.
  useEffect(check, [check]);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    measures.current.offsetY = e.nativeEvent.contentOffset.y;
    check();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <Head>
        <title>
          {title
            ? `${title} · ${APP_NAME}`
            : `${APP_NAME} · la politique française, expliquée simplement`}
        </title>
      </Head>
      <View
        style={{
          backgroundColor: colors.background.primary,
          borderBottomColor: colors.surface.border.primary,
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      >
        <View
          style={[
            styles.headerInner,
            {
              maxWidth: isDesktop ? 1120 : CONTENT_MAX_WIDTH,
              paddingHorizontal: effects.spacing.md,
            },
          ]}
        >
          {back && !isDesktop ? (
            <Link href={back.href as never} asChild>
              <Pressable accessibilityRole="link" style={styles.headerButton}>
                <Text style={{ ...fonts.bold, color: colors.tint, fontSize: 16 }}>
                  ‹ {back.label}
                </Text>
              </Pressable>
            </Link>
          ) : (
            <Link href="/" asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Accueil"
                style={styles.headerButton}
              >
                <Logo />
              </Pressable>
            </Link>
          )}

          {isDesktop ? (
            <View style={styles.desktopNav}>
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} asChild>
                    <Pressable
                      aria-current={active ? 'page' : undefined}
                      style={StyleSheet.flatten([
                        styles.desktopNavItem,
                        { backgroundColor: active ? colors.tintSoft : 'transparent' },
                      ])}
                    >
                      <Text
                        style={{
                          ...(active ? fonts.bold : fonts.regular),
                          color: active ? colors.tint : colors.text.primary,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          ) : null}

          <Link href="/methodologie" asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="Méthodologie"
              style={StyleSheet.flatten([styles.headerButton, { alignItems: 'flex-end' }])}
            >
              {isDesktop ? (
                <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
                  Méthodologie
                </Text>
              ) : (
                <Icon name="information-circle-outline" variant="onGlass" size="medium" />
              )}
            </Pressable>
          </Link>
        </View>
      </View>
      <Tricolore />
      <View
        style={{
          backgroundColor: colors.tintSoft,
          paddingVertical: 6,
          paddingHorizontal: effects.spacing.md,
        }}
      >
        <Text style={{ fontSize: 13, color: colors.text.primary, textAlign: 'center' }}>
          Version bêta : contenus en cours de relecture.{' '}
          <Link
            href="/methodologie"
            style={{ color: colors.tint, textDecorationLine: 'underline' }}
          >
            Notre méthode
          </Link>
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={200}
        onScroll={onReachEnd ? onScroll : undefined}
        onLayout={(e) => {
          measures.current.viewportHeight = e.nativeEvent.layout.height;
          check();
        }}
        contentContainerStyle={{ paddingBottom: showTabBar ? TAB_BAR_HEIGHT + 16 : 16 }}
      >
        <View
          onLayout={(e) => {
            measures.current.contentHeight = e.nativeEvent.layout.height;
            check();
          }}
          style={[
            styles.inner,
            {
              maxWidth,
              padding: effects.spacing.md,
              paddingTop: effects.spacing.lg,
            },
          ]}
        >
          {loading ? (
            <PageSkeleton />
          ) : (
            <Enter
              kind={Platform.OS === 'web' ? 'rise' : 'fade'}
              duration={duration.page}
              style={{ gap: effects.spacing.lg }}
            >
              {children}
            </Enter>
          )}
        </View>
        <View
          style={[
            styles.inner,
            {
              maxWidth,
              paddingHorizontal: effects.spacing.md,
              paddingVertical: effects.spacing.md,
            },
          ]}
        >
          <Text style={{ color: colors.text.secondary, fontSize: 13, textAlign: 'center' }}>
            Site indépendant et non officiel ·{' '}
            <Link
              href="/methodologie"
              style={{ color: colors.tint, textDecorationLine: 'underline' }}
            >
              Méthodologie et corrections
            </Link>
          </Text>
        </View>
      </ScrollView>

      {showTabBar ? <BottomTabBar /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', alignSelf: 'center' },
  headerInner: {
    width: '100%',
    alignSelf: 'center',
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  desktopNav: { flexDirection: 'row', gap: 4, flex: 1, justifyContent: 'center' },
  desktopNavItem: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  slidingArc: { position: 'absolute', top: 3, left: 0 },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', gap: 1, paddingTop: 3 },
});
