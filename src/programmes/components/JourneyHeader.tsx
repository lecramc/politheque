import React from 'react';
import { View } from 'react-native';

import { duration } from '@/components/motion';
import { Enter } from '@/components/ui/Enter';
import { JourneyIntro } from '@/src/programmes/components/JourneyIntro';
import { JourneySummary } from '@/src/programmes/components/JourneySummary';
import type { JourneySummaryModel } from '@/src/programmes/view-models/journey.view-model';

/** Hauteur minimale commune à l'intro et au résumé : pas de saut de page à l'hydratation. */
export const HEADER_MIN_HEIGHT = 200;

/**
 * Créneau d'en-tête de l'accueil : l'intro (état neutre, HTML statique) laisse la place
 * au résumé dès qu'une lecture est connue. Changer de `key` rejoue le fondu (`duration.page`).
 */
export function JourneyHeader({ summary }: { summary: JourneySummaryModel | null }) {
  return (
    <View style={{ minHeight: HEADER_MIN_HEIGHT, justifyContent: 'center' }}>
      {summary ? (
        <Enter key="summary" kind="fade" duration={duration.page}>
          <JourneySummary summary={summary} />
        </Enter>
      ) : (
        <JourneyIntro />
      )}
    </View>
  );
}
