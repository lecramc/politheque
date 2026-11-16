import type { Groupe } from '@/src/assemblee/models/scrutin.model';

export type GroupeOrder = 'places' | 'alphabetique';

export type OrderedGroupe = Groupe & {
  /** Indice du groupe dans la liste publiée (les décomptes et détails y renvoient). */
  index: number;
};

const collator = new Intl.Collator('fr', { sensitivity: 'base' });
const compareText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Ordre des groupes : par défaut l'ordre des places (médiane des numéros de place, de la gauche à
 * la droite de l'image, la place 1 étant à droite), identique dans le schéma et les tableaux ;
 * tri alphabétique proposé en option. Aucun autre classement.
 */
export const orderGroupes = (groupes: Groupe[], order: GroupeOrder): OrderedGroupe[] =>
  groupes
    .map((groupe, index) => ({ ...groupe, index }))
    .sort((a, b) =>
      order === 'alphabetique'
        ? collator.compare(a.libelle, b.libelle) || compareText(a.abrev, b.abrev)
        : b.medianePlace - a.medianePlace ||
          compareText(a.abrev, b.abrev) ||
          compareText(a.organeRef, b.organeRef)
    );
