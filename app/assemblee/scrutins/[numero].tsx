import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/assemblee/screens/ScrutinScreen';

export const generateStaticParams = staticParamsFor('/assemblee/scrutins/[numero]');
