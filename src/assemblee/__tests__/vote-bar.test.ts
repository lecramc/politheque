import { barLayout } from '@/src/assemblee/models/vote-bar';

describe('Feature: barre empilée des votes', () => {
  const segments = [
    { kind: 'pour', count: 30 },
    { kind: 'contre', count: 20 },
    { kind: 'abstention', count: 10 },
    { kind: 'aucun', count: 40 },
  ] as const;

  it('should give each position a width proportional to its count, side by side', () => {
    expect(barLayout([...segments], 100, 200).rects).toEqual([
      { kind: 'pour', x: 0, width: 60 },
      { kind: 'contre', x: 60, width: 40 },
      { kind: 'abstention', x: 100, width: 20 },
      { kind: 'aucun', x: 120, width: 80 },
    ]);
  });

  it('should fill the whole width with the counts of the segments when no total is given', () => {
    const { rects } = barLayout([...segments], undefined, 100);
    expect(rects.at(-1)!.x + rects.at(-1)!.width).toBeCloseTo(100);
  });

  it('should place a mark at the threshold, kept inside the bar', () => {
    expect(barLayout([...segments], 100, 200, 50).mark).toBe(100);
    expect(barLayout([...segments], 100, 200, 0).mark).toBe(0);
    expect(barLayout([...segments], 100, 200, 150).mark).toBe(200);
    expect(barLayout([...segments], 100, 200).mark).toBeNull();
  });

  it('should draw nothing for an empty bar', () => {
    expect(barLayout([], 0, 200, 10)).toEqual({ rects: [], mark: null });
  });
});
