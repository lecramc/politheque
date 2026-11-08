import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Arc } from '@/src/programmes/components/Arc';

/** En-tête d'une page d'étape : arc « 4 sur 10 », « ÉTAPE 3 SUR 6 », titre et introduction. */
export function StepHeader({
  index,
  total,
  title,
  intro,
  ratio,
  readCount,
  itemTotal,
}: {
  index: number;
  total: number;
  title: string;
  intro: string;
  ratio: number;
  readCount: number;
  itemTotal: number;
}) {
  const { colors, effects, fonts } = useTheme();
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.md }}>
        <Arc
          value={ratio}
          size={96}
          strokeWidth={10}
          accessibilityLabel={`${readCount} sur ${itemTotal}`}
        >
          <Text style={{ ...fonts.displayBold, fontSize: 26, color: colors.tint }}>
            {readCount}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>sur {itemTotal}</Text>
        </Arc>
        <View style={{ flex: 1, gap: effects.spacing.xxs }}>
          <Text variant="caption">
            Étape {index} sur {total}
          </Text>
          <Text variant="title" style={{ fontSize: 30, lineHeight: 36 }}>
            {title}
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.text.secondary, fontSize: 17 }}>{intro}</Text>
    </View>
  );
}
