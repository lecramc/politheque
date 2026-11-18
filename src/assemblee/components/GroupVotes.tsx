import React from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';
import { VoteBar } from '@/src/assemblee/components/VoteBar';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import {
  groupTableColumns,
  type GroupRow,
  type GroupTable,
} from '@/src/assemblee/models/group-table';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';
import { Accordion } from '@/src/programmes/components/Accordion';

const TABLE_MIN_WIDTH = 640;
const NUMBER_WIDTH = 84;

/**
 * Le vote de chaque groupe : une ligne par groupe, sans défilement horizontal. Nom, nombre de
 * députés, barre empilée (mêmes formes que les sièges) et une phrase qui ne cite que les positions
 * non nulles dans un ordre fixe. Aucune position « majoritaire ». Le tableau chiffré complet est
 * dans un accordéon, où il peut défiler. Un seul ordre des groupes : celui de la page.
 */
export function GroupVotes({
  table,
  order,
  onOrderChange,
  highlight,
  onSelect,
  interactive,
}: {
  table: GroupTable;
  order: GroupeOrder;
  onOrderChange: (order: GroupeOrder) => void;
  highlight: number | null;
  onSelect: (groupe: number | null) => void;
  interactive: boolean;
}) {
  const { colors, effects, fonts } = useTheme();

  const orderChip = (id: GroupeOrder, label: string) => {
    const active = order === id;
    return (
      <Pressable
        key={id}
        onPress={() => onOrderChange(id)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          minHeight: 44,
          justifyContent: 'center',
          paddingHorizontal: 14,
          borderRadius: effects.borderRadius.round,
          borderWidth: 1.5,
          borderColor: active ? colors.tint : colors.surface.border.tertiary,
          backgroundColor: active ? colors.tintSoft : 'transparent',
        }}
      >
        <Text style={active ? { ...fonts.bold, color: colors.tint } : undefined}>{label}</Text>
      </Pressable>
    );
  };

  const content = (row: GroupRow, selected: boolean) => (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <GroupSwatch color={row.color} />
        <Text
          style={{
            ...fonts.semibold,
            fontSize: 16,
            lineHeight: 22,
            color: colors.text.primary,
            flex: 1,
            minWidth: 0,
          }}
        >
          {row.title}
        </Text>
      </View>
      <VoteBar segments={row.bar} />
      <Text plainDigits style={{ fontSize: 15, lineHeight: 22, color: colors.text.primary }}>
        {row.sentence}
      </Text>
      {selected ? (
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          {COPY.groups.selectedHint}
        </Text>
      ) : null}
    </View>
  );

  const columns = groupTableColumns(table.kind);

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <View
        role="group"
        aria-label={COPY.groups.sortLabel}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
      >
        {orderChip('places', COPY.groups.sortPlaces)}
        {orderChip('alphabetique', COPY.groups.sortAlpha)}
      </View>

      <View
        role="list"
        style={{
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.surface.primary,
          overflow: 'hidden',
        }}
      >
        {table.rows.map((row, index) => {
          const selected = highlight === row.index;
          const rowStyle = {
            paddingVertical: 10,
            paddingHorizontal: effects.spacing.md,
            borderTopWidth: index === 0 ? 0 : 1,
            borderColor: colors.surface.border.primary,
            backgroundColor: selected ? colors.tintSoft : 'transparent',
          };
          return (
            <View key={row.index} role="listitem">
              {interactive ? (
                <Pressable
                  large
                  onPress={() => onSelect(selected ? null : row.index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${row.title}. ${row.sentence}`}
                  accessibilityHint={COPY.groups.select(row.name)}
                  accessibilityState={{ selected }}
                  style={{ ...rowStyle, minHeight: 44 }}
                >
                  {content(row, selected)}
                </Pressable>
              ) : (
                <View style={rowStyle}>{content(row, false)}</View>
              )}
            </View>
          );
        })}
      </View>

      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
        {COPY.groups.note}
      </Text>

      <Accordion title={COPY.groups.tableToggle} headingLevel={3}>
        <ScrollView
          horizontal
          contentContainerStyle={{ minWidth: '100%' }}
          style={{
            borderWidth: 1,
            borderColor: colors.surface.border.primary,
            borderRadius: effects.borderRadius.small,
          }}
        >
          <View role="table" aria-label={COPY.groups.caption} style={{ minWidth: TABLE_MIN_WIDTH }}>
            <View
              role="row"
              style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Text role="columnheader" variant="label" style={{ flex: 1, minWidth: 0 }}>
                {COPY.groups.group}
              </Text>
              {columns.map((column) => (
                <Text
                  key={column.id}
                  role="columnheader"
                  variant="label"
                  style={{ width: NUMBER_WIDTH, textAlign: 'right' }}
                >
                  {column.label}
                </Text>
              ))}
            </View>
            {table.rows.map((row) => (
              <View
                key={row.index}
                role="row"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderTopWidth: 1,
                  borderColor: colors.surface.border.primary,
                }}
              >
                <View
                  role="rowheader"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <GroupSwatch color={row.color} />
                  <Text style={{ flex: 1, minWidth: 0, fontSize: 15 }}>{row.name}</Text>
                </View>
                {columns.map((column) => (
                  <Text
                    key={column.id}
                    role="cell"
                    plainDigits
                    style={{ width: NUMBER_WIDTH, textAlign: 'right', fontSize: 15 }}
                  >
                    {column.value(row)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </Accordion>
    </View>
  );
}
