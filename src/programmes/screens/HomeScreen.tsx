import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { ClearProgressSheet } from '@/src/programmes/components/ClearProgressSheet';
import { JourneyArrival } from '@/src/programmes/components/JourneyArrival';
import { JourneyHeader } from '@/src/programmes/components/JourneyHeader';
import { JourneyIntro } from '@/src/programmes/components/JourneyIntro';
import { JourneyPath } from '@/src/programmes/components/JourneyPath';
import { JourneySummary } from '@/src/programmes/components/JourneySummary';
import { NewsBanner } from '@/src/programmes/components/NewsBanner';
import { Page, useIsDesktop } from '@/src/programmes/components/Page';
import { PassportLink } from '@/src/programmes/components/PassportLink';
import { PrivacyNote } from '@/src/programmes/components/PrivacyNote';
import type { JourneyStepId } from '@/src/programmes/models/journey.model';
import { homeMeta } from '@/src/programmes/models/seo/page-meta';
import { journeyViewModel } from '@/src/programmes/view-models/journey.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';

const NO_CELEBRATION: JourneyStepId[] = [];
const metaViewModel = pageMetaViewModel(homeMeta);

/** Accueil : le parcours citoyen en six étapes (mobile : chemin ; desktop : cartes). */
export default function HomeScreen() {
  const vm = useViewModel(journeyViewModel());
  const meta = useViewModel(metaViewModel);
  const { effects } = useTheme();
  const isDesktop = useIsDesktop();
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
  const path = (
    <JourneyPath
      nodes={vm.nodes}
      variant={isDesktop ? 'cards' : 'compact'}
      celebrate={focused ? vm.celebrations : NO_CELEBRATION}
      onCelebrated={vm.celebrationsShown}
      arriving={arriving}
    />
  );
  const passport = <PassportLink label={vm.passport.label} />;
  const privacy = <PrivacyNote onClear={() => setClearOpen(true)} />;

  return (
    <Page meta={meta} loading={!vm.loaded} wide>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', gap: effects.spacing.xl, alignItems: 'flex-start' }}>
          <View style={{ flex: 1, gap: effects.spacing.md }}>
            {vm.summary ? <JourneySummary summary={vm.summary} stacked /> : <JourneyIntro large />}
            {vm.news ? <NewsBanner news={vm.news} variant="card" /> : null}
            {passport}
            {privacy}
          </View>
          <View style={{ flex: 1.4, gap: effects.spacing.md }}>
            {path}
            <JourneyArrival finished={vm.finished} animateIn={arriving} />
          </View>
        </View>
      ) : (
        <>
          {vm.news ? <NewsBanner news={vm.news} variant="line" /> : null}
          <JourneyHeader summary={vm.summary} />
          {path}
          <JourneyArrival finished={vm.finished} animateIn={arriving} />
          {passport}
          {privacy}
        </>
      )}
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
