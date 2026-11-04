import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { rubricMeta } from '@/src/programmes/models/seo/page-meta';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { electionViewModel } from '@/src/programmes/view-models/elections.view-model';
import { guideSectionViewModel } from '@/src/programmes/view-models/guide.view-model';
import { pageMetaViewModel } from '@/src/programmes/view-models/page-meta.view-model';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

const state = stateBuilder().withCatalog(catalogFactory()).build();
const deps = { dispatch: vi.fn() };

describe('Feature: métadonnées exposées par les view-models', () => {
  it('should expose the debate meta from the theme view-model', () => {
    expect(themeViewModel('economie')(deps)(state).meta?.path).toBe('/debats/economie');
  });

  it('should expose the guide section meta from the guide view-model', () => {
    expect(guideSectionViewModel('institutions')(deps)(state).meta?.path).toBe(
      '/comprendre/institutions'
    );
  });

  it('should expose the election meta from the election view-model', () => {
    expect(electionViewModel('presidentielle-2027')(deps)(state).meta?.path).toBe(
      '/elections/presidentielle-2027'
    );
  });

  it('should expose a non-indexable meta when the content is not found', () => {
    expect(themeViewModel('inconnu')(deps)(state).notFoundMeta.robots).toBe('noindex, follow');
    expect(guideSectionViewModel('inconnu')(deps)(state).notFoundMeta.robots).toBe(
      'noindex, follow'
    );
    expect(electionViewModel('inconnu')(deps)(state).notFoundMeta.robots).toBe('noindex, follow');
  });

  it('should expose a rubric meta for pages without their own view-model, null while loading', () => {
    const vm = pageMetaViewModel((catalog) => rubricMeta('partis', catalog))();
    expect(vm(state)?.path).toBe('/partis');
    expect(vm(stateBuilder().build())).toBeNull();
  });
});
