import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/programmes/screens/JourneyStepScreen';

// Export statique : une page par étape. « Me situer » (contenu unique) renvoie à /me-situer.
export const generateStaticParams = staticParamsFor('/parcours/[etape]');
