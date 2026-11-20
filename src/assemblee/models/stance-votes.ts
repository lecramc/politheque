import { scrutinNumberFromUrl } from '@/src/assemblee/models/extraction/cited';
import { groupTable } from '@/src/assemblee/models/group-table';
import { votesGrid, type MajorVoteCell } from '@/src/assemblee/models/major-votes';
import { sortByMostRecent } from '@/src/assemblee/models/scrutin-filters';
import type { ScrutinIndex, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import type { PartyStance } from '@/src/programmes/models/programme.model';

export type StanceVote = {
  numero: number;
  href: string;
  title: string;
  /** Titre officiel complet (étiquette d'accessibilité). */
  fullTitle: string;
  date: string;
  /** « Adopté » / « Rejeté ». */
  resultat: string;
  groupName: string;
  position: MajorVoteCell;
  /** Décompte officiel du groupe, positions non nulles (« 88 contre »). */
  detail: string;
};

/** Scrutins de la 17e législature cités en source `vote` par ces positions et présents dans l'index. */
export const citedVotes = (
  stances: readonly (PartyStance | null)[],
  index: ScrutinIndex
): ScrutinSummary[] => {
  const numbers = new Set(
    stances
      .flatMap((stance) => stance?.sources ?? [])
      .filter((source) => source.kind === 'vote')
      .map((source) => scrutinNumberFromUrl(source.url))
  );
  return sortByMostRecent(index.scrutins.filter((s) => numbers.has(s.numero)));
};

/**
 * Sous une position : le vote du groupe du parti sur chaque scrutin cité en source. Le groupe se
 * reconnaît à son sigle sur n'importe quel groupe présent dans le scrutin (pas seulement le
 * groupe actif). Sans groupe, ou groupe absent du scrutin : rien pour ce vote.
 */
export const stanceVotes = ({
  stance,
  groupe,
  index,
}: {
  stance: PartyStance | null;
  groupe: string | null;
  index: ScrutinIndex;
}): StanceVote[] => {
  if (groupe === null) return [];
  return citedVotes([stance], index).flatMap((scrutin) => {
    const grid = votesGrid(index, [scrutin]);
    const row = grid.rows.find((r) => r.abrev === groupe && r.cells[0].kind !== 'sansDepute');
    if (!row) return [];
    const column = grid.columns[0];
    const counts = groupTable(scrutin, index.groupes, 'places').rows.find(
      (r) => r.index === row.index
    );
    return [
      {
        numero: column.numero,
        href: column.href,
        title: column.title,
        fullTitle: column.fullTitle,
        date: column.date,
        resultat: column.resultat,
        groupName: row.name,
        position: row.cells[0],
        detail: counts?.sentence ?? '',
      },
    ];
  });
};
