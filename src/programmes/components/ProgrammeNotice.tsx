import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { ProgrammeNotice as Notice } from '@/src/programmes/models/programme-publication.service';

/**
 * État de la publication du programme 2027, en tête de l'onglet Programme : même carte pour les
 * trois états (pas encore publié, publié en partie, publié) : titre, une ligne, détail replié,
 * sources. Tout le texte vient du modèle.
 */
export function ProgrammeNotice({ notice }: { notice: Notice }) {
  const { effects } = useTheme();
  return (
    <Card style={{ gap: effects.spacing.xs }}>
      <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
        {notice.title}
      </Text>
      {notice.text ? <Text style={{ fontSize: 16, lineHeight: 25 }}>{notice.text}</Text> : null}
      {notice.detail ? (
        <Accordion title="Détail de la publication" flat last>
          <Text style={{ fontSize: 15, lineHeight: 23 }}>{notice.detail}</Text>
        </Accordion>
      ) : null}
      <View style={{ alignSelf: 'flex-start' }}>
        <SourceChip sources={notice.sources} subject={notice.title} />
      </View>
      {notice.positionsLink ? (
        <TextLink href={notice.positionsLink.href} standalone>
          {notice.positionsLink.label}
        </TextLink>
      ) : null}
    </Card>
  );
}
