import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/programmes/screens/ElectionScreen';

export const generateStaticParams = staticParamsFor('/elections/[id]');
