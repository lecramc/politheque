import { JOURNEY_STEP_IDS } from '@/src/programmes/models/journey.model';

export { default } from '@/src/programmes/screens/JourneyStepScreen';

// Export statique : une page par étape. « Me situer » (contenu unique) renvoie à /me-situer.
export function generateStaticParams() {
  return JOURNEY_STEP_IDS.filter((id) => id !== 'me-situer').map((etape) => ({ etape }));
}
