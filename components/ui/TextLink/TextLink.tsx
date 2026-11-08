import { Link } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { tv } from '@/src/core/web/tv';

/**
 * Lien texte : couleur `tint`, souligné, graisse normale. Un seul style pour tous les liens du
 * site. Survol (soulignement épaissi), anneau de focus `:focus-visible` et zone cliquable de
 * 23 px viennent de la feuille `layout-css` (crochet `data-tv="text-link"`).
 *
 * - Dans une phrase : sans `standalone`, le lien reste en ligne.
 * - Seul sur sa ligne (pied de liste, liens de corrections) : `standalone`.
 * - `size` : taille de police ; omise, le lien hérite de celle du texte qui l'entoure.
 */
export function TextLink({
  href,
  children,
  size,
  standalone = false,
  style,
  onPress,
}: {
  href: string;
  children: ReactNode;
  size?: number;
  standalone?: boolean;
  style?: StyleProp<TextStyle>;
  onPress?: () => void;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Link
      {...tv('text-link', ...(standalone ? ['text-link-block'] : []))}
      href={href as never}
      onPress={onPress}
      style={[
        { ...fonts.regular, color: colors.tint, textDecorationLine: 'underline' },
        size ? { fontSize: size } : null,
        style,
      ]}
    >
      {children}
    </Link>
  );
}
