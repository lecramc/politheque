import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { correctionsViewModel } from '@/src/programmes/view-models/corrections.view-model';

const entry = (over: Partial<CorrectionEntry>): CorrectionEntry => ({
  id: 'x',
  date: '2026-11-03',
  kind: 'correction',
  pages: ['/partis/alpha'],
  summary: 'Date de fondation corrigée : 5 octobre 1972 (et non 1973).',
  ...over,
});

const vm = (corrections: CorrectionEntry[]) =>
  correctionsViewModel()(stateBuilder().withCatalog(catalogFactory({ corrections })).build());

describe('Feature: vue du journal des corrections', () => {
  it('should expose an empty state and the page meta when there is no correction', () => {
    expect(vm([])).toMatchObject({
      status: 'loaded',
      isEmpty: true,
      months: [],
      meta: { path: '/corrections' },
    });
  });

  it('should expose months, readable dates, kind labels and labelled page links', () => {
    const result = vm([
      entry({
        id: 'b',
        date: '2026-12-02',
        kind: 'mise-a-jour',
        pages: ['/partis/alpha/positions'],
      }),
      entry({ id: 'a', date: '2026-11-03', pages: ['/partis/alpha', '/partis/zeta'] }),
    ]);
    expect(result.isEmpty).toBe(false);
    expect(result.months.map((m) => m.label)).toEqual(['Décembre 2026', 'Novembre 2026']);
    expect(result.months[0].entries[0]).toMatchObject({
      id: 'b',
      dateLabel: '2 décembre 2026',
      kindLabel: 'Mise à jour',
      pages: [{ path: '/partis/alpha/positions', label: 'Positions' }],
    });
    expect(result.months[1].entries[0].pages).toEqual([
      { path: '/partis/alpha', label: 'Alpha' },
      { path: '/partis/zeta', label: 'Zeta' },
    ]);
  });
});
