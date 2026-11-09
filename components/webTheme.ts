import { useMemo } from 'react';
import { Platform, StyleSheet, type StyleProp } from 'react-native';

import { theme, useTheme } from '@/components/ThemeContext';

/**
 * Couleurs du thème en variables CSS (web uniquement).
 *
 * Pourquoi : `useTheme()` donne des objets de style en ligne, que react-native-web ne peut pas
 * compiler en classes atomiques ; le même style revenait des centaines de fois dans le HTML
 * (voir docs/seo/audit-v2.md § 3.5). Sur le web, les couleurs deviennent donc `var(--…)`, définies
 * une fois dans `<head>` : `:root` en clair, `data-theme="dark"` en sombre, attribut posé par
 * `ThemeContext` au même moment que son thème (l'app suit l'OS, appliqué après l'hydratation). Un style qui n'a plus rien d'en ligne devient une classe.
 *
 * Sur natif, rien ne change : `useTheme()` et des objets de style ordinaires.
 */
type Palette = typeof theme.light;

const isWeb = Platform.OS === 'web';

const kebab = (path: string[]) =>
  path
    .join('-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();

/** Reproduit la forme de `theme.light` en remplaçant chaque couleur par `var(--chemin)`. */
const toVars = (node: unknown, path: string[] = []): unknown => {
  // `transparent` reste littéral : `hoverKind` s'appuie sur lui pour détecter un fond invisible.
  if (node === 'transparent') return node;
  if (typeof node === 'string') return `var(--${kebab(path)})`;
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [key, toVars(value, [...path, key])])
    );
  }
  return node;
};

/** Palette dont chaque couleur est une variable CSS (`cssColors.text.primary` → `var(--text-primary)`). */
export const cssColors = toVars(theme.light) as Palette;

const declarations = (node: unknown, path: string[] = []): string[] => {
  if (node === 'transparent') return [];
  if (typeof node === 'string') return [`--${kebab(path)}:${node}`];
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    return Object.entries(node).flatMap(([key, value]) => declarations(value, [...path, key]));
  }
  return [];
};

/**
 * Feuille des variables : clair par défaut, sombre quand `ThemeProviderCustom` pose
 * `data-theme="dark"` sur `<html>`. Le HTML statique est toujours clair et le thème réel ne
 * s'applique qu'à l'hydratation (voir ThemeContext) : un `@media (prefers-color-scheme: dark)`
 * mélangerait, avant l'hydratation, des textes sombres-sur-sombre et des fonds encore clairs.
 */
export const themeVarsCss: string = [
  `:root{${declarations(theme.light).join(';')}}`,
  `:root[data-theme="dark"]{${declarations(theme.dark).join(';')}}`,
].join('\n');

type Style = Record<string, unknown>;

const registry = new Map<string, StyleProp<never>>();

/**
 * Web : enregistre le style dans la feuille (une classe par style distinct, créée une seule fois).
 * Natif : renvoie l'objet tel quel. Le résultat est identique au rendu statique et à l'hydratation.
 */
export const registerStyle = <T extends Style>(style: T): StyleProp<T> => {
  if (!isWeb) return style as StyleProp<T>;
  const key = JSON.stringify(style);
  let registered = registry.get(key);
  if (!registered) {
    registered = StyleSheet.create({ s: style as never }).s as StyleProp<never>;
    registry.set(key, registered);
  }
  return registered as StyleProp<T>;
};

/**
 * `const c = useColorStyle(); <View style={[styles.box, c((p) => ({ backgroundColor: p.surface.primary }))]} />`
 * Web : classe aux couleurs en variables CSS. Natif : couleurs du thème courant.
 */
export const useColorStyle = () => {
  const { colors } = useTheme();
  return useMemo(
    () =>
      <T extends Style>(make: (palette: Palette) => T): StyleProp<T> =>
        isWeb ? registerStyle(make(cssColors)) : (make(colors as Palette) as StyleProp<T>),
    [colors]
  );
};

const isSimpleStyle = (value: unknown): value is Style =>
  typeof value === 'object' &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype &&
  Object.values(value).every((v) => typeof v === 'string' || typeof v === 'number');

/**
 * Web : remplace chaque objet de style ordinaire (en ligne) d'un tableau de styles par sa classe.
 * Les références et les valeurs non ordinaires (transforms, styles animés) passent telles quelles.
 */
export const classifyStyle = <T>(style: StyleProp<T>): StyleProp<T> => {
  if (!isWeb) return style;
  if (Array.isArray(style))
    return (style as StyleProp<T>[]).map((item) => classifyStyle(item)) as StyleProp<T>;
  return isSimpleStyle(style) ? (registerStyle(style) as StyleProp<T>) : style;
};
