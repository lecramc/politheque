import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { Card } from '@/src/programmes/components/Card';
import { LabelsLink } from '@/src/programmes/components/LabelsLink';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { PartyLabelsDetail } from '@/src/programmes/components/PartyLabelsDetail';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import type { OtherPartyCard as OtherPartyCardData } from '@/src/programmes/models/other-parties.service';

/**
 * Carte courte d'un parti présentant un candidat, sans fiche détaillée. Même gabarit pour tous :
 * pastille neutre (jamais de couleur de parti), nom, candidat, les deux étiquettes, description.
 */
export function OtherPartyCard({ card }: { card: OtherPartyCardData }) {
  const { colors, effects, fonts } = useTheme();
  const [labelsOpen, setLabelsOpen] = useState(false);
  return (
    <Card style={{ gap: effects.spacing.xs, flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.smd }}>
        <PartyDot color={colors.surface.border.tertiary} size={36} label={card.name} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="display" headingLevel={3} style={{ fontSize: 18, lineHeight: 24 }}>
            {card.name}
          </Text>
          {card.identity ? (
            <Text style={{ fontSize: 14, color: colors.text.secondary }}>{card.identity}</Text>
          ) : null}
        </View>
      </View>
      <Text style={{ fontSize: 15 }}>
        {'Candidature : '}
        <TextLink href={card.candidateHref}>{card.candidateName}</TextLink>
      </Text>
      <View>
        <View style={{ gap: effects.spacing.xxs }}>
          {card.labels.map((line) => (
            <Text key={line.id} style={{ fontSize: 14, color: colors.text.secondary }}>
              {`${line.title} : `}
              <Text style={{ ...fonts.bold, fontSize: 14, color: colors.text.primary }}>
                {line.value}
              </Text>
            </Text>
          ))}
        </View>
        {card.detail ? <LabelsLink onPress={() => setLabelsOpen(true)} /> : null}
      </View>
      <Text style={{ fontSize: 15, lineHeight: 22 }}>{card.description}</Text>
      <View style={{ marginTop: 'auto' }}>
        <SourceChip sources={card.sources} subject={card.name} />
      </View>
      {card.detail ? (
        <Sheet
          isOpen={labelsOpen}
          onClose={() => setLabelsOpen(false)}
          title={`Classements : ${card.name}`}
        >
          <PartyLabelsDetail detail={card.detail} onNavigate={() => setLabelsOpen(false)} />
        </Sheet>
      ) : null}
    </Card>
  );
}
