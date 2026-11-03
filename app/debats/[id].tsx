import themes from '@/src/programmes/data/themes.json';

export { default } from '@/src/programmes/screens/ThemeScreen';

export function generateStaticParams() {
  return themes.map((theme) => ({ id: theme.id }));
}
