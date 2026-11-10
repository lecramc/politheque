import { emptyThemes } from '@/src/programmes/models/party.factory';
import {
  NOT_PUBLISHED,
  NOTHING_ON_THEME,
  programmeNotice,
  themeProgramme,
} from '@/src/programmes/models/programme-publication.service';
import type { Candidacy, Measure, Source } from '@/src/programmes/models/programme.model';

const source: Source = {
  title: 'Site de campagne',
  url: 'https://example.org/programme',
  date: '2026-11-10',
  kind: 'programme',
};
const measure: Measure = { text: 'Une mesure.', sources: [source] };

const candidacy = (
  state: Candidacy['programmeState'],
  overrides: Partial<Candidacy> = {}
): Candidacy => {
  const themes = emptyThemes();
  themes.economie = { summary: 'Résumé économie.', measures: [measure] };
  return {
    candidateName: 'Jeanne Dupont',
    status: 'declare',
    statusLabel: 'Candidate déclarée',
    candidate: 'Jeanne Dupont',
    programmeStatus: '',
    programmeState: state,
    themes,
    ...overrides,
  };
};

describe('Feature: programme 2027 publié, partiel ou pas encore publié', () => {
  it('should show the measures of a theme when the programme is published', () => {
    expect(themeProgramme(candidacy('publie'), 'economie')).toEqual({
      kind: 'mesures',
      summary: 'Résumé économie.',
      measures: [measure],
    });
  });

  it('should say nothing is published on a theme without measure, for a partial programme', () => {
    expect(themeProgramme(candidacy('partiel'), 'travail')).toEqual({
      kind: 'rien',
      notice: 'Rien de publié sur ce thème dans le programme 2027',
    });
    expect(NOTHING_ON_THEME).toBe('Rien de publié sur ce thème dans le programme 2027');
  });

  it('should never show a measure when the programme is not published, even if the data still has one', () => {
    expect(themeProgramme(candidacy('non-publie'), 'economie')).toEqual({
      kind: 'non-publie',
      notice: 'Programme 2027 pas encore publié',
    });
    expect(NOT_PUBLISHED).toBe('Programme 2027 pas encore publié');
  });

  it('should not break when the theme is missing from the data', () => {
    expect(themeProgramme(candidacy('partiel', { themes: {} as never }), 'economie')).toEqual({
      kind: 'rien',
      notice: 'Rien de publié sur ce thème dans le programme 2027',
    });
  });

  it('should give no theme programme without a candidacy', () => {
    expect(themeProgramme(undefined, 'economie')).toBeNull();
  });
});

describe('Feature: encart de publication en tête de l’onglet Programme', () => {
  const publication = { text: 'Publié en partie.', date: null, sources: [source] };

  it('should give the same notice for a party whose programme is not published', () => {
    expect(programmeNotice(candidacy('non-publie', { programmePublication: publication }))).toEqual(
      {
        state: 'non-publie',
        title: NOT_PUBLISHED,
        text: 'Publié en partie.',
        sources: [source],
      }
    );
  });

  it('should keep a notice for a non-published programme whose publication text is missing', () => {
    expect(programmeNotice(candidacy('non-publie'))).toEqual({
      state: 'non-publie',
      title: NOT_PUBLISHED,
      text: null,
      sources: [],
    });
  });

  it('should put the publication text first for a partial programme, without a title', () => {
    expect(programmeNotice(candidacy('partiel', { programmePublication: publication }))).toEqual({
      state: 'partiel',
      title: null,
      text: 'Publié en partie.',
      sources: [source],
    });
  });

  it('should show nothing for a published programme without publication text', () => {
    expect(programmeNotice(candidacy('publie'))).toBeNull();
  });
});
