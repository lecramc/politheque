import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/programmes/screens/ThemeScreen';

export const generateStaticParams = staticParamsFor('/debats/[id]');
