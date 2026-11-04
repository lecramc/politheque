import { isAggregator } from '@/src/programmes/models/aggregators';
import { domainOf } from '@/src/programmes/models/domain';
import type { Source } from '@/src/programmes/models/programme.model';

export { domainOf };

export type VerificationLevel = 'croisee' | 'source-unique' | 'non-sourcee';

const PRIMARY_KINDS = new Set(['programme', 'vote', 'proposition-de-loi', 'declaration']);
/** Sources qui ne sont pas produites par le parti lui-même (un scrutin public est un fait constaté). */
const INDEPENDENT_KINDS = new Set(['presse', 'statistique', 'vote', 'justice']);

/**
 * « Croisée » : au moins deux sources de domaines différents, dont au moins une indépendante
 * du parti. Deux pages du même site, ou deux sites du même camp (programme + site du candidat),
 * ne suffisent pas.
 */
export const verificationLevel = (allSources: Source[]): VerificationLevel => {
  // Les agrégateurs sont des pistes, jamais des sources (règle 7) : ils ne comptent pas.
  const sources = allSources.filter((s) => !isAggregator(s.url));
  if (sources.length === 0) return 'non-sourcee';
  const domains = new Set(sources.map((s) => domainOf(s.url)));
  const hasIndependent = sources.some((s) => INDEPENDENT_KINDS.has(s.kind));
  return domains.size >= 2 && hasIndependent ? 'croisee' : 'source-unique';
};

export const hasPrimarySource = (sources: Source[]) =>
  sources.some((s) => PRIMARY_KINDS.has(s.kind));
