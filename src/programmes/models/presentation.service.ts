import type { Lean } from '@/src/programmes/models/axis-explanation.service';
import { JOURNEY_GUIDE_IDS } from '@/src/programmes/models/journey.model';
import type { SourceKind } from '@/src/programmes/models/programme.model';

// Formes courtes calculées à partir des textes sourcés : aucune nouvelle affirmation n'est écrite.

const SENTENCE_END = /(?<=[.!?…])\s+(?=[A-ZÀ-ÖØ-Þ«])/;

export const firstSentence = (text: string) => text.split(SENTENCE_END)[0]?.trim() ?? '';

/** Le texte sans sa première phrase (pour un accordéon dont la première phrase est le titre). */
export const afterFirstSentence = (text: string) =>
  text.split(SENTENCE_END).slice(1).join(' ').trim();

export const firstSentences = (text: string, count: number) =>
  text.split(SENTENCE_END).slice(0, count).join(' ').trim();

/** Retire la précision entre parenthèses : « Extrême droite (qualification…) » → « Extrême droite ». */
export const beforeParenthesis = (text: string) => text.split(' (')[0].trim();

/** Date de source affichée : AAAA, MM/AAAA ou JJ/MM/AAAA selon la précision de l'ISO. */
export const formatSourceDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  if (!month) return year;
  return day ? `${day}/${month}/${year}` : `${month}/${year}`;
};

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/**
 * Date en toutes lettres (« 3 novembre 2026 », « mars 2022 », « 2022 ») selon la précision de l'ISO.
 * Formatage de la chaîne, jamais d'objet `Date` : même rendu à la génération et dans le navigateur.
 */
export const formatLongDate = (iso: string) => {
  const [year, month, day] = iso.split('-');
  if (!month) return year;
  const monthName = MONTHS[Number(month) - 1];
  if (!day) return `${monthName} ${year}`;
  return `${Number(day) === 1 ? '1er' : Number(day)} ${monthName} ${year}`;
};

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  programme: 'Programme',
  declaration: 'Déclaration',
  vote: 'Vote',
  'proposition-de-loi': 'Proposition de loi',
  presse: 'Presse',
  statistique: 'Source officielle',
  justice: 'Décision de justice',
};

/** « Programme, mars 2022 » : ce que dit la source la plus forte d'une idée, avec sa date. */
export const originLabel = ({ kind, date }: { kind: SourceKind; date: string }) =>
  `${SOURCE_KIND_LABEL[kind]}, ${formatLongDate(date)}`;

const WORDS_PER_MINUTE = 200;

export const readingMinutes = (texts: string[]) => {
  const words = texts.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

export type GuideGroup = 'bases' | 'institutions' | 'presidentielle';

/** Même taxonomie que le parcours citoyen : « Les bases » désigne les mêmes sections partout. */
export const GUIDE_GROUPS: { id: GuideGroup; title: string; sectionIds: string[] }[] = [
  { id: 'bases', title: 'Les bases', sectionIds: JOURNEY_GUIDE_IDS['les-bases'] },
  {
    id: 'institutions',
    title: 'Les institutions',
    sectionIds: JOURNEY_GUIDE_IDS['les-institutions'],
  },
  {
    id: 'presidentielle',
    title: 'La présidentielle 2027',
    sectionIds: JOURNEY_GUIDE_IDS['presidentielle-2027'],
  },
];

const DISPLAY_NAMES: Record<string, string> = {
  horizons: 'Horizons',
  renaissance: 'Renaissance',
  reconquete: 'Reconquête',
  'nouvelle-energie': 'Nouvelle Énergie',
  ecologistes: 'Les Écologistes',
  lfi: 'LFI',
  pcf: 'PCF',
  'ps-place-publique': 'PS – Place publique',
  lr: 'LR',
  rn: 'RN',
};

/** Nom court lisible d'un parti (les sigles à trois lettres restent réservés aux pastilles). */
export const displayName = (party: { id: string; shortName: string }) =>
  DISPLAY_NAMES[party.id] ?? party.shortName;

/** Libellé d'une étape du calendrier : titre sans parenthèse, et mention « date calculée » si présente. */
export const stepLabel = (label: string): { title: string; note: string | null } => ({
  title: beforeParenthesis(label),
  note: /date calculée, à confirmer/i.test(label) ? 'Date calculée, à confirmer' : null,
});

/** Phrase décrivant où un parti se place sur un axe (on nomme toujours le pôle, jamais gauche/droite). */
export const leanText = (
  lean: Lean,
  axis: { negativePole: string; positivePole: string }
): string => {
  if (lean.kind === 'unplaced') {
    if (lean.count === 0) return 'Non placé : aucune position connue';
    const plural = lean.count > 1 ? 's' : '';
    return `Non placé : ${lean.count} position${plural} connue${plural}, il en faut ${lean.minimum}`;
  }
  if (lean.strength === 'centre') return "Au centre de l'axe";
  const pole = lean.side === 'negative' ? axis.negativePole : axis.positivePole;
  return `${lean.strength === 'plutot' ? 'Plutôt' : 'Nettement'} vers « ${pole} »`;
};

/** Sous-titre d'une carte de parti : sur combien d'axes il est placé, d'après combien de positions. */
export const placementSummary = ({
  placedCount,
  axisCount,
  positionsCount,
}: {
  placedCount: number;
  axisCount: number;
  positionsCount: number;
}): string => {
  if (placedCount === 0) return 'Non placé : trop peu de positions connues';
  const axes = placedCount > 1 ? 'axes' : 'axe';
  const positions = positionsCount > 1 ? 'positions' : 'position';
  return `Placé sur ${placedCount} ${axes} sur ${axisCount} · ${positionsCount} ${positions}`;
};
