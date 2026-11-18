import { sittingMembers, type ActeurRecord } from '@/src/assemblee/models/extraction/amo';
import type { Composition, Groupe } from '@/src/assemblee/models/scrutin.model';

/**
 * Composition de l'Assemblée au jour de l'extraction : les députés en exercice (mandat ouvert et
 * groupe en cours ce jour-là) comptés par groupe publié (la date est celle du manifeste : le fichier ne change que si l'effectif change). Un groupe sans député n'y figure pas ;
 * un jour de changement de groupe, le rattachement retenu est celui que l'open data donne pour le jour.
 */
export const currentComposition = (input: {
  acteurs: ActeurRecord[];
  /** Groupes dans l'ordre publié : les effectifs y renvoient par indice. */
  groupes: Pick<Groupe, 'organeRef'>[];
  date: string;
}): Composition => {
  const indexOf = new Map(input.groupes.map((g, i) => [g.organeRef, i] as const));
  const sitting = new Set(input.acteurs.filter((a) => a.enExercice).map((a) => a.id));
  const counts = new Map<number, number>();
  for (const member of sittingMembers(input.acteurs, input.date)) {
    const index = indexOf.get(member.groupeRef);
    if (index === undefined || !sitting.has(member.acteurRef)) continue;
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  const sieges = [...counts].sort((a, b) => a[0] - b[0]);
  return {
    sieges,
    total: sieges.reduce((sum, [, count]) => sum + count, 0),
  };
};
