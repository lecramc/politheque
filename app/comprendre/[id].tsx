import guide from '@/src/programmes/data/guide.json';

export { default } from '@/src/programmes/screens/GuideSectionScreen';

export function generateStaticParams() {
  return guide.map((section) => ({ id: section.id }));
}
