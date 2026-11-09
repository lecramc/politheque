import { useMemo } from 'react';
import { Platform, StyleSheet, type StyleProp } from 'react-native';

import { cssColors, kebab, theme, useTheme } from '@/components/ThemeContext';

/**
 * Couleurs du thème en variables CSS (web uniquement).
 *
 * Pourquoi : `useTheme()` donne des objets de style en ligne, que react-native-web ne peut pas
 * compiler en classes atomiques ; le même style revenait des centaines de fois dans le HTML
 * (voir docs/seo/audit-v2.md § 3.5). Sur le web, les couleurs deviennent donc `var(--…)`, définies
 * une fois dans `<head>` : `:root` en clair, sombre selon `prefers-color-scheme` (dès le premier
 * octet, sans éclair) et `data-theme` (posé par `ThemeContext` après l'hydratation). Un style qui
 * n'a plus rien d'en ligne devient une classe.
 *
 * Depuis que `useTheme().colors` vaut `cssColors` sur le web, plus aucune couleur littérale ne
 * reste en ligne : le HTML statique est déjà au bon thème.
 *
 * Sur natif, rien ne change : `useTheme()` et des objets de style ordinaires.
 */
type Palette = typeof theme.light;

const isWeb = Platform.OS === 'web';

export { cssColors };

const declarations = (node: unknown, path: string[] = []): string[] => {
  if (node === 'transparent') return [];
  if (typeof node === 'string') return [`--${kebab(path)}:${node}`];
  if (Array.isArray(node)) {
    return node.flatMap((value, index) => declarations(value, [...path, `${index}`]));
  }
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => declarations(value, [...path, key]));
  }
  return [];
};

const darkVars = declarations(theme.dark).join(';');

/**
 * Feuille des variables : clair par défaut ; sombre (1) par `prefers-color-scheme: dark` tant que
 * `data-theme` n'est pas posé, donc dès le HTML statique, (2) par `data-theme="dark"` ensuite.
 * Toutes les couleurs des composants sont des `var(--…)` (voir ThemeContext), le statique et
 * l'hydraté sont donc identiques dans les deux thèmes.
 */
export const themeVarsCss: string = [
  `:root{${declarations(theme.light).join(';')}}`,
  `@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${darkVars}}}`,
  `:root[data-theme="dark"]{${darkVars}}`,
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
