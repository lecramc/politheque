import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Arc } from '@/src/programmes/components/Arc';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyRow, RowGroup } from '@/src/programmes/components/PartyRow';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import type { DatedStep } from '@/src/programmes/models/programme.model';
import { electionViewModel } from '@/src/programmes/view-models/elections.view-model';

const shortDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  });
const weekday = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    timeZone: 'Europe/Paris',
  });

export default function ElectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(electionViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const [step, setStep] = useState<DatedStep | null>(null);
  const election = vm.election;

  if (vm.status === 'loaded' && !election) {
    return (
      <Page back={{ label: 'Élections', href: '/elections' }}>
        <Text variant="title">Élection introuvable</Text>
      </Page>
    );
  }

  const steps = election
    ? [...election.keyDates, ...election.rounds].sort((a, b) => a.date.localeCompare(b.date))
    : [];

  return (
    <Page loading={vm.status !== 'loaded'} back={{ label: 'Élections', href: '/elections' }}>
      {election ? (
        <>
          <Text variant="title">{election.title}</Text>
          <View style={{ gap: 12, alignItems: 'center' }}>
            {vm.daysLeft !== null && vm.round ? (
              <Arc
                value={1 - vm.daysLeft / 365}
                size={120}
                strokeWidth={12}
                accessibilityLabel={`${vm.daysLeft} jours avant le ${vm.round.label}`}
              >
                <Text
                  style={{ ...fonts.displayBold, fontSize: 36, lineHeight: 40, color: colors.tint }}
                >
                  {vm.daysLeft}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>jours</Text>
              </Arc>
            ) : null}
            <View style={{ gap: 8, alignSelf: 'stretch' }}>
              <Text style={{ fontSize: 16, lineHeight: 24 }}>{election.summary}</Text>
              <SourceChip sources={election.summarySources} />
            </View>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Le calendrier</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 16 }}
            >
              {steps.map((s) => {
                const isRound = election.rounds.includes(s);
                return (
                  <Pressable
                    large
                    key={s.label}
                    onPress={() => setStep(s)}
                    accessibilityRole="button"
                    style={{
                      width: 170,
                      padding: 14,
                      gap: 4,
                      borderRadius: effects.borderRadius.small,
                      borderWidth: 1,
                      borderColor: isRound ? colors.tintBorder : colors.surface.border.primary,
                      backgroundColor: isRound ? colors.tintSoft : colors.surface.primary,
                    }}
                  >
                    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                      {weekday(s.date)}
                    </Text>
                    <Text style={{ ...fonts.displayBold, fontSize: 24, color: colors.tint }}>
                      {shortDate(s.date)}
                    </Text>
                    <Text style={{ fontSize: 14 }} numberOfLines={3}>
                      {s.label.split(' (')[0]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View
            style={{
              backgroundColor: colors.tintSoft,
              borderRadius: effects.borderRadius.small,
              padding: effects.spacing.md,
            }}
          >
            <Text style={{ fontSize: 15, lineHeight: 23 }}>{election.candidaciesNote}</Text>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Candidatures · ordre alphabétique</Text>
            <RowGroup>
              {vm.candidates.map(({ party, candidacy }, index) => (
                <PartyRow
                  key={party.id}
                  party={party}
                  first={index === 0}
                  tab="programme"
                  subtitle={candidacy.candidateName}
                  trailing={<StatusChip label={candidacy.statusLabel} />}
                />
              ))}
            </RowGroup>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Comparer les programmes par thème</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {vm.themes.map((theme) => (
                <Link
                  key={theme.id}
                  href={{ pathname: '/debats/[id]', params: { id: theme.id } }}
                  asChild
                >
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      minHeight: 44,
                      paddingHorizontal: 14,
                      borderRadius: effects.borderRadius.round,
                      borderWidth: 1,
                      borderColor: colors.surface.border.primary,
                      backgroundColor: colors.surface.primary,
                    }}
                  >
                    <Icon name={theme.icon} variant="onGlass" size="small" />
                    <Text style={{ fontSize: 15 }}>{theme.title}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Pour bien comprendre</Text>
            {vm.guideSections.map((section) => (
              <Link
                key={section.id}
                href={{ pathname: '/comprendre/[id]', params: { id: section.id } }}
              >
                <Text style={{ color: colors.tint, ...fonts.bold, fontSize: 16 }}>
                  {section.title} →
                </Text>
              </Link>
            ))}
          </View>

          <PageSources sources={[...election.summarySources, ...steps.flatMap((s) => s.sources)]} />

          <Sheet
            isOpen={!!step}
            onClose={() => setStep(null)}
            title={step ? shortDate(step.date) : ''}
          >
            {step ? (
              <>
                <Text style={{ fontSize: 16, lineHeight: 25 }}>{step.label}</Text>
                <SourceChip sources={step.sources} />
              </>
            ) : null}
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
