import { Link } from 'expo-router';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Page } from '@/src/programmes/components/Page';
import { nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';

const SECTIONS = [
  { href: '/comprendre', label: 'Comprendre' },
  { href: '/partis', label: 'Partis' },
  { href: '/elections', label: 'Élections' },
  { href: '/debats', label: 'Débats' },
] as const;

const META = nonIndexableMeta('Page introuvable', '/404');

export default function NotFoundScreen() {
  const { colors, fonts } = useTheme();
  return (
    <Page meta={META}>
      <Text variant="title">Cette page n'existe pas.</Text>
      <Link href="/">
        <Text style={{ color: colors.tint, ...fonts.bold }}>Retour à l'accueil →</Text>
      </Link>
      {SECTIONS.map((section) => (
        <Link key={section.href} href={section.href}>
          <Text style={{ color: colors.tint }}>{section.label}</Text>
        </Link>
      ))}
    </Page>
  );
}
