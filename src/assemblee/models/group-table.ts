import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { groupColor } from '@/src/assemblee/models/group-color';
import { orderGroupes, type GroupeOrder } from '@/src/assemblee/models/groupe-order';
import type { Groupe, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

/** Position d'une part de la barre empilée : la même forme que les sièges. */
export type BarKind = 'pour' | 'contre' | 'abstention' | 'aucun';
export type BarSegment = { kind: BarKind; count: number };

export type GroupRow = {
  /** Indice du groupe dans l'index (lien avec le schéma et le détail par député). */
  index: number;
  abrev: string;
  /** Couleur officielle du groupe à l'Assemblée. */
  color: string;
  /** Libellé officiel complet. */
  libelle: string;
  /** « Nom (SIGLE) » : le même gabarit pour tous les groupes. */
  name: string;
  /** « Nom (SIGLE) · N députés ». */
  title: string;
  membres: number;
  pour: number;
  contre: number;
  abstentions: number;
  nonVotants: number;
  /** Standard : membres sans aucun vote enregistré (membres − pour − contre − abstentions − non-votants). */
  nonVote: number;
  /** Motion de censure : membres qui n'ont pas voté la motion (jamais comptés « contre »). */
  nePasVote: number;
  /** Une règle unique : les positions non nulles, dans un ordre fixe. Aucune position « majoritaire ». */
  sentence: string;
  /** Barre empilée : positions non nulles, mêmes quatre positions que la légende des sièges. */
  bar: BarSegment[];
};

export type GroupTable = {
  /** `censure` : l'Assemblée ne recense que les voix pour ; pas de colonnes contre ni abstentions. */
  kind: 'standard' | 'censure';
  rows: GroupRow[];
};

/** « Nom (SIGLE) », ou le nom seul quand l'organe n'a que son sigle ; les non-inscrits sont expliqués. */
export const groupName = ({ abrev, libelle }: Pick<Groupe, 'abrev' | 'libelle'>): string => {
  if (abrev === 'NI') return `${COPY.groups.nonInscrits} (${abrev})`;
  return abrev === libelle ? libelle : `${libelle} (${abrev})`;
};

export type GroupColumn = { id: string; label: string; value: (row: GroupRow) => number };

/** Colonnes du tableau chiffré complet : les parts s'additionnent aux membres. */
export const groupTableColumns = (kind: GroupTable['kind']): GroupColumn[] =>
  kind === 'censure'
    ? [
        { id: 'membres', label: COPY.groups.members, value: (r) => r.membres },
        { id: 'pour', label: COPY.groups.censureVoted, value: (r) => r.pour },
        { id: 'noVote', label: COPY.groups.censureNot, value: (r) => r.nePasVote },
        { id: 'nonVotant', label: COPY.groups.nonVotant, value: (r) => r.nonVotants },
      ]
    : [
        { id: 'membres', label: COPY.groups.members, value: (r) => r.membres },
        { id: 'pour', label: COPY.groups.pour, value: (r) => r.pour },
        { id: 'contre', label: COPY.groups.contre, value: (r) => r.contre },
        { id: 'abstention', label: COPY.groups.abstention, value: (r) => r.abstentions },
        { id: 'nonVotant', label: COPY.groups.nonVotant, value: (r) => r.nonVotants },
        { id: 'noVote', label: COPY.groups.noVote, value: (r) => r.nonVote },
      ];

const nonZero = <T extends { count: number }>(parts: T[]): T[] => parts.filter((p) => p.count > 0);

/**
 * Tableau des groupes, pré-rendu : décomptes officiels de l'Assemblée au jour du scrutin, dans
 * l'ordre des places (comme le schéma) ou l'ordre alphabétique. Aucun autre classement.
 */
export const groupTable = (
  scrutin: ScrutinSummary,
  groupes: Groupe[],
  order: GroupeOrder
): GroupTable => {
  const censure = scrutin.type === 'MOC';
  const counts = new Map(scrutin.groupes.map((row) => [row[0], row]));
  const said = COPY.groups.said;
  const rows = orderGroupes(groupes, order)
    .filter((groupe) => counts.has(groupe.index))
    .map((groupe): GroupRow => {
      const [, membres, pour, contre, abstentions, nonVotants] = counts.get(groupe.index)!;
      const nonVote = Math.max(0, membres - pour - contre - abstentions - nonVotants);
      const notVoted = Math.max(0, membres - pour);
      const name = groupName(groupe);
      return {
        index: groupe.index,
        abrev: groupe.abrev,
        color: groupColor(groupe),
        libelle: groupe.libelle,
        name,
        title: COPY.groups.lineTitle(name, membres),
        membres,
        pour,
        contre,
        abstentions,
        nonVotants,
        nonVote,
        nePasVote: Math.max(0, membres - pour - nonVotants),
        sentence: (censure
          ? nonZero([
              { count: pour, say: said.censureVoted },
              { count: notVoted, say: said.censureNot },
            ])
          : nonZero([
              { count: pour, say: said.pour },
              { count: contre, say: said.contre },
              { count: abstentions, say: said.abstention },
              { count: nonVotants, say: said.nonVotant },
              { count: nonVote, say: said.none },
            ])
        )
          .map(({ count, say }) => say(count))
          .join(' · '),
        bar: nonZero<BarSegment>(
          censure
            ? [
                { kind: 'pour', count: pour },
                { kind: 'aucun', count: notVoted },
              ]
            : [
                { kind: 'pour', count: pour },
                { kind: 'contre', count: contre },
                { kind: 'abstention', count: abstentions },
                { kind: 'aucun', count: nonVotants + nonVote },
              ]
        ),
      };
    });
  return { kind: censure ? 'censure' : 'standard', rows };
};
