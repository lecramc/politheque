import { Link, usePathname } from 'expo-router';
import React, { ReactNode } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Logo, Tricolore } from '@/src/programmes/components/Logo';

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

export const useIsDesktop = () => useWindowDimensions().width >= DESKTOP_BREAKPOINT;

/** Petit arc au-dessus de l'onglet actif : le motif signature sert aussi de repère. */
function ActiveArc({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 24,
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

function BottomTabBar() {
  const { colors, fonts } = useTheme();
  const pathname = usePathname();
  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.surface.border.primary,
        },
      ]}
    >
      {NAV.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              style={styles.tabItem}
            >
              <View style={{ height: 10 }}>
                {active ? <ActiveArc color={colors.tint} /> : null}
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
}: {
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
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
        contentContainerStyle={{ paddingBottom: showTabBar ? TAB_BAR_HEIGHT + 16 : 16 }}
      >
        <View
          style={[
            styles.inner,
            {
              maxWidth,
              padding: effects.spacing.md,
              gap: effects.spacing.lg,
              paddingTop: effects.spacing.lg,
            },
          ]}
        >
          {loading ? <ActivityIndicator color={colors.tint} style={styles.loader} /> : children}
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
  loader: { marginVertical: 48 },
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
