import { staticParamsFor } from '@/src/programmes/models/seo/site-routes';

export { default } from '@/src/programmes/screens/GuideSectionScreen';

export const generateStaticParams = staticParamsFor('/comprendre/[id]');
