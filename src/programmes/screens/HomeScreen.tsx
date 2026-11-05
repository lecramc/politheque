import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { duration } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Enter } from '@/components/ui/Enter';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { tv } from '@/src/core/web/tv';
import { ClearProgressSheet } from '@/src/programmes/components/ClearProgressSheet';
import { JourneyArrival } from '@/src/programmes/components/JourneyArrival';
import { HEADER_MIN_HEIGHT } from '@/src/programmes/components/JourneyHeader';
import { JourneyIntro } from '@/src/programmes/components/JourneyIntro';
import { JourneyPath } from '@/src/programmes/components/JourneyPath';
import { JourneySummary } from '@/src/programmes/components/JourneySummary';
import { NewsBanner } from '@/src/programmes/components/NewsBanner';
import { Page } from '@/src/programmes/components/Page';
import { PassportLink } from '@/src/programmes/components/PassportLink';
import { PrivacyNote } from '@/src/programmes/components/PrivacyNote';
import { RailLayout } from '@/src/programmes/components/RailLayout';
import type { JourneyStepId } from '@/src/programmes/models/journey.model';
import { homeMeta } from '@/src/programmes/models/seo/page-meta';
import { journeyViewModel } from '@/src/programmes/view-models/journey.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';

const NO_CELEBRATION: JourneyStepId[] = [];
const metaViewModel = pageMetaViewModel(homeMeta);

/**
 * Accueil : le parcours citoyen en six étapes. Une seule arborescence, la CSS choisit :
 * mobile = chemin en zigzag ; de 768 à 1023 px = cartes en une colonne ; dès 1024 px = titre
 * pleine largeur, puis rail (résumé, élection, passeport, confidentialité) et colonne des étapes.
 */
export default function HomeScreen() {
  const vm = useViewModel(journeyViewModel());
  const meta = useViewModel(metaViewModel);
  const { effects } = useTheme();
  const [clearOpen, setClearOpen] = useState(false);
  // L'accueil reste monté sous la pile en natif : rien ne se joue en arrière-plan.
  const [focused, setFocused] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );

  const arriving = focused && vm.finished && vm.celebrations.length > 0;

  // Le chemin existe en deux variantes (zigzag / cartes), toutes deux montées : chacune appelle
  // `onCelebrated` à la fin de la séquence. Une seule notification par série de tampons.
  const notified = useRef('');
  useEffect(() => {
    if (vm.celebrations.length === 0) notified.current = '';
  }, [vm.celebrations]);
  const { celebrationsShown } = vm;
  const onCelebrated = useCallback(
    (ids: JourneyStepId[]) => {
      const key = ids.join('|');
      if (notified.current === key) return;
      notified.current = key;
      celebrationsShown(ids);
    },
    [celebrationsShown]
  );

  const celebrate = focused ? vm.celebrations : NO_CELEBRATION;
  const passport = <PassportLink label={vm.passport.label} />;
  const privacy = <PrivacyNote onClear={() => setClearOpen(true)} />;

  return (
    <Page meta={meta} loading={!vm.loaded} template="hub">
      {vm.news ? (
        <Only below="lg">
          <NewsBanner news={vm.news} variant="line" />
        </Only>
      ) : null}

      {/* Titre : un seul <h1>, dans le HTML statique comme au premier rendu client. */}
      <View {...tv('hdr-slot')} style={styles.header}>
        {vm.summary ? (
          <>
            <Only below="lg">
              <Enter key="summary" kind="fade" duration={duration.page}>
                <JourneySummary summary={vm.summary} />
              </Enter>
            </Only>
            <Only from="lg">
              <JourneyIntro />
            </Only>
          </>
        ) : (
          <JourneyIntro />
        )}
      </View>

      <RailLayout
        railOnMobile="hidden"
        rail={
          <>
            {vm.summary ? <JourneySummary summary={vm.summary} stacked /> : null}
            {vm.news ? <NewsBanner news={vm.news} variant="card" /> : null}
            {passport}
            {privacy}
          </>
        }
      >
        <View style={{ gap: effects.spacing.md }}>
          <Only below="md">
            <JourneyPath
              nodes={vm.nodes}
              variant="compact"
              celebrate={celebrate}
              onCelebrated={onCelebrated}
              arriving={arriving}
            />
          </Only>
          <Only from="md">
            <JourneyPath
              nodes={vm.nodes}
              variant="cards"
              celebrate={celebrate}
              onCelebrated={onCelebrated}
              arriving={arriving}
            />
          </Only>
          <JourneyArrival finished={vm.finished} animateIn={arriving} />
          <Only below="lg" style={{ gap: effects.spacing.md }}>
            {passport}
            {privacy}
          </Only>
        </View>
      </RailLayout>
      <ClearProgressSheet
        isOpen={clearOpen}
        onClose={() => setClearOpen(false)}
        onConfirm={() => {
          vm.clearProgress();
          setClearOpen(false);
        }}
      />
    </Page>
  );
}

// `min-height` est remise à zéro par la CSS dès 1024 px (le titre n'a plus besoin de réserve).
const styles = StyleSheet.create({
  header: { minHeight: HEADER_MIN_HEIGHT, justifyContent: 'center' },
});
