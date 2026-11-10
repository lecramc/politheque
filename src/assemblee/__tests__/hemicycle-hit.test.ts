import { hitTest, pixelToModel } from '@/src/assemblee/models/hemicycle-hit';
import { hemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import { hemicycleArcs, hemicycleBox } from '@/src/assemblee/models/hemicycle-scene';
import { detailFactory, groupeFactory } from '@/src/assemblee/models/scrutin.factory';

const places = Array.from({ length: 40 }, (_, i) => i + 1);
const layout = hemicycleLayout(places);
const box = hemicycleBox(layout);
const groupes = [
  groupeFactory({ organeRef: 'A', abrev: 'A' }),
  groupeFactory({ organeRef: 'B', abrev: 'B' }),
];
const detail = detailFactory({
  places,
  votes: 'P'.repeat(40),
  deputes: places.map((_, i) => i),
  groupes: places.map((_, i) => (i < 20 ? 0 : 1)),
});
const arcs = hemicycleArcs(layout, detail, groupes);
const scene = { box, seats: layout.seats, seatRadius: layout.seatRadius, arcs };

describe('Feature: pointeur sur l’hémicycle', () => {
  it('should convert a pixel inside the drawing to schema coordinates', () => {
    const point = pixelToModel(box, { width: 290, height: 150 }, 145, 75);
    expect(point.x).toBeCloseTo(box.minX + box.width / 2);
    expect(point.y).toBeCloseTo(box.minY + box.height / 2);
  });

  it('should find the seat under a fine pointer', () => {
    const seat = layout.seats[7];
    expect(hitTest(scene, { x: seat.x, y: seat.y }, 'fine')).toEqual({
      kind: 'seat',
      place: seat.place,
    });
  });

  it('should find the nearest seat only when the pointer is close enough', () => {
    const seat = layout.seats[7];
    expect(hitTest(scene, { x: seat.x + layout.seatRadius * 1.2, y: seat.y }, 'fine')?.kind).toBe(
      'seat'
    );
    expect(hitTest(scene, { x: box.minX, y: box.minY }, 'fine')).toBeNull();
  });

  it('should not treat seats as touch targets: a coarse pointer only picks arc segments', () => {
    const seat = layout.seats[7];
    expect(hitTest(scene, { x: seat.x, y: seat.y }, 'coarse')).toBeNull();
  });

  it('should pick the group of an arc segment, for a fine or a coarse pointer', () => {
    const arc = arcs[0];
    const mid = (arc.start + arc.end) / 2;
    const r = box.arcRadius;
    const point = { x: box.cx + r * Math.cos(mid), y: box.cy - r * Math.sin(mid) };
    expect(hitTest(scene, point, 'coarse')).toEqual({ kind: 'arc', groupe: arc.groupe });
    expect(hitTest(scene, point, 'fine')).toEqual({ kind: 'arc', groupe: arc.groupe });
  });

  it('should find nothing in the empty space under the arc', () => {
    expect(hitTest(scene, { x: box.cx, y: box.cy }, 'coarse')).toBeNull();
  });
});
