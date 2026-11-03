import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Arc } from '@/src/programmes/components/Arc';
import { AxisChart } from '@/src/programmes/components/AxisChart';
import { Card } from '@/src/programmes/components/Card';
import { Page } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { STANCE_LABEL, StanceBadge } from '@/src/programmes/components/StanceBadge';
import { Tabs } from '@/src/programmes/components/Tabs';
import { resultsViewModel } from '@/src/programmes/view-models/results.view-model';

type Tab = 'proximite' | 'carte' | 'detail';
/** En dessous, l'arc de proximité affiche sa part « non comparée » en pointillés. */
const FEW_COMPARED = 15;

export default function ResultsScreen() {
  const vm = useViewModel(resultsViewModel);
  const { colors, effects, fonts } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const [tab, setTab] = useState<Tab>('proximite');
  const [alphabetical, setAlphabetical] = useState(false);
  const [themeFilter, setThemeFilter] = useState<string | null>(null);

  if (vm.ready && vm.answeredCount === 0) {
    return (
      <Page back={{ label: 'Questionnaire', href: '/me-situer' }}>
        <View
          style={{
            alignItems: 'center',
            gap: effects.spacing.md,
            paddingVertical: effects.spacing.xl,
          }}
        >
          <Text style={{ ...fonts.display, fontSize: 24, textAlign: 'center' }}>
            Pas encore de réponses
          </Text>
          <Text style={{ color: colors.text.secondary, textAlign: 'center', fontSize: 17 }}>
            Répondez à quelques affirmations pour voir de quels programmes vous êtes proche.
          </Text>
          <Link href="/me-situer">
            <Text style={{ color: colors.tint, ...fonts.bold, fontSize: 17 }}>
              Commencer le questionnaire →
            </Text>
          </Link>
        </View>
      </Page>
    );
  }

  if (vm.ready && !revealed) {
    return (
      <Page focus back={{ label: 'Questionnaire', href: '/me-situer' }}>
        <View
          style={{
            alignItems: 'center',
            gap: effects.spacing.md,
            paddingVertical: effects.spacing.xxl,
          }}
        >
          <Arc
            value={1}
            size={200}
            strokeWidth={16}
            accessibilityLabel={`${vm.answeredCount} réponses`}
          >
            <Text
              style={{ ...fonts.displayBold, fontSize: 52, lineHeight: 58, color: colors.tint }}
            >
              {vm.answeredCount}
            </Text>
            <Text style={{ color: colors.text.secondary }}>réponses</Text>
          </Arc>
          <Text style={{ ...fonts.display, fontSize: 26, textAlign: 'center' }}>
            Vos réponses sont prêtes
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              textAlign: 'center',
              fontSize: 17,
              maxWidth: 420,
            }}
          >
            Vous allez voir votre proximité avec les positions publiques de chaque parti.
          </Text>
          <View style={{ alignSelf: 'stretch' }}>
            <Button variant="brand" onPress={() => setRevealed(true)}>
              Voir mes résultats
            </Button>
          </View>
        </View>
      </Page>
    );
  }

  const ranking = alphabetical
    ? [...vm.ranking].sort((a, b) => a.party.name.localeCompare(b.party.name, 'fr'))
    : vm.ranking;
  const details = themeFilter
    ? vm.details.filter((d) => d.question.theme === themeFilter)
    : vm.details;

  return (
    <Page loading={!vm.ready} back={{ label: 'Questionnaire', href: '/me-situer' }}>
      <View style={{ gap: 8 }}>
        <Text variant="title">Vos résultats</Text>
        <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
          Proximité avec les positions publiques des partis, pas une consigne de vote. Un parti
          n'est noté que si au moins 5 de vos réponses peuvent être comparées à ses positions.{' '}
          <Link
            href="/methodologie"
            style={{ color: colors.tint, textDecorationLine: 'underline' }}
          >
            Comment ça marche
          </Link>
        </Text>
      </View>

      {!vm.enoughAnswers ? (
        <Card style={{ borderColor: colors.accent.warning }}>
          <Text>
            Vous avez répondu à {vm.answeredCount} question(s). En dessous de {vm.minAnswers}, le
            résultat est peu fiable.
          </Text>
        </Card>
      ) : null}

      <Tabs
        tabs={[
          { id: 'proximite', label: 'Proximité' },
          { id: 'carte', label: 'Ma carte' },
          { id: 'detail', label: 'Détail' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'proximite' ? (
        <View style={{ gap: effects.spacing.sm }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary }}>Ordre :</Text>
            {[
              { id: false, label: 'Proximité' },
              { id: true, label: 'A-Z' },
            ].map((option) => (
              <Pressable
                key={option.label}
                onPress={() => setAlphabetical(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: alphabetical === option.id }}
                style={{
                  minHeight: 44,
                  justifyContent: 'center',
                  paddingHorizontal: 14,
                  borderRadius: effects.borderRadius.round,
                  borderWidth: 1.5,
                  borderColor:
                    alphabetical === option.id ? colors.tint : colors.surface.border.tertiary,
                  backgroundColor: alphabetical === option.id ? colors.tintSoft : 'transparent',
                }}
              >
                <Text
                  style={
                    alphabetical === option.id ? { ...fonts.bold, color: colors.tint } : undefined
                  }
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {ranking.map(({ party, score, comparedCount, agree, disagree }, index) => (
            <Accordion
              key={party.id}
              title={party.name}
              subtitle={`Comparé sur ${comparedCount} question${comparedCount > 1 ? 's' : ''}`}
              leading={<PartyDot color={party.color} size={32} label={party.shortName} />}
              trailing={
                score === null ? (
                  <Text
                    style={{
                      width: 84,
                      fontSize: 12,
                      color: colors.text.secondary,
                      textAlign: 'right',
                    }}
                  >
                    Pas assez de positions connues
                  </Text>
                ) : (
                  <Arc
                    value={score / 100}
                    size={64}
                    strokeWidth={7}
                    delay={index * 120}
                    dashedRemainder={comparedCount < FEW_COMPARED}
                    accessibilityLabel={`${score} pour cent`}
                  >
                    <Text style={{ ...fonts.bold, fontSize: 14, color: colors.tint }}>
                      {score} %
                    </Text>
                  </Arc>
                )
              }
            >
              {agree.length ? (
                <View style={{ gap: 4 }}>
                  <Text variant="caption">Vous êtes proches sur</Text>
                  {agree.slice(0, 3).map((q) => (
                    <Text key={q.id} style={{ fontSize: 15 }}>
                      • {q.statement}
                    </Text>
                  ))}
                </View>
              ) : null}
              {disagree.length ? (
                <View style={{ gap: 4 }}>
                  <Text variant="caption">Vous divergez sur</Text>
                  {disagree.slice(0, 3).map((q) => (
                    <Text key={q.id} style={{ fontSize: 15 }}>
                      • {q.statement}
                    </Text>
                  ))}
                </View>
              ) : null}
              <Link href={{ pathname: '/partis/[id]', params: { id: party.id } }}>
                <Text style={{ color: colors.tint, ...fonts.bold }}>Voir la fiche du parti →</Text>
              </Link>
            </Accordion>
          ))}
        </View>
      ) : null}

      {tab === 'carte' ? (
        <Card>
          <AxisChart axes={vm.axes} user={vm.userPosition} parties={vm.partyPositions} />
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            Plus deux points sont proches, plus les réponses se ressemblent. Positions calculées
            uniquement à partir des affirmations du questionnaire : les axes simplifient la réalité.
          </Text>
        </Card>
      ) : null}

      {tab === 'detail' ? (
        <View style={{ gap: effects.spacing.sm }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {[{ id: null, title: 'Tous' }, ...vm.themes].map((theme) => {
              const active = themeFilter === theme.id;
              return (
                <Pressable
                  key={theme.id ?? 'tous'}
                  onPress={() => setThemeFilter(theme.id)}
                  style={{
                    minHeight: 44,
                    justifyContent: 'center',
                    paddingHorizontal: 12,
                    borderRadius: effects.borderRadius.round,
                    borderWidth: 1.5,
                    borderColor: active ? colors.tint : colors.surface.border.tertiary,
                    backgroundColor: active ? colors.tintSoft : 'transparent',
                  }}
                >
                  <Text style={active ? { ...fonts.bold, color: colors.tint } : undefined}>
                    {theme.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {details.map(({ question, userValue, important, positions }) => (
            <Accordion
              key={question.id}
              title={question.statement}
              subtitle={`Vous : ${STANCE_LABEL[String(userValue)]}${important ? ' (compte double)' : ''}`}
            >
              {positions.map(({ party, stance }) => (
                <View
                  key={party.id}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                >
                  <PartyDot color={party.color} size={24} label={party.shortName} />
                  <Text style={{ width: 90, fontSize: 14 }}>{party.shortName}</Text>
                  <StanceBadge stance={stance?.stance ?? null} />
                  {stance?.sources.length ? (
                    <SourceChip sources={stance.sources} subject={stance.justification} />
                  ) : null}
                </View>
              ))}
            </Accordion>
          ))}
        </View>
      ) : null}

      <Button variant="secondary" onPress={vm.restart}>
        Recommencer le questionnaire
      </Button>
    </Page>
  );
}
