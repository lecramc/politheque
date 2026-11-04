import type { Source } from '@/src/programmes/models/programme.model';

export type VerificationLevel = 'croisee' | 'source-unique' | 'non-sourcee';

const PRIMARY_KINDS = new Set(['programme', 'vote', 'proposition-de-loi', 'declaration']);
/** Sources qui ne sont pas produites par le parti lui-même (un scrutin public est un fait constaté). */
const INDEPENDENT_KINDS = new Set(['presse', 'statistique', 'vote', 'justice']);

const SECOND_LEVEL = new Set(['gouv', 'co', 'com', 'org', 'ac', 'asso']);

/** Domaine « enregistrable » : deux sous-domaines du même site ne comptent pas comme deux sources. */
export const domainOf = (url: string) => {
  try {
    const labels = new URL(url).hostname.split('.');
    const keep = labels.length > 2 && SECOND_LEVEL.has(labels[labels.length - 2]) ? 3 : 2;
    return labels.slice(-keep).join('.');
  } catch {
    return url;
  }
};

/**
 * « Croisée » : au moins deux sources de domaines différents, dont au moins une indépendante
 * du parti. Deux pages du même site, ou deux sites du même camp (programme + site du candidat),
 * ne suffisent pas.
 */
export const verificationLevel = (sources: Source[]): VerificationLevel => {
  if (sources.length === 0) return 'non-sourcee';
  const domains = new Set(sources.map((s) => domainOf(s.url)));
  const hasIndependent = sources.some((s) => INDEPENDENT_KINDS.has(s.kind));
  return domains.size >= 2 && hasIndependent ? 'croisee' : 'source-unique';
};

export const hasPrimarySource = (sources: Source[]) =>
  sources.some((s) => PRIMARY_KINDS.has(s.kind));
