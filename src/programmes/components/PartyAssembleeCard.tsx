import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import type { PartyAssembleePanel } from '@/src/assemblee/models/party-assemblee';
import { Card } from '@/src/programmes/components/Card';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';

/**
 * Encart « À l'Assemblée » de la fiche : le même pour les dix partis. Avec un groupe : pastille
 * officielle, nom, effectif, position sur les derniers grands votes, lien vers `/assemblee`.
 * Sans groupe : une phrase. Tout est décidé dans le view-model ; ici, on affiche.
 */
export function PartyAssembleeCard({ panel }: { panel: PartyAssembleePanel }) {
  const { colors, effects, fonts } = useTheme();

  if (panel.kind === 'none') {
    return (
      <Card>
        <SectionTitle>{panel.title}</SectionTitle>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>{panel.text}</Text>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle>{panel.title}</SectionTitle>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: effects.spacing.xs }}>
        <GroupSwatch color={panel.color} size={16} lineHeight={24} />
        <Text style={{ ...fonts.bold, fontSize: 16, lineHeight: 24, flexShrink: 1 }}>
          {`${panel.name} · ${panel.count}`}
        </Text>
      </View>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {`${panel.note} ${panel.updatedLine}`}
      </Text>
      {panel.votes.length > 0 ? (
        <View role="list" aria-label={panel.votesLabel} style={{ gap: effects.spacing.sm }}>
          <Text variant="label">{panel.votesTitle}</Text>
          {panel.votes.map((vote) => (
            <View
              key={vote.numero}
              role="listitem"
              style={{ gap: effects.spacing.xxs, paddingTop: effects.spacing.xs }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}>
                {vote.position.glyph ? <VoteGlyph glyph={vote.position.glyph} size={18} /> : null}
                {!vote.position.glyph && vote.position.symbol ? (
                  <Text aria-hidden style={{ fontSize: 16, lineHeight: 18 }}>
                    {vote.position.symbol}
                  </Text>
                ) : null}
                <Text style={{ ...fonts.bold, fontSize: 15 }}>{vote.position.label}</Text>
              </View>
              <TextLink href={vote.href}>{vote.title}</TextLink>
              <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                {`${vote.date} · ${vote.resultat}`}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <TextLink href={panel.all.href} standalone>
        {`${panel.all.label} →`}
      </TextLink>
    </Card>
  );
}
