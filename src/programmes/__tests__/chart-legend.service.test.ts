import { chartLegend } from '@/src/programmes/models/chart-legend.service';

const party = (id: string, name: string) => ({ id, name, shortName: id.toUpperCase() });

describe('Feature: légende de la carte des résultats', () => {
  it('should sort the parties alphabetically by name', () => {
    const legend = chartLegend([
      party('rn', 'Rassemblement National'),
      party('ps', 'Parti socialiste'),
      party('lfi', 'La France insoumise'),
    ]);
    expect(legend.map((p) => p.id)).toEqual(['lfi', 'ps', 'rn']);
  });

  it('should ignore accents and case when sorting', () => {
    const legend = chartLegend([party('b', 'Zèbre'), party('a', 'écologie'), party('c', 'Zoo')]);
    expect(legend.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('should not depend on the order received, so no ranking can leak through it', () => {
    const parties = [party('a', 'Alpha'), party('b', 'Bravo'), party('c', 'Charlie')];
    const reversed = [...parties].reverse();
    expect(chartLegend(reversed).map((p) => p.id)).toEqual(chartLegend(parties).map((p) => p.id));
  });

  it('should not mutate the input', () => {
    const parties = [party('b', 'Bravo'), party('a', 'Alpha')];
    chartLegend(parties);
    expect(parties.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('should keep every party, with the same treatment for all', () => {
    const parties = [party('a', 'Alpha'), party('b', 'Bravo')];
    expect(chartLegend(parties)).toHaveLength(2);
  });
});
