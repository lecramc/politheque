import { createSelector } from 'reselect';

import {
  itemStatusLabel,
  stepFootnote,
  stepInvite,
  STEP_INTROS,
  JOURNEY_COPY,
} from '@/src/programmes/models/journey.copy';
import { computeJourneyProgress } from '@/src/programmes/models/journey.service';
import { isRead } from '@/src/programmes/models/reading-progress.model';
import { ANSWERS_NOT_KEPT } from '@/src/programmes/models/results.copy';
import {
  selectCatalogStatus,
  selectJourney,
  selectProgressStatus,
  selectReadingEntries,
  selectResultsLost,
} from '@/src/programmes/store/programmes.selector';

export const journeyStepViewModel = (stepId: string) => () =>
  createSelector(
    [
      selectCatalogStatus,
      selectProgressStatus,
      selectJourney,
      selectReadingEntries,
      selectResultsLost,
    ],
    (status, progressStatus, journey, entries, resultsLost) => {
      const hydrated = progressStatus === 'ready';
      // Avant le chargement : état neutre, identique pour tout le monde.
      const progress = computeJourneyProgress(journey, hydrated ? entries : {});
      const p = progress.steps.find((s) => s.step.id === stepId);
      if (!p) {
        return {
          status,
          hydrated,
          found: false as const,
          index: 0,
          total: progress.total,
          title: '',
          intro: '',
          ratio: 0,
          readCount: 0,
          itemTotal: 0,
          listTitle: '',
          invite: null,
          notice: null as string | null,
          orderNote: null,
          items: [],
          nextItem: null,
          footnote: '',
        };
      }

      const isParties = p.step.id === 'les-partis';
      const next = p.nextItem;
      return {
        status,
        hydrated,
        found: true as const,
        index: p.step.index,
        total: progress.total,
        title: p.step.title,
        intro: STEP_INTROS[p.step.id],
        ratio: p.ratio,
        readCount: p.readCount,
        itemTotal: p.total,
        listTitle: `Les ${p.total} ${p.total > 1 ? p.step.unit.many : p.step.unit.one}`,
        invite: stepInvite(p),
        /** Étape du questionnaire : les réponses ne sont pas conservées (jamais « pas encore de réponses »). */
        notice: hydrated && stepId === 'me-situer' && resultsLost ? ANSWERS_NOT_KEPT : null,
        orderNote: isParties ? JOURNEY_COPY.orderNote : null,
        items: p.step.items.map((item) => {
          const read = hydrated && isRead(entries, item.key);
          return {
            key: item.key,
            kind: item.kind,
            title: item.title,
            href: item.href,
            partyColor: item.partyColor,
            read,
            statusLabel: itemStatusLabel(item.kind, read),
            stamp: { state: read ? ('stamped' as const) : ('empty' as const) },
          };
        }),
        nextItem: next
          ? {
              title: next.title,
              href: next.href,
              label: isParties
                ? `Fiche suivante (ordre alphabétique) : ${next.title}`
                : `Suite : ${next.title}`,
            }
          : null,
        footnote: stepFootnote(p),
      };
    }
  );
