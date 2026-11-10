import type { SittingMember } from '@/src/assemblee/models/extraction/amo';
import { alignAbsents } from '@/src/assemblee/models/extraction/effectifs';

const member = (
  acteurRef: string,
  groupeRef: string,
  alternatives: (string | null)[] = []
): SittingMember => ({ acteurRef, groupeRef, placeHemicycle: null, alternatives });

const groupsOf = (members: SittingMember[]) => members.map((m) => [m.acteurRef, m.groupeRef]);

describe("Feature: alignement sur l'effectif officiel des groupes", () => {
  it('should keep every deputy when the group sizes already match', () => {
    const absents = [member('a', 'X', [null]), member('b', 'Y')];
    const official = new Map([
      ['X', 1],
      ['Y', 1],
    ]);
    expect(alignAbsents({ absents, voterGroups: [], official })).toEqual(absents);
  });

  it('should drop a deputy whose mandate ends that day when his group is over its official size', () => {
    const absents = [member('a', 'X', [null])];
    expect(alignAbsents({ absents, voterGroups: [], official: new Map([['X', 0]]) })).toEqual([]);
  });

  it('should move a deputy to the group he joins the next day when that group is short', () => {
    const absents = [member('a', 'X', ['Y'])];
    const official = new Map([
      ['X', 0],
      ['Y', 1],
    ]);
    expect(groupsOf(alignAbsents({ absents, voterGroups: [], official }))).toEqual([['a', 'Y']]);
  });

  it('should never move a deputy without an alternative, even when his group is over its size', () => {
    const absents = [member('a', 'X')];
    expect(alignAbsents({ absents, voterGroups: [], official: new Map([['X', 0]]) })).toEqual(
      absents
    );
  });

  it('should count the deputies who voted in the size of their group', () => {
    const absents = [member('a', 'X', [null])];
    const official = new Map([['X', 2]]);
    expect(alignAbsents({ absents, voterGroups: ['X'], official })).toEqual(absents);
    expect(
      alignAbsents({ absents, voterGroups: ['X', 'X'], official: new Map([['X', 2]]) })
    ).toEqual([]);
  });

  it('should chain moves through a group that is already at its size', () => {
    const absents = [member('a', 'X', ['Y']), member('b', 'Y', ['Z'])];
    const official = new Map([
      ['X', 0],
      ['Y', 1],
      ['Z', 1],
    ]);
    expect(groupsOf(alignAbsents({ absents, voterGroups: [], official }))).toEqual([
      ['a', 'Y'],
      ['b', 'Z'],
    ]);
  });

  it('should leave a group over its size alone when no move can fix it', () => {
    const absents = [member('a', 'X', ['Y'])];
    const official = new Map([
      ['X', 0],
      ['Y', 1],
      ['Z', 1],
    ]);
    expect(groupsOf(alignAbsents({ absents, voterGroups: [], official }))).toEqual([['a', 'Y']]);
    expect(
      groupsOf(
        alignAbsents({
          absents: [member('a', 'X', ['Y'])],
          voterGroups: [],
          official: new Map([
            ['X', 0],
            ['Y', 0],
          ]),
        })
      )
    ).toEqual([['a', 'X']]);
  });
});
