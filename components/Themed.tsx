import { Ref, useContext } from 'react';
import {
  Platform,
  StyleSheet,
  Text as DefaultText,
  TextStyle,
  View as DefaultView,
} from 'react-native';

import { PressableHoverContext } from '@/components/ui/Pressable/hover-context';
import { isIsolatedNumber, splitDates, splitDigits } from '@/src/programmes/models/digits.service';
import { lineHeightFor } from '@/src/programmes/models/line-height.service';
import { frenchTypography } from '@/src/programmes/models/typography.service';

import { useTheme, theme as baseTheme } from './ThemeContext';
import { classifyStyle, cssColors, registerStyle } from './webTheme';

export type TextProps = DefaultText['props'] & {
  /**
   * Échelle typographique partagée (tailles lues dans `effects.sizes.text`) :
   * `title` 28/34 · `display` 22/28 · `subtitle` 18 · `body` 16/24 · `secondary` 15/22 ·
   * `caption` 14 en capitales · `label` 13.
   */
  variant?: 'body' | 'title' | 'display' | 'subtitle' | 'secondary' | 'label' | 'caption' | 'quote';
  /** Niveau de titre (structure), indépendant de la variante (visuel). `title` vaut 1 par défaut. */
  headingLevel?: 1 | 2 | 3 | 4;
  /**
   * Chiffres sans zéro barré (Atkinson barre le zéro) pour les titres, compteurs et grands chiffres
   * isolés. Hors titres, n'agit que sur un libellé composé uniquement d'un nombre.
   */
  plainDigits?: boolean;
  /** Transmise au texte natif (React 19 : `ref` est une prop ordinaire). */
  ref?: Ref<DefaultText>;
};
export type ViewProps = DefaultView['props'];

const isWeb = Platform.OS === 'web';

type TextVariant = NonNullable<TextProps['variant']>;

/** Style de base d'une variante, pour une palette donnée (couleurs réelles ou variables CSS). */
const variantStyle = (variant: TextVariant, colors: typeof baseTheme.light): TextStyle => {
  const { effects, fonts } = baseTheme;
  switch (variant) {
    case 'title':
      return {
        fontSize: effects.sizes.text.title,
        lineHeight: Math.round(effects.sizes.text.title * 1.2),
        ...fonts.display,
        color: colors.text.strong,
      };
    case 'display':
      return {
        fontSize: effects.sizes.text.display,
        lineHeight: 28,
        ...fonts.display,
        color: colors.text.strong,
      };
    case 'secondary':
      return {
        fontSize: effects.sizes.text.secondary,
        ...fonts.regular,
        color: colors.text.secondary,
      };
    case 'label':
      return {
        fontSize: effects.sizes.text.label,
        ...fonts.regular,
        color: colors.text.secondary,
      };
    case 'subtitle':
      return {
        fontSize: effects.sizes.text.subtitle,
        ...fonts.medium,
        color: colors.text.secondary,
      };
    case 'caption':
      return {
        fontSize: effects.sizes.text.caption,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        ...fonts.medium,
        color: colors.text.secondary,
      };
    case 'quote':
      return {
        fontSize: effects.sizes.text.quote,
        fontStyle: 'italic' as const,
        lineHeight: 30,
        color: colors.text.secondary,
      };
    case 'body':
    default:
      return {
        fontSize: effects.sizes.text.body,
        ...fonts.regular,
        color: colors.text.primary,
      };
  }
};

// Web : une classe par variante (couleurs en variables CSS), au lieu d'un style en ligne par texte.
const webVariantStyles = StyleSheet.create(
  Object.fromEntries(
    (
      ['body', 'title', 'display', 'subtitle', 'secondary', 'label', 'caption', 'quote'] as const
    ).map((variant) => [variant, variantStyle(variant, cssColors)])
  ) as Record<TextVariant, TextStyle>
);
const underlineStyle = StyleSheet.create({ underline: { textDecorationLine: 'underline' } });

export function Text(props: TextProps) {
  const { style, variant = 'body', headingLevel, plainDigits, children, ...otherProps } = props;
  const { colors, effects, fonts } = useTheme();
  const underlined = useContext(PressableHoverContext);

  const getTextStyle = () => (isWeb ? webVariantStyles[variant] : variantStyle(variant, colors));

  // Les titres de page sont de vrais titres pour les lecteurs d'écran et le référencement.
  const level = headingLevel ?? (variant === 'title' ? 1 : undefined);
  const headingProps = level ? { accessibilityRole: 'header' as const, 'aria-level': level } : {};
  // Sans interligne explicite : proportionnel à la taille réellement affichée (16 px : 24 px).
  const base = getTextStyle();
  const flat = StyleSheet.flatten([base, style]) as TextStyle;
  const lineHeight = flat.lineHeight ?? lineHeightFor(flat.fontSize ?? effects.sizes.text.body);
  const typeset = typeof children === 'string' ? frenchTypography(children) : children;
  const digitFont = String(flat.fontFamily ?? '').includes('Bold')
    ? fonts.displayBold
    : fonts.display;
  // Titres : dates sans zéro barré (`plainDigits` : tous les chiffres). Texte courant : Atkinson
  // d'un bout à l'autre, sauf un libellé composé uniquement d'un nombre avec `plainDigits`.
  const isHeading = variant === 'title' || variant === 'display' || variant === 'subtitle';
  const digitRuns =
    typeof typeset !== 'string'
      ? null
      : isHeading
        ? plainDigits
          ? splitDigits(typeset)
          : splitDates(typeset)
        : plainDigits && isIsolatedNumber(typeset)
          ? splitDigits(typeset)
          : null;
  const content = digitRuns
    ? digitRuns.map((run, index) =>
        run.digits ? (
          <DefaultText key={index} style={digitFont}>
            {run.text}
          </DefaultText>
        ) : (
          run.text
        )
      )
    : typeset;
  // Sur le web, les styles restent des références (classes) au lieu d'être fusionnés en un objet
  // en ligne. Exception : un texte portant un crochet `data-tv` garde le style fusionné, pour que
  // la feuille responsive ne surcharge pas ses classes (comportement historique).
  const byReference = isWeb && !('dataSet' in otherProps);
  return (
    <DefaultText
      style={
        byReference
          ? [
              base,
              classifyStyle(style),
              flat.lineHeight === undefined ? registerStyle({ lineHeight }) : null,
              underlined ? underlineStyle.underline : null,
            ]
          : [flat, { lineHeight }, underlined ? { textDecorationLine: 'underline' } : null]
      }
      {...headingProps}
      {...otherProps}
    >
      {content}
    </DefaultText>
  );
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  return <DefaultView style={[style]} {...otherProps} />;
}

export { ThemedButton, ThemedContainer } from './ui';
export { Icon } from './ui/Icon';
export { Pressable } from './ui/Pressable';
