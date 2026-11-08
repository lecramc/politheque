import { Text } from '@/components/Themed';
import { TextLink } from '@/components/ui/TextLink';
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
  return (
    <Page meta={META}>
      <Text variant="title">Cette page n'existe pas.</Text>
      <TextLink href="/" size={16} standalone>
        Retour à l'accueil
      </TextLink>
      {SECTIONS.map((section) => (
        <TextLink key={section.href} href={section.href} size={16} standalone>
          {section.label}
        </TextLink>
      ))}
    </Page>
  );
}
