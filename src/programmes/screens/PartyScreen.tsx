import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { Sheet } from '@/src/programmes/components/Sheet';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { formatSourceDate } from '@/src/programmes/components/SourceLinks';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { TabPanel, Tabs } from '@/src/programmes/components/Tabs';
import {
  afterFirstSentence,
  beforeParenthesis,
  firstSentence,
} from '@/src/programmes/models/presentation.service';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

type Tab = 'bref' | 'histoire' | 'positions' | 'programme';
const TABS: { id: Tab; label: string }[] = [
  { id: 'bref', label: 'En bref' },
  { id: 'histoire', label: 'Histoire' },
  { id: 'positions', label: 'Positions' },
  { id: 'programme', label: 'Programme 2027' },
];

function Chip({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors, effects } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: effects.borderRadius.round,
        borderWidth: 1.5,
        borderColor: colors.surface.border.tertiary,
        backgroundColor: colors.surface.primary,
      }}
    >
      <Text>{label}</Text>
      <Icon name="information-circle-outline" variant="onGlass" size="small" />
    </Pressable>
  );
}

export default function PartyScreen() {
  const { id, onglet } = useLocalSearchParams<{ id: string; onglet?: Tab }>();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(TABS.some((t) => t.id === onglet) ? onglet! : 'bref');
  const [sheet, setSheet] = useState<'famille' | 'candidat' | null>(null);
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const party = vm.party;
  const presidential = vm.candidacies[0];

  if (vm.status === 'loaded' && !party) {
    return (
      <Page back={{ label: 'Partis', href: '/partis' }}>
        <Text variant="title">Parti introuvable</Text>
      </Page>
    );
  }

  const changeTab = (next: Tab) => {
    setTab(next);
    router.setParams({ onglet: next });
  };

  return (
    <Page loading={vm.status !== 'loaded'} back={{ label: 'Partis', href: '/partis' }}>
      {party ? (
        <>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <PartyDot color={party.color} size={64} label={party.shortName} />
            <View style={{ flex: 1, gap: 6 }}>
              <Text variant="title" style={{ fontSize: 28, lineHeight: 33 }}>
                {party.name}
              </Text>
              <Text style={{ color: colors.text.secondary }}>
                {firstSentence(party.description)}
              </Text>
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Chip
              label={`Famille : ${beforeParenthesis(party.family)}`}
              onPress={() => setSheet('famille')}
            />
            {presidential ? (
              <Chip
                label={`Candidat 2027 : ${presidential.candidacy.candidateName}`}
                onPress={() => setSheet('candidat')}
              />
            ) : null}
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
              Fiche vérifiée le {formatSourceDate(party.lastVerified)}
            </Text>
          </View>

          <Tabs tabs={TABS} value={tab} onChange={changeTab} />

          <TabPanel id={tab}>
            {tab === 'bref' ? (
              <View style={{ gap: effects.spacing.sm }}>
                <Card style={{ gap: 0, paddingVertical: 4 }}>
                  {[
                    ['Fondé', party.history?.founded],
                    [
                      'Candidat 2027',
                      presidential
                        ? `${presidential.candidacy.candidateName} · ${presidential.candidacy.statusLabel}`
                        : null,
                    ],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value], index) => (
                      <View
                        key={label}
                        style={{
                          paddingVertical: 12,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderColor: colors.surface.border.primary,
                        }}
                      >
                        <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{label}</Text>
                        <Text style={{ ...fonts.bold, fontSize: 16 }}>{value}</Text>
                      </View>
                    ))}
                </Card>
                {(party.history?.ideals ?? []).slice(0, 3).map((ideal) => (
                  <Accordion key={ideal.text} title={firstSentence(ideal.text)}>
                    {afterFirstSentence(ideal.text) ? (
                      <Text style={{ fontSize: 16, lineHeight: 25 }}>
                        {afterFirstSentence(ideal.text)}
                      </Text>
                    ) : null}
                    <SourceChip sources={ideal.sources} />
                  </Accordion>
                ))}
                <Accordion
                  title="Présentation complète"
                  subtitle="Chiffres, dirigeants, situation actuelle"
                >
                  <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.description}</Text>
                </Accordion>
              </View>
            ) : null}

            {tab === 'histoire' && party.history ? (
              <View style={{ gap: effects.spacing.md }}>
                {party.history.whyCreated ? (
                  <Card
                    style={{ backgroundColor: colors.tintSoft, borderColor: colors.tintBorder }}
                  >
                    <Text variant="caption">Pourquoi ce parti a été créé</Text>
                    <Text style={{ fontSize: 16, lineHeight: 25 }}>
                      {party.history.whyCreated.text}
                    </Text>
                    <SourceChip sources={party.history.whyCreated.sources} />
                  </Card>
                ) : (
                  <Card>
                    <Text variant="caption">Origines</Text>
                    <Text style={{ fontSize: 16, lineHeight: 25 }}>
                      {party.history.origins.text}
                    </Text>
                    <SourceChip sources={party.history.origins.sources} />
                  </Card>
                )}

                {party.history.figures?.length ? (
                  <View style={{ gap: effects.spacing.xs }}>
                    <Text variant="caption">Fondateurs et figures</Text>
                    {party.history.figures.map((figure) => (
                      <Accordion key={figure.name} title={figure.name} subtitle={figure.role}>
                        <Text style={{ color: colors.text.secondary }}>{figure.role}</Text>
                        <Text style={{ fontSize: 16, lineHeight: 25 }}>{figure.background}</Text>
                        <SourceChip sources={figure.sources} subject={figure.name} />
                      </Accordion>
                    ))}
                  </View>
                ) : null}

                <View style={{ gap: effects.spacing.xs }}>
                  <Text variant="caption">Repères</Text>
                  <View
                    style={{
                      borderLeftWidth: 2,
                      borderColor: colors.tintBorder,
                      marginLeft: 6,
                      gap: 14,
                      paddingVertical: 4,
                    }}
                  >
                    {party.history.timeline.map((item) => (
                      <View key={item.date + item.event} style={{ paddingLeft: 16, gap: 4 }}>
                        <View
                          style={{
                            position: 'absolute',
                            left: -7,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: colors.tint,
                            backgroundColor: colors.background.secondary,
                          }}
                        />
                        <Text style={{ ...fonts.bold, color: colors.tint }}>
                          {formatSourceDate(item.date)}
                        </Text>
                        <Text style={{ fontSize: 16, lineHeight: 24 }}>{item.event}</Text>
                        <SourceChip sources={item.sources} />
                      </View>
                    ))}
                  </View>
                </View>

                {(party.history.thought ?? party.history.ideals).length ? (
                  <View style={{ gap: effects.spacing.xs }}>
                    <Text variant="caption">
                      {party.history.thought ? 'Courants de pensée' : 'Idées et classement'}
                    </Text>
                    {(party.history.thought ?? party.history.ideals).map((item) => (
                      <Accordion key={item.text} title={firstSentence(item.text)}>
                        {afterFirstSentence(item.text) ? (
                          <Text style={{ fontSize: 16, lineHeight: 25 }}>
                            {afterFirstSentence(item.text)}
                          </Text>
                        ) : null}
                        <SourceChip sources={item.sources} />
                      </Accordion>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : null}

            {tab === 'positions' ? (
              <View style={{ gap: effects.spacing.xs }}>
                <Text style={{ color: colors.text.secondary }}>
                  Ce que le parti défend sur les 24 affirmations du questionnaire, d'après ses
                  programmes, ses votes et ses déclarations.
                </Text>
                {vm.stances.map(({ question, stance }) => (
                  <Accordion
                    key={question.id}
                    title={question.statement}
                    trailing={null}
                    leading={null}
                    subtitle={undefined}
                  >
                    <StanceBadge stance={stance?.stance ?? null} />
                    <Text style={{ fontSize: 16, lineHeight: 24 }}>{stance?.justification}</Text>
                    {stance?.sources.length ? <SourceChip sources={stance.sources} /> : null}
                  </Accordion>
                ))}
              </View>
            ) : null}

            {tab === 'programme' && presidential ? (
              <View style={{ gap: effects.spacing.xs }}>
                <View
                  style={{
                    backgroundColor: colors.tintSoft,
                    borderRadius: effects.borderRadius.small,
                    padding: effects.spacing.md,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>
                    {firstSentence(presidential.candidacy.programmeStatus)}
                  </Text>
                </View>
                {presidential.sections.map(({ theme, programme }) =>
                  programme ? (
                    <Accordion
                      key={theme.id}
                      title={theme.title}
                      subtitle={firstSentence(programme.summary)}
                      leading={<Icon name={theme.icon} variant="onGlass" size="small" />}
                      open={openTheme === theme.id}
                      onToggle={(o) => setOpenTheme(o ? theme.id : null)}
                    >
                      <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
                        {programme.summary}
                      </Text>
                      {programme.measures.map((measure) => (
                        <View
                          key={measure.text}
                          style={{
                            gap: 6,
                            paddingTop: 10,
                            borderTopWidth: 1,
                            borderColor: colors.surface.border.primary,
                          }}
                        >
                          <Text style={{ fontSize: 16, lineHeight: 24 }}>{measure.text}</Text>
                          <SourceChip sources={measure.sources} subject={measure.text} />
                        </View>
                      ))}
                    </Accordion>
                  ) : null
                )}
              </View>
            ) : null}
          </TabPanel>

          <PageSources sources={vm.allSources} />

          <Sheet
            isOpen={sheet === 'famille'}
            onClose={() => setSheet(null)}
            title="Famille politique"
          >
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{party.family}</Text>
            <Text style={{ color: colors.text.secondary }}>
              Les étiquettes viennent de la presse de référence, des politistes et du ministère de
              l'Intérieur ; chaque parti peut les contester. Le même traitement s'applique à tous.
            </Text>
          </Sheet>
          {presidential ? (
            <Sheet
              isOpen={sheet === 'candidat'}
              onClose={() => setSheet(null)}
              title={`Candidat 2027 : ${presidential.candidacy.candidateName}`}
            >
              <StatusChip label={presidential.candidacy.statusLabel} />
              <Text style={{ fontSize: 16, lineHeight: 25 }}>
                {presidential.candidacy.candidate}
              </Text>
            </Sheet>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}
