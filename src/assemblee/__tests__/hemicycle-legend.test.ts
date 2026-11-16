import { legendEntries } from '@/src/assemblee/models/hemicycle-legend';

describe('Feature: légende de l’hémicycle', () => {
  it('should have four entries: for, against, abstention, did not vote, each with its shape', () => {
    expect(legendEntries(false)).toEqual([
      { code: 'P', glyph: 'disc', label: 'Pour' },
      { code: 'C', glyph: 'disc-slash', label: 'Contre' },
      { code: 'A', glyph: 'ring', label: 'Abstention' },
      { code: '-', glyph: 'dashed', label: "N'a pas voté" },
    ]);
  });

  it('should have two entries for a censure motion, where only the votes for are recorded', () => {
    expect(legendEntries(true)).toEqual([
      { code: 'P', glyph: 'disc', label: 'Pour' },
      { code: '-', glyph: 'dashed', label: "N'a pas voté la motion" },
    ]);
  });

  it('should not legend the delegations on the diagram', () => {
    for (const censure of [false, true]) {
      expect(
        legendEntries(censure)
          .map((e) => e.label.toLowerCase())
          .join(' ')
      ).not.toMatch(/délégation|confié/);
    }
  });
});
