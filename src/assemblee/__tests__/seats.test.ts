import { assignSeats, fillSeats, type SeatMember } from '@/src/assemblee/models/extraction/seats';

const voter = (
  acteurRef: string,
  place: number | null,
  vote: SeatMember['vote'] = 'P'
): SeatMember => ({
  acteurRef,
  groupeRef: 'PO100',
  vote,
  delegation: false,
  place,
});
const absent = (acteurRef: string, placeHemicycle: number | null = null) => ({
  acteurRef,
  groupeRef: 'PO100',
  placeHemicycle,
});

describe('Feature: occupation des places un jour de scrutin', () => {
  it('should seat a voter on the place given by the vote', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [voter('a', 10)],
      absents: [],
      history: {},
    });
    expect(seated).toEqual([{ ...voter('a', 10), place: 10 }]);
  });

  it('should mark a sitting deputy absent from every list as « pas de vote enregistré » on the closest known place in time', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [],
      absents: [absent('a', 99)],
      history: {
        a: [
          { date: '2025-01-01', place: 20 },
          { date: '2025-03-08', place: 21 },
        ],
      },
    });
    expect(seated).toEqual([
      { acteurRef: 'a', groupeRef: 'PO100', vote: '-', delegation: false, place: 21 },
    ]);
  });

  it('should fall back on the hemicycle place of the mandate when no place was ever observed', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [],
      absents: [absent('a', 301)],
      history: {},
    });
    expect(seated.map((s) => s.place)).toEqual([301]);
  });

  it('should never give the same place to two deputies : the voter keeps it, the absent takes its next candidate', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [voter('replacement', 11)],
      absents: [absent('former', 50)],
      history: {
        former: [{ date: '2025-03-09', place: 11 }],
      },
    });
    expect(seated.find((s) => s.acteurRef === 'former')?.place).toBe(50);
    expect(seated.find((s) => s.acteurRef === 'replacement')?.place).toBe(11);
  });

  it('should find a place for a voter whose vote carries none', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [voter('a', null)],
      absents: [],
      history: { a: [{ date: '2025-03-01', place: 7 }] },
    });
    expect(seated).toEqual([{ ...voter('a', null), place: 7 }]);
  });

  it('should fall back on the hemicycle place of the mandate for a voter with no observed place', () => {
    const { seated } = assignSeats({
      date: '2025-03-10',
      voters: [voter('a', null)],
      absents: [],
      history: {},
      hemicyclePlaces: { a: 209 },
    });
    expect(seated).toEqual([{ ...voter('a', null), place: 209 }]);
  });

  it('should report a deputy for whom no free place is known instead of inventing one', () => {
    const { seated, unplaced } = assignSeats({
      date: '2025-03-10',
      voters: [],
      absents: [absent('a', null)],
      history: {},
    });
    expect(seated).toEqual([]);
    expect(unplaced.map((u) => u.acteurRef)).toEqual(['a']);
  });
});

describe('Feature: sièges vacants', () => {
  it('should list every place of the universe in ascending order and mark the unoccupied ones vacant', () => {
    const { places, seats } = fillSeats(
      [1, 2, 3],
      [
        { ...voter('b', 3), place: 3 },
        { ...voter('a', 1, 'C'), place: 1 },
      ]
    );
    expect(places).toEqual([1, 2, 3]);
    expect(seats.map((s) => s?.vote ?? '.')).toEqual(['C', '.', 'P']);
  });

  it('should refuse a seated deputy outside the universe', () => {
    expect(() => fillSeats([1, 2], [{ ...voter('a', 9), place: 9 }])).toThrow(/9/);
  });
});
