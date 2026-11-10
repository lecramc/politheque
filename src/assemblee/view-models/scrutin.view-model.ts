import { createSelector } from 'reselect';

import { t } from '@/src/assemblee/i18n/translate';
import {
  deputyRows,
  filterDeputyRows,
  type DeputyFilters,
  type DeputyRow,
} from '@/src/assemblee/models/deputy-table';
import { groupTable } from '@/src/assemblee/models/group-table';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';
import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import { hemicycleArcs, hemicycleBox } from '@/src/assemblee/models/hemicycle-scene';
import {
  capitalizeTitle,
  categoryLabel,
  countsLabel,
  requesters,
  resultLabel,
  scrutinHeading,
  voteTypeLabel,
} from '@/src/assemblee/models/scrutin-labels';
import { citingParties, otherVotesOnSameText } from '@/src/assemblee/models/scrutin-links';
import { scrutinResultSentence } from '@/src/assemblee/models/scrutin-result';
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
      box: ReturnType<typeof hemicycleBox>;
      seats: ReturnType<typeof seatViews>['seats'];
      unseated: ReturnType<typeof seatViews>['unseated'];
      arcs: ReturnType<typeof hemicycleArcs>;
      censure: boolean;
      /** Groupes présents ce jour-là, pour le filtre du tableau des députés. */
      groupes: { index: number; abrev: string; libelle: string; couleurOfficielle: string }[];
      rows: DeputyRow[];
      filter: (filters: DeputyFilters) => DeputyRow[];
    };

const SYNTHESIS_STANDARD = [
  'votants',
  'exprimes',
  'requis',
  'pour',
  'contre',
  'abstentions',
  'nonVotants',
] as const;
const SYNTHESIS_CENSURE = ['votants', 'requis', 'pour', 'nonVotants'] as const;

const buildHemicycle = (
  scrutin: ScrutinSummary,
  detail: ScrutinDetail,
  deputes: Depute[],
  groupes: Groupe[]
): HemicycleView => {
  const censure = scrutin.type === 'MOC';
  // Les numéros de place sont les mêmes pour tous les scrutins de la législature : la géométrie
  // ne bouge pas d'un scrutin à l'autre.
  const layout = hemicycleLayout(detail.places);
  const { seats, unseated } = seatViews({ layout, detail, deputes, groupes, censure });
  const rows = deputyRows({ detail, deputes, groupes, censure });
  const present = new Set([
    ...detail.groupes.filter((g) => g >= 0),
    ...detail.sansPlace.map((m) => m.groupe),
  ]);
  return {
    status: 'ready',
    ariaLabel: t('hemicycle.label', {
      numero: scrutin.numero,
      resume: describeVotes(detail, { censure }),
    }),
    layout,
    box: hemicycleBox(layout),
    seats,
    unseated,
    arcs: hemicycleArcs(layout, detail, groupes),
    censure,
    groupes: [...present].map((index) => ({
      index,
      abrev: groupes[index].abrev,
      libelle: groupes[index].libelle,
      couleurOfficielle: groupes[index].couleurOfficielle,
    })),
    rows,
    filter: (filters) => filterDeputyRows(rows, filters),
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
          return {
            numero,
            meta: scrutinMeta(scrutin),
            heading: scrutinHeading(scrutin),
            titre: capitalizeTitle(scrutin.titre),
            dateIso: scrutin.date,
            date: formatLongDate(scrutin.date),
            categorie: categoryLabel(scrutin.categorie),
            type: voteTypeLabel(scrutin.type),
            demandeurs: requesters(scrutin.demandeur),
            adopte: scrutin.adopte,
            resultatCourt: resultLabel(scrutin),
            resultat: scrutinResultSentence(scrutin),
            decompte: countsLabel(scrutin),
            censure,
            synthese: (censure ? SYNTHESIS_CENSURE : SYNTHESIS_STANDARD).map((id) => ({
              id,
              label: t(`scrutin.synthesis.${id}`),
              value: scrutin.synthese[id],
            })),
            groups: (order: GroupeOrder) => groupTable(scrutin, index.groupes, order),
            delegations: scrutin.delegations,
            misesAuPoint: scrutin.misesAuPoint,
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
                  label: t('cited.item', {
                    partie: citation.name,
                    onglet: partySectionLabel(citation.section),
                  }),
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
