import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import {
  candidatesOf,
  daysUntil,
  nextRound,
  voteSteps,
} from '@/src/programmes/models/election.service';
import { readingMinutes } from '@/src/programmes/models/presentation.service';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import { electionMeta, nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const electionsViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    elections: catalog?.elections ?? [],
  }));

export const electionViewModel =
  (electionId: string, now: Date = new Date()) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
      const election = catalog?.elections.find((e) => e.id === electionId) ?? null;
      const round = election ? nextRound(election, now) : null;
      return {
        status,
        election,
        meta: election && catalog ? electionMeta(election, catalog) : null,
        notFoundMeta: nonIndexableMeta('Élection introuvable', `/elections/${electionId}`),
        markRead: () => dispatch(markContentReadUsecase(contentKey.election(electionId))),
        daysLeft: round ? daysUntil(round.date, now) : null,
        round,
        candidates: election ? candidatesOf(election, catalog?.parties ?? []) : [],
        guideSections: election
          ? (catalog?.guide ?? []).filter((s) => election.guideSectionIds.includes(s.id))
          : [],
        themes: catalog?.themes ?? [],
        /** Une seule liste de dates (parrainages, inscription, tours), dans l'ordre du calendrier. */
        dates: election
          ? [...election.keyDates, ...election.rounds].sort((a, b) => a.date.localeCompare(b.date))
          : [],
        voteSteps: election ? voteSteps(election) : [],
        /** Pages de détail (comment voter, questions-réponses) : seulement pour la présidentielle 2027. */
        contentLinks:
          election && catalog?.voter.electionId === election.id
            ? { voter: CONTENUS_2027_PATHS.voter, faq: CONTENUS_2027_PATHS.faq }
            : null,
        voteGuide: {
          href: '/comprendre/comment-voter',
          minutes: readingMinutes(
            (catalog?.guide ?? [])
              .find((s) => s.id === 'comment-voter')
              ?.blocks.flatMap((b) => [b.heading, ...b.paragraphs, ...(b.more ?? [])]) ?? []
          ),
        },
      };
    });
