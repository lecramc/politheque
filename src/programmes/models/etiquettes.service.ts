import { formatLongDate } from '@/src/programmes/models/presentation.service';
import type {
  EtiquettesFile,
  PartyEtiquettes,
  PressLabel,
  Source,
} from '@/src/programmes/models/programme.model';

/** Affiché à la place d'une étiquette quand aucune source ne classe le parti. */
export const NO_CLASSIFICATION = 'pas de classement du parti';

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

/** Contenu de la feuille « Étiquettes » : mêmes blocs, dans le même ordre, pour tous les partis. */
export function etiquetteDetail(entry: PartyEtiquettes, circular: EtiquettesFile['circular']) {
  const [ministryLine, pressLine] = labelLines(entry);
  const ministrySources = entry.ministry?.sources ?? [];
  return {
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
