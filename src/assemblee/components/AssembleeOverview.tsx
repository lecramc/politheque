import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
import { CompositionChart } from '@/src/assemblee/components/CompositionChart';
import { GroupSwatch } from '@/src/assemblee/components/GroupSwatch';
import { MajorVotesGrid } from '@/src/assemblee/components/MajorVotesGrid';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { assembleeOverviewViewModel } from '@/src/assemblee/view-models/assemblee-overview.view-model';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Card } from '@/src/programmes/components/Card';

/**
 * Vue d'ensemble, avant la liste des votes : qui siège aujourd'hui, qui vote quoi sur les grands
 * votes, l'entrée vers la leçon sur la loi. Aucune décision ici : l'écran affiche ce que le
 * view-model donne, même forme pour tous les groupes.
 */
export function AssembleeOverview() {
  const vm = useViewModel(assembleeOverviewViewModel);
  const { colors, effects, fonts } = useTheme();
  const small = { fontSize: 14, lineHeight: 21, color: colors.text.secondary } as const;

  return (
    <>
      {vm.sitting ? (
        <View style={{ gap: effects.spacing.sm }}>
          <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
            {vm.sitting.title}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
            {vm.sitting.lead}
          </Text>
          <CompositionChart scene={vm.sitting.scene} label={vm.sitting.chartLabel} />
          <View
            style={{
              padding: effects.spacing.sm,
              borderRadius: effects.borderRadius.small,
              backgroundColor: colors.tintSoft,
              gap: effects.spacing.xxs,
            }}
          >
            <Text style={{ ...fonts.bold, fontSize: 16 }}>{vm.sitting.majority}</Text>
            <Text style={{ fontSize: 15, lineHeight: 22 }}>{vm.sitting.sentence}</Text>
          </View>
          <View role="list" aria-label={vm.sitting.listLabel}>
            {vm.sitting.rows.map((row, index) => (
              <View
                key={row.index}
                role="listitem"
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: effects.spacing.sm,
                  paddingVertical: effects.spacing.xs,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: colors.surface.border.primary,
                }}
              >
                <View
                  style={{
                    width: 92,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: effects.spacing.xs,
                  }}
                >
                  <GroupSwatch color={row.color} lineHeight={22} />
                  <Text style={{ ...fonts.bold, fontSize: 15, lineHeight: 22 }}>{row.abrev}</Text>
                </View>
                <Text style={{ fontSize: 15, lineHeight: 22, flex: 1, minWidth: 0 }}>
                  {row.libelle}
                </Text>
                <Text plainDigits style={{ fontSize: 15, lineHeight: 22 }}>
                  {row.seatsLabel}
                </Text>
              </View>
            ))}
          </View>
          {vm.sitting.vacant ? <Text style={small}>{vm.sitting.vacant}</Text> : null}
          <Text style={small}>{vm.sitting.note}</Text>
          <Only from="md">
            <Text style={small}>{COPY.hemicycle.labelsWide}</Text>
          </Only>
          <Only below="md">
            <Text style={small}>{COPY.hemicycle.labelsSmall}</Text>
          </Only>
        </View>
      ) : null}

      {vm.grid ? (
        <View style={{ gap: effects.spacing.sm }}>
          <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
            {vm.grid.title}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.text.secondary }}>
            {vm.grid.lead}
          </Text>
          <MajorVotesGrid grid={vm.grid} />
          <Text style={small}>{vm.grid.note}</Text>
          <Text style={small}>{vm.grid.shared}</Text>
        </View>
      ) : null}

      {vm.law ? (
        <Card>
          <Text style={{ ...fonts.bold, fontSize: 17 }} headingLevel={2}>
            {vm.law.title}
          </Text>
          <Text style={{ fontSize: 16, color: colors.text.secondary }}>{vm.law.text}</Text>
          <TextLink href={vm.law.href} standalone>
            {`${vm.law.cta} →`}
          </TextLink>
        </Card>
      ) : null}

      <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
        {vm.allVotesTitle}
      </Text>
    </>
  );
}
