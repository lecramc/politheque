import { emptyThemes } from '@/src/programmes/models/party.factory';
import {
  NOT_PUBLISHED,
  NOTHING_ON_THEME,
  programmeNotice,
  themeProgramme,
} from '@/src/programmes/models/programme-publication.service';
import type { Candidacy, Measure, Source, ThemeId } from '@/src/programmes/models/programme.model';

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

describe('Feature: carte d’état de l’onglet Programme, même gabarit pour les trois cas', () => {
  const publication = { text: 'Publié en partie.', date: null, sources: [source] };
  const scope = { partyId: 'dupont', themeIds: ['economie', 'travail'] as ThemeId[] };

  it('should give a title and the publication text for a programme that is not published', () => {
    expect(
      programmeNotice(candidacy('non-publie', { programmePublication: publication }), scope)
    ).toEqual({
      state: 'non-publie',
      title: NOT_PUBLISHED,
      text: 'Publié en partie.',
      detail: null,
      sources: [source],
      positionsLink: {
        label: 'En attendant, voir ses positions →',
        href: '/partis/dupont/positions',
      },
    });
  });

  it('should keep a card, without text, for a non-published programme whose publication text is missing', () => {
    expect(programmeNotice(candidacy('non-publie'), scope)).toMatchObject({
      title: NOT_PUBLISHED,
      text: null,
      sources: [],
    });
  });

  it('should say a part is published in words and count the themes of the site once', () => {
    expect(
      programmeNotice(candidacy('partiel', { programmePublication: publication }), scope)
    ).toEqual({
      state: 'partiel',
      title: 'Programme 2027 publié en partie',
      text: 'Le parti a publié une partie de son programme. Ses propositions sont recensées dans 1 thème sur 2.',
      detail: 'Publié en partie.',
      sources: [source],
      positionsLink: null,
    });
  });

  it('should still give a card for a partial programme without publication text', () => {
    expect(programmeNotice(candidacy('partiel'), scope)).toMatchObject({
      title: 'Programme 2027 publié en partie',
      detail: null,
      sources: [],
    });
  });

  it('should give a title for a published programme too, with its publication text and the count', () => {
    expect(
      programmeNotice(
        candidacy('publie', {
          programmePublication: { ...publication, text: 'Publié le 6 novembre 2026.' },
        }),
        scope
      )
    ).toMatchObject({
      state: 'publie',
      title: 'Programme 2027 publié',
      text: 'Publié le 6 novembre 2026. Ses propositions sont recensées dans 1 thème sur 2.',
      detail: null,
      positionsLink: null,
    });
  });

  it('should still say the count for a published programme without publication text', () => {
    expect(programmeNotice(candidacy('publie'), scope)?.text).toBe(
      'Ses propositions sont recensées dans 1 thème sur 2.'
    );
  });
});
