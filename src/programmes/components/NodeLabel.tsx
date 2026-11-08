import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Stamp } from '@/src/programmes/components/Stamp';

/** Textes d'une étape : « ÉTAPE 3 », titre, mini-tampon, méta, pastille d'action. */
export function NodeLabel({
  index,
  title,
  meta,
  cta,
  stamped,
  hideMeta = false,
}: {
  index: number;
  title: string;
  meta: string;
  cta: string | null;
  stamped: boolean;
  /** Variante carte : la méta est affichée à part, à droite. */
  hideMeta?: boolean;
}) {
  const { colors, fonts, effects } = useTheme();
  return (
    <View style={{ flex: 1, gap: effects.spacing.xxs }}>
      <Text variant="caption" style={{ fontSize: 12 }}>
        Étape {index}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}>
        <Text style={{ ...fonts.display, fontSize: 20, lineHeight: 25, flexShrink: 1 }}>
          {title}
        </Text>
        {stamped ? <Stamp state="stamped" size="mini" /> : null}
      </View>
      {hideMeta ? null : <Text style={{ color: colors.text.secondary }}>{meta}</Text>}
      {cta ? (
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: effects.spacing.xxs,
            marginTop: 4,
            minHeight: 36,
            paddingHorizontal: 14,
            borderRadius: effects.borderRadius.round,
            backgroundColor: colors.tint,
          }}
        >
          <Text style={{ ...fonts.bold, color: colors.text.onColor }}>{cta}</Text>
          <Icon name="chevron-forward" variant="onColor" size="small" />
        </View>
      ) : null}
    </View>
  );
}
