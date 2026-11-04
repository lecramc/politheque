import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { candidatesOf } from '@/src/programmes/models/election.service';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import { debateMeta, nonIndexableMeta } from '@/src/programmes/models/seo/page-meta';
import {
  selectCatalog,
  selectCatalogStatus,
  selectFeaturedElection,
} from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const themesViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    themes: catalog?.themes ?? [],
  }));

export const themeViewModel =
  (themeId: string) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector(
      [selectCatalog, selectCatalogStatus, selectFeaturedElection],
      (catalog, status, election) => {
        const theme = catalog?.themes.find((t) => t.id === themeId) ?? null;
        const parties = [...(catalog?.parties ?? [])].sort((a, b) =>
          a.name.localeCompare(b.name, 'fr')
        );
        const themes = catalog?.themes ?? [];
        const index = themes.findIndex((t) => t.id === themeId);
        return {
          status,
          theme,
          meta: theme && catalog ? debateMeta(theme, catalog) : null,
          notFoundMeta: nonIndexableMeta('Thème introuvable', `/debats/${themeId}`),
          markRead: () => dispatch(markContentReadUsecase(contentKey.debate(themeId))),
          election,
          position: { index: index + 1, total: themes.length },
          nextTheme: index >= 0 ? (themes[(index + 1) % themes.length] ?? null) : null,
          // Propositions : celles présentées pour l'élection mise en avant.
          comparisons:
            theme && election
              ? candidatesOf(election, parties).map(({ party, candidacy }) => ({
                  party,
                  candidate: candidacy.candidate,
                  programme: candidacy.themes[theme.id],
                }))
              : [],
          // Positions : celles des partis, indépendamment du scrutin.
          questions: theme
            ? (catalog?.questions ?? [])
                .filter((q) => q.theme === theme.id)
                .map((question) => ({
                  question,
                  positions: parties.map((party) => ({
                    party,
                    stance: party.stances[question.id] ?? null,
                  })),
                }))
            : [],
        };
      }
    );
