import {
  deputyRows,
  deputySearch,
  filterDeputyRows,
  orderedPositions,
  positionLabel,
  shouldListDeputies,
} from '@/src/assemblee/models/deputy-table';
import {
  deputeFactory,
  detailFactory,
  groupeFactory,
} from '@/src/assemblee/models/scrutin.factory';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';

const deputes = [
  deputeFactory({ id: 'PA1', prenom: 'Jean', nom: 'Durand', alpha: 'Durand' }),
  deputeFactory({ id: 'PA2', prenom: 'Anne', nom: 'Martin', alpha: 'Martin' }),
  deputeFactory({ id: 'PA3', prenom: 'Élodie', nom: 'Abadie', alpha: 'Abadie' }),
  deputeFactory({ id: 'PA4', prenom: 'Paul', nom: 'Roux', alpha: 'Roux' }),
];
const groupes = [
  groupeFactory({ organeRef: 'PO1', abrev: 'GA', libelle: 'Groupe A' }),
  groupeFactory({ organeRef: 'PO2', abrev: 'GB', libelle: 'Groupe B' }),
];
const detail = detailFactory({
  places: [1, 2, 3, 4, 5],
  votes: 'PCAN.',
  deputes: [0, 1, 2, 3, -1],
  groupes: [0, 0, 1, 1, -1],
  delegations: [1],
  misesAuPoint: [{ depute: 0, souhait: 'C' }],
  sansPlace: [{ depute: 3, groupe: 1, vote: '-', delegation: false }],
});

describe('Feature: tableau des députés', () => {
  const rows = deputyRows({ detail, deputes, groupes, censure: false });

  it('should list every deputy in alphabetical order, leaving vacant seats out', () => {
    expect(rows.map((r) => r.nom)).toEqual([
      'Élodie Abadie',
      'Jean Durand',
      'Anne Martin',
      'Paul Roux',
      'Paul Roux',
    ]);
  });

  it('should give the group of the day and the official position in words', () => {
    const jean = rows.find((r) => r.id === 'PA1')!;
    expect(jean).toMatchObject({ groupe: 'GA', vote: 'P', position: 'Pour', delegation: false });
  });

  it('should mark a delegated vote', () => {
    expect(rows.find((r) => r.id === 'PA2')).toMatchObject({ vote: 'C', delegation: true });
  });

  it('should show a mise au point as such, without changing the official position', () => {
    const jean = rows.find((r) => r.id === 'PA1')!;
    expect(jean.vote).toBe('P');
    expect(jean.miseAuPoint).toBe(
      'Correction après le vote : souhaitait voter contre. Le résultat ne change pas.'
    );
    expect(rows.find((r) => r.id === 'PA2')!.miseAuPoint).toBeNull();
  });

  it('should word each position in plain words', () => {
    expect(['P', 'C', 'A', 'N', '-', '.'].map((v) => positionLabel(v as VoteCode, false))).toEqual([
      'Pour',
      'Contre',
      'Abstention',
      'Ne prend pas part au vote',
      "N'a pas voté",
      'Siège vacant',
    ]);
  });

  it('should write a second line per deputy: position, group, and « vote confié à un collègue » only when it applies', () => {
    expect(rows.find((r) => r.id === 'PA1')!.details).toBe('Pour · GA');
    expect(rows.find((r) => r.id === 'PA2')!.details).toBe(
      'Contre · GA · vote confié à un collègue'
    );
  });

  it('should include the deputies without an identifiable seat', () => {
    expect(rows.filter((r) => r.id === 'PA4')).toHaveLength(2);
  });

  it('should word « pas de vote » as « n’a pas voté la motion » for a censure motion', () => {
    const motion = deputyRows({ detail, deputes, groupes, censure: true });
    expect(motion.find((r) => r.id === 'PA4' && r.vote === '-')!.position).toBe(
      "N'a pas voté la motion"
    );
  });
});

describe('Feature: cause d’un non-vote', () => {
  const withCause = (cause: string) =>
    deputyRows({ detail: { ...detail, causes: [[3, cause]] }, deputes, groupes, censure: false });

  it('should say why a deputy did not take part, when the source gives the cause', () => {
    expect(withCause('MG').find((r) => r.vote === 'N')!.position).toBe(
      'Ne prend pas part au vote (membre du Gouvernement)'
    );
    expect(withCause('PSE').find((r) => r.vote === 'N')!.position).toBe(
      'Ne prend pas part au vote (présidence de séance)'
    );
    expect(withCause('PAN').find((r) => r.vote === 'N')!.position).toBe(
      "Ne prend pas part au vote (présidence de l'Assemblée)"
    );
  });

  it('should keep a plain « ne prend pas part au vote » without a known cause', () => {
    expect(withCause('XYZ').find((r) => r.vote === 'N')!.position).toBe(
      'Ne prend pas part au vote'
    );
    expect(
      deputyRows({ detail, deputes, groupes, censure: false }).find((r) => r.vote === 'N')!.position
    ).toBe('Ne prend pas part au vote');
  });
});

