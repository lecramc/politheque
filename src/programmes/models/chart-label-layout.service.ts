/**
 * Placement des étiquettes de la carte des résultats : quand deux étiquettes se chevauchent, on
 * décale verticalement celle qui est placée après. Règle pure et déterministe, identique pour tous
 * les partis : les étiquettes sont traitées par ordre alphabétique du libellé (puis de la clé),
 * jamais dans l'ordre reçu ni selon une proximité, donc aucun parti n'est favorisé.
 */
export type LabelPoint = { key: string; label: string; x: number; y: number };

/** Décalages essayés, dans cet ordre : sur place, puis alternativement dessous et dessus. */
const STEP = 13;
const CANDIDATES = [0, 1, -1, 2, -2, 3, -3].map((n) => n * STEP);

const LABEL_HEIGHT = 13;
const CHAR_WIDTH = 6.4;
/** Début de l'étiquette à droite du centre du point (demi-point, écart). */
const LABEL_OFFSET_X = 11;
const DOT_RADIUS = 8;

type Box = { left: number; top: number; right: number; bottom: number };

const overlaps = (a: Box, b: Box) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const dotBox = (p: LabelPoint): Box => ({
  left: p.x - DOT_RADIUS,
  right: p.x + DOT_RADIUS,
  top: p.y - DOT_RADIUS,
  bottom: p.y + DOT_RADIUS,
});

const labelBox = (p: LabelPoint, dy: number): Box => ({
  left: p.x + LABEL_OFFSET_X,
  right: p.x + LABEL_OFFSET_X + p.label.length * CHAR_WIDTH,
  top: p.y - LABEL_HEIGHT / 2 + dy,
  bottom: p.y + LABEL_HEIGHT / 2 + dy,
});

/** Décalage vertical (px) de l'étiquette de chaque point, par clé. */
export function layoutChartLabels(points: LabelPoint[]): Record<string, number> {
  const ordered = [...points].sort(
    (a, b) =>
      a.label.localeCompare(b.label, 'fr', { sensitivity: 'base' }) || a.key.localeCompare(b.key)
  );
  const placed: Box[] = [];
  const offsets: Record<string, number> = {};
  for (const p of ordered) {
    const obstacles = [...placed, ...points.filter((o) => o.key !== p.key).map(dotBox)];
    const dy = CANDIDATES.find((c) => !obstacles.some((o) => overlaps(labelBox(p, c), o))) ?? 0;
    offsets[p.key] = dy;
    placed.push(labelBox(p, dy));
  }
  return offsets;
}
