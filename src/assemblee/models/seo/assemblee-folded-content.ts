import { orderGroupes } from '@/src/assemblee/models/groupe-order';
import { capitalizeTitle } from '@/src/assemblee/models/scrutin-labels';
import { scrutinResultSentence } from '@/src/assemblee/models/scrutin-result';
import type { Groupe, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

const TITLE_FRAGMENT = 120;

/**
 * Fragments que le HTML pré-rendu d'une page de scrutin doit contenir : titre officiel, date,
 * phrase de résultat et premier groupe du tableau (celui de la place 1 à droite, dans l'ordre des
 * places). Le détail par député, lui, se charge côté client.
 */
export function assembleeFoldedSnippets(scrutin: ScrutinSummary, groupes: Groupe[]): string[] {
  const present = new Set(scrutin.groupes.map(([index]) => index));
  const first = orderGroupes(groupes, 'places').find((g) => present.has(g.index));
  return [
    capitalizeTitle(scrutin.titre).slice(0, TITLE_FRAGMENT),
    formatLongDate(scrutin.date),
    scrutinResultSentence(scrutin),
    ...(first ? [first.libelle] : []),
  ];
}
