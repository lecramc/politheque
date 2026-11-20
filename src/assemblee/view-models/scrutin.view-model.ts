import { createSelector } from 'reselect';

import {
  ARTICLE_49_SOURCE_URL,
  censureMotionsOnSameText,
  needsArticle493Note,
} from '@/src/assemblee/models/article-49-3';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import {
  circonscriptionsOf,
  departementChoices,
  departements,
  type CirconscriptionRow,
} from '@/src/assemblee/models/constituencies';
import {
  deputyRows,
  deputySearch,
  orderedPositions,
  positionLabel,
  type DeputyFilters,
  type DeputyRow,
} from '@/src/assemblee/models/deputy-table';
import { groupColor } from '@/src/assemblee/models/group-color';
import { groupName, groupTable } from '@/src/assemblee/models/group-table';
import { orderGroupes, type GroupeOrder } from '@/src/assemblee/models/groupe-order';
import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import { legendEntries } from '@/src/assemblee/models/hemicycle-legend';
import { hemicycleArcs, hemicycleBox } from '@/src/assemblee/models/hemicycle-scene';
import { groupedSeating } from '@/src/assemblee/models/hemicycle-seating';
import { scrutinDetails } from '@/src/assemblee/models/scrutin-details';
import {
  capitalizeTitle,
  categoryLabel,
  resultLabel,
  scrutinHelpLinks,
  scrutinNature,
  scrutinReference,
  scrutinShortTitle,
  scrutinStage,
  voteTypeLabel,
} from '@/src/assemblee/models/scrutin-labels';
import { citingParties, otherVotesOnSameText } from '@/src/assemblee/models/scrutin-links';
import { scrutinVerdict } from '@/src/assemblee/models/scrutin-verdict';
import type {
  Depute,
  Groupe,
  ScrutinDetail,
  ScrutinSummary,
} from '@/src/assemblee/models/scrutin.model';
import { describeVotes, seatViews } from '@/src/assemblee/models/seat-view';
import { officialScrutinUrl, sourceNote } from '@/src/assemblee/models/source-note';
import {
  selectAssembleeIndex,
  selectAssembleeManifest,
  selectDeputes,
  selectScrutinDetails,
} from '@/src/assemblee/store/assemblee.selector';
import { loadDeputesUsecase } from '@/src/assemblee/usecases/load-deputes.usecase';
import { loadScrutinDetailUsecase } from '@/src/assemblee/usecases/load-scrutin-detail.usecase';
import type { AppDispatch } from '@/src/core/store/create-store';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { scrutinMeta } from '@/src/programmes/models/seo/page-meta';
import { partyHref, partySectionLabel } from '@/src/programmes/models/seo/party-sections';
import { selectCatalog } from '@/src/programmes/store/programmes.selector';

export type HemicycleView =
  | { status: 'loading' }
  | { status: 'error'; officialUrl: string }
  | {
      status: 'ready';
      /** Un seul libellé résumé : l'hémicycle est une image, pas 577 arrêts de tabulation. */
      ariaLabel: string;
      layout: ReturnType<typeof hemicycleLayout>;
      /** Cadre avec la place des étiquettes de groupe (écran large). */
      box: ReturnType<typeof hemicycleBox>;
      /** Cadre serré, sans étiquettes : pleine largeur sur écran étroit. */
      compactBox: ReturnType<typeof hemicycleBox>;
      seats: ReturnType<typeof seatViews>['seats'];
      unseated: ReturnType<typeof seatViews>['unseated'];
      /** Une ligne par député sans siège identifiable : « Nom (SIGLE) : position ». */
      unseatedLines: string[];
      arcs: ReturnType<typeof hemicycleArcs>;
      censure: boolean;
      legend: ReturnType<typeof legendEntries>;
      /** Phrase affichée au survol d'un siège ; null pour un siège vacant. */
      tooltipOf: (place: number) => string | null;
      /** Groupes présents ce jour-là (un seul ordre sur toute la page). */
      groupes: (order: GroupeOrder) => {
        index: number;
        abrev: string;
        /** Couleur officielle du groupe à l'Assemblée. */
        color: string;
        libelle: string;
        name: string;
      }[];
      /** Positions présentes, dans leur ordre fixe, pour le filtre des députés. */
      positions: { code: DeputyRow['vote']; label: string }[];
      rows: DeputyRow[];
      /** Chercher un député : la liste n'apparaît qu'une fois une recherche ou un filtre posés. */
      search: (filters: DeputyFilters, requested: boolean) => ReturnType<typeof deputySearch>;
      /** Trouver son député : département (nom ou numéro), puis circonscriptions. Aucune adresse. */
      constituency: {
        choices: (query: string, requested: boolean) => ReturnType<typeof departementChoices>;
        circonscriptions: (code: string) => CirconscriptionRow[];
      };
    };

