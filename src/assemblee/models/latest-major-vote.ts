import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { MAJOR_VOTES_LEGEND, majorVotesGrid } from '@/src/assemblee/models/major-votes';
import type { ScrutinIndex } from '@/src/assemblee/models/scrutin.model';

/**
 * Dernier grand vote, pour l'accueil. Règle fixe : le plus récent des grands votes, c'est-à-dire
 * la première colonne de `majorVotesGrid` (mêmes catégories, même ordre officiel des groupes,
 * mêmes positions). Aucun choix éditorial. Null si l'index ne contient aucun grand vote.
 */
export const latestMajorVoteGrid = (index: ScrutinIndex) => {
  const grid = majorVotesGrid(index, 1);
  if (grid.columns.length === 0) return null;
  const copy = COPY.overview.grid;
  return {
    title: copy.title,
    lead: copy.lead(1),
    note: copy.note,
    shared: copy.shared,
    groupHeader: copy.group,
    caption: copy.caption,
    legend: MAJOR_VOTES_LEGEND,
    open: copy.open,
    cellLabel: copy.cell,
    ...grid,
  };
};
