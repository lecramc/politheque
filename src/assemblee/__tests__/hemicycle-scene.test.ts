import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import {
  HEMICYCLE_RATIO,
  hemicycleArcs,
  hemicycleBox,
} from '@/src/assemblee/models/hemicycle-scene';
import { detailFactory, groupeFactory } from '@/src/assemblee/models/scrutin.factory';

const places = Array.from({ length: 40 }, (_, i) => i + 1);
const layout = hemicycleLayout(places);
const groupes = [
  groupeFactory({ organeRef: 'A', abrev: 'A', libelle: 'Groupe A' }),
  groupeFactory({ organeRef: 'B', abrev: 'B', libelle: 'Groupe B' }),
  groupeFactory({ organeRef: 'C', abrev: 'NI', libelle: 'Non inscrit' }),
  groupeFactory({ organeRef: 'D', abrev: 'D', libelle: 'Groupe D' }),
];
// A : 0-9, B : 10-19, NI dispersé : 20, 26, 32, 38, D : le reste
const groupeOf = (i: number) => (i < 10 ? 0 : i < 20 ? 1 : [20, 26, 32, 38].includes(i) ? 2 : 3);
const detail = detailFactory({
  places,
  votes: 'P'.repeat(40),
  deputes: places.map((_, i) => i),
  groupes: places.map((_, i) => groupeOf(i)),
});

describe('Feature: arc des groupes autour de l’hémicycle', () => {
  const arcs = hemicycleArcs(layout, detail, groupes);

  it('should draw one segment per cohesive group and none for a scattered group', () => {
    expect(arcs.map((a) => a.abrev)).toEqual(['A', 'B', 'D']);
  });

  it('should always carry the abbreviation and official label of the group as text', () => {
    for (const arc of arcs) {
      expect(arc.abrev).not.toBe('');
      expect(arc.libelle).toMatch(/^Groupe/);
    }
  });

  it('should order segments from the right of the image (place 1) to the left, without overlap', () => {
    for (let i = 1; i < arcs.length; i += 1) {
      expect(arcs[i].start).toBeGreaterThanOrEqual(arcs[i - 1].end);
    }
    expect(arcs[0].start).toBeLessThan(arcs[0].end);
  });

  it('should keep every segment on the half circle', () => {
    for (const arc of arcs) {
      expect(arc.start).toBeGreaterThanOrEqual(0);
      expect(arc.end).toBeLessThanOrEqual(Math.PI);
    }
  });

  it('should leave a thin gap between two neighbouring arcs, since they share one neutral colour', () => {
    const box = hemicycleBox(layout);
    const endpoints = (path: string) => {
      const [, x1, y1, , , , , , , x2, y2] = path.split(' ').map(Number);
      const angle = (x: number, y: number) => Math.atan2(box.cy - y, x - box.cx);
      return { from: angle(x1, y1), to: angle(x2, y2) };
    };
    for (let i = 1; i < arcs.length; i += 1) {
      const previous = endpoints(arcs[i - 1].path);
      const next = endpoints(arcs[i].path);
      // le tracé va de `start` (droite de l'image) à `end` (gauche) : le début de l'un suit la fin du précédent
      expect(next.from - previous.to).toBeGreaterThan(0.005);
    }
  });

  it('should give a drawable path and a label position outside the outer row', () => {
    const box = hemicycleBox(layout);
    for (const arc of arcs) {
      expect(arc.path).toMatch(/^M [\d.-]+ [\d.-]+ A /);
      const distance = Math.hypot(arc.labelX - box.cx, arc.labelY - box.cy);
      expect(distance).toBeGreaterThan(box.arcRadius);
    }
  });

  it('should keep side labels clear of the arc and inside the frame, anchored away from it', () => {
    const many = Array.from({ length: 580 }, (_, i) => i + 1);
    const big = hemicycleLayout(many);
    const box = hemicycleBox(big);
    const detail580 = detailFactory({
      places: many,
      votes: 'P'.repeat(580),
      deputes: many.map((_, i) => i),
      groupes: many.map((_, i) => (i < 290 ? 0 : 1)),
    });
    const [right, left] = hemicycleArcs(big, detail580, groupes);
    expect(right.labelAnchor).not.toBe('end');
    expect(left.labelAnchor).not.toBe('start');
    for (const arc of [right, left]) {
      expect(arc.labelX).toBeGreaterThan(box.minX);
      expect(arc.labelX).toBeLessThan(box.minX + box.width);
      expect(arc.labelY).toBeGreaterThan(box.minY);
    }
  });

  it('should return no segment when nobody is seated', () => {
    expect(
      hemicycleArcs(
        layout,
        detailFactory({
          places,
          votes: '.'.repeat(40),
          deputes: places.map(() => -1),
          groupes: places.map(() => -1),
        }),
        groupes
      )
    ).toEqual([]);
  });
});

