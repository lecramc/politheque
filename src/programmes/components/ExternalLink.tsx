import React from 'react';
import { Linking, Platform } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { tv } from '@/src/core/web/tv';

/**
 * Lien sortant (mailto:, site de campagne, HATVP, GitHub) : un vrai <a href> sur le web, car le
 * `Link` du routeur réécrit les adresses et perdrait le préremplissage (`?title=…&body=…`).
 * Même style que `TextLink`.
 */
export function ExternalLink({
  href,
  newTab = false,
  size,
  children,
}: {
  href: string;
  newTab?: boolean;
  /** Taille de police ; omise, celle du composant `Text` (16). */
  size?: number;
  children: string;
}) {
  const { colors, fonts } = useTheme();
  return (
    <Text
      {...tv('text-link')}
      role="link"
      {...(Platform.OS === 'web'
        ? {
            href,
            ...(newTab ? { hrefAttrs: { target: '_blank', rel: 'noopener' } } : {}),
          }
        : { onPress: () => Linking.openURL(href) })}
      style={{
        ...fonts.regular,
        color: colors.tint,
        textDecorationLine: 'underline',
        ...(size ? { fontSize: size } : null),
      }}
    >
      {children}
    </Text>
  );
}
