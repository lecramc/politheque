import { orderGroupes } from '@/src/assemblee/models/groupe-order';
import type { Groupe, ScrutinDetail } from '@/src/assemblee/models/scrutin.model';

type Seating = Pick<ScrutinDetail, 'places' | 'votes' | 'deputes' | 'groupes' | 'delegations'>;

/** Colonne d'un siège vacant : au-delà de tous les groupes, donc à l'extrémité droite. */
const VACANT = 1e9;

/**
 * Sièges du schéma, regroupés par groupe. Les numéros de place officiels ne suivent pas l'angle
 * de la salle (les groupes y sont mêlés) : le schéma simplifié renumérote donc les sièges de 1 à n
 * en rangeant les groupes d'un seul tenant, dans l'ordre officiel de la salle (de la droite de
 * l'image, le dernier groupe, les non-inscrits, à la gauche, le premier). Les sièges vacants
 * (invisibles) sont à l'extrémité droite ; à l'intérieur d'un groupe, l'ordre des places réelles
 * est conservé. Chaque siège garde son vote, son député et sa délégation.
 */
export const groupedSeating = (detail: Seating, groupes: Groupe[]): Seating => {
  const leftToRight = new Map(orderGroupes(groupes, 'places').map((g, i) => [g.index, i]));
  const column = (groupe: number) => (groupe === -1 ? VACANT : leftToRight.get(groupe)!);
  const order = detail.places
    .map((_, i) => i)
    .sort(
      (a, b) =>
        column(detail.groupes[b]) - column(detail.groupes[a]) || detail.places[a] - detail.places[b]
    );
  const moved = new Map(order.map((from, to) => [from, to]));
  return {
    places: order.map((_, i) => i + 1),
    votes: order.map((i) => detail.votes[i]).join(''),
    deputes: order.map((i) => detail.deputes[i]),
    groupes: order.map((i) => detail.groupes[i]),
    delegations: detail.delegations.map((i) => moved.get(i)!),
  };
};
