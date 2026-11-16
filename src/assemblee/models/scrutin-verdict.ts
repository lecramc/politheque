import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { BarSegment } from '@/src/assemblee/models/group-table';
import { countsLabel, resultLabel } from '@/src/assemblee/models/scrutin-labels';
import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

export type Verdict =
  | {
      kind: 'standard';
      adopte: boolean;
      /** « Adopté » / « Rejeté ». */
      headline: string;
      counts: string;
      threshold: string;
      /** Une barre unique pour, contre, abstentions (les votants), avec un trait à la majorité. */
      bar: { segments: BarSegment[]; total: number; threshold: number };
    }
  | {
      kind: 'censure';
      adopte: boolean;
      headline: string;
      detail: string;
      note: string;
    };

/**
 * Le verdict, sans commentaire : le résultat en un mot, les décomptes, ce qu'il fallait. Une
 * motion de censure dit sa conséquence constitutionnelle (le Gouvernement reste ou est renversé).
 * Même gabarit pour tous les votes.
 */
export const scrutinVerdict = (scrutin: ScrutinSummary): Verdict => {
  const { pour, contre, abstentions, requis } = scrutin.synthese;
  if (scrutin.type === 'MOC') {
    return {
      kind: 'censure',
      adopte: scrutin.adopte,
      headline: COPY.verdict.censureHeadline(scrutin.adopte),
      detail: COPY.verdict.censureDetail(pour, requis),
      note: COPY.verdict.censureNote,
    };
  }
  const segments: BarSegment[] = [
    { kind: 'pour', count: pour },
    { kind: 'contre', count: contre },
    { kind: 'abstention', count: abstentions },
  ];
  return {
    kind: 'standard',
    adopte: scrutin.adopte,
    headline: resultLabel(scrutin),
    counts: countsLabel(scrutin),
    threshold: COPY.verdict.threshold(requis),
    bar: {
      segments: segments.filter((segment) => segment.count > 0),
      total: pour + contre + abstentions,
      threshold: requis,
    },
  };
};
