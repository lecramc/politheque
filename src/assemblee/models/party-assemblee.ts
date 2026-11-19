import { COPY } from '@/src/assemblee/models/assemblee.copy';
import { groupColor } from '@/src/assemblee/models/group-color';
import {
  majorVotesGrid,
  type MajorVoteCell,
  type MajorVoteColumn,
} from '@/src/assemblee/models/major-votes';
import type {
  AssembleeManifest,
  Composition,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

export type PartyAssembleeVote = {
  numero: number;
  href: string;
  title: string;
  fullTitle: string;
  date: string;
  resultat: string;
  position: MajorVoteCell;
};

export type PartyAssembleePanel =
  | { kind: 'none'; title: string; text: string }
  | {
      kind: 'group';
      title: string;
      /** Couleur officielle du groupe à l'Assemblée. */
      color: string;
      name: string;
      /** « 42 députés » : effectif officiel à la date d'extraction. */
      count: string;
      /** « Effectif officiel au 18 novembre 2026, selon l'Assemblée nationale. » */
      updatedLine: string;
      /** « Un groupe peut réunir des élus de plusieurs partis. » */
      note: string;
      votesTitle: string;
      votesLabel: string;
      votes: PartyAssembleeVote[];
      all: { label: string; href: string };
    };

const toVote = (column: MajorVoteColumn, position: MajorVoteCell): PartyAssembleeVote => ({
  numero: column.numero,
  href: column.href,
  title: column.title,
  fullTitle: column.fullTitle,
  date: column.date,
  resultat: column.resultat,
  position,
});

/**
 * Encart « À l'Assemblée » : le groupe officiel d'un parti (par son sigle), son effectif et sa
 * position sur les grands votes, tirés des mêmes données et de la même règle que `/assemblee`.
 * Sans groupe (ou groupe introuvable dans les données) : « Pas de groupe », jamais un chiffre écrit à la main.
 */
export const partyAssemblee = ({
  groupe,
  index,
  composition,
  manifest,
}: {
  groupe: string | null;
  index: ScrutinIndex;
  composition: Composition;
  manifest: AssembleeManifest;
}): PartyAssembleePanel => {
  const copy = COPY.partyPanel;
  const none = { kind: 'none' as const, title: copy.title, text: copy.none };
  const found =
    groupe === null ? undefined : index.groupes.find((g) => g.abrev === groupe && g.fin === null);
  if (!found) return none;
  const groupIndex = index.groupes.indexOf(found);
  const seats = new Map(composition.sieges).get(groupIndex);
  if (seats === undefined) return none;
  const grid = majorVotesGrid(index);
  const row = grid.rows.find((r) => r.index === groupIndex);
  const name = row?.name ?? found.libelle;
  return {
    kind: 'group',
    title: copy.title,
    color: groupColor(found),
    name,
    count: copy.count(seats),
    updatedLine: copy.updated(formatLongDate(manifest.extraitLe)),
    note: copy.note,
    votesTitle: copy.votesTitle,
    votesLabel: copy.votesLabel(name),
    votes: row ? grid.columns.map((column, i) => toVote(column, row.cells[i])) : [],
    all: { label: copy.all, href: '/assemblee' },
  };
};
