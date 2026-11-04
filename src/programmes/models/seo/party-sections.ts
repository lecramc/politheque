import type { Party } from '@/src/programmes/models/programme.model';

export type PartySection = 'en-bref' | 'histoire' | 'positions' | 'programme-2027';

export const PARTY_SECTIONS: readonly {
  id: PartySection;
  label: string;
  segment: string | null;
}[] = [
  { id: 'en-bref', label: 'En bref', segment: null },
  { id: 'histoire', label: 'Histoire', segment: 'histoire' },
  { id: 'positions', label: 'Positions', segment: 'positions' },
  { id: 'programme-2027', label: 'Pour 2027', segment: 'programme-2027' },
];

export const partySectionLabel = (section: PartySection) =>
  PARTY_SECTIONS.find((s) => s.id === section)!.label;

export function partyHref(partyId: string, section: PartySection = 'en-bref'): string {
  const segment = PARTY_SECTIONS.find((s) => s.id === section)?.segment;
  return segment ? `/partis/${partyId}/${segment}` : `/partis/${partyId}`;
}

/** Section active d'après le chemin : '/partis/rn/histoire' → 'histoire' ; '/partis/rn' → 'en-bref'. */
export function sectionFromPath(pathname: string): PartySection | null {
  const match = /^\/partis\/[^/]+(?:\/([^/]+))?\/?$/.exec(pathname);
  if (!match) return null;
  if (!match[1]) return 'en-bref';
  return PARTY_SECTIONS.find((s) => s.segment === match[1])?.id ?? null;
}

/** Même règle pour tous : histoire si `history`, 2027 si candidature à l'élection mise en avant. */
export function availableSections(party: Party, featuredElectionId: string | null): PartySection[] {
  return PARTY_SECTIONS.map((s) => s.id).filter(
    (id) =>
      (id !== 'histoire' || !!party.history) &&
      (id !== 'programme-2027' || (!!featuredElectionId && !!party.candidacies[featuredElectionId]))
  );
}

const LEGACY_TABS: Record<string, PartySection> = {
  bref: 'en-bref',
  histoire: 'histoire',
  positions: 'positions',
  programme: 'programme-2027',
};

/** Compatibilité des anciens liens `?onglet=` ; null si la valeur est inconnue. */
export function legacyTabRedirect(partyId: string, onglet: string | undefined): string | null {
  const section = onglet && Object.hasOwn(LEGACY_TABS, onglet) ? LEGACY_TABS[onglet] : undefined;
  return section ? partyHref(partyId, section) : null;
}
