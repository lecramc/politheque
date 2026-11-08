import type { Catalog, Party } from '@/src/programmes/models/programme.model';

export type PartySection = 'programme' | 'positions' | 'histoire' | 'procedures';

/**
 * `label` : titre complet (fil d'Ariane, métadonnées, onglet dès 768 px) ; `tabLabel` : libellé
 * court de l'onglet. Ordre des onglets : Programme (par défaut), Positions, Histoire, Procédures.
 */
export const PARTY_SECTIONS: readonly {
  id: PartySection;
  label: string;
  tabLabel: string;
  segment: string;
}[] = [
  { id: 'programme', label: 'Programme', tabLabel: 'Programme', segment: 'programme-2027' },
  { id: 'positions', label: 'Positions', tabLabel: 'Positions', segment: 'positions' },
  { id: 'histoire', label: 'Histoire', tabLabel: 'Histoire', segment: 'histoire' },
  {
    id: 'procedures',
    label: 'Procédures judiciaires',
    tabLabel: 'Procédures',
    segment: 'procedures-judiciaires',
  },
];

export const partySectionLabel = (section: PartySection) =>
  PARTY_SECTIONS.find((s) => s.id === section)!.label;

/**
 * Adresse d'un onglet. L'onglet par défaut (Programme) garde `/programme-2027` : `/partis/[id]` n'est
 * qu'un alias (canonical vers cette adresse), jamais le lien que le site publie.
 */
export function partyHref(partyId: string, section: PartySection = 'programme'): string {
  const segment = PARTY_SECTIONS.find((s) => s.id === section)!.segment;
  return `/partis/${partyId}/${segment}`;
}

/** Section active d'après le chemin : '/partis/rn/histoire' → 'histoire' ; '/partis/rn' → 'programme'. */
export function sectionFromPath(pathname: string): PartySection | null {
  const match = /^\/partis\/[^/]+(?:\/([^/]+))?\/?$/.exec(pathname);
  if (!match) return null;
  if (!match[1]) return 'programme';
  return PARTY_SECTIONS.find((s) => s.segment === match[1])?.id ?? null;
}

/**
 * La section « Procédures judiciaires » existe pour tous les partis ou pour aucun : seulement
 * quand chaque parti du catalogue a son dossier publié.
 */
export function hasLegalSection(catalog: Pick<Catalog, 'parties' | 'legal'>): boolean {
  return (
    catalog.legal.length > 0 &&
    catalog.parties.every((party) => catalog.legal.some((d) => d.partyId === party.id))
  );
}

/**
 * Même règle pour tous : histoire si `history`, programme si candidature à l'élection mise en
 * avant, procédures si les dossiers sont publiés (`legalPublished`, voir `hasLegalSection`).
 */
export function availableSections(
  party: Party,
  featuredElectionId: string | null,
  legalPublished = false
): PartySection[] {
  return PARTY_SECTIONS.map((s) => s.id).filter(
    (id) =>
      (id !== 'histoire' || !!party.history) &&
      (id !== 'programme' || (!!featuredElectionId && !!party.candidacies[featuredElectionId])) &&
      (id !== 'procedures' || legalPublished)
  );
}

const LEGACY_TABS: Record<string, PartySection> = {
  bref: 'programme',
  histoire: 'histoire',
  positions: 'positions',
  programme: 'programme',
};

/** Compatibilité des anciens liens `?onglet=` ; null si la valeur est inconnue. */
export function legacyTabRedirect(partyId: string, onglet: string | undefined): string | null {
  const section = onglet && Object.hasOwn(LEGACY_TABS, onglet) ? LEGACY_TABS[onglet] : undefined;
  return section ? partyHref(partyId, section) : null;
}
