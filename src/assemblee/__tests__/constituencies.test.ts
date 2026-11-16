import {
  circonscriptionsOf,
  departementChoices,
  departements,
  findDepartements,
} from '@/src/assemblee/models/constituencies';
import { deputeFactory } from '@/src/assemblee/models/scrutin.factory';

const d = (departement: string, numDepartement: string, circonscription = 1, id = 'x') =>
  deputeFactory({ id, departement, numDepartement, circonscription });

describe('Feature: départements', () => {
  it('should list each département once, in alphabetical order ignoring accents', () => {
    const list = departements([
      d('Nord', '59', 1, 'a'),
      d('Nord', '59', 2, 'b'),
      d('Hérault', '34'),
      d('Haute-Corse', '2B'),
      d('Ain', '01'),
    ]);
    expect(list.map((x) => x.nom)).toEqual(['Ain', 'Haute-Corse', 'Hérault', 'Nord']);
  });
});

describe('Feature: trouver un département', () => {
  const list = departements([
    d('Ain', '01'),
    d('Corse-du-Sud', '2A'),
    d('Haute-Corse', '2B'),
    d('Nord', '59'),
    d('Réunion', '974'),
    d('Guadeloupe', '971'),
    d('Français établis hors de France', '099'),
    d('Seine-Saint-Denis', '93'),
  ]);
  const codes = (query: string) => findDepartements(list, query).map((x) => x.code);

  it('should match a name ignoring case, accents and hyphens, and keep partial matches', () => {
    expect(codes('REUNION')).toEqual(['974']);
    expect(codes('seine saint')).toEqual(['93']);
    expect(codes('corse')).toEqual(['2A', '2B']);
  });

  it('should match a number, with or without the leading zero, including 2A and 2B', () => {
    expect(codes('1')).toEqual(['01']);
    expect(codes('01')).toEqual(['01']);
    expect(codes('59')).toEqual(['59']);
    expect(codes('2a')).toEqual(['2A']);
    expect(codes(' 971 ')).toEqual(['971']);
  });

  it('should find the Français de l’étranger by name or by the code 099 or 999', () => {
    expect(codes('étranger')).toEqual(['099']);
    expect(codes('hors de france')).toEqual(['099']);
    expect(codes('999')).toEqual(['099']);
    expect(codes('099')).toEqual(['099']);
  });

  it('should find nothing for an empty or unknown entry', () => {
    expect(codes('')).toEqual([]);
    expect(codes('zzz')).toEqual([]);
  });
});

describe('Feature: circonscriptions d’un département', () => {
  const rows = circonscriptionsOf(
    [
      deputeFactory({
        id: 'a',
        prenom: 'Anne',
        nom: 'Martin',
        numDepartement: '59',
        circonscription: 10,
      }),
      deputeFactory({
        id: 'b',
        prenom: 'Paul',
        nom: 'Roux',
        numDepartement: '59',
        circonscription: 2,
      }),
      deputeFactory({
        id: 'c',
        prenom: 'Léa',
        nom: 'Ancien',
        numDepartement: '59',
        circonscription: 2,
        enExercice: false,
      }),
      deputeFactory({
        id: 'e',
        prenom: 'Jean',
        nom: 'Vide',
        numDepartement: '59',
        circonscription: 1,
        enExercice: false,
      }),
      deputeFactory({
        id: 'd',
        prenom: 'Zoé',
        nom: 'Ailleurs',
        numDepartement: '62',
        circonscription: 1,
      }),
    ],
    '59'
  );

  it('should list the circonscriptions of the département in numerical order with their député en exercice', () => {
    expect(rows.map((r) => [r.label, r.deputeId, r.nom])).toEqual([
      ['1re circonscription', null, null],
      ['2e circonscription', 'b', 'Paul Roux'],
      ['10e circonscription', 'a', 'Anne Martin'],
    ]);
  });

  it('should say when no député is in office in a circonscription', () => {
    expect(rows[0].vacant).toBe(true);
    expect(rows[1].vacant).toBe(false);
  });
});

describe('Feature: choisir son département', () => {
  const list = departements([d('Ain', '01'), d('Nord', '59'), d('Rhône', '69')]);

  it('should keep the list hidden until something is typed or the citizen asks for it', () => {
    expect(departementChoices(list, '', false)).toMatchObject({
      visible: false,
      items: [],
      showAllLabel: 'Afficher les 3 départements',
    });
  });

  it('should list the matches of what is typed, with the code next to the name', () => {
    const found = departementChoices(list, 'nor', false);
    expect(found.visible).toBe(true);
    expect(found.items).toEqual([{ code: '59', label: 'Nord (59)' }]);
  });

  it('should list every département on request, and say when nothing matches', () => {
    expect(departementChoices(list, '', true).items.map((i) => i.code)).toEqual(['01', '59', '69']);
    expect(departementChoices(list, 'zzz', false)).toMatchObject({ visible: true, items: [] });
  });
});
