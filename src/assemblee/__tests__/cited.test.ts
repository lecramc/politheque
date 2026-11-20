import { citedScrutinNumbers, scrutinNumberFromUrl } from '@/src/assemblee/models/extraction/cited';
import type { PartyStance, Source } from '@/src/programmes/models/programme.model';

const source = (url: string, kind: Source['kind'] = 'vote'): Source => ({
  title: 't',
  url,
  date: '2026-01-01',
  kind,
});
const party = (...sources: Source[][]) => ({
  stances: Object.fromEntries(
    sources.map((s, i) => [`q${i}`, { stance: 1, justification: 'j', sources: s } as PartyStance])
  ),
});
const an = (leg: number, n: number) =>
  `https://www.assemblee-nationale.fr/dyn/${leg}/scrutins/${n}`;

describe('Feature: scrutins cités en source sur les fiches des partis', () => {
  it('should read the number of a 17th legislature scrutin from its url', () => {
    expect(scrutinNumberFromUrl(an(17, 3300))).toBe(3300);
  });

  it('should ignore other legislatures and other links', () => {
    expect(scrutinNumberFromUrl(an(16, 44))).toBeNull();
    expect(scrutinNumberFromUrl('https://example.org/dyn/17/scrutins/12')).toBeNull();
    expect(scrutinNumberFromUrl('https://www.assemblee-nationale.fr/dyn/17/scrutins/')).toBeNull();
  });

  it('should list each cited number once, across all parties and stances', () => {
    const parties = [
      party([source(an(17, 10)), source('https://x.org', 'presse')], [source(an(17, 5))]),
      party([source(an(17, 10))], [source(an(15, 4296))]),
    ];
    expect([...citedScrutinNumbers(parties)].sort((a, b) => a - b)).toEqual([5, 10]);
  });
});