const buildHemicycle = (
  scrutin: ScrutinSummary,
  detail: ScrutinDetail,
  deputes: Depute[],
  groupes: Groupe[]
): HemicycleView => {
  const censure = scrutin.type === 'MOC';
  // Schéma simplifié : sièges renumérotés groupe par groupe, dans l'ordre officiel de la salle
  // (les numéros de place réels ne suivent pas l'angle). Même effectif de sièges d'un scrutin à
  // l'autre, donc même géométrie.
  const seating = { ...detail, ...groupedSeating(detail, groupes) };
  const layout = hemicycleLayout(seating.places);
  const { seats, unseated } = seatViews({ layout, detail: seating, deputes, groupes, censure });
  const rows = deputyRows({ detail, deputes, groupes, censure });
  const allDepartements = departements(deputes);
  const present = new Set([
    ...detail.groupes.filter((g) => g >= 0),
    ...detail.sansPlace.map((m) => m.groupe),
  ]);
  const seatByPlace = new Map(seats.map((seat) => [seat.place, seat]));
  return {
    status: 'ready',
    ariaLabel: COPY.hemicycle.label(scrutin.numero, describeVotes(detail, { censure })),
    layout,
    box: hemicycleBox(layout),
    compactBox: hemicycleBox(layout, { labels: false }),
    seats,
    unseated,
    unseatedLines: unseated.map(
      (m) =>
        `${m.depute.nom} (${m.groupe}) : ${positionLabel(m.vote, censure)}${m.delegation ? ` · ${COPY.vote.delegation}` : ''}`
    ),
    arcs: hemicycleArcs(layout, seating, groupes),
    censure,
    legend: legendEntries(censure),
    tooltipOf: (place) => {
      const seat = seatByPlace.get(place);
      return seat?.depute
        ? COPY.hemicycle.tooltip(
            seat.depute.nom,
            seat.groupe ?? '',
            positionLabel(seat.vote, censure)
          )
        : null;
    },
    groupes: (order) =>
      orderGroupes(groupes, order)
        .filter((groupe) => present.has(groupe.index))
        .map((groupe) => ({
          index: groupe.index,
          abrev: groupe.abrev,
          color: groupColor(groupe),
          libelle: groupe.libelle,
          name: groupName(groupe),
        })),
    positions: orderedPositions(
      rows.map((row) => row.vote),
      censure
    ).map((code) => ({ code, label: positionLabel(code, censure) })),
    rows,
    search: (filters, requested) => deputySearch(rows, filters, requested),
    constituency: {
      choices: (query, requested) => departementChoices(allDepartements, query, requested),
      circonscriptions: (code) => circonscriptionsOf(deputes, code),
    },
  };
};

/**
 * Page d'un scrutin. Tout ce qui est pré-rendu (en-tête, résultat, synthèse, tableau des groupes,
 * autres votes, source) vient de l'index embarqué ; le détail par député n'arrive qu'après
 * `load()`, côté client. Tant qu'il n'est pas là, `hemicycle` vaut `loading` (idem au pré-rendu).
 */
