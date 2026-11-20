import { stancesByTheme } from '@/src/programmes/models/stances-by-theme.service';

/** Nombre de thèmes (donc de positions) de l'aperçu : le même pour tous les partis. */
export const PREVIEW_SIZE = 5;

/**
 * Aperçu des positions d'un parti dont le programme 2027 n'est pas publié. Règle fixe, la même
 * pour tous : la première question de chacun des 5 premiers thèmes, dans l'ordre des thèmes.
 */
export const POSITIONS_PREVIEW_RULE = `Ces positions sont toujours choisies de la même façon, pour tous les partis : la première question de chacun des ${PREVIEW_SIZE} premiers thèmes du site.`;

export function positionsPreview<
  T extends { question: { theme: string } },
  H extends { id: string; title: string },
>(items: T[], themes: H[]) {
  return {
    title: 'Ses positions, en attendant',
    rule: POSITIONS_PREVIEW_RULE,
    items: stancesByTheme(items, themes)
      .slice(0, PREVIEW_SIZE)
      .map((group) => group.items[0]),
    all: { label: 'Toutes ses positions' },
  };
}
