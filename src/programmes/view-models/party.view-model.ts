import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import type { Source } from '@/src/programmes/models/programme.model';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import {
  nonIndexableMeta,
  partyPageContext,
  partySectionMeta,
  type PageMeta,
} from '@/src/programmes/models/seo/page-meta';
import {
  availableSections,
  hasLegalSection,
  PARTY_SECTIONS,
  type PartySection,
} from '@/src/programmes/models/seo/party-sections';
import {
  selectCatalog,
  selectCatalogStatus,
  selectFeaturedElection,
} from '@/src/programmes/store/programmes.selector';
import { markContentReadUsecase } from '@/src/programmes/usecases/reading-progress.usecase';

export const partyViewModel =
  (partyId: string) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector(
      [selectCatalog, selectCatalogStatus, selectFeaturedElection],
      (catalog, status, featured) => {
        const party = catalog?.parties.find((p) => p.id === partyId) ?? null;
        const featuredId = featured?.id ?? null;
        const legalPublished = !!catalog && hasLegalSection(catalog);
        const sections = party
          ? PARTY_SECTIONS.filter((s) =>
              availableSections(party, featuredId, legalPublished).includes(s.id)
            )
          : [];
        const context = party && catalog ? partyPageContext(party, catalog) : null;
        const sourcesBySection = Object.fromEntries(
          PARTY_SECTIONS.map((s) => [s.id, context?.sources[s.id] ?? []])
        ) as Record<PartySection, Source[]>;
        const metaBySection = context
          ? (Object.fromEntries(
              sections.map((s) => [s.id, partySectionMeta(context, s.id)])
            ) as Record<PartySection, PageMeta>)
          : null;
        return {
          status,
          party,
          sections,
          metaBySection,
          notFoundMeta: nonIndexableMeta('Parti introuvable', `/partis/${partyId}`),
          sourcesBySection,
          /** Dossier présenté (tri, libellés, rappel de présomption) ; null si la section n'existe pas. */
          procedures: context?.legal ? presentDossier(context.legal) : null,
          markRead: () => dispatch(markContentReadUsecase(contentKey.party(partyId))),
          // Candidature à l'élection mise en avant (présidentielle 2027).
          presidential:
            party && featured && party.candidacies[featured.id]
              ? {
                  election: featured,
                  candidacy: party.candidacies[featured.id],
                  sections: (catalog?.themes ?? []).map((theme) => ({
                    theme,
                    programme: party.candidacies[featured.id].themes[theme.id],
                  })),
                }
              : null,
          stances:
            party && catalog
              ? catalog.questions.map((question) => ({
                  question,
                  stance: party.stances[question.id] ?? null,
                }))
              : [],
        };
      }
    );
