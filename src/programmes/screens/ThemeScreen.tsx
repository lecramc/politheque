import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { theme as baseTheme, useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { TextLink } from '@/components/ui/TextLink';
import { useColorStyle } from '@/components/webTheme';
import { MajorVotesGrid } from '@/src/assemblee/components/MajorVotesGrid';
import { VoteGlyph } from '@/src/assemblee/components/SeatMark';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Card } from '@/src/programmes/components/Card';
import { MoreText } from '@/src/programmes/components/MoreText';
import { OnThisPage } from '@/src/programmes/components/OnThisPage';
import { Page } from '@/src/programmes/components/Page';
import { PageSources } from '@/src/programmes/components/PageSources';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { PartyStanceRow } from '@/src/programmes/components/PartyStanceRow';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { figureColumns, splitFigure } from '@/src/programmes/models/key-figure.service';
import { DEBATE_ANCHORS } from '@/src/programmes/models/on-this-page';
import { firstSentence } from '@/src/programmes/models/presentation.service';
import type { ThemeProgramme } from '@/src/programmes/models/programme-publication.service';
import type { KeyFigure, Party } from '@/src/programmes/models/programme.model';
import { partyLinkLabel } from '@/src/programmes/models/seo/page-meta';
import { partyHref } from '@/src/programmes/models/seo/party-sections';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

/** Le sous-titre d'un parti : première phrase du résumé, ou la mention qui en tient lieu. */
const programmeSubtitle = (programme: ThemeProgramme) =>
  programme.kind === 'mesures' ? firstSentence(programme.summary) : programme.notice;

function ProgrammeDetail({ programme, party }: { programme: ThemeProgramme; party: Party }) {
  const c = useColorStyle();
  if (programme.kind !== 'mesures') {
    return (
      <>
        <Text style={[styles.body15, c((p) => ({ color: p.text.secondary }))]}>
          {programmeSubtitle(programme)}
        </Text>
        <Link href={partyHref(party.id, 'programme') as never}>
          <Text style={[styles.link15, c((p) => ({ color: p.tint }))]}>
            {partyLinkLabel(party, 'programme')}
          </Text>
        </Link>
      </>
    );
  }
  return (
    <>
      <Text style={[styles.body15, c((p) => ({ color: p.text.secondary }))]}>
        {programme.summary}
      </Text>
      {programme.measures.map((measure) => (
        <View
          key={measure.text}
          style={[styles.measure, c((p) => ({ borderColor: p.surface.border.primary }))]}
        >
          <Text style={styles.body15}>{measure.text}</Text>
          <SourceChip sources={measure.sources} subject={measure.text} />
        </View>
      ))}
      <Link href={partyHref(party.id, 'programme') as never}>
        <Text style={[styles.link15, c((p) => ({ color: p.tint }))]}>
          {partyLinkLabel(party, 'programme')}
        </Text>
      </Link>
    </>
  );
}

/** Chiffre clé : la valeur en gros, sa précision en dessous (présentation, le texte ne change pas). */
function KeyFigureCard({ figure }: { figure: KeyFigure }) {
  const c = useColorStyle();
  const { headline, detail } = splitFigure(figure.value);
  return (
    <Card style={styles.figureCard}>
      <Text style={[styles.figureValue, c((p) => ({ color: p.tint }))]}>{headline}</Text>
      <Text style={styles.text14}>{figure.label}</Text>
      {detail ? (
        <Text style={[styles.detail, c((p) => ({ color: p.text.secondary }))]}>{detail}</Text>
      ) : null}
      {/* Pastille collée au bas de la carte : alignée d'une carte à l'autre. */}
      <View style={styles.pushDown}>
        <SourceChip sources={[figure.source]} subject={figure.label} />
      </View>
    </Card>
  );
}

