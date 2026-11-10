import { createSelector } from 'reselect';

import type { AppDispatch } from '@/src/core/store/create-store';
import { partyLastUpdate } from '@/src/programmes/models/corrections/party-last-update';
import { emptyCatalog } from '@/src/programmes/models/empty-catalog';
import { etiquetteDetail, labelLines } from '@/src/programmes/models/etiquettes.service';
import {
  hasKeyIdeas,
  hasKeyIdeasSection,
  keyIdeaMeasureSources,
  keyIdeaOrigin,
  keyIdeaSources,
  keyIdeaTheme,
  nextPartyInJourney,
  sortKeyIdeasByTheme,
} from '@/src/programmes/models/key-ideas.service';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import { electionPhrase, partySummary } from '@/src/programmes/models/page-summary.service';
import { formatLongDate, originLabel } from '@/src/programmes/models/presentation.service';
import {
  NOT_PUBLISHED,
  programmeNotice,
  themeProgramme,
} from '@/src/programmes/models/programme-publication.service';
import type { Candidacy, Source, ThemeId } from '@/src/programmes/models/programme.model';
import { contentKey } from '@/src/programmes/models/reading-progress.model';
import {
  nonIndexableMeta,
  partyAliasMeta,
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
import { stancesByTheme } from '@/src/programmes/models/stances-by-theme.service';
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
    return `${NOT_PUBLISHED} au ${verifiedOn}.`;
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
            ).map((s) => ({ id: s.id, label: s.tabLabel, longLabel: s.label }))
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
        const lastUpdate = party && catalog ? partyLastUpdate(party.id, catalog.corrections) : null;
        const updatedOn =
          party && lastUpdate && lastUpdate > party.lastVerified
            ? formatLongDate(lastUpdate)
            : null;
        const themeTitle = (id: ThemeId) => catalog?.themes.find((t) => t.id === id)?.title ?? id;
        const questionById = (id: string) => catalog?.questions.find((q) => q.id === id);
        const keyIdeas =
          party &&
          catalog &&
          featured &&
          hasKeyIdeas(party, featured.id) &&
          hasKeyIdeasSection(catalog.parties, featured.id)
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
        const etiquette = (catalog?.etiquettes.parties ?? []).find((e) => e.id === partyId);
        const stances =
          party && catalog
            ? catalog.questions.map((question) => ({
                question,
                stance: party.stances[question.id] ?? null,
              }))
            : [];
        return {
          status,
          party,
          identityLine: party
            ? `Fondé en ${party.foundedYear} · ${party.leader.role} ${party.leader.name}`
            : '',
          verifiedOn,
          updatedOn,
          /** Phrase datée en tête de la fiche, même gabarit pour tous (audit SEO § 5.1). */
          summary:
            party && catalog && featured
              ? partySummary({
                  party,
                  candidacy: party.candidacies[featured.id] ?? null,
                  electionTitle: electionPhrase(featured),
                  themeIds: catalog.themes.map((t) => t.id),
                })
              : null,
          /** Deux lignes, toujours les mêmes, et la feuille de détail (même structure pour tous). */
          labels: {
            lines: labelLines(etiquette),
            detail: etiquetteDetail(
              etiquette ?? {
                id: partyId,
                name: party?.name ?? '',
                ministry: null,
                ministryNullReason: null,
                press: null,
                pressNullReason: null,
              },
              catalog?.etiquettes.circular ?? emptyCatalog().etiquettes.circular
            ),
          },
          keyIdeas,
          /** Encart en tête de l'onglet Programme (publication, ou « pas encore publié ») ; null s'il n'y a rien à dire. */
          programmeNotice:
            party && featured && party.candidacies[featured.id]
              ? programmeNotice(party.candidacies[featured.id])
              : null,
          nextParty: party && catalog ? nextPartyInJourney(catalog.parties, party.id) : null,
          sections,
          metaBySection,
          /** `/partis/[id]` : canonical vers l'onglet Programme, hors index. */
          aliasMeta: context ? partyAliasMeta(context) : null,
          notFoundMeta: nonIndexableMeta('Parti introuvable', `/partis/${partyId}/programme-2027`),
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
                    programme: themeProgramme(party.candidacies[featured.id], theme.id),
                  })),
                }
              : null,
          stances,
          partyCount: catalog?.parties.length ?? 0,
          /** Mêmes groupes, dans le même ordre (celui des thèmes), pour les dix partis. */
          stancesByTheme: catalog ? stancesByTheme(stances, catalog.themes) : [],
        };
      }
    );

export type PartyViewModel = ReturnType<ReturnType<ReturnType<typeof partyViewModel>>>;
