import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import type { Catalog } from '@/src/programmes/models/programme.model';
import type { PartySection } from '@/src/programmes/models/seo/party-sections';

/**
 * « Autres votes sur ce texte » : uniquement par identifiant officiel du dossier législatif. Aucun
 * rapprochement par similarité de titre (risque de faux regroupements). Du plus ancien au plus récent.
 */
export const otherVotesOnSameText = (
  scrutin: ScrutinSummary,
  all: ScrutinSummary[]
): ScrutinSummary[] => {
  if (!scrutin.dossier) return [];
  const uid = scrutin.dossier.uid;
  return all
    .filter((s) => s.numero !== scrutin.numero && s.dossier?.uid === uid)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.numero - b.numero));
};

export type Citation = { partyId: string; name: string; section: PartySection };

/** Onglet de la fiche selon la rubrique de la donnée qui porte la source. */
const SECTION_OF_KEY: Record<string, PartySection> = {
  stances: 'positions',
  candidacies: 'programme',
  history: 'histoire',
};

const scrutinUrl = /\/dyn\/17\/scrutins\/(\d+)(?!\d)/g;

const cites = (node: unknown, numero: string): boolean => {
  if (typeof node === 'string') {
    return [...node.matchAll(scrutinUrl)].some((match) => match[1] === numero);
  }
  if (Array.isArray(node)) return node.some((item) => cites(item, numero));
  if (node && typeof node === 'object') {
    return Object.values(node).some((value) => cites(value, numero));
  }
  return false;
};

/**
 * Fiches dont les sources citent ce scrutin (adresse `…/dyn/17/scrutins/<n>`). Lecture seule du
 * catalogue : le périmètre des scrutins ne dépend jamais des choix rédactionnels des fiches.
 */
export const citingParties = (catalog: Catalog, numero: number): Citation[] =>
  [...catalog.parties]
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .flatMap((party) =>
      Object.entries(SECTION_OF_KEY)
        .filter(([key]) =>
          cites((party as unknown as Record<string, unknown>)[key], String(numero))
        )
        .map(([, section]) => ({ partyId: party.id, name: party.name, section }))
    );
