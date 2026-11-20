import { createSelector } from 'reselect';

import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { partyAssemblee } from '@/src/assemblee/models/party-assemblee';
import { partyAssembleeLine } from '@/src/assemblee/models/party-assemblee-line';
import { stanceVotes } from '@/src/assemblee/models/stance-votes';
import {
  selectAssembleeComposition,
  selectAssembleeIndex,
  selectAssembleeManifest,
} from '@/src/assemblee/store/assemblee.selector';
import type { AppDispatch } from '@/src/core/store/create-store';
import { partyLastUpdate } from '@/src/programmes/models/corrections/party-last-update';
import { emptyCatalog } from '@/src/programmes/models/empty-catalog';
import { etiquetteDetail, labelLines } from '@/src/programmes/models/etiquettes.service';
import { keyIdeasNote } from '@/src/programmes/models/key-ideas.copy';
import {
  displayedKeyIdeas,
  hasKeyIdeasSection,
  keyIdeaMeasureSources,
  keyIdeaOrigin,
  keyIdeaSources,
  keyIdeaTheme,
  nextPartyInJourney,
  sortKeyIdeasByTheme,
} from '@/src/programmes/models/key-ideas.service';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import {
  candidacySummary,
  electionPhrase,
  partySummary,
} from '@/src/programmes/models/page-summary.service';
import { positionsPreview } from '@/src/programmes/models/positions-preview.service';
import { formatLongDate, originLabel } from '@/src/programmes/models/presentation.service';
import {
  programmeNotice,
  themeProgramme,
} from '@/src/programmes/models/programme-publication.service';
import type { Source, ThemeId } from '@/src/programmes/models/programme.model';
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
  partyHref,
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

export const partyViewModel =
  (partyId: string) =>
  ({ dispatch }: { dispatch: AppDispatch }) =>
    createSelector(
      [
        selectCatalog,
        selectCatalogStatus,
        selectFeaturedElection,
        selectAssembleeIndex,
        selectAssembleeComposition,
        selectAssembleeManifest,
      ],
      (catalog, status, featured, assembleeIndex, composition, manifest) => {
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
          party && catalog && featured && hasKeyIdeasSection(party, featured.id)
            ? {
                note: keyIdeasNote(displayedKeyIdeas(party, featured.id).length),
                items: sortKeyIdeasByTheme(
                  displayedKeyIdeas(party, featured.id),
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
                /** Vote du groupe du parti sur les scrutins cités en source de cette position. */
                votes: assembleeIndex
                  ? stanceVotes({
                      stance: party.stances[question.id] ?? null,
                      groupe: party.colorSource.groupe,
                      index: assembleeIndex,
                    })
                  : [],
              }))
            : [];
        const assembleePanel =
          party && assembleeIndex && composition && manifest
            ? partyAssemblee({
                groupe: party.colorSource.groupe,
                index: assembleeIndex,
                composition,
                manifest,
              })
            : null;
        const notice =
          party && featured && party.candidacies[featured.id]
            ? programmeNotice(party.candidacies[featured.id], {
                partyId: party.id,
                themeIds: (catalog?.themes ?? []).map((t) => t.id),
              })
            : null;
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
          programmeNotice: notice,
          /** Programme non publié : 3 à 5 positions, même règle pour tous (voir `positionsPreview`). */
          positionsPreview:
            party && catalog && notice?.state === 'non-publie'
              ? {
                  ...positionsPreview(stances, catalog.themes),
                  all: { label: 'Toutes ses positions', href: partyHref(party.id, 'positions') },
                }
              : null,
          /** Chapô de l'onglet Programme : la candidature seulement (l'état du programme est dans la carte). */
          intro:
            party && catalog && featured
              ? candidacySummary({
                  party,
                  candidacy: party.candidacies[featured.id] ?? null,
                  electionTitle: electionPhrase(featured),
                })
              : null,
          /** Encart « À l'Assemblée » : le groupe officiel du parti (sigle de `colorSource`), même forme pour les dix. */
          assemblee: assembleePanel,
          /** Ligne d'en-tête, visible sur les 4 onglets. */
          assembleeLine: assembleePanel ? partyAssembleeLine(assembleePanel) : null,
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
          /** Note de méthode unique de l'onglet Positions, seulement si au moins un vote s'affiche. */
          stanceVotesNote: stances.some((item) => item.votes.length > 0)
            ? COPY.stanceVotes.note
            : null,
          partyCount: catalog?.parties.length ?? 0,
          /** Mêmes groupes, dans le même ordre (celui des thèmes), pour les dix partis. */
          stancesByTheme: catalog ? stancesByTheme(stances, catalog.themes) : [],
        };
      }
    );

export type PartyViewModel = ReturnType<ReturnType<ReturnType<typeof partyViewModel>>>;
