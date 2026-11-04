import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import {
  glanceQuestionIds,
  hasKeyIdeasSection,
  keyIdeaMeasureSources,
  keyIdeaOrigin,
  keyIdeaSources,
  keyIdeaTheme,
  nextPartyInJourney,
  sortKeyIdeasByTheme,
} from '@/src/programmes/models/key-ideas.service';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import { formatLongDate, originLabel } from '@/src/programmes/models/presentation.service';
import type { Candidacy, Source, ThemeId } from '@/src/programmes/models/programme.model';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import {
  nonIndexableMeta,
  partyPageContext,
  partySectionMeta,
  type PageMeta,
} from '@/src/programmes/models/seo/page-meta';
import {
  availableSections,
  partyHref,
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

const sourceCountLabel = (count: number) => `${count} source${count > 1 ? 's' : ''}`;

/** Une ligne sous le titre du bloc : état du programme 2027 à la date de vérification de la fiche. */
const programmeLine = (candidacy: Candidacy | undefined, verifiedOn: string): string | null => {
  if (!candidacy || candidacy.programmeState === 'publie') return null;
  if (candidacy.programmeState === 'non-publie') {
    return `Programme 2027 pas encore publié au ${verifiedOn}.`;
  }
  const detail = candidacy.programmeStateDetail ? ` (${candidacy.programmeStateDetail})` : '';
  return `Programme 2027 partiel${detail} au ${verifiedOn}.`;
};

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
            ).map((s) => ({ id: s.id, label: s.tabLabel }))
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
        const verifiedOn = party ? formatLongDate(party.lastVerified) : '';
        const themeTitle = (id: ThemeId) => catalog?.themes.find((t) => t.id === id)?.title ?? id;
        const questionById = (id: string) => catalog?.questions.find((q) => q.id === id);
        const keyIdeas =
          party && catalog && featured && hasKeyIdeasSection(catalog.parties, featured.id)
            ? {
                programmeLine: programmeLine(party.candidacies[featured.id], verifiedOn),
                items: sortKeyIdeasByTheme(
                  party.keyIdeas,
                  catalog.themes.map((t) => t.id)
                ).map((idea) => {
                  const sources = keyIdeaSources(party, featured.id, idea);
                  return {
                    id: idea.id,
                    themeTitle: themeTitle(keyIdeaTheme(idea)),
                    title: idea.title,
                    text: idea.text,
                    origin: originLabel(
                      keyIdeaOrigin(keyIdeaMeasureSources(party, featured.id, idea))
                    ),
                    sources,
                    sourceCount: sources.length,
                    sourceCountLabel: sourceCountLabel(sources.length),
                    relatedStances: idea.relatedQuestionIds.map((questionId) => ({
                      questionId,
                      label: questionById(questionId)?.shortLabel ?? questionId,
                      stance: party.stances[questionId].stance,
                    })),
                  };
                }),
              }
            : null;
        const glance =
          party && catalog
            ? glanceQuestionIds(catalog.questions, catalog.parties).map((questionId) => {
                const q = questionById(questionId)!;
                const position = party.stances[questionId];
                return {
                  questionId,
                  label: q.shortLabel,
                  statement: q.statement,
                  stance: position?.stance ?? null,
                  justification: position?.justification ?? '',
                  sources: position?.sources ?? [],
                };
              })
            : [];
        return {
          status,
          party,
          identityLine: party
            ? `Fondé en ${party.foundedYear} · ${party.leader.role} ${party.leader.name}`
            : '',
          verifiedOn,
          keyIdeas,
          glance,
          glanceIntro: catalog
            ? `${glance.length} questions, les mêmes pour les ${catalog.parties.length} partis. Touchez-en une pour voir pourquoi et les sources.`
            : '',
          positionsLabel: `Ses positions sur les ${catalog?.questions.length ?? 0} questions`,
          further:
            party && catalog
              ? [
                  ...(party.history
                    ? [
                        {
                          key: 'histoire',
                          title: 'Son histoire',
                          subtitle: `Fondé en ${party.foundedYear} · ${party.history.timeline.length} dates clés`,
                          href: partyHref(party.id, 'histoire'),
                        },
                        {
                          key: 'definition',
                          title: 'Comment il se définit, comment on le classe',
                          subtitle: null,
                          href: partyHref(party.id, 'histoire'),
                        },
                      ]
                    : []),
                  ...(featured && party.candidacies[featured.id]
                    ? [
                        {
                          key: 'programme',
                          title: 'Son programme pour 2027',
                          subtitle: `${catalog.themes.length} thèmes, chaque mesure sourcée`,
                          href: partyHref(party.id, 'programme-2027'),
                        },
                      ]
                    : []),
                ]
              : [],
          nextParty: party && catalog ? nextPartyInJourney(catalog.parties, party.id) : null,
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

export type PartyViewModel = ReturnType<ReturnType<ReturnType<typeof partyViewModel>>>;