describe('Feature: ordre des positions', () => {
  it('should list positions in a fixed order, whatever the order of the rows', () => {
    expect(orderedPositions(['-', 'N', 'A', 'C', 'P'], false)).toEqual(['P', 'C', 'A', 'N', '-']);
  });

  it('should keep only the positions that exist, and use the censure order for a motion', () => {
    expect(orderedPositions(['A', 'P'], false)).toEqual(['P', 'A']);
    expect(orderedPositions(['N', '-', 'P'], true)).toEqual(['P', '-', 'N']);
  });
});

describe('Feature: filtres du tableau des députés', () => {
  const rows = deputyRows({ detail, deputes, groupes, censure: false });

  it('should search a name without regard to case or accents', () => {
    expect(filterDeputyRows(rows, { recherche: 'elodie' }).map((r) => r.id)).toEqual(['PA3']);
    expect(filterDeputyRows(rows, { recherche: 'DURAND' }).map((r) => r.id)).toEqual(['PA1']);
  });

  it('should filter by group and by position', () => {
    expect(filterDeputyRows(rows, { groupe: 1 }).map((r) => r.id)).toEqual(['PA3', 'PA4', 'PA4']);
    expect(filterDeputyRows(rows, { vote: 'C' }).map((r) => r.id)).toEqual(['PA2']);
  });

  it('should combine criteria and keep the alphabetical order', () => {
    expect(filterDeputyRows(rows, { groupe: 0, vote: 'P' }).map((r) => r.id)).toEqual(['PA1']);
    expect(filterDeputyRows(rows, {})).toHaveLength(5);
  });
});

describe('Feature: quand afficher la liste des députés', () => {
  const none = { recherche: '', groupe: null, vote: null };

  it('should keep the list hidden at first: a citizen searches a name rather than reads 574 lines', () => {
    expect(shouldListDeputies(none, false)).toBe(false);
  });

  it('should show it as soon as something is typed, or a filter is chosen, or the citizen asks for it', () => {
    expect(shouldListDeputies({ ...none, recherche: 'du' }, false)).toBe(true);
    expect(shouldListDeputies({ ...none, groupe: 2 }, false)).toBe(true);
    expect(shouldListDeputies({ ...none, vote: 'C' }, false)).toBe(true);
    expect(shouldListDeputies(none, true)).toBe(true);
  });

  it('should not count blank spaces as a search', () => {
    expect(shouldListDeputies({ ...none, recherche: '   ' }, false)).toBe(false);
  });
});

describe('Feature: chercher un député', () => {
  const rows = deputyRows({ detail, deputes, groupes, censure: false });
  const none = { recherche: '', groupe: null, vote: null };

  it('should offer to show all the deputies, without listing them, at first', () => {
    expect(deputySearch(rows, none, false)).toEqual({
      visible: false,
      rows: [],
      countLabel: '5 députés',
      showAllLabel: 'Afficher les 5 députés',
      filterCount: 0,
      emptyLabel: 'Aucun député ne correspond à ces critères.',
    });
  });

  it('should list the matching deputies as soon as a name is typed', () => {
    const found = deputySearch(rows, { ...none, recherche: 'durand' }, false);
    expect(found.visible).toBe(true);
    expect(found.rows.map((r) => r.id)).toEqual(['PA1']);
    expect(found.countLabel).toBe('1 député');
  });

  it('should list everybody on request, and count the group and position filters of the sheet', () => {
    expect(deputySearch(rows, none, true).rows).toHaveLength(5);
    expect(deputySearch(rows, { ...none, groupe: 1, vote: 'C' }, false).filterCount).toBe(2);
    expect(deputySearch(rows, { ...none, recherche: 'x' }, false).filterCount).toBe(0);
  });
});

describe('Feature: retrouver un député choisi par sa circonscription', () => {
  const rows = deputyRows({ detail, deputes, groupes, censure: false });
  const none = { recherche: '', groupe: null, vote: null };

  it('should show only the chosen deputy, without anything typed', () => {
    const found = deputySearch(rows, { ...none, depute: 'PA1' }, false);
    expect(found.visible).toBe(true);
    expect(found.rows.map((r) => r.id)).toEqual(['PA1']);
  });

  it('should say that a deputy who did not sit at the time of this vote has no line', () => {
    const found = deputySearch(rows, { ...none, depute: 'PA99' }, false);
    expect(found.rows).toEqual([]);
    expect(found.emptyLabel).toBe("Ce député ne siégeait pas à l'Assemblée lors de ce vote.");
  });

  it('should not claim the deputy was absent when another filter hides them', () => {
    const present = rows.find((r) => r.id === 'PA1')!;
    const other = (['C', 'P', 'N', 'A'] as const).find((v) => v !== present.vote)!;
    const found = deputySearch(rows, { ...none, depute: 'PA1', vote: other }, false);
    expect(found.rows).toEqual([]);
    expect(found.emptyLabel).toBe('Aucun député ne correspond à ces critères.');
  });
});
