import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { tv } from '@/src/core/web/tv';

export interface AnchorItem {
  /** Identifiant de l'ancre : le bloc cible porte `nativeID` avec la même valeur. */
  id: string;
  label: string;
}

/** Sommaire d'ancres du rail (« Sur cette page »). Web uniquement : de vrais liens `#ancre`. */
export function AnchorList({
  items,
  title = 'Sur cette page',
}: {
  items: AnchorItem[];
  title?: string;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View role="navigation" aria-label={title} style={{ gap: effects.spacing.xs }}>
      <Text variant="caption">{title}</Text>
      {items.map((item) => (
        <Text
          key={item.id}
          role="link"
          {...tv('text-link', 'text-link-block')}
          {...({ href: `#${item.id}` } as object)}
          style={{
            ...fonts.regular,
            fontSize: 15,
            lineHeight: 22,
            paddingVertical: 6,
            color: colors.tint,
            textDecorationLine: 'underline',
          }}
        >
          {item.label}
        </Text>
      ))}
    </View>
  );
}
