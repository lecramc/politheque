import { Link, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { Only } from '@/src/core/components/Only';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Arc } from '@/src/programmes/components/Arc';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyRow, RowGroup } from '@/src/programmes/components/PartyRow';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { stepLabel } from '@/src/programmes/models/presentation.service';
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
  // Le compte à rebours dépend du jour : rendu après l'hydratation seulement (voir useHydrated).
  const hydrated = useHydrated();
  const daysLeft = hydrated ? vm.daysLeft : null;
  const { colors, effects, fonts } = useTheme();
  const [step, setStep] = useState<DatedStep | null>(null);
  const election = vm.election;

  if (vm.status === 'loaded' && !election) {
    return (
      <Page meta={vm.notFoundMeta} back={{ label: 'Élections', href: '/elections' }}>
        <Text variant="title">Élection introuvable</Text>
      </Page>
    );
  }

  const steps = election
    ? [...election.keyDates, ...election.rounds].sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const countdown =
    daysLeft !== null && vm.round ? (
      <Arc
        value={1 - daysLeft / 365}
        size={120}
        strokeWidth={12}
        accessibilityLabel={`${daysLeft} jours avant le ${vm.round.label}`}
      >
        <Text style={{ ...fonts.displayBold, fontSize: 28, lineHeight: 30, color: colors.tint }}>
          {daysLeft}
        </Text>
        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>jours</Text>
      </Arc>
    ) : null;

  /** Carte d'une étape du calendrier (largeur fixe en défilement, souple en grille). */
  const stepCard = (s: DatedStep, width?: number) => {
    const isRound = !!election?.rounds.includes(s);
    return (
      <Pressable
        large
        key={s.label}
        onPress={() => setStep(s)}
        accessibilityRole="button"
        style={{
          ...(width ? { width } : null),
          padding: 14,
          gap: effects.spacing.xxs,
          borderRadius: effects.borderRadius.small,
          borderWidth: 1,
          borderColor: isRound ? colors.tintBorder : colors.surface.border.primary,
          backgroundColor: isRound ? colors.tintSoft : colors.surface.primary,
        }}
      >
        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{weekday(s.date)}</Text>
        <Text style={{ ...fonts.displayBold, fontSize: 24, color: colors.tint }}>
          {shortDate(s.date)}
        </Text>
        <Text style={{ fontSize: 14 }}>{stepLabel(s.label).title}</Text>
        {stepLabel(s.label).note ? (
          <Text style={{ fontSize: 12, color: colors.text.secondary }}>
            {stepLabel(s.label).note}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Élections', href: '/elections' }}
      onReachEnd={vm.markRead}
      railOnMobile="hidden"
      rail={
        election ? (
          // Les dates sont dans le calendrier de la colonne : le rail ne garde que le compte à rebours.
          <>{countdown}</>
        ) : undefined
      }
    >
      {election ? (
        <>
          <Text variant="title">{election.title}</Text>
          <View style={{ gap: 12, alignItems: 'center' }}>
            {/* Compte à rebours : dans le rail dès 1024 px, ici en dessous. */}
            <Only below="lg">{countdown}</Only>
            <View style={{ gap: effects.spacing.xs, alignSelf: 'stretch' }}>
              <Text style={{ fontSize: 16, lineHeight: 24 }}>{election.summary}</Text>
              <SourceChip sources={election.summarySources} />
            </View>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              Le calendrier
            </Text>
            <Only below="lg">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: effects.spacing.sm, paddingRight: 16 }}
              >
                {steps.map((s) => stepCard(s, 170))}
              </ScrollView>
            </Only>
            {Platform.OS === 'web' ? (
              <View {...tv('only-from-lg', 'cal-grid')}>{steps.map((s) => stepCard(s))}</View>
            ) : null}
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
            <Text variant="caption" headingLevel={2}>
              Candidatures · ordre alphabétique
            </Text>
            <RowGroup>
              {vm.candidates.map(({ party, candidacy }, index) => (
                <PartyRow
                  key={party.id}
                  party={party}
                  first={index === 0}
                  section="programme-2027"
                  subtitle={candidacy.candidateName}
                  badge={<StatusChip label={candidacy.statusLabel} />}
                />
              ))}
            </RowGroup>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              Comparer les programmes par thème
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}>
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
                      gap: effects.spacing.xs,
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
            <Text variant="caption" headingLevel={2}>
              Pour bien comprendre
            </Text>
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
