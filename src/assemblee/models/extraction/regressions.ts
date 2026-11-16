export type DatasetCounts = {
  /** Nombre de scrutins du périmètre. */
  scrutins: number;
  /** Nombre de votes sans place connue (jamais inventée). */
  unplaced: number;
};

/**
 * Régressions d'une mise à jour par rapport aux données commitées : moins de scrutins (la source
 * a perdu ou le périmètre a rétréci) ou davantage de députés sans place. Liste vide = rien à signaler.
 */
export const findRegressions = (input: {
  before: DatasetCounts;
  after: DatasetCounts;
}): string[] => {
  const { before, after } = input;
  const problems: string[] = [];
  if (after.scrutins < before.scrutins) {
    problems.push(`nombre de scrutins en baisse : ${before.scrutins} → ${after.scrutins}`);
  }
  if (after.unplaced > before.unplaced) {
    problems.push(`députés sans place en hausse : ${before.unplaced} → ${after.unplaced}`);
  }
  return problems;
};
