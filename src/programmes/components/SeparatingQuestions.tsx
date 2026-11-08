import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Only } from '@/src/core/components/Only';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { displayName } from '@/src/programmes/models/presentation.service';
import type { Party, Stance } from '@/src/programmes/models/programme.model';

export interface SeparatingItem {
  id: string;
  statement: string;
  userLabel: string;
  positions: { name: string; party: Party; stance: Stance }[];
}

const CELL = 132;
const YOU = 150;

/**
 * « Ce qui les départage » en version compacte (2 ou 3 partis) : à partir de 768 px, un bloc de
 * deux lignes par question (affirmation pleine largeur, puis « Vous » et une colonne de largeur
 * fixe par parti, alignées sous l'en-tête), des blocs empilés en dessous. Les partis
 * sont dans l'ordre de la liste reçue (alphabétique), jamais selon leur position.
 */
export function SeparatingQuestions({ items }: { items: SeparatingItem[] }) {
  const { colors, effects, fonts } = useTheme();
  const parties = items[0]?.positions.map((p) => p.party) ?? [];
  const border = { borderTopWidth: 1, borderTopColor: colors.surface.border.tertiary };
  return (
    <View>
      <Only from="md" style={{ gap: effects.spacing.xs }}>
        <View style={{ flexDirection: 'row', gap: effects.spacing.sm, alignItems: 'center' }}>
          <View style={{ width: YOU }} />
          {parties.map((party) => (
            <View
              key={party.id}
              style={{ width: CELL, flexDirection: 'row', gap: 6, alignItems: 'center' }}
            >
              <PartyDot color={party.color} size={24} label={party.shortName} />
              <Text style={{ ...fonts.bold, fontSize: 14, flexShrink: 1 }} numberOfLines={1}>
                {displayName(party)}
              </Text>
            </View>
          ))}
        </View>
        {items.map((item) => (
          <View
            key={item.id}
            style={{
              ...border,
              gap: effects.spacing.xs,
              paddingTop: effects.spacing.sm,
              paddingBottom: effects.spacing.sm,
            }}
          >
            <Text style={fonts.bold}>{item.statement}</Text>
            <View style={{ flexDirection: 'row', gap: effects.spacing.sm, alignItems: 'center' }}>
              <Text variant="secondary" style={{ width: YOU }}>
                Vous : {item.userLabel}
              </Text>
              {item.positions.map((position) => (
                <View key={position.party.id} style={{ width: CELL }}>
                  <StanceBadge stance={position.stance} variant="cell" />
                </View>
              ))}
            </View>
          </View>
        ))}
      </Only>
      <Only below="md" style={{ gap: effects.spacing.sm }}>
        {items.map((item) => (
          <View
            key={item.id}
            style={{ ...border, gap: effects.spacing.xs, paddingTop: effects.spacing.xs }}
          >
            <Text style={fonts.bold}>{item.statement}</Text>
            <Text variant="secondary">Vous : {item.userLabel}</Text>
            {item.positions.map((position) => (
              <View
                key={position.party.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}
              >
                <PartyDot color={position.party.color} size={24} label={position.party.shortName} />
                <Text style={{ flex: 1, fontSize: 14 }}>{displayName(position.party)}</Text>
                <View style={{ width: CELL }}>
                  <StanceBadge stance={position.stance} variant="cell" />
                </View>
              </View>
            ))}
          </View>
        ))}
      </Only>
    </View>
  );
}