export default function ThemeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useViewModel(themeViewModel(id));
  const { colors, effects } = useTheme();
  const c = useColorStyle();
  const theme = vm.theme;

  if (vm.status === 'loaded' && !theme) {
    return (
      <Page meta={vm.notFoundMeta} back={{ label: 'Partis', href: '/partis' }}>
        <Text variant="title">Thème introuvable</Text>
      </Page>
    );
  }

  return (
    <Page
      meta={vm.meta}
      article
      loading={vm.status !== 'loaded'}
      back={{ label: 'Partis', href: '/partis' }}
      onReachEnd={vm.markRead}
    >
      {theme ? (
        <>
          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="title">{theme.title}</Text>
            {/* Phrase datée et autonome, même gabarit pour les neuf débats (audit SEO § 5.1). */}
            {vm.summary ? (
              <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text.secondary }}>
                {vm.summary}
              </Text>
            ) : null}
            <Text style={{ fontSize: 16, lineHeight: 25 }}>{theme.context}</Text>
            {theme.contextMore ? (
              <MoreText>
                <Text style={{ fontSize: 16, lineHeight: 25, color: colors.text.secondary }}>
                  {theme.contextMore}
                </Text>
              </MoreText>
            ) : null}
          </View>

          <OnThisPage items={DEBATE_ANCHORS} />

          <View nativeID="chiffres-cles" style={{ gap: effects.spacing.xs }}>
            <Text variant="caption" headingLevel={2}>
              Chiffres clés
            </Text>
            {/* Sous 1024 px : défilement horizontal. Dès 1024 px : grille de 3 colonnes (2 si une carte
                resterait seule sur la dernière ligne), par CSS. */}
            <Only below="lg">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: effects.spacing.sm,
                  paddingRight: effects.spacing.smd,
                }}
              >
                {theme.keyFigures.map((figure) => (
                  <View key={figure.label} style={{ width: 230 }}>
                    <KeyFigureCard figure={figure} />
                  </View>
                ))}
              </ScrollView>
            </Only>
            {Platform.OS === 'web' ? (
              <View
                {...tv(
                  'only-from-lg',
                  figureColumns(theme.keyFigures.length) === 2 ? 'grid-2-lg' : 'grid-3-lg',
                  'grid-stretch'
                )}
              >
                {theme.keyFigures.map((figure) => (
                  <KeyFigureCard key={figure.label} figure={figure} />
                ))}
              </View>
            ) : null}
          </View>

          {vm.questions.length > 0 ? (
            <View nativeID="pour-contre">
              {/* Ouvert par défaut : c'est la réponse à « et les partis, qu'en pensent-ils ? ». */}
              <Accordion headingLevel={2} title="Qui est pour, qui est contre ?" defaultOpen>
                {vm.questions.map(({ question, groups }) => (
                  <View key={question.id} style={styles.question}>
                    <Text style={styles.heading16}>{question.statement}</Text>
                    <Text style={[styles.text14, c((p) => ({ color: p.text.secondary }))]}>
                      {question.help}
                    </Text>
                    {groups.map((group) => (
                      <View
                        key={String(group.stance)}
                        role="group"
                        aria-label={group.label}
                        style={styles.stanceGroup}
                      >
                        <View style={styles.stanceGroupTitle}>
                          <VoteGlyph glyph={group.glyph} size={20} />
                          <Text style={styles.heading16}>{group.label}</Text>
                        </View>
                        {group.items.map(({ party, stance }) => (
                          <PartyStanceRow
                            key={party.id}
                            party={party}
                            stance={stance}
                            href={partyHref(party.id, 'positions')}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                ))}
              </Accordion>
            </View>
          ) : null}

          {vm.assembleeVotes ? (
            <View nativeID="votes-assemblee" style={{ gap: effects.spacing.sm }}>
              <Text variant="caption" headingLevel={2}>
                {vm.assembleeVotes.title}
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text.secondary }}>
                {vm.assembleeVotes.method}
              </Text>
              <MajorVotesGrid grid={vm.assembleeVotes.grid} />
              <TextLink href={vm.assembleeVotes.all.href} standalone>
                {`${vm.assembleeVotes.all.label} →`}
              </TextLink>
              {vm.assembleeVotes.law ? (
                <TextLink href={vm.assembleeVotes.law.href} standalone>
                  {`${vm.assembleeVotes.law.label} →`}
                </TextLink>
              ) : null}
            </View>
          ) : null}

          <View nativeID="partis" style={{ gap: effects.spacing.sm }}>
            <Text variant="caption" headingLevel={2}>
              Ce que proposent les partis{vm.election ? ` · ${vm.election.title}` : ''}
            </Text>
            {vm.comparisons.map(({ party, candidate, programme }) =>
              programme ? (
                <Accordion
                  key={party.id}
                  title={party.name}
                  subtitle={programmeSubtitle(programme)}
                  leading={<PartyDot color={party.color} size={32} label={party.shortName} />}
                >
                  <Text style={[styles.text14, c((p) => ({ color: p.text.secondary }))]}>
                    {candidate.split(' (')[0]}
                  </Text>
                  <ProgrammeDetail programme={programme} party={party} />
                </Accordion>
              ) : null
            )}
            {/* Un seul comparateur sur le site : il s'ouvre sur ce thème. */}
            <TextLink href={`/partis/comparer?theme=${theme.id}`} standalone>
              Comparer deux partis sur ce thème →
            </TextLink>
          </View>

          <View nativeID="aller-plus-loin" style={{ gap: effects.spacing.sm }}>
            <Text variant="caption" headingLevel={2}>
              Pour aller plus loin
            </Text>
            <Accordion headingLevel={3} title="Les options en débat">
              {theme.debates.map((debate) => (
                <View key={debate.question} style={styles.debate}>
                  <Text style={styles.heading16}>{debate.question}</Text>
                  {debate.options.map((option) => (
                    <Text
                      key={option}
                      style={[styles.option, c((p) => ({ borderColor: p.surface.border.primary }))]}
                    >
                      {option}
                    </Text>
                  ))}
                </View>
              ))}
              <Text style={[styles.text13, c((p) => ({ color: p.text.secondary }))]}>
                Options présentées sans ordre de préférence.
              </Text>
            </Accordion>
          </View>

          <PageSources
            sources={[
              ...theme.keyFigures.map((f) => f.source),
              ...vm.measureSources,
              ...vm.questions.flatMap((q) => q.positions.flatMap((p) => p.stance?.sources ?? [])),
            ]}
          />

          {vm.nextTheme ? (
            <Button variant="secondary" href={`/debats/${vm.nextTheme.id}`}>
              {`Débat suivant : ${vm.nextTheme.title}`}
            </Button>
          ) : null}
        </>
      ) : null}
    </Page>
  );
}

// Parties statiques en feuille de style (classes sur le web) ; les couleurs viennent de `useColorStyle`.
const styles = StyleSheet.create({
  body15: { fontSize: 15, lineHeight: 23 },
  link15: { fontSize: 15 },
  text14: { fontSize: 14 },
  text13: { fontSize: 13 },
  detail: { fontSize: 14, lineHeight: 20 },
  heading16: { ...baseTheme.fonts.bold, fontSize: 16 },
  measure: {
    gap: baseTheme.effects.spacing.xs,
    paddingTop: baseTheme.effects.spacing.sm,
    borderTopWidth: 1,
  },
  figureCard: { minWidth: 0, flex: 1 },
  figureValue: { ...baseTheme.fonts.displayBold, fontSize: 28, lineHeight: 34 },
  pushDown: { marginTop: 'auto' },
  debate: { gap: baseTheme.effects.spacing.xxs },
  question: { gap: baseTheme.effects.spacing.sm },
  stanceGroup: { gap: baseTheme.effects.spacing.xs },
  stanceGroupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: baseTheme.effects.spacing.xs,
  },
  option: {
    fontSize: 15,
    lineHeight: 23,
    paddingVertical: baseTheme.effects.spacing.xs,
    borderTopWidth: 1,
  },
});
