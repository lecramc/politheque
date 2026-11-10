import { t } from '@/src/assemblee/i18n/translate';
import { normalizeTitle } from '@/src/assemblee/models/extraction/normalize';
import type { Depute, Groupe, ScrutinDetail, VoteCode } from '@/src/assemblee/models/scrutin.model';

export type DeputyRow = {
  id: string;
  nom: string;
  /** Abréviation officielle du groupe au jour du vote. */
  groupe: string;
  /** Indice du groupe dans l'index (filtre). */
  groupeIndex: number;
  vote: VoteCode;
  /** Position officielle en toutes lettres. */
  position: string;
  delegation: boolean;
  /** Phrase de la source quand le député a publié une mise au point ; elle ne change pas `vote`. */
  miseAuPoint: string | null;
  /** Clé de tri : nom de famille. */
  tri: string;
  recherche: string;
};

type Input = { detail: ScrutinDetail; deputes: Depute[]; groupes: Groupe[]; censure: boolean };

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

const VOTE_KEYS: Record<VoteCode, string> = {
  P: 'P',
  C: 'C',
  A: 'A',
  N: 'N',
  '-': 'none',
  '.': 'vacant',
};

const ORDER: VoteCode[] = ['P', 'C', 'A', 'N', '-'];
const CENSURE_ORDER: VoteCode[] = ['P', '-', 'N'];

/** Ordre fixe des positions (filtre, légende), réduit à celles qui existent. */
export const orderedPositions = (present: VoteCode[], censure: boolean): VoteCode[] =>
  (censure ? CENSURE_ORDER : ORDER).filter((code) => present.includes(code));

/** Causes de non-vote que la source nomme (`causePositionVote`) ; les autres codes ne sont pas affichés. */
const KNOWN_CAUSES = new Set(['PAN', 'PSE', 'MG']);

export const positionLabel = (vote: VoteCode, censure: boolean, cause?: string): string => {
  if (vote === '-' && censure) return t('vote.censure.none');
  if (vote === 'N' && cause && KNOWN_CAUSES.has(cause)) {
    return t('vote.nonVotantCause', { cause: t(`vote.cause.${cause}`) });
  }
  return t(`vote.${VOTE_KEYS[vote]}`);
};

const searchable = (text: string) => normalizeTitle(text).normalize('NFD').replace(/\p{M}/gu, '');

/** Un député par ligne, ordre alphabétique : jamais classé selon son vote ni son groupe. */
export const deputyRows = ({ detail, deputes, groupes, censure }: Input): DeputyRow[] => {
  const mises = new Map(detail.misesAuPoint.map((m) => [m.depute, m.souhait]));
  const causes = new Map(detail.causes);
  const delegated = new Set(detail.delegations);
  const row = (
    deputeIndex: number,
    groupeIndex: number,
    vote: VoteCode,
    delegation: boolean
  ): DeputyRow => {
    const depute = deputes[deputeIndex];
    const souhait = mises.get(deputeIndex);
    const nom = `${depute.prenom} ${depute.nom}`;
    return {
      id: depute.id,
      nom,
      groupe: groupes[groupeIndex].abrev,
      groupeIndex,
      vote,
      position: positionLabel(vote, censure, causes.get(deputeIndex)),
      delegation,
      miseAuPoint: souhait
        ? t('vote.miseAuPoint', { souhait: t(`vote.souhait.${souhait}`) })
        : null,
      tri: depute.alpha || depute.nom,
      recherche: searchable(nom),
    };
  };

  const seated = detail.places.flatMap((_, i) =>
    detail.deputes[i] === -1 || detail.votes[i] === '.'
      ? []
      : [row(detail.deputes[i], detail.groupes[i], detail.votes[i] as VoteCode, delegated.has(i))]
  );
  const unseated = detail.sansPlace.map((m) => row(m.depute, m.groupe, m.vote, m.delegation));
  return [...seated, ...unseated].sort(
    (a, b) => collator.compare(a.tri, b.tri) || collator.compare(a.nom, b.nom)
  );
};

export type DeputyFilters = { recherche?: string; groupe?: number | null; vote?: VoteCode | null };

export const filterDeputyRows = (rows: DeputyRow[], filters: DeputyFilters): DeputyRow[] => {
  const words = searchable(filters.recherche ?? '')
    .split(' ')
    .filter(Boolean);
  return rows.filter(
    (r) =>
      (filters.groupe == null || r.groupeIndex === filters.groupe) &&
      (filters.vote == null || r.vote === filters.vote) &&
      words.every((word) => r.recherche.includes(word))
  );
};
