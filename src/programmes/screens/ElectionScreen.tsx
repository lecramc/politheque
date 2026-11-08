import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { useHydrated } from '@/src/core/hooks/useHydrated';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
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
      <Page meta={vm.notFoundMeta} back={{ label: 'Accueil', href: '/' }}>
        <Text variant="title">Élection introuvable</Text>
      </Page>
    );
  }

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
      back={{ label: 'Accueil', href: '/' }}
      onReachEnd={vm.markRead}
    >
      {election ? (
        <>
          <View style={{ gap: effects.spacing.xs }}>
            {/* Le compte à rebours dépend du jour : rendu après l'hydratation seulement. */}
            {daysLeft !== null ? (
              <Text plainDigits style={{ color: colors.text.secondary, fontSize: 15 }}>
                {`J-${daysLeft}`}
              </Text>
            ) : null}
            <Text variant="title">{election.title}</Text>
            <Text style={{ fontSize: 17, lineHeight: 26 }}>{election.summary}</Text>
            <SourceChip sources={election.summarySources} />
          </View>

          <View {...tv('cal-grid')} role="list" style={{ gap: effects.spacing.xs }}>
            {vm.dates.map((s) => (
              <View key={s.label} role="listitem">
                {stepCard(s)}
              </View>
            ))}
          </View>

          <View style={{ gap: effects.spacing.sm }}>
            <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
              Comment voter
            </Text>
            {vm.voteSteps.map((item, index) => (
              <View
                key={item.title}
                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: effects.spacing.smd }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tint,
                  }}
                >
                  <Text
                    plainDigits
                    style={{ ...fonts.bold, fontSize: 14, color: colors.text.onColor }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text style={{ flex: 1, fontSize: 16, lineHeight: 25 }}>
                  <Text style={{ ...fonts.bold, fontSize: 16 }}>{item.title}</Text> {item.text}
                </Text>
              </View>
            ))}
            <TextLink href={vm.voteGuide.href} standalone>
              {`Tout savoir pour voter (guide, ${vm.voteGuide.minutes} min)`}
            </TextLink>
            <TextLink href="/comprendre/election-presidentielle" standalone>
              Comment se déroule l'élection présidentielle
            </TextLink>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
              Les candidatures
              <Text style={{ fontSize: 15, color: colors.text.secondary }}>
                {' · ordre alphabétique'}
              </Text>
            </Text>
            <RowGroup>
              {vm.candidates.map(({ party, candidacy }, index) => (
                <PartyRow
                  key={party.id}
                  party={party}
                  first={index === 0}
                  section="programme"
                  subtitle={candidacy.candidateName}
                  badge={<StatusChip label={candidacy.statusLabel} />}
                />
              ))}
            </RowGroup>
            <Text style={{ fontSize: 15, lineHeight: 23, color: colors.text.secondary }}>
              {election.candidaciesNote}{' '}
              <TextLink href="/partis/comparer">Comparer les programmes</TextLink>
            </Text>
          </View>

          <PageSources
            sources={[...election.summarySources, ...vm.dates.flatMap((s) => s.sources)]}
          />

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
