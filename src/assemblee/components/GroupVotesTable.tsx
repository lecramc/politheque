import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { t } from '@/src/assemblee/i18n/translate';
import type { GroupRow, GroupTable } from '@/src/assemblee/models/group-table';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';

const MIN_WIDTH = 560;
const NUMBER_WIDTH = 78;

type Column = { id: string; label: string; value: (row: GroupRow) => number };

const columnsOf = (kind: GroupTable['kind']): Column[] =>
  kind === 'censure'
    ? [
        { id: 'membres', label: t('groups.members'), value: (r) => r.membres },
        { id: 'pour', label: t('groups.pour'), value: (r) => r.pour },
        { id: 'noVote', label: t('groups.noVote'), value: (r) => r.nePasVote },
        { id: 'nonVotant', label: t('groups.nonVotant'), value: (r) => r.nonVotants },
      ]
    : [
        { id: 'membres', label: t('groups.members'), value: (r) => r.membres },
        { id: 'pour', label: t('groups.pour'), value: (r) => r.pour },
        { id: 'contre', label: t('groups.contre'), value: (r) => r.contre },
        { id: 'abstention', label: t('groups.abstention'), value: (r) => r.abstentions },
        { id: 'nonVotant', label: t('groups.nonVotant'), value: (r) => r.nonVotants },
      ];

/**
 * Tableau des groupes : pré-rendu dans le HTML (c'est l'alternative textuelle complète du
 * schéma). Libellé officiel et abréviation ; ordre des places par défaut, tri alphabétique en
 * option. Une fois le schéma prêt (`interactive`), le nom du groupe met ses sièges en évidence.
 * Le tableau défile dans son cadre sur un écran étroit, jamais la page.
 */
export function GroupVotesTable({
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
  const [frame, setFrame] = useState(0);
  const columns = columnsOf(table.kind);
  const border = { borderTopWidth: 1, borderColor: colors.surface.border.primary };

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

  return (
    <View style={{ gap: effects.spacing.sm }}>
      <Text style={{ fontSize: 15, color: colors.text.secondary }}>{t('groups.caption')}</Text>
      <View
        role="group"
        aria-label={t('groups.sortLabel')}
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
      >
        {orderChip('places', t('groups.sortPlaces'))}
        {orderChip('alphabetique', t('groups.sortAlpha'))}
      </View>
      <ScrollView
        horizontal
        // Barre de défilement seulement si le cadre est plus étroit que le tableau (mobile).
        showsHorizontalScrollIndicator={frame > 0 && frame < MIN_WIDTH}
        onLayout={(e) => setFrame(e.nativeEvent.layout.width)}
        contentContainerStyle={{ minWidth: '100%' }}
        style={{
          borderWidth: 1,
          borderColor: colors.surface.border.primary,
          borderRadius: effects.borderRadius.small,
          backgroundColor: colors.surface.primary,
        }}
      >
        <View
          role="table"
          aria-label={t('groups.caption')}
          style={{ minWidth: MIN_WIDTH, flexGrow: 1 }}
        >
          <View
            role="row"
            style={{ flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 }}
          >
            <Text role="columnheader" variant="label" style={{ flex: 1, minWidth: 0 }}>
              {t('groups.group')}
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
          {table.rows.map((row) => {
            const selected = highlight === row.index;
            return (
              <View
                key={row.index}
                role="row"
                style={[
                  border,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    backgroundColor: selected ? colors.tintSoft : 'transparent',
                  },
                ]}
              >
                <View role="rowheader" style={{ flex: 1, minWidth: 0 }}>
                  {interactive ? (
                    <Pressable
                      onPress={() => onSelect(selected ? null : row.index)}
                      accessibilityRole="button"
                      accessibilityLabel={t('groups.select', { groupe: row.libelle })}
                      accessibilityState={{ selected }}
                      style={{ minHeight: 44, justifyContent: 'center' }}
                    >
                      <GroupLabel row={row} />
                    </Pressable>
                  ) : (
                    <GroupLabel row={row} />
                  )}
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
            );
          })}
        </View>
      </ScrollView>
      {table.kind === 'censure' ? (
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          {t('scrutin.censureNote')}
        </Text>
      ) : null}
      <Text style={{ fontSize: 14, color: colors.text.secondary }}>{t('groups.note')}</Text>
    </View>
  );
}

function GroupLabel({ row }: { row: GroupRow }) {
  const { colors, fonts } = useTheme();
  return (
    <Text style={{ fontSize: 15, lineHeight: 21, color: colors.text.primary }}>
      {row.libelle}
      {/* Libellé officiel complet + abréviation ; une seule fois quand l'organe n'a que son sigle. */}
      {row.abrev !== row.libelle ? (
        <Text style={{ ...fonts.bold, fontSize: 15 }}>{` (${row.abrev})`}</Text>
      ) : null}
    </Text>
  );
}
