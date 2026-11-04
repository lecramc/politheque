import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Arc } from '@/src/programmes/components/Arc';
import { Page } from '@/src/programmes/components/Page';
import { daysUntil, formatLongDate, nextRound } from '@/src/programmes/models/election.service';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { electionsViewModel } from '@/src/programmes/view-models/elections.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';

const metaViewModel = pageMetaViewModel((catalog) => rubricMeta('elections', catalog));

export default function ElectionsScreen() {
  const vm = useViewModel(electionsViewModel);
  const meta = useViewModel(metaViewModel);
  const { colors, effects, fonts } = useTheme();
  const now = new Date();

  return (
    <Page meta={meta} loading={vm.status !== 'loaded'}>
      <View style={{ gap: 6 }}>
        <Text variant="title">Les élections</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 17 }}>
          Le calendrier, les règles et les candidatures.
        </Text>
      </View>

      {vm.elections.map((election) => {
        const round = nextRound(election, now);
        const days = round ? daysUntil(round.date, now) : null;
        return (
          <Link
            key={election.id}
            href={{ pathname: '/elections/[id]', params: { id: election.id } }}
            asChild
          >
            <Pressable
              large
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: effects.spacing.md,
                borderRadius: effects.borderRadius.small,
                backgroundColor: colors.tintSoft,
                borderWidth: 1,
                borderColor: colors.tintBorder,
              }}
            >
              {days !== null ? (
                <Arc
                  value={1 - days / 365}
                  size={96}
                  strokeWidth={10}
                  accessibilityLabel={`${election.title} : dans ${days} jours`}
                >
                  <Text style={{ ...fonts.displayBold, fontSize: 22, color: colors.tint }}>
                    {days} j
                  </Text>
                </Arc>
              ) : null}
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="caption">
                  {
                    { 'a-venir': 'À venir', 'en-cours': 'En cours', passee: 'Passée' }[
                      election.status
                    ]
                  }
                </Text>
                <Text style={{ ...fonts.display, fontSize: 20 }}>{election.title}</Text>
                <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                  {election.rounds.map((r) => `${r.label} : ${formatLongDate(r.date)}`).join('\n')}
                </Text>
              </View>
              <Icon name="chevron-forward" variant="onGlass" size="small" />
            </Pressable>
          </Link>
        );
      })}

      <Link href={{ pathname: '/comprendre/[id]', params: { id: 'comment-voter' } }} asChild>
        <Pressable
          large
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: effects.spacing.md,
            borderRadius: effects.borderRadius.small,
            backgroundColor: colors.surface.primary,
            borderWidth: 1,
            borderColor: colors.surface.border.primary,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.tintSoft,
            }}
          >
            <Icon name="checkbox-outline" variant="onGlass" size="medium" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...fonts.bold, fontSize: 17 }}>Comment voter</Text>
            <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
              Inscription, procuration, pièces à fournir
            </Text>
          </View>
          <Icon name="chevron-forward" variant="secondary" size="small" />
        </Pressable>
      </Link>
      <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
        D'autres scrutins (législatives, municipales, européennes…) apparaîtront ici dès qu'ils
        seront documentés.
      </Text>
    </Page>
  );
}
