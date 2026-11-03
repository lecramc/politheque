import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { Source } from '@/src/programmes/models/programme.model';
import { verificationLevel } from '@/src/programmes/models/verification.service';

const LABEL = {
  croisee: '● Recoupée',
  'source-unique': '◐ Source unique',
  'non-sourcee': '○ Non sourcée',
} as const;

/** Niveau de recoupement d'une information : affiché partout, calculé, jamais saisi à la main. */
export function VerificationBadge({ sources }: { sources: Source[] }) {
  const { colors, effects } = useTheme();
  const level = verificationLevel(sources);
  const count = sources.length > 1 ? ` · ${sources.length} sources` : '';
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderStyle: level === 'croisee' ? 'solid' : 'dashed',
        borderColor: colors.text.secondary,
        borderRadius: effects.borderRadius.round,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Text style={{ fontSize: 12, color: colors.text.secondary }}>
        {LABEL[level]}
        {count}
      </Text>
    </View>
  );
}
