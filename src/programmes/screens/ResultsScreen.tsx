import { Link } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { duration } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import Button from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { appDispatch } from '@/src/core/store/create-store';
import { readLocationHash } from '@/src/core/web/browser-actions';
import { tv } from '@/src/core/web/tv';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Arc } from '@/src/programmes/components/Arc';
import { AxisChart } from '@/src/programmes/components/AxisChart';
import { Card } from '@/src/programmes/components/Card';
import { KeepResults } from '@/src/programmes/components/KeepResults';
import { Page } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { PartyPlacement } from '@/src/programmes/components/PartyPlacement';
import { PartyStanceRow } from '@/src/programmes/components/PartyStanceRow';
import { ResultsPrint } from '@/src/programmes/components/ResultsPrint';
import { SeparatingQuestions } from '@/src/programmes/components/SeparatingQuestions';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { STANCE_LABEL } from '@/src/programmes/components/StanceBadge';
import { StanceLegend } from '@/src/programmes/components/StanceLegend';
import { TabPanel, Tabs } from '@/src/programmes/components/Tabs';
import {
  decodeAnswers,
  INVALID_LINK_MESSAGE,
  readCodeFromHash,
} from '@/src/programmes/models/answer-link.service';
import { chartLegend } from '@/src/programmes/models/chart-legend.service';
import { MIN_AXIS_COUNT } from '@/src/programmes/models/matching.service';
import type { Source } from '@/src/programmes/models/programme.model';
import { TIED_LABEL } from '@/src/programmes/models/results.copy';
import { nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';
import { quizActions } from '@/src/programmes/store/quiz.slice';
import { resultsViewModel } from '@/src/programmes/view-models/results.view-model';

/** Page non indexée, avec ses balises dès le HTML statique (même pendant la lecture du lien). */
const RESULTS_META = nonIndexableMeta('Vos résultats', '/me-situer/resultats');

type Tab = 'proximite' | 'carte' | 'detail';
/** Source du contrôle de cohérence : l'ordre des partis est comparé à l'enquête d'experts CHES. */
const CHES_SOURCES: Source[] = [
  {
    title: 'Chapel Hill Expert Survey 2024 — données par parti',
    url: 'https://www.chesdata.eu/ches-europe/',
    date: '2025',
    kind: 'statistique',
  },
  {
    title: 'CHES 2024, fichier des moyennes par parti (CSV)',
    url: 'https://github.com/chesdata/chesdata.github.io/releases/download/ches-europe/CHES_2024_final_v2.csv',
    date: '2025',
    kind: 'statistique',
  },
];

export default function ResultsScreen() {
  const vm = useViewModel(resultsViewModel);
  const { colors, effects, fonts } = useTheme();
  const [tab, setTab] = useState<Tab>('proximite');
  const [alphabetical, setAlphabetical] = useState(false);
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const dispatch = appDispatch();

  // Lien personnel (#r=v2.…) : lu après l'hydratation seulement (le HTML statique ne voit pas le
  // fragment, le premier rendu reste donc identique). Les réponses vont en mémoire, jamais dans
  // le stockage, et le parcours n'est pas touché.
  const [link, setLink] = useState<'checking' | 'none' | 'loaded' | 'invalid'>('checking');
  useEffect(() => {
    const code = readCodeFromHash(readLocationHash());
    if (code === null) return setLink('none');
    const decoded = decodeAnswers(code);
    if (!decoded.ok) return setLink('invalid');
    dispatch(quizActions.loadAnswers(decoded.answers));
    setLink('loaded');
  }, [dispatch]);
  const ready = vm.ready && link !== 'checking';

  // Révélation des arcs : une seule fois, en séquence alphabétique (neutralité : l'ordre
  // ne dépend pas du score), mêmes durées pour tous, l'ensemble tient en ~1,2 s.
  const revealDelays = useMemo(() => {
    const names = vm.ranking.map((r) => r.party).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    const step = Math.min(
      120,
      (duration.sequence - duration.reveal) / Math.max(1, names.length - 1)
    );
    return Object.fromEntries(names.map((party, index) => [party.id, Math.round(index * step)]));
  }, [vm.ranking]);
  const revealPlayed = useRef(false);
  useEffect(() => {
    if (ready && vm.answeredCount > 0) revealPlayed.current = true;
  }, [ready, vm.answeredCount]);

  if (ready && vm.answeredCount === 0) {
    return (
      <Page meta={RESULTS_META} back={{ label: 'Me situer', href: '/me-situer' }}>
        <View
          style={{
            alignItems: 'center',
            gap: effects.spacing.md,
            paddingVertical: effects.spacing.xl,
          }}
        >
          {vm.resultsLost ? (
            <Text role="status" style={{ textAlign: 'center', fontSize: 17 }}>
              {vm.resultsLostMessage}
            </Text>
          ) : (
            <>
              <Text variant="display" style={{ textAlign: 'center' }}>
                Pas encore de réponses
              </Text>
              <Text style={{ color: colors.text.secondary, textAlign: 'center', fontSize: 17 }}>
                Répondez à quelques affirmations pour voir de quels programmes vous êtes proche.
              </Text>
            </>
          )}
          {link === 'invalid' ? (
            <Text role="alert" style={{ textAlign: 'center', fontSize: 16 }}>
              {INVALID_LINK_MESSAGE}
            </Text>
          ) : null}
          <Link href="/me-situer">
            <Text style={{ color: colors.tint, ...fonts.bold, fontSize: 17 }}>
              Commencer le questionnaire →
            </Text>
          </Link>
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

  const tabList: { id: Tab; label: string }[] = [
    { id: 'proximite', label: 'Proximité' },
    { id: 'carte', label: 'Ma carte' },
    { id: 'detail', label: 'Détail' },
  ];
  const themeChip = (theme: { id: string | null; title: string }) => {
    const active = themeFilter === theme.id;
    return (
      <Pressable
        key={theme.id ?? 'tous'}
        onPress={() => setThemeFilter(theme.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
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
  };
  const themeChips = [{ id: null, title: 'Tous' }, ...vm.themes];
  const legend = chartLegend(vm.partyPositions.map(({ party }) => party));

  return (
    <Page
      meta={RESULTS_META}
      loading={!ready}
      back={{ label: 'Me situer', href: '/me-situer' }}
      railOnMobile="hidden"
      rail={
        <>
          <Tabs tabs={tabList} value={tab} onChange={setTab} vertical />
          <Button variant="secondary" onPress={vm.restart}>
            Recommencer le questionnaire
          </Button>
          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
            Vos réponses ne quittent pas votre navigateur : rien n'est envoyé.
          </Text>
        </>
      }
    >
      <View {...tv('no-print')} style={{ gap: effects.spacing.lg }}>
        {link === 'invalid' ? (
          <Card style={{ borderColor: colors.accent.warning }}>
            <Text role="alert">{INVALID_LINK_MESSAGE}</Text>
          </Card>
        ) : null}
        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="title">Vos résultats</Text>
          <Text style={{ color: colors.text.secondary, fontSize: 16 }}>
            Proximité avec les positions publiques des partis, pas une consigne de vote. Un parti
            n'est noté que si au moins 5 de vos réponses peuvent être comparées à ses positions.{' '}
            <TextLink href="/methodologie">Comment ça marche</TextLink>
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

        {/* Sous 1024 px : onglets soulignés ici ; dès 1024 px : liste verticale dans le rail. */}
        <Only below="lg">
          <Tabs tabs={tabList} value={tab} onChange={setTab} />
        </Only>

        <TabPanel id={tab}>
          {tab === 'proximite' ? (
            <View style={{ gap: effects.spacing.sm }}>
              {vm.leadGroup.sentence ? (
                <Card>
                  <Text variant="caption" headingLevel={2}>
                    Groupe de tête
                  </Text>
                  <Text>{vm.leadGroup.sentence}</Text>
                  {vm.separating.length ? (
                    <View style={{ gap: effects.spacing.xs }}>
                      <Text variant="caption" headingLevel={3}>
                        Ce qui les départage
                      </Text>
                      <SeparatingQuestions items={vm.separating} />
                    </View>
                  ) : null}
                  {vm.leadGroup.pointer ? <Text>{vm.leadGroup.pointer}</Text> : null}
                </Card>
              ) : null}
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                {vm.marginSentence} Les pourcentages ne portent pas sur le même nombre de questions
                selon les partis : un parti qui s'exprime peu est comparé sur moins de sujets, ce
                qui peut gonfler son score.
              </Text>
              <View style={{ flexDirection: 'row', gap: effects.spacing.xs, alignItems: 'center' }}>
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
                        alphabetical === option.id
                          ? { ...fonts.bold, color: colors.tint }
                          : undefined
                      }
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {ranking.map(
                ({
                  party,
                  score,
                  comparedCount,
                  agree,
                  disagree,
                  tied,
                  fewCompared,
                  fewComparedNote,
                }) => (
                  <Accordion
                    key={party.id}
                    title={party.name}
                    subtitle={`Comparé sur ${comparedCount} question${comparedCount > 1 ? 's' : ''}${tied ? ` · ${TIED_LABEL}` : ''}`}
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
                          delay={revealDelays[party.id] ?? 0}
                          animate={!revealPlayed.current}
                          dashedRemainder={fewCompared}
                          accessibilityLabel={`Proximité avec ${party.name} : ${score} %, sur ${comparedCount} questions`}
                        >
                          <Text
                            plainDigits
                            style={{ ...fonts.bold, fontSize: 14, color: colors.tint }}
                          >
                            {score} %
                          </Text>
                        </Arc>
                      )
                    }
                  >
                    {fewComparedNote ? (
                      <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                        {fewComparedNote}
                      </Text>
                    ) : null}
                    {agree.length ? (
                      <View style={{ gap: effects.spacing.xxs }}>
                        <Text variant="caption">Vous êtes proches sur</Text>
                        {agree.slice(0, 3).map((q) => (
                          <Text key={q.id} style={{ fontSize: 15 }}>
                            • {q.statement}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                    {disagree.length ? (
                      <View style={{ gap: effects.spacing.xxs }}>
                        <Text variant="caption">Vous divergez sur</Text>
                        {disagree.slice(0, 3).map((q) => (
                          <Text key={q.id} style={{ fontSize: 15 }}>
                            • {q.statement}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                    <TextLink href={`/partis/${party.id}`} standalone>
                      Voir la fiche du parti
                    </TextLink>
                  </Accordion>
                )
              )}
            </View>
          ) : null}

          {tab === 'carte' ? (
            <Card>
              {/* Tracé + légende alphabétique (aucun second classement) : côte à côte dès 1200 px. */}
              <View {...tv('map-layout')} style={{ gap: effects.spacing.md }}>
                <AxisChart axes={vm.axes} user={vm.userPosition} parties={vm.partyPositions} />
                <View
                  role="list"
                  aria-label="Légende : partis par ordre alphabétique"
                  style={{ gap: effects.spacing.xs, flexShrink: 1 }}
                >
                  <Text variant="caption">Légende · A-Z</Text>
                  {legend.map((party) => (
                    <View
                      key={party.id}
                      role="listitem"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: effects.spacing.xs,
                      }}
                    >
                      <PartyDot color={party.color} size={14} />
                      <Text style={{ fontSize: 14, flexShrink: 1 }}>
                        <Text style={{ ...fonts.bold, fontSize: 14 }}>{party.shortName}</Text>
                        {` · ${party.name}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                Plus deux points sont proches, plus les réponses se ressemblent. Positions calculées
                uniquement à partir des affirmations du questionnaire : les axes simplifient la
                réalité.
              </Text>
            </Card>
          ) : null}

          {tab === 'carte' ? (
            <View style={{ gap: effects.spacing.sm }}>
              <Text
                accessibilityRole="header"
                aria-level={2}
                style={{
                  ...fonts.display,
                  fontSize: effects.sizes.text.display,
                  color: colors.text.strong,
                }}
              >
                Comment les partis sont placés
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                Chaque point de la carte est la moyenne des positions publiques du parti sur les
                affirmations du questionnaire liées à cet axe. Ouvrez un parti pour voir ces
                positions et leurs sources.
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                Un parti n'est placé sur un axe qu'à partir de {MIN_AXIS_COUNT} positions connues.
              </Text>
              {vm.axisExplanations.map((placement) => (
                <PartyPlacement
                  key={placement.party.id}
                  party={placement.party}
                  axes={vm.axes}
                  placement={placement}
                />
              ))}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: effects.spacing.xs,
                  flexWrap: 'wrap',
                }}
              >
                <Text style={{ flexShrink: 1, fontSize: 14, color: colors.text.secondary }}>
                  Contrôle de cohérence : l'ordre des partis a été comparé à celui d'une enquête
                  d'experts indépendante, la Chapel Hill Expert Survey 2024.
                </Text>
                <SourceChip
                  compact
                  sources={CHES_SOURCES}
                  subject="Contrôle de cohérence des positions"
                />
              </View>
            </View>
          ) : null}

          {tab === 'detail' ? (
            <View style={{ gap: effects.spacing.sm }}>
              <Only from="md">
                <StanceLegend />
              </Only>
              {/* Mobile : puces en défilement horizontal. Dès 768 px : elles passent à la ligne. */}
              <Only below="md">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  // Marge intérieure (compensée à l'extérieur) : l'anneau de focus n'est pas rogné.
                  style={{ margin: -effects.spacing.xs }}
                  contentContainerStyle={{ gap: effects.spacing.xs, padding: effects.spacing.xs }}
                >
                  {themeChips.map(themeChip)}
                </ScrollView>
              </Only>
              <Only
                from="md"
                style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}
              >
                {themeChips.map(themeChip)}
              </Only>
              {details.map(({ question, userValue, important, positions }) => (
                <Accordion
                  key={question.id}
                  title={question.statement}
                  titleWeight="regular"
                  subtitle={`Vous : ${STANCE_LABEL[String(userValue)]}${important ? ' (compte double)' : ''}`}
                >
                  {positions.map(({ party, stance }) => (
                    <PartyStanceRow key={party.id} party={party} stance={stance} />
                  ))}
                </Accordion>
              ))}
            </View>
          ) : null}
        </TabPanel>

        {vm.answeredCount > 0 ? (
          <KeepResults personalLink={vm.personalLink} mailto={vm.mailto} />
        ) : null}

        <Only below="lg">
          <Button variant="secondary" onPress={vm.restart}>
            Recommencer le questionnaire
          </Button>
        </Only>
      </View>

      <ResultsPrint
        date={vm.recapDate}
        ranking={vm.ranking}
        axes={vm.axes}
        userPosition={vm.userPosition}
        partyPositions={vm.partyPositions}
        questions={vm.printQuestions}
      />
    </Page>
  );
}
