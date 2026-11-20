import { indexFactory, scrutinFactory } from '@/src/assemblee/models/scrutin.factory';
import { themeVotes } from '@/src/assemblee/models/theme-votes';
import type { PartyStance, Source } from '@/src/programmes/models/programme.model';

const cite = (n: number, kind: Source['kind'] = 'vote'): PartyStance => ({
  stance: 1,
  justification: 'j',
  sources: [
    {
      title: 't',
      url: `https://www.assemblee-nationale.fr/dyn/17/scrutins/${n}`,
      date: '2026-01-01',
      kind,
    },
  ],
});
const party = (stances: Record<string, PartyStance>) => ({ stances });
const day = (n: number) => `2025-01-${String(n).padStart(2, '0')}`;

describe('Feature: ce qu’a voté l’Assemblée sur un débat', () => {
  const scrutins = Array.from({ length: 12 }, (_, i) =>
    scrutinFactory({ numero: i + 1, date: day(i + 1) })
  );
  const index = indexFactory({ scrutins });

  it('should gather the distinct scrutins cited by any party on the questions of the theme, newest first', () => {
    const parties = [
      party({ q1: cite(2), q2: cite(5), other: cite(9) }),
      party({ q1: cite(2), q2: cite(1) }),
    ];
    expect(themeVotes(['q1', 'q2'], parties, index).map((s) => s.numero)).toEqual([5, 2, 1]);
  });

  it('should ignore cited scrutins missing from the index and sources that are not votes', () => {
    const parties = [party({ q1: cite(99), q2: cite(3, 'presse') })];
    expect(themeVotes(['q1', 'q2'], parties, index)).toEqual([]);
  });

  it('should keep the eight most recent', () => {
    const stances = Object.fromEntries(scrutins.map((s) => [`q${s.numero}`, cite(s.numero)]));
    const found = themeVotes(Object.keys(stances), [party(stances)], index);
    expect(found.map((s) => s.numero)).toEqual([12, 11, 10, 9, 8, 7, 6, 5]);
  });
});
