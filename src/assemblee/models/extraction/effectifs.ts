import type { SittingMember } from '@/src/assemblee/models/extraction/amo';

type Move = { member: SittingMember; to: string | null };

/**
 * Aligne les députés sans vote sur l'effectif officiel de chaque groupe (`nombreMembresGroupe`).
 *
 * Un jour de fin de mandat ou de changement de groupe, l'open data ne dit pas à quelle heure le
 * changement a eu lieu : le député a un autre rattachement possible (`alternatives`). On ne
 * déplace (ou n'écarte) que ces députés-là, et seulement pour résorber un groupe qui dépasse son
 * effectif officiel : jamais un député sans incertitude. Un déplacement peut en entraîner un autre
 * (A → B puis B → C) : on cherche un chemin de déplacements qui finit dans un groupe trop petit
 * ou hors de l'effectif. Sans chemin, l'écart reste tel quel (signalé par le test d'intégrité).
 */
export const alignAbsents = (input: {
  absents: SittingMember[];
  /** Groupe (ventilation du scrutin) de chaque député ayant un vote nominatif. */
  voterGroups: string[];
  /** `nombreMembresGroupe` de chaque groupe ventilé. */
  official: ReadonlyMap<string, number>;
}): SittingMember[] => {
  const current = new Map(input.absents.map((m) => [m.acteurRef, m.groupeRef] as const));
  const gone = new Set<string>();
  const moved = new Set<string>();
  const counts = new Map<string, number>();
  const add = (groupeRef: string, delta: number) =>
    counts.set(groupeRef, (counts.get(groupeRef) ?? 0) + delta);
  input.voterGroups.forEach((g) => add(g, 1));
  input.absents.forEach((m) => add(m.groupeRef, 1));

  const surplus = (g: string) => (counts.get(g) ?? 0) > (input.official.get(g) ?? Infinity);
  const deficit = (g: string) => (counts.get(g) ?? 0) < (input.official.get(g) ?? -Infinity);

  /** Déplacements possibles depuis un groupe : un par alternative d'un député pas encore déplacé. */
  const movesFrom = (g: string): Move[] =>
    input.absents.flatMap((member) =>
      current.get(member.acteurRef) === g &&
      !moved.has(member.acteurRef) &&
      !gone.has(member.acteurRef)
        ? member.alternatives.map((to) => ({ member, to }))
        : []
    );

  /** Plus court chemin de déplacements depuis `start` jusqu'à un groupe trop petit ou une sortie. */
  const pathFrom = (start: string): Move[] | null => {
    const queue: { group: string; path: Move[] }[] = [{ group: start, path: [] }];
    const seen = new Set([start]);
    for (let head = 0; head < queue.length; head++) {
      const { group, path } = queue[head];
      for (const move of movesFrom(group)) {
        if (move.to === null || deficit(move.to)) return [...path, move];
        if (!seen.has(move.to)) {
          seen.add(move.to);
          queue.push({ group: move.to, path: [...path, move] });
        }
      }
    }
    return null;
  };

  const apply = ({ member, to }: Move) => {
    add(current.get(member.acteurRef) as string, -1);
    if (to === null) gone.add(member.acteurRef);
    else {
      add(to, 1);
      current.set(member.acteurRef, to);
      moved.add(member.acteurRef);
    }
  };

  const stuck = new Set<string>();
  for (;;) {
    const over = [...counts.keys()].sort().find((g) => surplus(g) && !stuck.has(g));
    if (over === undefined) break;
    const path = pathFrom(over);
    if (path === null) stuck.add(over);
    else path.forEach(apply);
  }

  return input.absents.flatMap((member) =>
    gone.has(member.acteurRef)
      ? []
      : [{ ...member, groupeRef: current.get(member.acteurRef) as string }]
  );
};
