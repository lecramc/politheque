import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/programmes/screens/party/PartyLayout';

// Expo expanse les segments dynamiques depuis le layout du dossier `[id]` : une fiche = quatre pages.
export const generateStaticParams = staticParamsFor('/partis/[id]');
