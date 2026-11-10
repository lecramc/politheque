/**
 * Géométrie schématique de l'hémicycle : rangées concentriques, sièges triés par angle puis
 * attribués aux numéros de place dans l'ordre croissant. La place 1 est à droite de l'image.
 * Ce n'est pas le plan exact de l'hémicycle (l'Assemblée ne le publie pas sous forme de
 * coordonnées) : fonction pure de l'ensemble des places observées, donc stable d'un scrutin à l'autre.
 */
export type HemicycleSeat = {
  place: number;
  x: number;
  y: number;
  /** Rangée, de 0 (intérieure) à n-1 (extérieure). */
  rangee: number;
  /** Angle en radians : 0 à droite de l'image, π à gauche. */
  angle: number;
};

export type HemicycleLayout = {
  seats: HemicycleSeat[];
  seatRadius: number;
  width: number;
  height: number;
};

const INNER_RADIUS = 0.4;
const MAX_SEAT_RADIUS = 0.08;
const round = (value: number) => Math.round(value * 10_000) / 10_000;

/** Répartit `total` sièges entre les rangées proportionnellement à leur rayon (plus grands restes). */
const seatsPerRow = (total: number, radii: number[]): number[] => {
  const sum = radii.reduce((a, b) => a + b, 0);
  const exact = radii.map((r) => (total * r) / sum);
  const counts = exact.map(Math.floor);
  let missing = total - counts.reduce((a, b) => a + b, 0);
  const byRemainder = exact
    .map((value, row) => ({ row, remainder: value - Math.floor(value) }))
    .sort((a, b) => b.remainder - a.remainder || b.row - a.row);
  for (const { row } of byRemainder) {
    if (missing <= 0) break;
    counts[row] += 1;
    missing -= 1;
  }
  return counts;
};

export const hemicycleLayout = (observedPlaces: number[]): HemicycleLayout => {
  const places = [...new Set(observedPlaces)].sort((a, b) => a - b);
  const total = places.length;
  if (total === 0) return { seats: [], seatRadius: 0, width: 0, height: 0 };

  const rows = Math.max(1, Math.round(Math.sqrt(total / 4)));
  const radii = Array.from({ length: rows }, (_, i) =>
    rows === 1 ? 1 : INNER_RADIUS + ((1 - INNER_RADIUS) * i) / (rows - 1)
  );
  const counts = seatsPerRow(total, radii);

  const rowGap = rows > 1 ? (1 - INNER_RADIUS) / (rows - 1) : Infinity;
  const arcGaps = radii.map((r, i) => (counts[i] > 1 ? (Math.PI * r) / (counts[i] - 1) : Infinity));
  const spacing = Math.min(rowGap, ...arcGaps);
  const seatRadius = round(Math.min(0.45 * spacing, MAX_SEAT_RADIUS));

  const slots = radii
    .flatMap((radius, rangee) =>
      Array.from({ length: counts[rangee] }, (_, k) => ({
        rangee,
        radius,
        angle: counts[rangee] === 1 ? Math.PI / 2 : (Math.PI * k) / (counts[rangee] - 1),
      }))
    )
    .sort((a, b) => a.angle - b.angle || a.rangee - b.rangee);

  const width = round(2 + 2 * seatRadius);
  const height = round(1 + 2 * seatRadius);
  const seats = slots.map((slot, i) => ({
    place: places[i],
    x: round(width / 2 + slot.radius * Math.cos(slot.angle)),
    y: round(height - seatRadius - slot.radius * Math.sin(slot.angle)),
    rangee: slot.rangee,
    angle: round(slot.angle),
  }));
  return { seats, seatRadius, width, height };
};
