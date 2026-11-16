import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe('Feature: hémicycle', () => {
  it('should place every observed seat number exactly once', () => {
    const places = [3, 1, 2, 10, 650];
    const { seats } = hemicycleLayout(places);
    expect(seats.map((s) => s.place).sort((a, b) => a - b)).toEqual([1, 2, 3, 10, 650]);
  });

  it('should order seats by place number from the right of the image to the left', () => {
    const { seats } = hemicycleLayout(range(200));
    const byPlace = [...seats].sort((a, b) => a.place - b.place);
    // l'angle (0 à droite, π à gauche) croît avec le numéro de place
    for (let i = 1; i < byPlace.length; i++) {
      expect(byPlace[i].angle).toBeGreaterThanOrEqual(byPlace[i - 1].angle);
    }
    expect(byPlace[0].x).toBeGreaterThan(byPlace[byPlace.length - 1].x);
  });

  it('should keep the same geometry whatever the order the places are given in', () => {
    const forward = hemicycleLayout(range(300));
    const shuffled = hemicycleLayout([...range(300)].reverse());
    expect(shuffled).toEqual(forward);
  });

  it('should depend on the observed places only, so that the drawing never moves between scrutins', () => {
    expect(hemicycleLayout(range(580))).toEqual(hemicycleLayout(range(580)));
  });

  it('should keep every seat inside the drawing, without overlap', () => {
    const layout = hemicycleLayout(range(580));
    for (const s of layout.seats) {
      expect(s.x - layout.seatRadius).toBeGreaterThanOrEqual(0);
      expect(s.x + layout.seatRadius).toBeLessThanOrEqual(layout.width);
      expect(s.y - layout.seatRadius).toBeGreaterThanOrEqual(0);
      expect(s.y + layout.seatRadius).toBeLessThanOrEqual(layout.height);
    }
    let closest = Infinity;
    for (let i = 0; i < layout.seats.length; i++) {
      for (let j = i + 1; j < layout.seats.length; j++) {
        const a = layout.seats[i];
        const b = layout.seats[j];
        closest = Math.min(closest, Math.hypot(a.x - b.x, a.y - b.y));
      }
    }
    expect(closest).toBeGreaterThanOrEqual(2 * layout.seatRadius);
  });

  it('should draw about twelve concentric rows for a full assembly, with more seats on outer rows', () => {
    const { seats } = hemicycleLayout(range(580));
    const perRow = new Map<number, number>();
    for (const s of seats) perRow.set(s.rangee, (perRow.get(s.rangee) ?? 0) + 1);
    expect(perRow.size).toBe(12);
    const counts = [...perRow.entries()].sort(([a], [b]) => a - b).map(([, n]) => n);
    for (let i = 1; i < counts.length; i++) expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(580);
  });

  it('should handle an empty or tiny set of places', () => {
    expect(hemicycleLayout([]).seats).toEqual([]);
    expect(hemicycleLayout([5]).seats).toHaveLength(1);
  });
});
