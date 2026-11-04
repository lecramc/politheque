import type {
  Journey,
  JourneyItem,
  JourneyStep,
  JourneyStepId,
} from '@/src/programmes/models/journey.model';
import {
  contentKey,
  isRead,
  type ReadingEntries,
} from '@/src/programmes/models/reading-progress.model';

/** Jamais « locked » : tout est accessible dès le premier jour. */
export type StepStatus = 'todo' | 'in-progress' | 'done';

export type StepProgress = {
  step: JourneyStep;
  readCount: number;
  total: number;
  /** 0..1 (0 si total = 0). */
  ratio: number;
  status: StepStatus;
  /** Tampon enregistré : reste vrai si du contenu est ajouté ensuite. */
  stamped: boolean;
  /** Contenus non lus d'une étape déjà tamponnée (« 1 nouvelle fiche »). */
  newItems: number;
  /** Premier non lu dans l'ordre des items (alphabétique pour les partis). */
  nextItem: JourneyItem | null;
};

export type JourneyProgress = {
  steps: StepProgress[];
  /** « 3 sur 6 étapes » */
  stampedCount: number;
  total: number;
  hasStarted: boolean;
  /** Première étape non terminée dans l'ordre conseillé ; null si tout est fait. */
  next: StepProgress | null;
  /** Les six tampons sont obtenus. */
  finished: boolean;
};

const progressOf = (step: JourneyStep, entries: ReadingEntries): StepProgress => {
  const total = step.items.length;
  const unread = step.items.filter((item) => !isRead(entries, item.key));
  const readCount = total - unread.length;
  const done = total > 0 && unread.length === 0;
  const stamped = isRead(entries, contentKey.stamp(step.id));
  return {
    step,
    readCount,
    total,
    ratio: total === 0 ? 0 : readCount / total,
    status: done ? 'done' : readCount > 0 ? 'in-progress' : 'todo',
    stamped,
    newItems: stamped && !done ? unread.length : 0,
    nextItem: unread[0] ?? null,
  };
};

export function computeJourneyProgress(journey: Journey, entries: ReadingEntries): JourneyProgress {
  const steps = journey.map((step) => progressOf(step, entries));
  const stampedCount = steps.filter((s) => s.stamped).length;
  return {
    steps,
    stampedCount,
    total: steps.length,
    hasStarted: steps.some((s) => s.readCount > 0),
    next: steps.find((s) => s.total > 0 && s.status !== 'done') ?? null,
    finished: steps.length > 0 && stampedCount === steps.length,
  };
}

/** Étapes complètes (tous les contenus lus) dont le tampon n'est pas encore enregistré. */
export function stampsToAward(journey: Journey, entries: ReadingEntries): JourneyStepId[] {
  return journey
    .map((step) => progressOf(step, entries))
    .filter((p) => p.status === 'done' && !p.stamped)
    .map((p) => p.step.id);
}

/**
 * Le questionnaire est complet quand chaque question a une entrée (« pas d'avis » compris).
 * Seule la PRÉSENCE d'une réponse est lue, jamais sa valeur.
 */
export function isQuizComplete(
  questions: readonly { id: string }[],
  values: Readonly<Record<string, unknown>>
): boolean {
  return questions.length > 0 && questions.every((q) => q.id in values);
}

/** Ajoute les tampons donnés au registre (même date pour tous). */
export function withStamps(
  entries: ReadingEntries,
  stepIds: readonly JourneyStepId[],
  now: string
): ReadingEntries {
  if (stepIds.length === 0) return entries;
  return { ...entries, ...Object.fromEntries(stepIds.map((id) => [contentKey.stamp(id), now])) };
}
