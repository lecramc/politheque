import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { groupColor } from '@/src/assemblee/models/group-color';
import { groupName } from '@/src/assemblee/models/group-table';
import { orderGroupes } from '@/src/assemblee/models/groupe-order';
import { sortByMostRecent } from '@/src/assemblee/models/scrutin-filters';
import { capitalizeTitle, resultLabel } from '@/src/assemblee/models/scrutin-labels';
import type {
  GroupeDecompte,
  ScrutinCategory,
  ScrutinIndex,
  ScrutinSummary,
  ScrutinType,
} from '@/src/assemblee/models/scrutin.model';
import type { SeatGlyph } from '@/src/assemblee/models/seat-view';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import { STANCE_SCALE_ENTRIES } from '@/src/programmes/models/stance-scale';

/** « Grands votes » : le texte entier, la censure, la confiance, la déclaration du Gouvernement. */
export const MAJOR_CATEGORIES: ScrutinCategory[] = ['texte', 'censure', 'confiance', 'declaration'];
export const MAJOR_VOTES_COUNT = 8;
const TITLE_MAX = 90;

export type CellKind =
  | 'pour'
  | 'contre'
  | 'abstention'
  | 'partage'
  | 'absent'
  | 'motionNon'
  | 'sansDepute';

const GLYPHS: Record<CellKind, SeatGlyph | null> = {
  pour: STANCE_SCALE_ENTRIES.pour.glyph,
  contre: STANCE_SCALE_ENTRIES.contre.glyph,
  abstention: STANCE_SCALE_ENTRIES.abstention.glyph,
  partage: STANCE_SCALE_ENTRIES.partage.glyph,
  absent: STANCE_SCALE_ENTRIES.absent.glyph,
  motionNon: STANCE_SCALE_ENTRIES.absent.glyph,
  sansDepute: null,
};

/**
 * Position majoritaire d'un groupe : celle que tient au moins la moitié des membres qui ont voté
 * (pour, contre ou abstention). Si deux positions tiennent chacune la moitié, ou si aucune n'y
 * arrive : partagé. Aucun votant : absent. Motion de censure : seuls les votes « pour » existent ;
 * ne pas voter la motion n'est pas voter contre.
 */
export const groupPosition = (decompte: GroupeDecompte, type: ScrutinType): CellKind => {
  const [, membres, pour, contre, abstentions] = decompte;
  if (type === 'MOC') {
    if (pour === 0) return 'motionNon';
    return pour * 2 >= membres ? 'pour' : 'partage';
  }
  const votants = pour + contre + abstentions;
  if (votants === 0) return 'absent';
  const held = (
    [
      ['pour', pour],
      ['contre', contre],
      ['abstention', abstentions],
    ] as const
  ).filter(([, count]) => count * 2 >= votants);
  return held.length === 1 ? held[0][0] : 'partage';
};

/** Titre officiel, première lettre en capitale, point final retiré, coupé à un mot près : jamais réécrit. */
export const shortTitle = (title: string, max: number = TITLE_MAX): string => {
  const plain = capitalizeTitle(title.trim().replace(/\.$/, ''));
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max + 1);
  const atWord = cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).trimEnd();
  return `${atWord}…`;
};

export type MajorVoteColumn = {
  numero: number;
  href: string;
  title: string;
  /** Titre officiel complet (étiquette d'accessibilité). */
  fullTitle: string;
  dateIso: string;
  date: string;
  /** « Adopté » / « Rejeté ». */
  resultat: string;
  adopte: boolean;
};

export type MajorVoteCell = {
  kind: CellKind;
  label: string;
  glyph: SeatGlyph | null;
};

/** Légende de la grille : la forme de l'échelle commune et le mot, pour chaque position possible. */
export const MAJOR_VOTES_LEGEND: {
  kind: CellKind;
  label: string;
  glyph: SeatGlyph | null;
}[] = (['pour', 'contre', 'abstention', 'partage', 'absent'] as const).map((kind) => ({
  kind,
  label: COPY.overview.grid.position[kind],
  glyph: GLYPHS[kind],
}));

export type MajorVoteRow = {
  index: number;
  abrev: string;
  /** Couleur officielle du groupe à l'Assemblée. */
  color: string;
  libelle: string;
  name: string;
  cells: MajorVoteCell[];
};

export type MajorVotesGrid = { columns: MajorVoteColumn[]; rows: MajorVoteRow[] };

const toColumn = (s: ScrutinSummary): MajorVoteColumn => ({
  numero: s.numero,
  href: `/assemblee/scrutins/${s.numero}`,
  title: shortTitle(s.titre),
  fullTitle: capitalizeTitle(s.titre),
  dateIso: s.date,
  date: formatLongDate(s.date),
  resultat: resultLabel(s),
  adopte: s.adopte,
});

/**
 * Des votes en colonnes (du plus récent au plus ancien), les groupes en lignes (de la gauche à la
 * droite, comme l'hémicycle), la position majoritaire de chaque groupe dans chaque case. Même
 * règle pour tous les groupes ; aucun score ni classement.
 */
export const votesGrid = (index: ScrutinIndex, scrutins: ScrutinSummary[]): MajorVotesGrid => {
  const votes = sortByMostRecent(scrutins);
  const labels = COPY.overview.grid.position;
  const present = new Set(votes.flatMap((v) => v.groupes.map((row) => row[0])));
  const rows = orderGroupes(index.groupes, 'places')
    .filter((groupe) => present.has(groupe.index))
    .map(
      (groupe): MajorVoteRow => ({
        index: groupe.index,
        abrev: groupe.abrev,
        color: groupColor(groupe),
        libelle: groupe.libelle,
        name: groupName(groupe),
        cells: votes.map((vote): MajorVoteCell => {
          const decompte = vote.groupes.find((row) => row[0] === groupe.index);
          const kind = decompte ? groupPosition(decompte, vote.type) : 'sansDepute';
          return { kind, label: labels[kind], glyph: GLYPHS[kind] };
        }),
      })
    );
  return { columns: votes.map(toColumn), rows };
};

/** Les derniers grands votes : la grille de `votesGrid` sur les votes de `MAJOR_CATEGORIES`. */
export const majorVotesGrid = (index: ScrutinIndex, limit = MAJOR_VOTES_COUNT): MajorVotesGrid =>
  votesGrid(
    index,
    sortByMostRecent(index.scrutins.filter((s) => MAJOR_CATEGORIES.includes(s.categorie))).slice(
      0,
      limit
    )
  );

/** Grille prête à afficher par `MajorVotesGrid` : colonnes, lignes, légende et libellés d'accessibilité. */
export const votesGridView = (grid: MajorVotesGrid, caption: string) => ({
  ...grid,
  caption,
  groupHeader: COPY.overview.grid.group,
  legend: MAJOR_VOTES_LEGEND,
  open: COPY.overview.grid.open,
  cellLabel: COPY.overview.grid.cell,
});
export type VotesGridView = ReturnType<typeof votesGridView>;
