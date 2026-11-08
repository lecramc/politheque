import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { scrollToId } from '@/src/core/web/browser-actions';
import { tv } from '@/src/core/web/tv';
import { Accordion } from '@/src/programmes/components/Accordion';
import { AnchorList } from '@/src/programmes/components/AnchorList';
import { Card } from '@/src/programmes/components/Card';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { PartyStanceRow } from '@/src/programmes/components/PartyStanceRow';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { TabPanel, Tabs } from '@/src/programmes/components/Tabs';
import { splitFigure } from '@/src/programmes/models/key-figure.service';
import {
  displayName,
  firstSentence,
  firstSentences,
} from '@/src/programmes/models/presentation.service';
import type {
  KeyFigure,
  Party,
  PartyThemeProgramme,
} from '@/src/programmes/models/programme.model';
import { partyLinkLabel } from '@/src/programmes/models/seo/page-meta';
import { partyHref } from '@/src/programmes/models/seo/party-sections';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

type Mode = 'tous' | 'comparer';

function ProgrammeDetail({ programme, party }: { programme: PartyThemeProgramme; party: Party }) {
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
      <Link href={partyHref(party.id, 'programme-2027') as never}>
        <Text style={{ color: colors.tint, fontSize: 15 }}>
          {partyLinkLabel(party, 'programme-2027')}
        </Text>
      </Link>
    </>
  );
}

/** Chiffre clé : la valeur en gros, sa précision en dessous (présentation, le texte ne change pas). */
function KeyFigureCard({ figure }: { figure: KeyFigure }) {
  const { colors, fonts } = useTheme();
  const { headline, detail } = splitFigure(figure.value);
  return (
    <Card style={{ minWidth: 0, flex: 1 }}>
      <Text style={{ ...fonts.displayBold, fontSize: 28, lineHeight: 34, color: colors.tint }}>
        {headline}
      </Text>
      <Text style={{ fontSize: 14 }}>{figure.label}</Text>
      {detail ? (
        <Text style={{ fontSize: 14, lineHeight: 20, color: colors.text.secondary }}>{detail}</Text>
      ) : null}
      {/* Pastille collée au bas de la carte : alignée d'une carte à l'autre. */}
      <View style={{ marginTop: 'auto' }}>
        <SourceChip sources={[figure.source]} subject={figure.label} />
      </View>
    </Card>
  );
}

