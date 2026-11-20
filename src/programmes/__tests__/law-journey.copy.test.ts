import { vi } from 'vitest';

import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { LAW_JOURNEY, LAW_JOURNEY_ID } from '@/src/programmes/models/law-journey.copy';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { guideSectionViewModel } from '@/src/programmes/view-models/guide.view-model';

describe('Feature: frise du parcours d’une loi', () => {
  it('should list the eight steps, from the filing to the promulgation', () => {
    expect(LAW_JOURNEY.map((s) => s.id)).toEqual([
      'depot',
      'commission',
      'seance',
      'navette',
      'cmp',
      'lecture-definitive',
      'conseil-constitutionnel',
      'promulgation',
    ]);
  });

  it('should cite the article of the Constitution of each step', () => {
    expect(LAW_JOURNEY.map((s) => s.article)).toEqual([39, 43, 42, 45, 45, 45, 61, 10]);
  });

  it('should write each step in one sentence, and flag the conditional ones', () => {
    for (const step of LAW_JOURNEY) {
      expect(step.text.match(/[.!?](\s|$)/g)).toHaveLength(1);
    }
    expect(LAW_JOURNEY.filter((s) => s.optional).map((s) => s.id)).toEqual([
      'cmp',
      'lecture-definitive',
      'conseil-constitutionnel',
    ]);
  });
});

describe('Feature: frise sur la leçon « Comment une loi est votée »', () => {
  const vmOf = (id: string) =>
    guideSectionViewModel(id)({ dispatch: vi.fn() as never })(
      stateBuilder().withCatalog(catalogFactory()).build()
    );

  it('should show the timeline on that lesson only', () => {
    expect(vmOf(LAW_JOURNEY_ID).timeline).toBe(LAW_JOURNEY);
    expect(vmOf('institutions').timeline).toBeNull();
  });
});