export const scrutinViewModel = ({ dispatch }: { dispatch: AppDispatch }) =>
  createSelector(
    [
      selectAssembleeIndex,
      selectAssembleeManifest,
      selectScrutinDetails,
      selectDeputes,
      selectCatalog,
    ],
    (index, manifest, details, deputes, catalog) => {
      const hemicycles = new Map<number, HemicycleView>();

      const hemicycleOf = (scrutin: ScrutinSummary): HemicycleView => {
        const detail = details[scrutin.numero];
        if (detail?.status === 'error' || deputes.status === 'error') {
          return { status: 'error', officialUrl: officialScrutinUrl(scrutin.numero) };
        }
        if (detail?.status !== 'loaded' || deputes.status !== 'loaded')
          return { status: 'loading' };
        const cached = hemicycles.get(scrutin.numero);
        if (cached) return cached;
        const built = buildHemicycle(scrutin, detail.data, deputes.data.deputes, index!.groupes);
        hemicycles.set(scrutin.numero, built);
        return built;
      };

      return {
        status: index && manifest ? ('loaded' as const) : ('loading' as const),
        /** Déclenché à l'ouverture de la page, côté client seulement. Chaque fichier n'est lu qu'une fois. */
        load: (numero: number) => {
          void dispatch(loadScrutinDetailUsecase(numero));
          void dispatch(loadDeputesUsecase());
        },
        scrutin: (numero: number) => {
          const scrutin = index?.scrutins.find((s) => s.numero === numero);
          if (!index || !manifest || !scrutin) return null;
          const censure = scrutin.type === 'MOC';
          const reference = scrutinReference(numero);
          return {
            numero,
            meta: scrutinMeta(scrutin),
            /** Ligne d'en-tête : date · type de vote. */
            heading: COPY.scrutin.header(formatLongDate(scrutin.date), voteTypeLabel(scrutin.type)),
            reference,
            /** Mention en petit sous le titre : la référence, et d'où vient le titre. */
            titleNote: COPY.scrutin.titleNote(reference),
            titre: capitalizeTitle(scrutin.titre),
            /** Nature, étape et titre court tirés du titre officiel ; null sans règle applicable. */
            nature: scrutinNature(scrutin.titre),
            stage: scrutinStage(scrutin.titre),
            shortTitle: scrutinShortTitle(scrutin.titre),
            helpLinks: scrutinHelpLinks(scrutin),
            dateIso: scrutin.date,
            censure,
            verdict: scrutinVerdict(scrutin),
            ...scrutinDetails(scrutin),
            article493: needsArticle493Note(scrutin)
              ? {
                  text: COPY.notes.article493,
                  sourceLabel: COPY.notes.article493Source,
                  sourceUrl: ARTICLE_49_SOURCE_URL,
                }
              : null,
            motionsDeCensure: censureMotionsOnSameText(scrutin, index.scrutins).map((motion) => ({
              numero: motion.numero,
              href: `/assemblee/scrutins/${motion.numero}`,
              label: COPY.notes.budgetMotionItem(motion.numero, resultLabel(motion)),
            })),
            groups: (order: GroupeOrder) => groupTable(scrutin, index.groupes, order),
            autresVotes: otherVotesOnSameText(scrutin, index.scrutins).map((other) => ({
              numero: other.numero,
              href: `/assemblee/scrutins/${other.numero}`,
              date: formatLongDate(other.date),
              categorie: categoryLabel(other.categorie),
              titre: capitalizeTitle(other.titre),
              resultat: resultLabel(other),
            })),
            dossierUrl: scrutin.dossier?.url ?? null,
            citations: catalog
              ? citingParties(catalog, numero).map((citation) => ({
                  label: COPY.cited.item(citation.name, partySectionLabel(citation.section)),
                  href: partyHref(citation.partyId, citation.section),
                }))
              : [],
            sourceUrl: officialScrutinUrl(numero),
            source: sourceNote(manifest),
            hemicycle: hemicycleOf(scrutin),
          };
        },
      };
    }
  );
