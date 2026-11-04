import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { daysUntil, formatLongDate, nextRound } from '@/src/programmes/models/election.service';
import {
  ctaLabel,
  nodeAccessibilityLabel,
  passportLabel,
  stepMeta,
  summaryLabel,
} from '@/src/programmes/models/journey.copy';
import { stepHref, type JourneyStepId } from '@/src/programmes/models/journey.model';
import type { StepProgress } from '@/src/programmes/models/journey.service';
import { isRead } from '@/src/programmes/models/reading-progress.model';
import {
  selectCatalog,
  selectCelebrations,
  selectFeaturedElection,
  selectJourneyProgress,
  selectProgressStatus,
  selectReadingEntries,
} from '@/src/programmes/store/programmes.selector';
import { progressActions } from '@/src/programmes/store/progress.slice';
import { clearReadingProgressUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

/** État neutre, valable pour tout le monde : celui du HTML statique et du premier rendu. */
const asTodo = (p: StepProgress): StepProgress => ({
  ...p,
  readCount: 0,
  ratio: 0,
  status: 'todo',
  stamped: false,
  newItems: 0,
  nextItem: p.step.items[0] ?? null,
});

export const journeyViewModel =
  (now: Date = new Date()) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector(
      [
        selectProgressStatus,
        selectJourneyProgress,
        selectReadingEntries,
        selectCelebrations,
        selectFeaturedElection,
        selectCatalog,
      ],
      (status, progress, entries, celebrations, election, catalog) => {
        const hydrated = status === 'ready';
        const round = election ? nextRound(election, now) : null;
        const daysLeft = round ? daysUntil(round.date, now) : null;
        const questionCount = catalog?.questions.length ?? 0;
        const opts = { daysLeft, questionCount };
        const nextId = hydrated ? (progress.next?.step.id ?? null) : null;

        const nodeOf = (p: StepProgress) => {
          const shown = hydrated ? p : asTodo(p);
          const isNext = p.step.id === nextId;
          return {
            id: p.step.id as JourneyStepId,
            index: p.step.index,
            title: p.step.title,
            icon: p.step.icon,
            href: stepHref(p.step),
            ratio: shown.ratio,
            status: shown.status,
            stamped: shown.stamped,
            isNext,
            meta: stepMeta(shown, opts),
            cta: isNext ? ctaLabel(p) : null,
            accessibilityLabel: nodeAccessibilityLabel(shown, isNext, progress.total, opts),
            chips: p.step.items.map(({ key, title, href }) => ({
              key,
              title,
              href,
              read: hydrated && isRead(entries, key),
            })),
            /** Tronçon plein sous une étape terminée. */
            segmentDone: hydrated && p.status === 'done',
          };
        };

        const next = hydrated ? progress.next : null;
        return {
          /** Catalogue chargé (natif : quelques millisecondes ; web : préchargé). */
          loaded: catalog !== null,
          hydrated,
          summary:
            hydrated && progress.hasStarted
              ? {
                  stampedCount: progress.stampedCount,
                  total: progress.total,
                  label: summaryLabel(progress.stampedCount, progress.total),
                  next: next
                    ? {
                        title: next.step.title,
                        meta: stepMeta(next, opts),
                        href: stepHref(next.step),
                        cta: ctaLabel(next),
                      }
                    : null,
                }
              : null,
          nodes: progress.steps.map(nodeOf),
          finished: hydrated && progress.finished,
          news: election
            ? {
                title: election.title,
                roundLabel: round?.label ?? null,
                dateLabel: round ? formatLongDate(round.date) : null,
                daysLeft,
                href: `/elections/${election.id}`,
              }
            : null,
          passport: {
            stampedCount: hydrated ? progress.stampedCount : 0,
            total: progress.total,
            label: hydrated ? passportLabel(progress.stampedCount, progress.total) : null,
          },
          questionCount,
          /** Tampons à « poser » (animation unique). Jamais rempli par le chargement. */
          celebrations,
          celebrationsShown: (ids: JourneyStepId[]) =>
            dispatch(progressActions.celebrationsShown(ids)),
          clearProgress: () => dispatch(clearReadingProgressUsecase()),
        };
      }
    );

type JourneyViewModel = ReturnType<ReturnType<ReturnType<typeof journeyViewModel>>>;
export type JourneyNodeModel = JourneyViewModel['nodes'][number];
export type JourneySummaryModel = NonNullable<JourneyViewModel['summary']>;
export type JourneyNewsModel = NonNullable<JourneyViewModel['news']>;
