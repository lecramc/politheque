import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { StanceVote } from '@/src/assemblee/models/stance-votes';

/**
 * Bloc « À l'Assemblée » sous la justification d'une position : une ligne par vote cité en
 * source. Même forme de siège et mêmes mots que la grille de `/assemblee` ; le libellé est
 * toujours écrit, la forme ne porte jamais seule la position. Tout est décidé dans le modèle.
 */
export function StanceVotes({ votes }: { votes: StanceVote[] }) {
  const { colors, effects, fonts } = useTheme();
  if (votes.length === 0) return null;
  return (
    <View
      style={{
        gap: effects.spacing.xs,
        paddingTop: effects.spacing.sm,
        borderTopWidth: 1,
        borderColor: colors.surface.border.primary,
      }}
    >
      <Text variant="label">{COPY.stanceVotes.title}</Text>
      {votes.map((vote) => (
        <View
          key={vote.numero}
          aria-label={COPY.stanceVotes.listLabel(vote.groupName)}
          style={{ gap: effects.spacing.xxs }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}>
            {vote.position.glyph ? (
              <VoteGlyph glyph={vote.position.glyph} size={18} />
            ) : vote.position.symbol ? (
              <Text aria-hidden style={{ fontSize: 16, lineHeight: 18 }}>
                {vote.position.symbol}
              </Text>
            ) : null}
            <Text style={{ ...fonts.bold, fontSize: 15 }}>{vote.position.label}</Text>
            <Text style={{ fontSize: 13, color: colors.text.secondary, flexShrink: 1 }}>
              {`· ${vote.groupName}`}
            </Text>
          </View>
          <TextLink href={vote.href}>{vote.title}</TextLink>
          <Text style={{ fontSize: 13, color: colors.text.secondary }}>
            {`${vote.date} · ${vote.resultat} · ${vote.detail}`}
          </Text>
        </View>
      ))}
    </View>
  );
}
