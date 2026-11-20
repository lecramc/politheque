import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import type { VotesGridView } from '@/src/assemblee/models/major-votes';

const FIRST_COLUMN = 112;
const COLUMN = 148;

/**
 * « Qui vote quoi » : un groupe par ligne (de la gauche à la droite), un grand vote par colonne.
 * Chaque case dit la position en toutes lettres avec une forme ; la pastille devant le sigle est
 * la couleur officielle du groupe (jamais la seule information : le sigle est écrit). Sur
 * mobile le tableau défile horizontalement, seul ; la colonne des groupes reste en place.
 */
export function MajorVotesGrid({ grid }: { grid: VotesGridView }) {
  const { colors, effects, fonts } = useTheme();
  const border = colors.surface.border.primary;
  const stickyStyle = { position: 'sticky', left: 0, zIndex: 1 } as never;

  return (
    <View style={{ gap: effects.spacing.xs }}>
      <View
        role="group"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: effects.spacing.md,
          rowGap: effects.spacing.xs,
        }}
      >
        {grid.legend.map((entry) => (
          <View
            key={entry.kind}
            style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}
          >
            {entry.glyph ? <VoteGlyph glyph={entry.glyph} size={18} /> : null}
            <Text style={{ fontSize: 14 }}>{entry.label}</Text>
          </View>
        ))}
      </View>
      {/* Zone défilante : nom accessible et accès au clavier (flèches) pour voir toutes les colonnes. */}
      <ScrollView
        horizontal
        role="region"
        aria-label={grid.caption}
        tabIndex={0}
        contentContainerStyle={{ minWidth: '100%' }}
        style={{
          borderWidth: 1,
          borderColor: border,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.surface.primary,
        }}
      >
        <View
          role="table"
          aria-label={grid.caption}
          style={{ minWidth: FIRST_COLUMN + COLUMN * grid.columns.length }}
        >
          <View role="row" style={{ flexDirection: 'row' }}>
            <View
              role="columnheader"
              style={[
                {
                  width: FIRST_COLUMN,
                  padding: effects.spacing.sm,
                  justifyContent: 'flex-end',
                  backgroundColor: colors.surface.primary,
                },
                stickyStyle,
              ]}
            >
              <Text variant="label">{grid.groupHeader}</Text>
            </View>
            {grid.columns.map((column) => (
              <View key={column.numero} role="columnheader" style={{ width: COLUMN }}>
                <Link href={column.href as never} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={grid.open(column.fullTitle)}
                    style={{ flex: 1, gap: effects.spacing.xxs, padding: effects.spacing.sm }}
                  >
                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                      {column.date}
                    </Text>
                    <Text numberOfLines={6} style={{ fontSize: 13, lineHeight: 18 }}>
                      {column.title}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: effects.spacing.xxs,
                      }}
                    >
                      <Icon
                        name={column.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
                        variant="secondary"
                        size="small"
                      />
                      <Text style={{ ...fonts.bold, fontSize: 13 }}>{column.resultat}</Text>
                    </View>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
          {grid.rows.map((row) => (
            <View
              key={row.index}
              role="row"
              style={{ flexDirection: 'row', borderTopWidth: 1, borderColor: border }}
            >
              <View
                role="rowheader"
                accessibilityLabel={row.name}
                style={[
                  {
                    width: FIRST_COLUMN,
                    padding: effects.spacing.sm,
                    justifyContent: 'center',
                    backgroundColor: colors.surface.primary,
                  },
                  stickyStyle,
                ]}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: effects.spacing.xs,
                  }}
                >
                  <GroupSwatch color={row.color} lineHeight={20} />
                  <Text style={{ ...fonts.bold, fontSize: 14, lineHeight: 20 }}>{row.abrev}</Text>
                </View>
              </View>
              {row.cells.map((cell, i) => (
                <View
                  key={grid.columns[i].numero}
                  role="cell"
                  aria-label={grid.cellLabel(row.name, cell.label)}
                  style={{
                    width: COLUMN,
                    minHeight: 48,
                    paddingHorizontal: effects.spacing.sm,
                    paddingVertical: effects.spacing.xs,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: effects.spacing.xs,
                  }}
                >
                  {cell.glyph ? <VoteGlyph glyph={cell.glyph} size={18} /> : null}
                  <Text style={{ fontSize: 14, flexShrink: 1 }}>{cell.label}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
