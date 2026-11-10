import { formatLongDate } from '@/src/programmes/models/presentation.service';
import type {
  EtiquettesFile,
  PartyEtiquettes,
  PressLabel,
  Source,
} from '@/src/programmes/models/programme.model';

/** Affiché à la place d'une étiquette quand aucune source ne classe le parti. */
export const NO_CLASSIFICATION = 'non classé';

export type LabelLine = { id: 'ministere' | 'presse'; title: string; value: string };

/**
 * Les deux lignes sous le nom du parti : toujours deux, dans le même ordre, même quand elles
 * disent la même chose. Un classement absent est dit comme tel, jamais omis.
 */
export function labelLines(entry: PartyEtiquettes | undefined): LabelLine[] {
  return [
    {
      id: 'ministere',
      title: "Ministère de l'Intérieur",
      value: entry?.ministry?.bloc ?? NO_CLASSIFICATION,
    },
    {
      id: 'presse',
      title: 'Presse et politistes',
      value: entry?.press?.label ?? NO_CLASSIFICATION,
    },
  ];
}

/** Lien sous les deux lignes d'étiquettes, et titre de la feuille qu'il ouvre. */
export const LABELS_LINK = "D'où vient ce classement ?";
export const LABELS_SHEET_TITLE = "D'où viennent ces classements ?";

const SHORT_TITLES: Record<LabelLine['id'], string> = {
  ministere: 'Ministère',
  presse: 'Presse et politistes',
};

/** Une ligne courte pour les listes : « Ministère : X · Presse et politistes : Y ». */
export const labelsInline = (lines: LabelLine[]): string =>
  lines.map((line) => `${SHORT_TITLES[line.id]} : ${line.value}`).join(' · ');

const hasKind = (sources: Source[], kind: Source['kind']) => sources.some((s) => s.kind === kind);

/** « la presse seule » ou « la presse, des encyclopédies et des politistes ou analystes (A, B) ». */
export function usedByText(press: PressLabel): string {
  const users = [
    'la presse',
    ...(hasKind(press.sources, 'encyclopedie') ? ['des encyclopédies'] : []),
    ...(press.scholars.length > 0
      ? [`des politistes ou analystes (${press.scholars.join(', ')})`]
      : []),
  ];
  if (users.length === 1) return 'la presse seule';
  return `${users.slice(0, -1).join(', ')} et ${users[users.length - 1]}`;
}

/** « Circulaire du 2 février 2026 (NOR INTP2602966C) ». */
export const circularLine = ({ date, nor }: EtiquettesFile['circular']) =>
  `Circulaire du ${formatLongDate(date)} (NOR ${nor})`;

const uniqueByUrl = (sources: Source[]): Source[] => [
  ...new Map(sources.map((s) => [s.url, s])).values(),
];

const BLOC_PHRASES: Record<string, string> = {
  'Extrême gauche': "à l'extrême gauche",
  Gauche: 'à gauche',
  Centre: 'au centre',
  Droite: 'à droite',
  'Extrême droite': "à l'extrême droite",
};

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * Phrase en clair, construite des seules données : même gabarit pour tous les partis. Un classement
 * absent est dit comme tel. Ce que dit le parti n'y figure pas : c'est un bloc à part de la feuille.
 */
export function plainSummary(entry: PartyEtiquettes, circular: EtiquettesFile['circular']): string {
  const bloc = entry.ministry?.bloc;
  const ministry = bloc
    ? `Le ministère de l'Intérieur classe ce parti ${BLOC_PHRASES[bloc] ?? `dans le bloc « ${bloc} »`} (circulaire de ${circular.date.slice(0, 4)}).`
    : "Le ministère de l'Intérieur ne classe pas ce parti.";
  const press = entry.press
    ? `${entry.press.scholars.length > 0 ? 'La presse et les politistes emploient' : 'La presse emploie'} « ${lowerFirst(entry.press.label)} ».`
    : "Ni la presse ni les politistes n'emploient de classement établi pour ce parti.";
  return `${ministry} ${press}`;
}

/** Contenu de la feuille « Étiquettes » : mêmes blocs, dans le même ordre, pour tous les partis. */
export function etiquetteDetail(entry: PartyEtiquettes, circular: EtiquettesFile['circular']) {
  const [ministryLine, pressLine] = labelLines(entry);
  const ministrySources = entry.ministry?.sources ?? [];
  return {
    summary: plainSummary(entry, circular),
    ministry: {
      ...ministryLine,
      nuance: entry.ministry?.nuance ?? null,
      note: entry.ministry?.note ?? null,
      circular: circularLine(circular),
      /** Décisions du Conseil d'État qui touchent ce classement (sources de type `justice`). */
      councilOfState: ministrySources
        .filter((s) => s.kind === 'justice')
        .map((s) => ({ ...s, label: `${s.title} (${formatLongDate(s.date)})` })),
      nullReason: entry.ministryNullReason,
    },
    press: {
      ...pressLine,
      note: entry.press?.note ?? null,
      usedBy: entry.press ? usedByText(entry.press) : null,
      nullReason: entry.pressNullReason,
    },
    party: entry.party ?? null,
    sources: uniqueByUrl([
      ...ministrySources,
      ...(entry.press?.sources ?? []),
      ...(entry.party?.sources ?? []),
    ]),
  };
}

export type EtiquetteDetail = ReturnType<typeof etiquetteDetail>;
