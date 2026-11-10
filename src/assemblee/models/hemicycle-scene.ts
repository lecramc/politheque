import type { HemicycleLayout } from '@/src/assemblee/models/hemicycle-layout';
import type { Groupe, ScrutinDetail } from '@/src/assemblee/models/scrutin.model';

/**
 * Cadre du schéma. Largeur et hauteur sont fixes (en unités du schéma, où la rangée extérieure a
 * pour rayon 1) : le rapport ne dépend ni du nombre de sièges ni du scrutin, si bien que
 * l'emplacement pré-rendu (« Chargement du détail par député ») a exactement les dimensions du
 * schéma qui le remplace, sans saut de mise en page.
 */
const BOX_WIDTH = 3.7;
const BOX_HEIGHT = 1.62;
const BOX_TOP = 1.5;
export const HEMICYCLE_RATIO = BOX_WIDTH / BOX_HEIGHT;

const ARC_GAP = 0.05;
const LABEL_GAP = 0.11;
const LABEL_GAP_SIDE = 0.06;
const LABEL_STAGGER = 0.12;
/** Intervalle (radians) laissé de chaque côté d'une frontière : fin séparateur entre deux arcs de même couleur. */
const ARC_INSET = 0.008;

export type HemicycleBox = {
  minX: number;
  minY: number;
  width: number;
  height: number;
  ratio: number;
  /** Centre des rangées (milieu de la base du demi-cercle). */
  cx: number;
  cy: number;
  /** Rayon de l'arc extérieur des groupes. */
  arcRadius: number;
};

export const hemicycleBox = (layout: HemicycleLayout): HemicycleBox => {
  const cx = layout.width / 2;
  const cy = layout.height - layout.seatRadius;
  return {
    minX: cx - BOX_WIDTH / 2,
    minY: cy - BOX_TOP,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    ratio: HEMICYCLE_RATIO,
    cx,
    cy,
    arcRadius: 1 + layout.seatRadius + ARC_GAP,
  };
};

export type ArcSegment = {
  /** Indice du groupe dans l'index. */
  groupe: number;
  /** Abréviation officielle, toujours affichée en texte à côté de la couleur. */
  abrev: string;
  libelle: string;
  /** Radians, de 0 (droite de l'image, place 1) à π (gauche). */
  start: number;
  end: number;
  path: string;
  labelX: number;
  labelY: number;
  /** Côté du texte par rapport au point : sur les flancs il s'éloigne de l'arc. */
  labelAnchor: 'start' | 'middle' | 'end';
};

/** Un groupe n'a pas de segment si ses sièges (cœur de sa répartition) sont mêlés à d'autres. */
const MIN_DENSITY = 0.3;
const TRIM = 0.1;

type Block = { groupe: number; positions: number[]; first: number; last: number; median: number };

/**
 * Frontière entre deux groupes voisins : le rang de siège après lequel le moins de sièges se
 * retrouvent du mauvais côté (sièges du premier au-delà, sièges du second en deçà). Les sièges
 * égarés d'un groupe ne tirent donc pas la frontière.
 */
const boundaryBetween = (left: Block, right: Block): number => {
  let best = left.median;
  let bestCost = Infinity;
  for (let t = left.median; t <= right.median; t += 1) {
    const cost =
      left.positions.filter((p) => p > t).length + right.positions.filter((p) => p <= t).length;
    if (cost < bestCost) {
      best = t;
      bestCost = cost;
    }
  }
  return best;
};

/**
 * Segments de l'arc extérieur : un par groupe dont les sièges forment un bloc, dans l'ordre des
 * places. Le cœur de chaque groupe (10 % de ses sièges écartés à chaque extrémité) décide s'il
 * forme un bloc ; les groupes dispersés (non inscrits, un groupe aux sièges mêlés à d'autres)
 * n'ont pas de segment, seulement des sièges. Les segments se suivent sans se chevaucher : la
 * frontière entre deux blocs voisins est celle qui range le mieux leurs sièges.
 */
export const hemicycleArcs = (
  layout: HemicycleLayout,
  detail: ScrutinDetail,
  groupes: Groupe[]
): ArcSegment[] => {
  const angleOf = new Map(layout.seats.map((seat) => [seat.place, seat.angle]));
  const rows = Math.max(1, ...layout.seats.map((seat) => seat.rangee + 1));
  const halfStep = Math.PI / Math.max(1, layout.seats.length / rows) / 2;
  const box = hemicycleBox(layout);

  const byGroup = new Map<number, number[]>();
  detail.groupes.forEach((groupe, i) => {
    if (groupe >= 0) byGroup.set(groupe, [...(byGroup.get(groupe) ?? []), i]);
  });

  const angleAt = (rank: number) => angleOf.get(detail.places[rank]) ?? 0;
  const blocks: Block[] = [];
  for (const [groupe, positions] of byGroup) {
    const trim = Math.floor(positions.length * TRIM);
    const core = positions.slice(trim, positions.length - trim);
    const first = core[0];
    const last = core[core.length - 1];
    if (core.length / (last - first + 1) < MIN_DENSITY) continue;
    blocks.push({
      groupe,
      positions,
      first,
      last,
      median: positions[Math.floor(positions.length / 2)],
    });
  }
  blocks.sort((a, b) => a.median - b.median);

  const cuts = blocks.slice(1).map((block, i) => boundaryBetween(blocks[i], block));
  const edgeAfter = (rank: number) => (angleAt(rank) + angleAt(rank + 1)) / 2;
  const arcs: ArcSegment[] = [];
  blocks.forEach((block, order) => {
    const start =
      order === 0 ? Math.max(0, angleAt(block.first) - halfStep) : edgeAfter(cuts[order - 1]);
    const end =
      order === blocks.length - 1
        ? Math.min(Math.PI, angleAt(block.last) + halfStep)
        : edgeAfter(cuts[order]);
    const mid = (start + end) / 2;
    const point = (radius: number, angle: number) => ({
      x: box.cx + radius * Math.cos(angle),
      y: box.cy - radius * Math.sin(angle),
    });
    const from = point(box.arcRadius, start + ARC_INSET);
    const to = point(box.arcRadius, end - ARC_INSET);
    // Sur les côtés le texte part vers l'extérieur (ancré par son bord), en haut il est centré :
    // dans les deux cas il ne touche ni l'arc ni les sièges.
    const labelAnchor = Math.cos(mid) > 0.35 ? 'start' : Math.cos(mid) < -0.35 ? 'end' : 'middle';
    const gap = labelAnchor === 'middle' ? LABEL_GAP : LABEL_GAP_SIDE;
    const label = point(box.arcRadius + gap + (order % 2) * LABEL_STAGGER, mid);
    const round = (n: number) => Math.round(n * 10_000) / 10_000;
    arcs.push({
      groupe: block.groupe,
      abrev: groupes[block.groupe].abrev,
      libelle: groupes[block.groupe].libelle,
      start,
      end,
      path: `M ${round(from.x)} ${round(from.y)} A ${box.arcRadius} ${box.arcRadius} 0 0 0 ${round(to.x)} ${round(to.y)}`,
      labelX: round(label.x),
      labelY: round(label.y),
      labelAnchor,
    });
  });
  return arcs;
};
