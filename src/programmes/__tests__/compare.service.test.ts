import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { compareParties, parseCompareParams } from '@/src/programmes/models/compare.service';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Candidacy, Question } from '@/src/programmes/models/programme.model';

const candidacy = (economie: string): Candidacy => ({
  candidateName: 'X',
  status: 'declare',
  statusLabel: 'Déclaré',
  candidate: '',
  programmeStatus: '',
  programmeState: 'publie',
  themes: { ...emptyThemes(), economie: { summary: economie, measures: [] } },
});

const question = (id: string, theme: Question['theme']): Question => ({
  id,
  theme,
  statement: `Affirmation ${id}`,
  shortLabel: id,
  help: '',
  axis: null,
  direction: 1,
});

const catalog = catalogFactory({
  parties: [
    partyFactory({
      id: 'zeta',
      name: 'Zeta',
      stanceValues: { q1: 2, q2: -1, q3: null },
      candidacies: { 'presidentielle-2027': candidacy('Zeta économie') },
    }),
    partyFactory({
      id: 'alpha',
      name: 'Alpha',
      stanceValues: { q1: 2, q2: 1, q3: null },
      candidacies: { 'presidentielle-2027': candidacy('Alpha économie') },
    }),
    partyFactory({ id: 'milieu', name: 'Milieu' }),
  ],
  questions: [question('q1', 'economie'), question('q2', 'travail'), question('q3', 'travail')],
});

describe('Feature: comparer deux partis', () => {
  it('should keep the parties in the order they were chosen, the first on the left', () => {
    const result = compareParties(catalog, 'zeta', 'alpha')!;
    expect(result.parties.map((p) => p.id)).toEqual(['zeta', 'alpha']);
    expect(compareParties(catalog, 'alpha', 'zeta')!.parties.map((p) => p.id)).toEqual([
      'alpha',
      'zeta',
    ]);
  });

  it('should refuse an unknown party or the same party twice', () => {
    expect(compareParties(catalog, 'zeta', 'inconnu')).toBeNull();
    expect(compareParties(catalog, 'zeta', 'zeta')).toBeNull();
  });

  it('should list the themes in the fixed order of the catalog, whatever the pair', () => {
    const order = (a: string, b: string) =>
      compareParties(catalog, a, b)!.themes.map((t) => t.theme.id);
    expect(order('zeta', 'alpha')).toEqual(['economie', 'travail']);
    expect(order('alpha', 'milieu')).toEqual(order('zeta', 'alpha'));
  });

  it('should give each theme the programme of each party, in the chosen order', () => {
    const economie = compareParties(catalog, 'zeta', 'alpha')!.themes[0];
    expect(economie.programmes.map((p) => p?.summary)).toEqual(['Zeta économie', 'Alpha économie']);
  });

  it('should give no programme for a party without a candidacy', () => {
    const economie = compareParties(catalog, 'zeta', 'milieu')!.themes[0];
    expect(economie.programmes[1]).toBeNull();
  });

  it('should give each theme every question in questionnaire order, with both stances', () => {
    const travail = compareParties(catalog, 'zeta', 'alpha')!.themes[1];
    expect(travail.questions.map((q) => q.question.id)).toEqual(['q2', 'q3']);
    expect(travail.questions[0].stances.map((s) => s?.stance)).toEqual([-1, 1]);
  });

  it('should flag a shared position only when both are known and equal', () => {
    const result = compareParties(catalog, 'zeta', 'alpha')!;
    expect(result.themes[0].questions[0].same).toBe(true);
    expect(result.themes[1].questions[0].same).toBe(false);
    expect(result.themes[1].questions[1].same).toBe(false);
  });

  it('should not carry any score, count or ranking', () => {
    const json = JSON.stringify(compareParties(catalog, 'zeta', 'alpha'));
    expect(json).not.toMatch(/score|rank|agreement|accord/i);
  });
});

describe('Feature: choix des partis dans le lien', () => {
  it('should read two distinct known parties from the query', () => {
    expect(parseCompareParams({ a: 'rn', b: 'lfi' }, ['rn', 'lfi', 'ps'])).toEqual(['rn', 'lfi']);
  });

  it('should open with no pair when the query is missing or invalid', () => {
    expect(parseCompareParams({}, ['rn', 'lfi'])).toEqual([null, null]);
    expect(parseCompareParams({ a: 'rn', b: 'rn' }, ['rn', 'lfi'])).toEqual(['rn', null]);
    expect(parseCompareParams({ a: 'x', b: 'lfi' }, ['rn', 'lfi'])).toEqual([null, 'lfi']);
  });
});
