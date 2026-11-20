import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import {
  calculatedDateText,
  faqSection,
  relatedLessons,
  VOTER_PAGE_ID,
} from '@/src/programmes/models/contenus-2027';

describe('Feature: affichage d’une date calculée', () => {
  it('should write the weekday and the long date', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-03-12', rule: 'r' })).toBe(
      'vendredi 12 mars 2027'
    );
  });

  it('should add the deadline time when there is one', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-03-12', rule: 'r', time: '18:00' })).toBe(
      'vendredi 12 mars 2027, 18 h'
    );
  });

  it('should write the first of the month as « 1er »', () => {
    expect(calculatedDateText({ label: 'x', date: '2027-05-01', rule: 'r' })).toBe(
      'samedi 1er mai 2027'
    );
  });
});

describe('Feature: pages citées par un contenu', () => {
  const guide = catalogFactory().guide;

  it('should resolve the voting page by its identifier, with its own title', () => {
    expect(relatedLessons(guide, [VOTER_PAGE_ID], { title: 'Comment voter' })).toEqual([
      { id: 'voter-2027', title: 'Comment voter', href: '/elections/presidentielle-2027/voter' },
    ]);
  });

  it('should ignore the voting page when the voter guide is not given', () => {
    expect(relatedLessons(guide, [VOTER_PAGE_ID])).toEqual([]);
  });
});

describe('Feature: questions-réponses réunies avec la leçon sur la présidentielle', () => {
  const faq = (id: string, related: string[], lastVerified = '2026-11-08') => ({
    id,
    question: `Question ${id} ?`,
    answer: 'Réponse.',
    related,
    sources: [
      {
        title: 'T',
        url: `https://example.gouv.fr/${id}`,
        date: '2026-11-08',
        kind: 'statistique' as const,
      },
    ],
    lastVerified,
    calculated: [{ label: 'Date', date: '2027-03-12', rule: 'Règle.' }],
  });
  const catalog = catalogFactory({
    faq: [
      faq('a', ['election-presidentielle', 'institutions']),
      faq('b', [VOTER_PAGE_ID], '2026-11-10'),
    ],
  });

  it('should not link a question to the page it is already on, but to the other lessons', () => {
    const { items } = faqSection(catalog);
    expect(items[0].lessons.map((l) => l.id)).toEqual(['institutions']);
  });

  it('should link a question to the voting page and expose its calculated dates', () => {
    const { items } = faqSection(catalog);
    expect(items[1].lessons.map((l) => l.href)).toEqual(['/elections/presidentielle-2027/voter']);
    expect(items[1].calculated[0].text).toBe('vendredi 12 mars 2027');
  });

  it('should expose the latest check and every source of the questions', () => {
    const section = faqSection(catalog);
    expect(section.verifiedOn).toBe('2026-11-10');
    expect(section.sources).toHaveLength(2);
  });
});
