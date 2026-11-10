import {
  deputyRows,
  filterDeputyRows,
  orderedPositions,
} from '@/src/assemblee/models/deputy-table';
import {
  deputeFactory,
  detailFactory,
  groupeFactory,
} from '@/src/assemblee/models/scrutin.factory';

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
      'Mise au point publiée : souhaitait voter contre. Elle ne modifie pas le résultat.'
    );
    expect(rows.find((r) => r.id === 'PA2')!.miseAuPoint).toBeNull();
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
      'Non-votant (membre du Gouvernement)'
    );
    expect(withCause('PSE').find((r) => r.vote === 'N')!.position).toBe(
      'Non-votant (présidence de séance)'
    );
    expect(withCause('PAN').find((r) => r.vote === 'N')!.position).toBe(
      "Non-votant (présidence de l'Assemblée)"
    );
  });

  it('should keep a plain « non-votant » without a known cause', () => {
    expect(withCause('XYZ').find((r) => r.vote === 'N')!.position).toBe('Non-votant');
    expect(
      deputyRows({ detail, deputes, groupes, censure: false }).find((r) => r.vote === 'N')!.position
    ).toBe('Non-votant');
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
