import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { methodologyViewModel } from '@/src/programmes/view-models/methodology.view-model';

const question = (id: string) => ({
  id,
  theme: 'economie' as const,
  statement: '',
  shortLabel: '',
  help: '',
  axis: null,
  direction: 1 as const,
});

describe('Feature: vue de la méthodologie', () => {
  it('should derive the questionnaire size in the margin sentence from the catalog', () => {
    const questions = ['a', 'b', 'c'].map(question);
    const vm = methodologyViewModel()(
      stateBuilder().withCatalog(catalogFactory({ questions })).build()
    );
    expect(vm.methodSentences[0]).toContain('moins de 3 questions');
  });
});
