import {
  rawActeur,
  rawActeurs,
  rawOrgane,
} from '@/src/assemblee/__tests__/fixtures/raw-amo.fixtures';
import { GROUPE_A, GROUPE_C } from '@/src/assemblee/__tests__/fixtures/raw-scrutins.fixtures';
import { parseActeur, parseGroupe, sittingMembers } from '@/src/assemblee/models/extraction/amo';

describe('Feature: lecture des acteurs de l’open data', () => {
  it('should read identity, constituency and hemicycle place of the 17th legislature mandate', () => {
    const acteur = parseActeur(
      rawActeur({
        id: 'x',
        nom: 'Dupont',
        prenom: 'Anne',
        groupes: [{ groupe: GROUPE_A, debut: '2024-07-01' }],
        mandat: { debut: '2024-07-01', place: '063', circo: '12' },
      })
    );
    expect(acteur).toMatchObject({
      id: 'x',
      civ: 'Mme',
      prenom: 'Anne',
      nom: 'Dupont',
      alpha: 'Dupont',
      departement: 'Nord',
      circonscription: 12,
      placeHemicycle: 63,
    });
  });

  it('should ignore a person without a 17th legislature mandate', () => {
    const raw = rawActeur({
      id: 'x',
      groupes: [],
      mandat: { debut: '2024-07-01' },
    });
    raw.mandats = { mandat: [] };
    expect(parseActeur(raw)).toBeNull();
  });

  it('should keep one membership per group even when the group lists several mandates', () => {
    const raw = rawActeur({
      id: 'x',
      groupes: [
        { groupe: GROUPE_A, debut: '2024-07-19' },
        { groupe: GROUPE_A, debut: '2024-07-19' },
      ],
      mandat: { debut: '2024-07-01' },
    });
    expect(parseActeur(raw)?.groupes).toEqual([
      { groupeRef: GROUPE_A, debut: '2024-07-19', fin: null },
    ]);
  });

  it('should read a lone mandate object and a missing place', () => {
    const raw = rawActeur({
      id: 'x',
      groupes: [],
      mandat: { debut: '2024-07-01', place: null },
    });
    const mandats = raw.mandats?.mandat;
    raw.mandats = { mandat: Array.isArray(mandats) ? mandats[1] : mandats };
    expect(parseActeur(raw)).toMatchObject({ placeHemicycle: null, groupes: [] });
  });
});

describe('Feature: groupes politiques', () => {
  it('should read the official abbreviation, label, colour and dates of a group of the 17th legislature', () => {
    expect(
      parseGroupe(
        rawOrgane(GROUPE_C, 'GC', { viMoDe: { dateDebut: '2024-07-18', dateFin: '2025-12-31' } })
      )
    ).toEqual({
      organeRef: GROUPE_C,
      abrev: 'GC',
      libelle: 'Groupe GC',
      couleurOfficielle: '#336699',
      debut: '2024-07-18',
      fin: '2025-12-31',
    });
  });

  it('should ignore other organs and other legislatures', () => {
    expect(parseGroupe(rawOrgane('PO1', 'X', { codeType: 'COMPER' }))).toBeNull();
    expect(parseGroupe(rawOrgane('PO1', 'X', { legislature: '16' }))).toBeNull();
  });
});

describe('Feature: députés en fonction un jour donné', () => {
  const acteurs = rawActeurs().flatMap((a) => parseActeur(a) ?? []);

  it('should list members through their group mandate of the day', () => {
    expect(sittingMembers(acteurs, '2025-03-10').map((m) => [m.acteurRef, m.groupeRef])).toEqual([
      ['dep1', GROUPE_A],
      ['dep2', GROUPE_A],
      ['dep3', 'PO200'],
      ['dep4', 'PO200'],
      ['dep5', GROUPE_C],
      ['dep6', GROUPE_C],
    ]);
  });

  it('should follow a replacement and a change of group', () => {
    const members = sittingMembers(acteurs, '2025-04-02');
    expect(members.map((m) => m.acteurRef)).not.toContain('dep2');
    expect(members.find((m) => m.acteurRef === 'dep7')).toMatchObject({ groupeRef: GROUPE_A });
    expect(members.find((m) => m.acteurRef === 'dep6')).toMatchObject({ groupeRef: GROUPE_A });
  });

  it('should include the first and the last day of a mandate', () => {
    expect(sittingMembers(acteurs, '2025-03-20').map((m) => m.acteurRef)).toContain('dep2');
    expect(sittingMembers(acteurs, '2025-03-21').map((m) => m.acteurRef)).toContain('dep7');
    expect(sittingMembers(acteurs, '2025-03-21').map((m) => m.acteurRef)).not.toContain('dep2');
  });
});

describe('Feature: députés dont le rattachement est incertain un jour de changement', () => {
  const acteurs = rawActeurs().flatMap((a) => parseActeur(a) ?? []);
  const on = (date: string, id: string) =>
    sittingMembers(acteurs, date).find((m) => m.acteurRef === id);

  it('should flag a deputy whose Assembly mandate ends that day as possibly not counted', () => {
    expect(on('2025-03-20', 'dep2')).toMatchObject({ groupeRef: GROUPE_A, alternatives: [null] });
    expect(on('2025-03-19', 'dep2')?.alternatives).toEqual([]);
  });

  it('should offer the group joined the next day as an alternative on the last day of a group', () => {
    expect(on('2025-03-31', 'dep6')).toMatchObject({
      groupeRef: GROUPE_C,
      alternatives: [GROUPE_A],
    });
  });

  it('should ignore a deputy whose Assembly mandate does not cover the day, even with a group', () => {
    const lapsed = parseActeur(
      rawActeur({
        id: 'dep10',
        groupes: [{ groupe: GROUPE_A, debut: '2024-07-01' }],
        mandat: { debut: '2024-07-01', fin: '2025-01-10' },
      })
    );
    expect(sittingMembers([lapsed!], '2025-03-10')).toEqual([]);
  });
});
