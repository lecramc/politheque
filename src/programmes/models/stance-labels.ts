import type { Stance } from '@/src/programmes/models/programme.model';

/** Libellés complets : lecteurs d'écran, justification, légende. */
export const STANCE_LABEL: Record<string, string> = {
  '2': 'Pour',
  '1': 'Plutôt pour',
  '0': 'Mitigé',
  '-1': 'Plutôt contre',
  '-2': 'Contre',
  null: 'Pas de position claire',
};

/** Libellés courts des listes : tiennent sur une ligne dans la cellule fixe du badge. */
export const STANCE_SHORT_LABEL: Record<string, string> = {
  ...STANCE_LABEL,
  null: 'Pas de position',
};

/** Échelle complète, dans l'ordre d'affichage de la légende. */
export const STANCE_SCALE: (Stance | null)[] = [2, 1, 0, -1, -2, null];
