import type { PartyStance } from '@/src/programmes/models/programme.model';

const LEGISLATURE = 17;
const SCRUTIN_URL = /^https:\/\/www\.assemblee-nationale\.fr\/dyn\/(\d+)\/scrutins\/(\d+)$/;

/** Numéro d'un scrutin de la 17e législature d'après son adresse officielle ; null sinon. */
export const scrutinNumberFromUrl = (url: string): number | null => {
  const found = SCRUTIN_URL.exec(url);
  return found && Number(found[1]) === LEGISLATURE ? Number(found[2]) : null;
};

/** Règle R7 : numéros des scrutins de la 17e législature cités en source par les positions des partis. */
export const citedScrutinNumbers = (
  parties: readonly { stances: Record<string, PartyStance> }[]
): Set<number> =>
  new Set(
    parties
      .flatMap((party) => Object.values(party.stances))
      .flatMap((stance) => stance.sources)
      .map((source) => scrutinNumberFromUrl(source.url))
      .filter((n): n is number => n !== null)
  );
