import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { JOURNEY_COPY, summaryLabel } from '@/src/programmes/models/journey.copy';
import { stepHref, type JourneyStepId } from '@/src/programmes/models/journey.model';
import { computeJourneyProgress } from '@/src/programmes/models/journey.service';
import { isRead } from '@/src/programmes/models/reading-progress.model';
import {
  selectCatalogStatus,
  selectCelebrations,
  selectJourney,
  selectProgressStatus,
  selectReadingEntries,
} from '@/src/programmes/store/programmes.selector';
import { progressActions } from '@/src/programmes/store/progress.slice';
import { clearReadingProgressUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const passportViewModel =
  () =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector(
      [
        selectCatalogStatus,
        selectProgressStatus,
        selectJourney,
        selectReadingEntries,
        selectCelebrations,
      ],
      (status, progressStatus, journey, entries, celebrations) => {
        const hydrated = progressStatus === 'ready';
        const shownEntries = hydrated ? entries : {};
        const progress = computeJourneyProgress(journey, shownEntries);
        const finished = hydrated && progress.finished;

        const listOf = (stepId: JourneyStepId, unit: string, suffix = '') => {
          const p = progress.steps.find((s) => s.step.id === stepId);
          const items = (p?.step.items ?? []).map((item) => ({
            key: item.key,
            title: item.title,
            href: item.href,
            state: isRead(shownEntries, item.key) ? ('stamped' as const) : ('empty' as const),
          }));
          return {
            countLabel: hydrated
              ? `${p?.readCount ?? 0} sur ${p?.total ?? 0} ${unit}${suffix}`
              : null,
            items,
          };
        };

        return {
          status,
          hydrated,
          finished,
          stampedCount: progress.stampedCount,
          total: progress.total,
          heading: finished ? JOURNEY_COPY.passportFinishedHeading : JOURNEY_COPY.passportHeading,
          stamps: progress.steps.map((p) => ({
            stepId: p.step.id,
            title: p.step.title,
            icon: p.step.icon,
            state: p.stamped ? ('stamped' as const) : ('empty' as const),
            href: stepHref(p.step),
          })),
          subtitle: !hydrated
            ? null
            : finished
              ? `Les ${progress.total} étapes sont terminées.`
              : summaryLabel(progress.stampedCount, progress.total),
          quizNote: JOURNEY_COPY.quizNote,
          parties: listOf('les-partis', 'fiches lues', ' · ordre alphabétique'),
          debates: listOf('les-grands-debats', 'débats lus'),
          whatNow: {
            title: JOURNEY_COPY.whatNowTitle,
            text: JOURNEY_COPY.whatNowText,
            label: JOURNEY_COPY.whatNowLabel,
            href: '/comprendre/comment-voter',
          },
          celebrations,
          celebrationsShown: (ids: JourneyStepId[]) =>
            dispatch(progressActions.celebrationsShown(ids)),
          clearProgress: () => dispatch(clearReadingProgressUsecase()),
        };
      }
    );
