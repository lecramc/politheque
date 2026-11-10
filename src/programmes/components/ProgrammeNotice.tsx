import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Card } from '@/src/programmes/components/Card';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { ProgrammeNotice as Notice } from '@/src/programmes/models/programme-publication.service';

/**
 * Publication du programme 2027, en tête de l'onglet Programme : « Programme 2027 pas encore
 * publié » (même gabarit pour tous les partis concernés) ou l'état de la publication d'un
 * programme partiel, toujours avec ses sources.
 */
export function ProgrammeNotice({ notice }: { notice: Notice }) {
  const { effects } = useTheme();
  return (
    <Card style={{ gap: effects.spacing.xs }}>
      {notice.title ? (
        <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
          {notice.title}
        </Text>
      ) : null}
      {notice.text ? <Text style={{ fontSize: 16, lineHeight: 25 }}>{notice.text}</Text> : null}
      <View style={{ alignSelf: 'flex-start' }}>
        <SourceChip
          sources={notice.sources}
          subject={notice.title ?? 'Publication du programme 2027'}
        />
      </View>
    </Card>
  );
}
