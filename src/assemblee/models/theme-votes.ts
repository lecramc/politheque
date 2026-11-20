import type { ScrutinIndex, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';
import { citedVotes } from '@/src/assemblee/models/stance-votes';
import type { PartyStance } from '@/src/programmes/models/programme.model';

export const THEME_VOTES_COUNT = 8;

/**
 * Les scrutins cités en source `vote` par les positions de n'importe quel parti sur les questions
 * d'un débat, s'ils sont dans l'index : distincts, du plus récent au plus ancien, 8 au maximum.
 */
export const themeVotes = (
  questionIds: readonly string[],
  parties: readonly { stances: Record<string, PartyStance> }[],
  index: ScrutinIndex
): ScrutinSummary[] =>
  citedVotes(
    parties.flatMap((party) => questionIds.map((id) => party.stances[id] ?? null)),
    index
  ).slice(0, THEME_VOTES_COUNT);
