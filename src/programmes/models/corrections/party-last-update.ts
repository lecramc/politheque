import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';

const touchesParty = (page: string, partyId: string) =>
  page === `/partis/${partyId}` || page.startsWith(`/partis/${partyId}/`);

/**
 * « Dernière mise à jour » d'une fiche parti : date de la dernière entrée du journal public qui
 * touche l'une de ses pages (AAAA-MM-JJ), ou null. Dérivée de `corrections.json`, jamais saisie.
 * `lastVerified` reste la date de la dernière revérification complète (charte, règle 8).
 */
export const partyLastUpdate = (
  partyId: string,
  corrections: readonly CorrectionEntry[]
): string | null =>
  corrections
    .filter((entry) => entry.pages.some((page) => touchesParty(page, partyId)))
    .reduce<
      string | null
    >((latest, entry) => (!latest || entry.date > latest ? entry.date : latest), null);
