import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import {
  deputeFactory,
  detailFactory,
  groupeFactory,
} from '@/src/assemblee/models/scrutin.factory';
import { describeVotes, seatViews, type SeatViewInput } from '@/src/assemblee/models/seat-view';

const deputes = [
  deputeFactory({ id: 'PA1', civ: 'M.', prenom: 'Jean', nom: 'Durand' }),
  deputeFactory({ id: 'PA2', civ: 'Mme', prenom: 'Anne', nom: 'Martin' }),
  deputeFactory({ id: 'PA3', civ: 'Mme', prenom: 'Léa', nom: 'Petit' }),
  deputeFactory({ id: 'PA4', civ: 'M.', prenom: 'Paul', nom: 'Roux' }),
];
const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'GA' }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GB' }),
];

// places 1..5 : P (dép. 0, délégation), C (dép. 1), A (dép. 2), '-' (dép. 0 bis impossible → vacant), '.'
const input = (overrides: Partial<SeatViewInput['detail']> = {}): SeatViewInput => ({
  layout: hemicycleLayout([1, 2, 3, 4, 5]),
  detail: detailFactory({
    numero: 1,
    places: [1, 2, 3, 4, 5],
    votes: 'PCAN.',
    deputes: [0, 1, 2, 3, -1],
    groupes: [0, 0, 1, 1, -1],
    delegations: [0],
    ...overrides,
  }),
  deputes,
  groupes,
  censure: false,
});

describe('Feature: sièges affichables', () => {
  it('should give every seat of the layout its position, vote, deputy and group of the day', () => {
    const { seats } = seatViews(input());
    const seat = seats.find((s) => s.place === 1)!;
    expect(seat).toMatchObject({
      place: 1,
      vote: 'P',
      depute: { id: 'PA1', nom: 'Jean Durand' },
      groupe: 'GA',
      groupeIndex: 0,
      delegation: true,
    });
    expect(seat.x).toBeGreaterThan(0);
  });

  it('should pick a distinct shape per vote, never the colour alone, and draw « ne prend pas part au vote » like « n’a pas voté »', () => {
    const { seats } = seatViews(input());
    const glyph = (place: number) => seats.find((s) => s.place === place)!.glyph;
    expect(glyph(1)).toBe('disc');
    expect(glyph(2)).toBe('disc-slash');
    expect(glyph(3)).toBe('ring');
    expect(glyph(4)).toBe('dashed');
    expect(glyph(5)).toBe('none');
    // La fusion est visuelle : la position reste celle de la source.
    expect(seats.find((s) => s.place === 4)!.vote).toBe('N');
  });

  it('should leave a vacant seat without deputy nor group', () => {
    const { seats } = seatViews(input());
    expect(seats.find((s) => s.place === 5)).toMatchObject({
      vote: '.',
      depute: null,
      groupe: null,
      delegation: false,
    });
  });

  it('should show « pas de vote enregistré » as a dashed outline', () => {
    const { seats } = seatViews(input({ votes: 'PCA-.' }));
    expect(seats.find((s) => s.place === 4)).toMatchObject({ vote: '-', glyph: 'dashed' });
  });

  it('should list apart the deputies without a seat, with their vote', () => {
    const { unseated } = seatViews(
      input({ sansPlace: [{ depute: 2, groupe: 1, vote: 'C', delegation: false }] })
    );
    expect(unseated).toEqual([
      { depute: { id: 'PA3', nom: 'Léa Petit' }, groupe: 'GB', vote: 'C', delegation: false },
    ]);
  });

  it('should fail loudly when the detail does not match the layout places', () => {
    const bad = input();
    bad.layout = hemicycleLayout([1, 2, 3, 4, 5, 6]);
    expect(() => seatViews(bad)).toThrow(/place/i);
  });
});

describe('Feature: description accessible', () => {
  it('should summarize the counts in a single accessible label', () => {
    const detail = input({ votes: 'PPCAN', sansPlace: [] }).detail;
    expect(describeVotes(detail)).toBe(
      '2 pour, 1 contre, 1 abstention, 1 ne prend pas part au vote'
    );
  });

  it('should count the unseated deputies and the vacant seats, and use plurals', () => {
    const detail = detailFactory({
      places: [1, 2, 3, 4, 5, 6],
      votes: 'PPA--.',
      sansPlace: [{ depute: 0, groupe: 0, vote: 'A', delegation: false }],
    });
    expect(describeVotes(detail)).toBe("2 pour, 2 abstentions, 2 n'ont pas voté, 1 siège vacant");
  });

  it('should word the label of a censure motion without « contre »', () => {
    const detail = detailFactory({ places: [1, 2, 3, 4], votes: 'PP--' });
    expect(describeVotes(detail, { censure: true })).toBe("2 pour, 2 n'ont pas voté la motion");
  });
});
