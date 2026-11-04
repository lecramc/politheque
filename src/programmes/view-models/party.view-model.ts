import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const partyViewModel =
  (partyId: string) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => {
      const party = catalog?.parties.find((p) => p.id === partyId) ?? null;
      const history = party?.history;
      const allSources = party
        ? [
            ...(history
              ? [
                  history.origins,
                  ...history.ideals,
                  ...history.timeline,
                  ...(history.whyCreated ? [history.whyCreated] : []),
                  ...(history.figures ?? []),
                  ...(history.thought ?? []),
                ].flatMap((item) => item.sources)
              : []),
            ...Object.values(party.stances).flatMap((s) => s.sources),
            ...Object.values(party.candidacies).flatMap((c) =>
              Object.values(c.themes).flatMap((t) => t.measures.flatMap((m) => m.sources))
            ),
          ]
        : [];
      return {
        status,
        party,
        markRead: () => dispatch(markContentReadUsecase(contentKey.party(partyId))),
        allSources,
        candidacies:
          party && catalog
            ? catalog.elections
                .filter((election) => party.candidacies[election.id])
                .map((election) => {
                  const candidacy = party.candidacies[election.id];
                  return {
                    election,
                    candidacy,
                    sections: catalog.themes.map((theme) => ({
                      theme,
                      programme: candidacy.themes[theme.id],
                    })),
                  };
                })
            : [],
        stances:
          party && catalog
            ? catalog.questions.map((question) => ({
                question,
                stance: party.stances[question.id] ?? null,
              }))
            : [],
      };
    });
