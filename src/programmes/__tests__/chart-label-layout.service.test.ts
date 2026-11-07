import { layoutChartLabels } from '@/src/programmes/models/chart-label-layout.service';

const point = (key: string, x: number, y: number, label = key.toUpperCase()) => ({
  key,
  label,
  x,
  y,
});

describe('Feature: étiquettes de la carte des résultats', () => {
  it('should leave an isolated label at its point', () => {
    const offsets = layoutChartLabels([point('a', 100, 100), point('b', 300, 300)]);
    expect(offsets).toEqual({ a: 0, b: 0 });
  });
});

describe('Feature: étiquettes en collision', () => {
  it('should separate the labels of two close points', () => {
    const offsets = layoutChartLabels([point('lr', 100, 100), point('ne', 104, 102)]);
    expect(offsets.lr).not.toBe(offsets.ne);
  });

  it('should give the same result whatever the order received', () => {
    const pts = [point('lr', 100, 100), point('ne', 104, 102), point('rn', 98, 99)];
    expect(layoutChartLabels(pts)).toEqual(layoutChartLabels([...pts].reverse()));
  });

  it('should leave no two labels overlapping', () => {
    const offsets = layoutChartLabels([
      point('a', 100, 100),
      point('b', 100, 100),
      point('c', 100, 100),
    ]);
    expect(new Set(Object.values(offsets)).size).toBe(3);
  });

  it('should not favour a party: the first alphabetical label moves least', () => {
    const offsets = layoutChartLabels([point('z', 100, 100, 'AAA'), point('a', 100, 100, 'ZZZ')]);
    expect(Math.abs(offsets.z)).toBeLessThan(Math.abs(offsets.a));
  });
});
