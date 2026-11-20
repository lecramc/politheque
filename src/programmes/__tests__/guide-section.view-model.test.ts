import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { guideSectionViewModel } from '@/src/programmes/view-models/guide.view-model';

const faqEntry = {
  id: 'quand-vote-t-on',
  question: 'Quand vote-t-on ?',
  answer: 'Le 18 avril 2027.',
  related: ['election-presidentielle'],
  sources: [
    {
      title: 'T',
      url: 'https://example.gouv.fr/a',
      date: '2026-11-08',
      kind: 'statistique' as const,
    },
  ],
  lastVerified: '2026-11-08',
};

const vmOf = (sectionId: string) =>
  guideSectionViewModel(sectionId)({ dispatch: vi.fn() })(
    stateBuilder()
      .withCatalog(catalogFactory({ faq: [faqEntry] }))
      .build()
  );

describe('Feature: leçon sur la présidentielle et ses questions-réponses', () => {
  it('should end the presidential lesson with the questions, anchored on #questions', () => {
    const { faq } = vmOf('election-presidentielle');
    expect(faq).toMatchObject({ anchor: 'questions', verifiedOn: '2026-11-08' });
    expect(faq?.items.map((i) => i.entry.id)).toEqual(['quand-vote-t-on']);
  });

  it('should list the sources of the questions with those of the lesson', () => {
    expect(vmOf('election-presidentielle').allSources.map((s) => s.url)).toContain(
      'https://example.gouv.fr/a'
    );
  });

  it('should carry the questions on the presidential lesson only', () => {
    expect(vmOf('institutions').faq).toBeNull();
  });

  it('should describe the lesson with the FAQ structured data, and only that lesson', () => {
    expect(JSON.stringify(vmOf('election-presidentielle').meta)).toContain('FAQPage');
    expect(JSON.stringify(vmOf('institutions').meta)).not.toContain('FAQPage');
  });
});
