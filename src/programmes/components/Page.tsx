import { Link, usePathname } from 'expo-router';
import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { layout } from '@/components/layout';
import { duration, useMotion } from '@/components/motion';
import { theme, useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Only } from '@/src/core/components/Only';
import { APP_NAME } from '@/src/core/config/app';
import { tv } from '@/src/core/web/tv';
import { Breadcrumb } from '@/src/programmes/components/Breadcrumb';
import { ElectionChip } from '@/src/programmes/components/ElectionChip';
import { Logo, Tricolore } from '@/src/programmes/components/Logo';
import { RailLayout } from '@/src/programmes/components/RailLayout';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { PageSkeleton } from '@/src/programmes/components/Skeleton';
import { hasReachedEnd } from '@/src/programmes/models/reach-end.service';
import {
  nonIndexableMeta,
  type Breadcrumb as BreadcrumbTrail,
  type PageMeta,
} from '@/src/programmes/models/seo/page-meta';

type Href = '/' | '/comprendre' | '/partis' | '/me-situer';

type NavItem = { href: Href; label: string; icon: string; matches: (pathname: string) => boolean };

/**
 * Trois rubriques. Les débats (`/debats/[id]`) vivent dans Partis ; l'élection est la pastille de
 * l'en-tête, hors rubrique.
 */
const NAV: NavItem[] = [
  {
    href: '/comprendre',
    label: 'Comprendre',
    icon: 'book-outline',
    matches: (p) => p.startsWith('/comprendre') || p.startsWith('/passeport'),
  },
  {
    href: '/partis',
    label: 'Partis',
    icon: 'people-outline',
    matches: (p) => p.startsWith('/partis') || p.startsWith('/debats'),
  },
  {
    href: '/me-situer',
    label: 'Me situer',
    icon: 'compass-outline',
    matches: (p) => p.startsWith('/me-situer'),
  },
];

/** Barre du bas en mobile : l'accueil, puis les trois rubriques. */
const BOTTOM_NAV: NavItem[] = [
  { href: '/', label: 'Accueil', icon: 'home-outline', matches: (p) => p === '/' || p === '' },
  ...NAV,
];

/** Largeur max du contenu en natif et sous 768 px (au-delà, la CSS `container` prend le relais). */
const BASE_MAX_WIDTH = 760;
const TAB_BAR_HEIGHT = 64;
const ARC_WIDTH = 24;

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

/** Pages qui portent le bandeau « Version bêta ». */
const BETA_BANNER_PATHS = ['/', '/methodologie'];

