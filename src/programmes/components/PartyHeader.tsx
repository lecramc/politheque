import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import {
  beforeParenthesis,
  firstSentence,
  formatSourceDate,
} from '@/src/programmes/models/presentation.service';
import type { Candidacy, Party } from '@/src/programmes/models/programme.model';

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, effects } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1.5,
        borderColor: colors.surface.border.tertiary,
        backgroundColor: colors.surface.primary,
      }}
    >
      <Text>{label}</Text>
      <Icon name="information-circle-outline" variant="onGlass" size="small" />
    </Pressable>
  );
}

/** En-tête commun aux quatre pages d'une fiche : le h1 est le nom du parti (l'entité). */
export function PartyHeader({
  party,
  candidacy,
  onOpenFamily,
  onOpenCandidate,
}: {
  party: Party;
  candidacy: Candidacy | null;
  onOpenFamily: () => void;
  onOpenCandidate: () => void;
}) {
  const { colors } = useTheme();
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <PartyDot color={party.color} size={64} label={party.shortName} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="title" style={{ fontSize: 28, lineHeight: 33 }}>
            {party.name}
          </Text>
          <Text style={{ color: colors.text.secondary }}>{firstSentence(party.description)}</Text>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Chip label={`Famille : ${beforeParenthesis(party.family)}`} onPress={onOpenFamily} />
        {candidacy ? (
          <Chip label={`Candidature 2027 : ${candidacy.candidateName}`} onPress={onOpenCandidate} />
        ) : null}
        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
          Fiche vérifiée le {formatSourceDate(party.lastVerified)}
        </Text>
      </View>
    </>
  );
}
