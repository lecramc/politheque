import { orderGroupes, type GroupeOrder } from '@/src/assemblee/models/groupe-order';
import type { Groupe, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

export type GroupRow = {
  /** Indice du groupe dans l'index (lien avec le schéma et le détail par député). */
  index: number;
  abrev: string;
  /** Libellé officiel complet. */
  libelle: string;
  membres: number;
  pour: number;
  contre: number;
  abstentions: number;
  nonVotants: number;
  /** Motion de censure : membres qui n'ont pas voté la motion (jamais comptés « contre »). */
  nePasVote: number;
};

export type GroupTable = {
  /** `censure` : l'Assemblée ne recense que les voix pour ; pas de colonnes contre ni abstentions. */
  kind: 'standard' | 'censure';
  rows: GroupRow[];
};

/**
 * Tableau des groupes, pré-rendu : décomptes officiels de l'Assemblée au jour du scrutin, dans
 * l'ordre des places (comme le schéma) ou l'ordre alphabétique. Aucun autre classement.
 */
export const groupTable = (
  scrutin: ScrutinSummary,
  groupes: Groupe[],
  order: GroupeOrder
): GroupTable => {
  const counts = new Map(scrutin.groupes.map((row) => [row[0], row]));
  const rows = orderGroupes(groupes, order)
    .filter((groupe) => counts.has(groupe.index))
    .map((groupe): GroupRow => {
      const [, membres, pour, contre, abstentions, nonVotants] = counts.get(groupe.index)!;
      return {
        index: groupe.index,
        abrev: groupe.abrev,
        libelle: groupe.libelle,
        membres,
        pour,
        contre,
        abstentions,
        nonVotants,
        nePasVote: Math.max(0, membres - pour - nonVotants),
      };
    });
  return { kind: scrutin.type === 'MOC' ? 'censure' : 'standard', rows };
};
