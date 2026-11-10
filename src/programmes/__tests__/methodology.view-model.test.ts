import { PERIMETER_RULES } from '@/src/assemblee/models/extraction/perimeter';
import { manifestFactory } from '@/src/assemblee/models/scrutin.factory';
import { assembleeStateBuilder } from '@/src/assemblee/store/state-builder';
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

describe('Feature: section « Votes de l’Assemblée » de la méthodologie', () => {
  const section = () =>
    methodologyViewModel()(
      assembleeStateBuilder(stateBuilder().withCatalog(catalogFactory()).build())
        .withManifest(manifestFactory({ extraitLe: '2026-11-10', licence: 'Licence Ouverte' }))
        .build()
    ).assemblee;

  it('should write the closed list of selection rules exactly as the extraction applies it', () => {
    expect(section().rules).toEqual(PERIMETER_RULES);
    expect(section().criteriaExcluded).toContain('amendements');
    expect(section().criteriaExcluded).toContain('articles isolés');
  });

  it('should explain article 49, alinéa 3, and the cause of a non-vote among the limits', () => {
    const limits = section().limits.join(' ');
    expect(limits).toContain('Article 49, alinéa 3');
    expect(limits).toContain('considéré comme adopté');
    expect(section().article493Source).toEqual({
      label: 'Constitution du 4 octobre 1958, article 49 (texte en vigueur)',
      href: expect.stringContaining('conseil-constitutionnel.fr'),
    });
    expect(limits).toContain('Non-votants');
  });

  it('should name the source, the licence and the extraction date', () => {
    expect(section().extraction).toBe(
      'Source : Assemblée nationale, open data, Licence Ouverte. Données extraites le 10 novembre 2026.'
    );
    expect(section().source).toContain('Licence Ouverte / Open Licence (Etalab)');
  });

  it('should list the limits: show of hands, non-geometric diagram, censure, proxies, voting corrections', () => {
    const limits = section().limits.join(' ').toLowerCase();
    for (const word of [
      'main levée',
      'plan exact',
      'motions de censure',
      'délégation',
      'mises au point',
    ]) {
      expect(limits).toContain(word);
    }
  });

  it('should state that no rate, ranking or score is shown', () => {
    expect(section().neutrality).toContain('Aucun taux de présence');
  });

  it('should not claim an extraction date before the manifest is in the store', () => {
    expect(
      methodologyViewModel()(stateBuilder().withCatalog(catalogFactory()).build()).assemblee
        .extraction
    ).toBeNull();
  });
});
