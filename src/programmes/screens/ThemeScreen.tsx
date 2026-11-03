import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { Page, useIsDesktop } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StanceBadge } from '@/src/programmes/components/StanceBadge';
import { TabPanel, Tabs } from '@/src/programmes/components/Tabs';
import {
  displayName,
  firstSentence,
  firstSentences,
} from '@/src/programmes/models/presentation.service';
import type { PartyThemeProgramme } from '@/src/programmes/models/programme.model';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

type Mode = 'tous' | 'comparer';

function ProgrammeDetail({ programme }: { programme: PartyThemeProgramme }) {
  const { colors } = useTheme();
  return (
    <>
      <Text style={{ color: colors.text.secondary, fontSize: 15, lineHeight: 23 }}>
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
          <Text style={{ fontSize: 15, lineHeight: 23 }}>{measure.text}</Text>
          <SourceChip sources={measure.sources} subject={measure.text} />
        </View>
      ))}
    </>
  );
}

export default function ThemeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(themeViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [mode, setMode] = useState<Mode>('tous');
  const [selected, setSelected] = useState<string[]>([]);
  const theme = vm.theme;

  if (vm.status === 'loaded' && !theme) {
    return (
      <Page title={'Thème introuvable'} back={{ label: 'Débats', href: '/debats' }}>
        <Text variant="title">Thème introuvable</Text>
      </Page>
    );
  }

  const toggleSelected = (partyId: string) =>
    setSelected((current) =>
      current.includes(partyId)
        ? current.filter((x) => x !== partyId)
        : [...current, partyId].slice(-2)
    );
  const compared = vm.comparisons.filter((c) => selected.includes(c.party.id));

  return (
    <Page
      title={theme?.title}
      loading={vm.status !== 'loaded'}
      back={{ label: 'Débats', href: '/debats' }}
    >
      {theme ? (
        <>
          <View style={{ gap: 8 }}>
            <Text variant="caption">
              {theme.title} · thème {vm.position.index} / {vm.position.total}
            </Text>
            <Text variant="title">{theme.debates[0]?.question ?? theme.title}</Text>
          </View>

          <Accordion title="Les enjeux en bref" subtitle={firstSentences(theme.context, 2)}>
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{theme.context}</Text>
          </Accordion>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Chiffres clés</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingRight: 16 }}
            >
              {theme.keyFigures.map((figure) => (
                <Card key={figure.label} style={{ width: isDesktop ? 240 : 230 }}>
                  <Text
                    style={{
                      ...fonts.displayBold,
                      fontSize: 24,
                      lineHeight: 30,
                      color: colors.tint,
                    }}
                  >
                    {figure.value}
                  </Text>
                  <Text style={{ fontSize: 14 }}>{figure.label}</Text>
                  <SourceChip sources={[figure.source]} subject={figure.label} />
                </Card>
              ))}
            </ScrollView>
          </View>

          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="caption">Les options en débat</Text>
            {theme.debates.map((debate, index) => (
              <Accordion key={debate.question} title={debate.question} defaultOpen={index === 0}>
                {debate.options.map((option) => (
                  <Text
                    key={option}
                    style={{
                      fontSize: 15,
                      lineHeight: 23,
                      paddingVertical: 6,
                      borderTopWidth: 1,
                      borderColor: colors.surface.border.primary,
                    }}
                  >
                    {option}
                  </Text>
                ))}
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  Options présentées sans ordre de préférence.
                </Text>
              </Accordion>
            ))}
          </View>

          <View style={{ gap: effects.spacing.sm }}>
            <Text variant="caption">
              Ce que proposent les partis{vm.election ? ` · ${vm.election.title}` : ''}
            </Text>
            <Tabs
              tabs={[
                { id: 'tous', label: 'Tous (A-Z)' },
                { id: 'comparer', label: 'Comparer 2 partis' },
              ]}
              value={mode}
              onChange={setMode}
            />
            <TabPanel id={mode} style={{ gap: effects.spacing.sm }}>
              {mode === 'tous' ? (
                vm.comparisons.map(({ party, candidate, programme }) =>
                  programme ? (
                    <Accordion
                      key={party.id}
                      title={party.name}
                      subtitle={firstSentence(programme.summary)}
                      leading={<PartyDot color={party.color} size={32} label={party.shortName} />}
                    >
                      <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                        {candidate.split(' (')[0]}
                      </Text>
                      <ProgrammeDetail programme={programme} />
                    </Accordion>
                  ) : null
                )
              ) : (
                <>
                  <Text style={{ color: colors.text.secondary }}>Choisissez deux partis :</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {vm.comparisons.map(({ party }) => {
                      const active = selected.includes(party.id);
                      return (
                        <Pressable
                          key={party.id}
                          onPress={() => toggleSelected(party.id)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: active }}
                          aria-checked={active}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            minHeight: 44,
                            paddingHorizontal: 10,
                            borderRadius: effects.borderRadius.round,
                            borderWidth: 1.5,
                            borderColor: active ? colors.tint : colors.surface.border.tertiary,
                            backgroundColor: active ? colors.tintSoft : colors.surface.primary,
                          }}
                        >
                          <PartyDot color={party.color} size={14} />
                          <Text style={active ? fonts.bold : undefined}>{displayName(party)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {compared.length === 2 ? (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      {compared.map(({ party, programme }) => (
                        <Card key={party.id} style={{ flex: 1, padding: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <PartyDot color={party.color} size={24} label={party.shortName} />
                            <Text style={{ ...fonts.bold, flex: 1 }}>{displayName(party)}</Text>
                          </View>
                          {programme ? <ProgrammeDetail programme={programme} /> : null}
                        </Card>
                      ))}
                    </View>
                  ) : null}
                </>
              )}
            </TabPanel>
          </View>

          {vm.questions.length > 0 ? (
            <View style={{ gap: effects.spacing.xs }}>
              <Text variant="caption">Qui est pour, qui est contre ?</Text>
              {vm.questions.map(({ question, positions }) => (
                <Accordion key={question.id} title={question.statement} subtitle={undefined}>
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {question.help}
                  </Text>
                  {positions.map(({ party, stance }) => (
                    <View
                      key={party.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingVertical: 4,
                        flexWrap: 'wrap',
                      }}
                    >
                      <PartyDot color={party.color} size={24} label={party.shortName} />
                      <Text style={{ width: 120, fontSize: 14 }}>{displayName(party)}</Text>
                      <StanceBadge stance={stance?.stance ?? null} />
                      {stance?.justification ? (
                        <Text
                          style={{ flexBasis: '100%', fontSize: 13, color: colors.text.secondary }}
                        >
                          {stance.justification}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </Accordion>
              ))}
            </View>
          ) : null}

          <PageSources
            sources={[
              ...theme.keyFigures.map((f) => f.source),
              ...vm.comparisons.flatMap(
                (c) => c.programme?.measures.flatMap((m) => m.sources) ?? []
              ),
              ...vm.questions.flatMap((q) => q.positions.flatMap((p) => p.stance?.sources ?? [])),
            ]}
          />

          {vm.nextTheme ? (
            <Button
              variant="secondary"
              onPress={() =>
                router.replace({ pathname: '/debats/[id]', params: { id: vm.nextTheme!.id } })
              }
            >
              {`Thème suivant : ${vm.nextTheme.title}`}
            </Button>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}
