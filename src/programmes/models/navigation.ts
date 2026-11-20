export type NavHref = '/' | '/comprendre' | '/partis' | '/assemblee' | '/me-situer';

export type NavItem = {
  href: NavHref;
  label: string;
  icon: string;
  matches: (pathname: string) => boolean;
};

/**
 * Quatre rubriques. Les débats (`/debats/[id]`) vivent dans Partis ; les votes de l'Assemblée
 * (`/assemblee/**`) ont leur rubrique ; l'élection est la pastille de l'en-tête, hors rubrique.
 */
export const NAV: NavItem[] = [
  {
    href: '/comprendre',
    label: 'Comprendre',
    icon: 'book-outline',
    matches: (p) => p.startsWith('/comprendre') || p.startsWith('/passeport'),
  },
  {
    href: '/partis',
    label: 'Partis',
    icon: 'people-outline',
    matches: (p) => p.startsWith('/partis') || p.startsWith('/debats'),
  },
  {
    href: '/assemblee',
    label: 'Assemblée',
    icon: 'business-outline',
    matches: (p) => p.startsWith('/assemblee'),
  },
  {
    href: '/me-situer',
    label: 'Me situer',
    icon: 'compass-outline',
    matches: (p) => p.startsWith('/me-situer'),
  },
];

/** Barre du bas en mobile : l'accueil, puis les quatre rubriques (cinq onglets). */
export const BOTTOM_NAV: NavItem[] = [
  { href: '/', label: 'Accueil', icon: 'home-outline', matches: (p) => p === '/' || p === '' },
  ...NAV,
];