describe('Feature: frontière entre deux groupes aux sièges mêlés', () => {
  it('should cut where the fewest seats end up on the wrong side, not at the stray seat', () => {
    // A : sièges 0 à 14 et un siège égaré à 20 ; B : 15 à 19 et 21 à 39
    const owner = (i: number) => (i <= 14 || i === 20 ? 0 : 1);
    const mixed = detailFactory({
      places,
      votes: 'P'.repeat(40),
      deputes: places.map((_, i) => i),
      groupes: places.map((_, i) => owner(i)),
    });
    const [a, b] = hemicycleArcs(layout, mixed, groupes);
    const angle = (i: number) => layout.seats[i].angle;
    const boundary = (angle(14) + angle(15)) / 2;
    expect(a.abrev).toBe('A');
    expect(a.end).toBeCloseTo(boundary, 5);
    expect(b.start).toBeCloseTo(boundary, 5);
  });

  it('should not leave slivers: a block of 17 seats among 580 keeps a readable width', () => {
    const many = Array.from({ length: 580 }, (_, i) => i + 1);
    const big = hemicycleLayout(many);
    const owner = (i: number) => (i < 120 ? 0 : i < 137 ? 1 : 2);
    const detail580 = detailFactory({
      places: many,
      votes: 'P'.repeat(580),
      deputes: many.map((_, i) => i),
      groupes: many.map((_, i) => owner(i)),
    });
    const arcs580 = hemicycleArcs(big, detail580, groupes);
    const small = arcs580.find((a) => a.abrev === 'B')!;
    // 17 sièges sur 12 rangées : environ une colonne et demie, soit 5 degrés
    expect(small.end - small.start).toBeGreaterThan(0.08);
  });
});

describe('Feature: cadre de l’hémicycle', () => {
  it('should contain every seat and the arc with its labels', () => {
    const box = hemicycleBox(layout);
    for (const seat of layout.seats) {
      expect(seat.x - layout.seatRadius).toBeGreaterThanOrEqual(box.minX);
      expect(seat.x + layout.seatRadius).toBeLessThanOrEqual(box.minX + box.width);
      expect(seat.y - layout.seatRadius).toBeGreaterThanOrEqual(box.minY);
      expect(seat.y + layout.seatRadius).toBeLessThanOrEqual(box.minY + box.height);
    }
    expect(box.minY).toBeLessThan(0);
  });

  it('should keep one aspect ratio whatever the number of seats, so the prerendered placeholder matches', () => {
    const small = hemicycleLayout([1, 2, 3, 4, 5, 6, 7, 8]);
    const large = hemicycleLayout(Array.from({ length: 580 }, (_, i) => i + 1));
    expect(hemicycleBox(small).ratio).toBe(HEMICYCLE_RATIO);
    expect(hemicycleBox(large).ratio).toBe(HEMICYCLE_RATIO);
    expect(hemicycleBox(layout).ratio).toBe(HEMICYCLE_RATIO);
    for (const seat of large.seats) {
      const box = hemicycleBox(large);
      expect(seat.x + large.seatRadius).toBeLessThanOrEqual(box.minX + box.width);
    }
  });
});
