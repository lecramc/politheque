import { createSelector } from 'reselect';

import { PARTY_JOURNEY_COPY } from '@/src/programmes/models/journey.copy';
import { stepHref } from '@/src/programmes/models/journey.model';
import { computeJourneyProgress } from '@/src/programmes/models/journey.service';
import { contentKey, isRead } from '@/src/programmes/models/reading-progress.model';
import {
  selectJourney,
  selectProgressStatus,
  selectReadingEntries,
} from '@/src/programmes/store/programmes.selector';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * Bloc parcours unique en bas de fiche (arc, tampon, fiche suivante). Tant que la progression
 * locale n'est pas chargée (rendu statique et premier rendu client), état neutre identique pour
 * tout le monde : ce qui dépend de la progression ne s'affiche qu'après l'hydratation.
 */
export const partyJourneyViewModel = (partyId: string) => () =>
  createSelector(
    [selectJourney, selectProgressStatus, selectReadingEntries],
    (journey, progressStatus, entries) => {
      const hydrated = progressStatus === 'ready';
      const progress = computeJourneyProgress(journey, hydrated ? entries : {});
      const step = progress.steps.find((s) => s.step.id === 'les-partis');
      const following = progress.steps.find((s) => s.step.index === (step?.step.index ?? 0) + 1);
      const read = hydrated && isRead(entries, contentKey.party(partyId));
      const completed = hydrated && !!step && step.total > 0 && step.readCount === step.total;
      const count = step?.readCount ?? 0;
      return {
        hydrated,
        heading: step
          ? `Parcours · étape ${step.step.index} : ${lowerFirst(step.step.title)}`
          : 'Parcours',
        stepHref: step ? stepHref(step.step) : '/parcours/les-partis',
        stepIndex: step?.step.index ?? 0,
        ratio: step?.ratio ?? 0,
        readCount: count,
        countLabel: hydrated ? PARTY_JOURNEY_COPY.count(count, step?.total ?? 0) : null,
        title: hydrated
          ? read
            ? PARTY_JOURNEY_COPY.readTitle
            : PARTY_JOURNEY_COPY.unreadTitle
          : null,
        stamp: read ? ('stamped' as const) : ('empty' as const),
        text: read ? null : PARTY_JOURNEY_COPY.stampRule,
        completion:
          completed && step && following
            ? {
                text: PARTY_JOURNEY_COPY.completed(step.total, step.step.title),
                nextLabel: `Étape suivante : ${lowerFirst(following.step.title)}`,
                nextHref: stepHref(following.step),
                privacy: PARTY_JOURNEY_COPY.privacy,
              }
            : null,
      };
    }
  );
