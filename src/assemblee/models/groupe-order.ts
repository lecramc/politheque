import type { Groupe } from '@/src/assemblee/models/scrutin.model';

export type GroupeOrder = 'places' | 'alphabetique';

export type OrderedGroupe = Groupe & {
  /** Indice du groupe dans la liste publiée (les décomptes et détails y renvoient). */
  index: number;
};

const collator = new Intl.Collator('fr', { sensitivity: 'base' });
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Ordre de référence des groupes, de la gauche à la droite de l'hémicycle, d'après le plan
 * officiel de l'Assemblée nationale (assemblee-nationale.fr/dyn/vos-deputes/hemicycle, consulté le
 * 18 novembre 2026). Les numéros de place ne suivent pas l'angle de la salle : la médiane des
 * places donnait un ordre faux (LIOT avant SOC, non-inscrits au centre). Clé : abréviation.
 * Les non-inscrits (NI) viennent toujours en dernier : leurs places sont dispersées dans la salle.
 */
export const OFFICIAL_GROUPE_ORDER = [
  'LFI-NFP',
  'GDR',
  'ECOS',
  'SOC',
  'LIOT',
  'DEM',
  'EPR',
  'HOR',
  'DR',
  'UDR',
  'RN',
] as const;

export const NON_INSCRITS_ABREV = 'NI';

/** Rang gauche → droite : référence, puis groupes inconnus de la référence, puis NI. */
const rank = (abrev: string): number => {
  if (abrev === NON_INSCRITS_ABREV) return OFFICIAL_GROUPE_ORDER.length + 1;
  const known = (OFFICIAL_GROUPE_ORDER as readonly string[]).indexOf(abrev);
  return known === -1 ? OFFICIAL_GROUPE_ORDER.length : known;
};

/**
 * Comparateur gauche → droite : ordre officiel ; un groupe inconnu de la référence se place avant
 * NI, par médiane des places (la plus haute, à gauche, d'abord).
 */
export const compareGroupesLeftToRight = (
  a: Pick<Groupe, 'abrev' | 'organeRef' | 'medianePlace'>,
  b: Pick<Groupe, 'abrev' | 'organeRef' | 'medianePlace'>
): number =>
  rank(a.abrev) - rank(b.abrev) ||
  b.medianePlace - a.medianePlace ||
  compareText(a.abrev, b.abrev) ||
  compareText(a.organeRef, b.organeRef);

/**
 * Ordre des groupes : par défaut l'ordre officiel de la salle (de la gauche à la droite),
 * identique dans le schéma et les tableaux ; tri alphabétique proposé en option. Aucun autre
 * classement.
 */
export const orderGroupes = (groupes: Groupe[], order: GroupeOrder): OrderedGroupe[] =>
  groupes
    .map((groupe, index) => ({ ...groupe, index }))
    .sort((a, b) =>
      order === 'alphabetique'
        ? collator.compare(a.libelle, b.libelle) || compareText(a.abrev, b.abrev)
        : compareGroupesLeftToRight(a, b)
    );