/** Chemin canonique du repli : sans requête ni barre finale. */
const canonicalPath = (pathname: string) =>
  pathname.length > 1 ? pathname.replace(/\/+$/, '').replace(/[?#].*$/, '') : '/';

/** Onglet quitté au dernier appui : la barre de la page suivante fait glisser l'arc depuis lui. */
let slideFrom: number | null = null;

function BottomTabBar() {
  const { colors, fonts } = useTheme();
  const { reduce, timing } = useMotion();
  const pathname = usePathname();
  const activeIndex = BOTTOM_NAV.findIndex((item) => item.matches(pathname));
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
    const slot = e.nativeEvent.layout.width / BOTTOM_NAV.length;
    const at = (index: number) => slot * (index + 0.5) - ARC_WIDTH / 2;
    x.value = at(from);
    x.value = withTiming(at(activeIndex), timing(duration.page, 'inOut'), (done) => {
      if (done) runOnJS(setSliding)(false);
    });
  };

  const arcStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View
      {...tv('bottom-bar', 'no-print')}
      role="navigation"
      aria-label="Rubriques"
      onLayout={onLayout}
      style={[
        styles.tabBar,
        {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.surface.border.primary,
        },
      ]}
    >
      {BOTTOM_NAV.map((item, index) => {
        const active = index === activeIndex;
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              ring="inside"
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
 * Gabarit commun. La mise en page ne dépend jamais de la largeur de la fenêtre côté JavaScript :
 * mobile dans les styles React Native, desktop dans la feuille `layout-css` (data-tv). Le HTML
 * statique et le premier rendu client sont ainsi identiques.
 *
 * - Mobile : en-tête mince (logo ou « Retour »), barre d'onglets en bas.
 * - `hub` : accueil, listes, cartes. `object` : fiche, débat, résultats (rail + colonne).
 */
export function Page({
  children,
  loading,
  back,
  focus = false,
  template = 'object',
  rail,
  railOnMobile = 'stack',
  title,
  meta,
  breadcrumb,
  article = false,
  onReachEnd,
}: {
  /**
   * Appelé une seule fois par montage quand l'essentiel du contenu (hors pied de page) a été
   * vu : 85 % défilé, ou contenu entièrement visible. Ignoré pendant le chargement.
   */
  onReachEnd?: () => void;
  /**
   * Métadonnées de la page (title, description, canonical, JSON-LD). `null` : aucune balise
   * (le layout d'une fiche laisse l'écran enfant les rendre).
   */
  meta?: PageMeta | null;
  /** Repli sans `meta` : title de la page, qui devient alors non indexée (jamais dupliquée). */
  title?: string;
  /** Fil d'Ariane visible sur desktop ; par défaut celui de `meta`. */
  breadcrumb?: BreadcrumbTrail;
  /** Contenu éditorial autonome (guide, fiche, débat, élection) : balise <article>. */
  article?: boolean;
  children: ReactNode;
  loading?: boolean;
  back?: { label: string; href: string };
  /** Mode focus (questionnaire) : ni barre d'onglets, ni navigation des rubriques. */
  focus?: boolean;
  /** `hub` : le contenu occupe tout le conteneur ; `object` : colonne de lecture (avec rail). */
  template?: 'hub' | 'object';
  /** Gabarit `object` : contenu de la colonne de gauche (collante à partir de 1024 px). */
  rail?: ReactNode;
  /** Sous 1024 px, le rail est empilé au-dessus du contenu ou masqué. */
  railOnMobile?: 'stack' | 'hidden';
}) {
  const { colors, effects, fonts } = useTheme();
  const pathname = usePathname();
  const headMeta =
    meta === undefined && !loading
      ? nonIndexableMeta(title ?? APP_NAME, canonicalPath(pathname))
      : meta;
  const trail = breadcrumb ?? headMeta?.breadcrumb ?? [];
  const showTabBar = !focus;
  // Sans rail, une page `object` est une colonne de lecture centrée (voir `RailLayout`).
  const solo = template === 'object' && !rail;
  // Le bandeau « Version bêta » n'est affiché que sur l'accueil et la méthodologie ; ailleurs, la
  // mention est dans le pied de page. Le chemin est connu au rendu statique : premier rendu identique.
  const showBetaBanner = BETA_BANNER_PATHS.includes(canonicalPath(pathname));
  const logo = (
    <Link href="/" asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Accueil"
        hoverStyle={{ opacity: effects.opacity.pressed }}
        style={styles.headerButton}
      >
        <Logo />
      </Pressable>
    </Link>
  );

  // Desktop : une rubrique comme les autres (pilule, sans soulignement). Mobile : icône ⓘ.
  const methodologyLink = (
    <>
      <Only from="md">
        <Link href="/methodologie" asChild>
          <Pressable accessibilityRole="link" style={styles.desktopNavItem}>
            <Text style={{ ...fonts.regular, color: colors.text.primary }}>Méthode</Text>
          </Pressable>
        </Link>
      </Only>
      <Only below="md">
        <Link href="/methodologie" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Méthodologie"
            style={StyleSheet.flatten([styles.headerButton, { alignItems: 'flex-end' }])}
          >
            <Icon name="information-circle-outline" variant="onGlass" size="medium" />
          </Pressable>
        </Link>
      </Only>
    </>
  );

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
    <View {...tv('print-flow')} style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      {headMeta ? <SeoHead meta={headMeta} /> : null}
      <View
        {...tv('no-print')}
        role="banner"
        style={{
          backgroundColor: colors.background.primary,
          borderBottomColor: colors.surface.border.primary,
          borderBottomWidth: StyleSheet.hairlineWidth,
        }}
      >
        <View {...tv('container')} style={styles.headerInner}>
          {/* Trois emplacements : les deux extrémités ont la même largeur (`flex: 1`), la navigation
              est donc sur l'axe de la page, comme la colonne de contenu et le pied de page. */}
          {/* Une seule arborescence : la CSS choisit la variante (mobile < 768 px, desktop). */}
          <View style={styles.headerSlot}>
            {back ? (
              <>
                <Only below="md">
                  <Link href={back.href as never} asChild>
                    <Pressable accessibilityRole="link" style={styles.headerButton}>
                      <Text style={{ ...fonts.bold, color: colors.tint, fontSize: 16 }}>
                        ‹ {back.label}
                      </Text>
                    </Pressable>
                  </Link>
                </Only>
                <Only from="md">{logo}</Only>
              </>
            ) : (
              logo
            )}
          </View>

          {focus ? null : (
            <View
              {...tv('only-from-md')}
              role="navigation"
              aria-label="Rubriques"
              style={styles.desktopNav}
            >
              {NAV.map((item) => {
                const active = item.matches(pathname);
                return (
                  <Link key={item.href} href={item.href} asChild>
                    <Pressable
                      aria-current={active ? 'page' : undefined}
                      style={StyleSheet.flatten([
                        styles.desktopNavItem,
                        { backgroundColor: active ? colors.tintSoft : 'transparent' },
                      ])}
                    >
                      {/* Graisse constante : l'état actif tient au fond et à la couleur, sans
                          que la largeur de la rubrique (donc ses voisines) change d'une page à l'autre. */}
                      <Text
                        style={{
                          ...fonts.regular,
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
          )}

          {focus && back ? (
            <Only from="md">
              <TextLink href={back.href} standalone>
                {back.label}
              </TextLink>
            </Only>
          ) : null}
          <View style={[styles.headerSlot, styles.headerSlotEnd]}>
            {focus ? null : <ElectionChip />}
            {focus && back ? <Only below="md">{methodologyLink}</Only> : methodologyLink}
          </View>
        </View>
      </View>
      <View {...tv('no-print')}>
        <Tricolore />
      </View>
      {showBetaBanner ? (
        <View
          {...tv('no-print')}
          style={{
            backgroundColor: colors.tintSoft,
            paddingVertical: 6,
            paddingHorizontal: effects.spacing.md,
          }}
        >
          {/* Une seule ligne sous 768 px : texte court. */}
          <Only below="md">
            <Text style={{ fontSize: 14, color: colors.text.primary, textAlign: 'center' }}>
              Version bêta : contenus en relecture.
            </Text>
          </Only>
          <Only from="md">
            <Text style={{ fontSize: 14, color: colors.text.primary, textAlign: 'center' }}>
              Version bêta : contenus en cours de relecture.
            </Text>
          </Only>
        </View>
      ) : null}

      <ScrollView
        {...tv('print-flow')}
        style={{ flex: 1 }}
        scrollEventThrottle={200}
        onScroll={onReachEnd ? onScroll : undefined}
        onLayout={(e) => {
          measures.current.viewportHeight = e.nativeEvent.layout.height;
          check();
        }}
      >
        <View
          {...tv('container')}
          role="main"
          onLayout={(e) => {
            measures.current.contentHeight = e.nativeEvent.layout.height;
            check();
          }}
          style={[styles.container, styles.mainPadding]}
        >
          {loading ? (
            <PageSkeleton />
          ) : (
            <Enter
              kind={Platform.OS === 'web' ? 'rise' : 'fade'}
              duration={duration.page}
              style={{ gap: effects.spacing.lg }}
            >
              {trail.length > 1 ? (
                // Colonne seule (ni rail ni page pleine largeur) : le fil d'Ariane suit le bord
                // gauche de la colonne centrée.
                <View {...(solo ? tv('no-print', 'solo') : tv('no-print'))}>
                  <Only from="md">
                    <Breadcrumb trail={trail} />
                  </Only>
                </View>
              ) : null}
              <View role={article ? 'article' : undefined} style={{ gap: effects.spacing.lg }}>
                {template === 'hub' ? (
                  children
                ) : (
                  <RailLayout rail={rail} railOnMobile={railOnMobile}>
                    <View style={{ gap: effects.spacing.lg }}>{children}</View>
                  </RailLayout>
                )}
              </View>
            </Enter>
          )}
        </View>
        <View
          {...tv('container', 'no-print')}
          role="contentinfo"
          style={[styles.container, styles.footerPadding]}
        >
          {/* Mobile : centré, sans filet. À partir de 768 px : à gauche, filet (CSS). */}
          <View
            {...tv('footer-rule')}
            style={[styles.footerRule, { borderTopColor: colors.surface.border.primary }]}
          >
            <Text
              {...tv('footer-text')}
              style={[styles.footerText, { color: colors.text.secondary, fontSize: 14 }]}
            >
              {showBetaBanner ? '' : 'Version bêta · '}Site indépendant et non officiel ·{' '}
              <TextLink href="/methodologie">Méthode</TextLink> ·{' '}
              <TextLink href="/corrections">Corrections</TextLink>
            </Text>
          </View>
        </View>
        {/* Réserve de la barre du bas : retirée par la CSS à partir de 768 px. */}
        <View
          {...tv('scroll-pad', 'no-print')}
          style={showTabBar ? styles.padWithTabBar : styles.pad}
        />
      </ScrollView>

      {showTabBar ? <BottomTabBar /> : null}
    </View>
  );
}

// Les propriétés que la feuille CSS surcharge (largeur max, marges latérales, hauteur de la
// réserve) viennent d'ici et pas d'un style en ligne : un style en ligne l'emporterait.
const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: BASE_MAX_WIDTH,
    paddingLeft: layout.gutter.base,
    paddingRight: layout.gutter.base,
  },
  mainPadding: { paddingTop: 28, paddingBottom: 20 },
  footerPadding: { paddingTop: 0, paddingBottom: 20 },
  footerRule: { paddingTop: 20 },
  footerText: { textAlign: 'center' },
  pad: { height: 16 },
  padWithTabBar: { height: TAB_BAR_HEIGHT + 16 },
  headerInner: {
    width: '100%',
    alignSelf: 'center',
    maxWidth: BASE_MAX_WIDTH,
    paddingLeft: layout.gutter.base,
    paddingRight: layout.gutter.base,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: { minHeight: 44, minWidth: 44, justifyContent: 'center' },
  // Extrémités de l'en-tête : même `flex: 1`, donc la rubrique du milieu est sur l'axe de la page.
  headerSlot: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerSlotEnd: { justifyContent: 'flex-end', gap: theme.effects.spacing.sm },
  desktopNav: {
    flexDirection: 'row',
    gap: theme.effects.spacing.xxs,
    justifyContent: 'center',
  },
  desktopNavItem: {
    paddingHorizontal: theme.effects.spacing.sm,
    paddingVertical: theme.effects.spacing.xs + 2,
    borderRadius: theme.effects.borderRadius.round,
  },
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
