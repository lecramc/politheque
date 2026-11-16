import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { requesters, voteTypeDetail } from '@/src/assemblee/models/scrutin-labels';
import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

export type DetailFact = { id: string; label: string; values: string[] };

/**
 * « Détails du vote » : les faits techniques, en mots simples, dans un ordre fixe. Une motion de
 * censure n'a pas de « Ont voté » (il répéterait les votes pour, déjà dans le verdict).
 */
export const scrutinDetails = (
  scrutin: ScrutinSummary
): { details: DetailFact[]; glossary: string[] } => {
  const censure = scrutin.type === 'MOC';
  const { synthese } = scrutin;
  const demandeurs = requesters(scrutin.demandeur);
  const count = (id: DetailFact['id'], label: string, value: number): DetailFact => ({
    id,
    label,
    values: [String(value)],
  });
  const details: DetailFact[] = [
    { id: 'type', label: COPY.details.type, values: [voteTypeDetail(scrutin.type)] },
    ...(demandeurs.length
      ? [{ id: 'demandeur', label: COPY.details.requestedBy, values: demandeurs }]
      : []),
    ...(censure ? [] : [count('votants', COPY.details.votants, synthese.votants)]),
    ...(censure ? [] : [count('exprimes', COPY.details.exprimes, synthese.exprimes)]),
    count('requis', COPY.details.requis, synthese.requis),
    count('nonVotants', COPY.details.nonVotants, synthese.nonVotants),
    ...(synthese.nonVotantsVolontaires > 0
      ? [
          count(
            'nonVotantsVolontaires',
            COPY.details.nonVotantsVolontaires,
            synthese.nonVotantsVolontaires
          ),
        ]
      : []),
    count('delegations', COPY.details.delegations, scrutin.delegations),
    count('misesAuPoint', COPY.details.misesAuPoint, scrutin.misesAuPoint),
  ];
  return {
    details,
    glossary: [COPY.details.glossaryDelegation, COPY.details.glossaryMiseAuPoint],
  };
};
