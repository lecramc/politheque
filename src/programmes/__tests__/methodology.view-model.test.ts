import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { GUIDE_ANCHORS, STANCE_LEGEND_TEXT } from '@/src/programmes/models/reading-guides.copy';
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

  it('should publish every reading guide with its anchor and the catalog counts', () => {
    const questions = ['a', 'b', 'c'].map(question);
    const vm = methodologyViewModel()(
      stateBuilder().withCatalog(catalogFactory({ questions })).build()
    );
    expect(vm.readingGuides.map((g) => g.anchor).sort()).toEqual(
      Object.values(GUIDE_ANCHORS).sort()
    );
    const positions = vm.readingGuides.find((g) => g.anchor === GUIDE_ANCHORS.positions);
    expect(positions?.paragraphs[0]).toContain('sur les 3 affirmations');
    expect(positions?.paragraphs).toContain(STANCE_LEGEND_TEXT);
  });
});