export default function ThemeScreen() {
  const { id, comparer } = useLocalSearchParams<{ id: string; comparer?: string }>();
  const vm = useViewModel(themeViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const [mode, setMode] = useState<Mode>('tous');
  const [selected, setSelected] = useState<string[]>([]);
  const theme = vm.theme;

  // Lien « Comparer avec un autre parti » (fiche parti) : comparaison ouverte, ce parti choisi.
  // Lu après l'hydratation : le HTML statique ne connaît pas la requête.
  useEffect(() => {
    if (!comparer || !vm.comparisons.some((c) => c.party.id === comparer)) return;
    setMode('comparer');
    setSelected([comparer]);
    scrollToId('partis');
  }, [comparer, vm.comparisons.length]);

  if (vm.status === 'loaded' && !theme) {
    return (
      <Page meta={vm.notFoundMeta} back={{ label: 'Débats', href: '/debats' }}>
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
  const anchors = [
    { id: 'enjeux', label: 'Les enjeux en bref' },
    { id: 'chiffres-cles', label: 'Chiffres clés' },
    { id: 'options', label: 'Les options en débat' },
    { id: 'partis', label: 'Ce que proposent les partis' },
    ...(vm.questions.length > 0
      ? [{ id: 'qui-est-pour', label: 'Qui est pour, qui est contre ?' }]
      : []),
  ];

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Débats', href: '/debats' }}
      onReachEnd={vm.markRead}
      railOnMobile="hidden"
      rail={
        theme ? (
          <>
            <Text variant="caption">
              Débat {vm.position.index} sur {vm.position.total}
            </Text>
            <AnchorList items={anchors} />
            {vm.nextTheme ? (
              <Button variant="secondary" href={`/debats/${vm.nextTheme.id}`}>
                {`Débat suivant : ${vm.nextTheme.title}`}
              </Button>
            ) : null}
          </>
        ) : undefined
      }
    >
      {theme ? (
        <>
          <View style={{ gap: effects.spacing.xs }}>
            {/* Sous 1024 px, le repère « thème n / N » reste au-dessus du titre ; au-delà il est dans le rail. */}
            <Only below="lg">
              <Text variant="caption">
                Débat {vm.position.index} sur {vm.position.total}
              </Text>
            </Only>
            <Text variant="title">{theme.title}</Text>
            <View style={{ alignSelf: 'flex-start' }}>
              <Button
                variant="secondary"
                fullWidth={false}
                onPress={() => {
                  setMode('comparer');
                  scrollToId('partis');
                }}
              >
                Comparer deux partis
              </Button>
            </View>
          </View>

          <View nativeID="enjeux">
            <Accordion
              headingLevel={2}
              title="Les enjeux en bref"
              subtitle={firstSentences(theme.context, 2)}
            >
              <Text style={{ fontSize: 16, lineHeight: 25 }}>{theme.context}</Text>
            </Accordion>
          </View>

          <View nativeID="chiffres-cles" style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              Chiffres clés
            </Text>
            {/* Sous 1024 px : défilement horizontal. Dès 1024 px : grille de 3 colonnes (CSS). */}
            <Only below="lg">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: effects.spacing.sm, paddingRight: 16 }}
              >
                {theme.keyFigures.map((figure) => (
                  <View key={figure.label} style={{ width: 230 }}>
                    <KeyFigureCard figure={figure} />
                  </View>
                ))}
              </ScrollView>
            </Only>
            {Platform.OS === 'web' ? (
              <View {...tv('only-from-lg', 'grid-3-lg')}>
                {theme.keyFigures.map((figure) => (
                  <KeyFigureCard key={figure.label} figure={figure} />
                ))}
              </View>
            ) : null}
          </View>

          <View nativeID="options" style={{ gap: effects.spacing.sm }}>
            <Text variant="caption" headingLevel={2}>
              Les options en débat
            </Text>
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

          <View nativeID="partis" style={{ gap: effects.spacing.sm }}>
            <Text variant="caption" headingLevel={2}>
              Ce que proposent les partis{vm.election ? ` · ${vm.election.title}` : ''}
            </Text>
            <Tabs
              tabs={[
                { id: 'tous', label: 'Tous (A-Z)' },
                { id: 'comparer', label: 'Comparer deux partis' },
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
                      <ProgrammeDetail programme={programme} party={party} />
                    </Accordion>
                  ) : null
                )
              ) : (
                <>
                  <Text style={{ color: colors.text.secondary }}>Choisissez deux partis :</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}>
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
                    <View style={{ flexDirection: 'row', gap: effects.spacing.sm }}>
                      {compared.map(({ party, programme }) => (
                        <Card key={party.id} style={{ flex: 1, padding: 12 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <PartyDot color={party.color} size={24} label={party.shortName} />
                            <Text style={{ ...fonts.bold, flex: 1 }}>{displayName(party)}</Text>
                          </View>
                          {programme ? (
                            <ProgrammeDetail programme={programme} party={party} />
                          ) : null}
                        </Card>
                      ))}
                    </View>
                  ) : null}
                </>
              )}
            </TabPanel>
          </View>

          {vm.questions.length > 0 ? (
            <View nativeID="qui-est-pour" style={{ gap: effects.spacing.sm }}>
              <Text variant="caption" headingLevel={2}>
                Qui est pour, qui est contre ?
              </Text>
              {vm.questions.map(({ question, positions }) => (
                <Accordion
                  key={question.id}
                  title={question.statement}
                  titleWeight="regular"
                  subtitle={undefined}
                >
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    {question.help}
                  </Text>
                  {positions.map(({ party, stance }) => (
                    <PartyStanceRow
                      key={party.id}
                      party={party}
                      stance={stance}
                      href={partyHref(party.id, 'positions')}
                    />
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
            <Only below="lg">
              <Button variant="secondary" href={`/debats/${vm.nextTheme.id}`}>
                {`Débat suivant : ${vm.nextTheme.title}`}
              </Button>
            </Only>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}
