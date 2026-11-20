import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import type { VotesGridView } from '@/src/assemblee/models/major-votes';

/**
 * Un seul vote, en format compact : son titre, sa date et son résultat, puis une tuile par groupe
 * (pastille de couleur officielle, sigle, forme et mot de la position), qui passent à la ligne.
 * Mêmes données, mêmes formes et même ordre des groupes que la grille de `/assemblee`.
 */
export function SingleVoteGroups({ grid }: { grid: VotesGridView }) {
  const { colors, effects, fonts } = useTheme();
  const column = grid.columns[0];
  if (!column) return null;

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View style={{ gap: effects.spacing.xxs }}>
        <Text style={{ fontSize: 13, color: colors.text.secondary }}>{column.date}</Text>
        <TextLink href={column.href} standalone>
          {column.title}
        </TextLink>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xxs }}>
          <Icon
            name={column.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
            variant="secondary"
            size="small"
          />
          <Text style={{ ...fonts.bold, fontSize: 14 }}>{column.resultat}</Text>
        </View>
      </View>
      <View
        role="list"
        aria-label={grid.caption}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
      >
        {grid.rows.map((row) => {
          const cell = row.cells[0];
          return (
            <View
              key={row.index}
              role="listitem"
              aria-label={grid.cellLabel(row.name, cell.label)}
              style={{
                minWidth: 150,
                flexGrow: 1,
                flexBasis: 150,
                flexDirection: 'row',
                alignItems: 'center',
                gap: effects.spacing.xs,
                paddingHorizontal: effects.spacing.sm,
                paddingVertical: effects.spacing.xs,
                borderWidth: 1,
                borderColor: colors.surface.border.primary,
                borderRadius: effects.borderRadius.xs,
                backgroundColor: colors.surface.primary,
              }}
            >
              <GroupSwatch color={row.color} lineHeight={20} />
              <Text style={{ ...fonts.bold, fontSize: 14, lineHeight: 20 }}>{row.abrev}</Text>
              <View style={{ flex: 1 }} />
              {cell.glyph ? <VoteGlyph glyph={cell.glyph} size={16} /> : null}
              <Text style={{ fontSize: 14 }}>{cell.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
