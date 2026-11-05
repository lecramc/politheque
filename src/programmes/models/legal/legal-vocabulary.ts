import type { LegalStatus } from '@/src/programmes/models/legal/legal.model';

/** Formes accordées d'un adjectif ou participe : x, xe, xs, xes. */
const inflected = (word: string) => [word, `${word}e`, `${word}s`, `${word}es`];

/**
 * Termes interdits dans les champs texte des procédures (blueprint § 2.4). Liste fermée : elle
 * s'enrichit par revue, jamais pour viser un cas particulier.
 * « inculpé » : terme supprimé du code de procédure pénale en 1993, on écrit « mis en examen ».
 * « coupable » n'est admis que dans « déclaré(e) coupable » (voir `isBareGuilty`).
 */
export const FORBIDDEN_LEGAL_TERMS: readonly string[] = [
  'scandale',
  'sulfureux',
  'retentissant',
  'accablant',
  'lourde peine',
  "affaire d'État",
  'magouille',
  'casserole',
  ...inflected('épinglé'),
  ...inflected('blanchi'),
  ...inflected('innocenté'),
  ...inflected('inculpé'),
  'délinquant',
  'délinquants',
  'délinquante',
  'délinquantes',
  'repris de justice',
  'tristement',
  'notoire',
  'notoirement',
];

/** Rappel de présomption écrit à la main : il est généré par le site, jamais stocké. */
export const HAND_WRITTEN_PRESUMPTION = /pr[ée]sum[ée]e?s?\s+innocente?s?|pr[ée]somption/i;

/** « coupable » qui n'est pas précédé de « déclaré(e)(s) ». */
export function hasBareGuilty(text: string): boolean {
  for (const match of text.matchAll(/(?<![\p{L}])coupables?(?![\p{L}])/giu)) {
    const before = text.slice(0, match.index);
    if (!/d[ée]clar[ée]e?s?\s+$/iu.test(before)) return true;
  }
  return false;
}

export const STATUS_LABELS: Record<LegalStatus, string> = {
  enquete: 'Enquête en cours',
  'temoin-assiste': 'Témoin assisté',
  'mise-en-examen': 'Mise en examen',
  'renvoi-devant-tribunal': 'Renvoi devant le tribunal',
  'proces-en-cours': 'Procès en cours',
  'condamnation-non-definitive': 'Condamnation non définitive (recours en cours)',
  // Libellé de repli : la présentation génère « Condamné·e par [juridiction] le [date] ; … ».
  'condamnation-recours-non-documente': "Condamnation ; nous n'avons pas trouvé trace d'un recours",
  'condamnation-definitive': 'Condamnation définitive',
  relaxe: 'Relaxe',
  acquittement: 'Acquittement',
  'non-lieu': 'Non-lieu',
  classement: 'Classement sans suite',
  'extinction-action-publique': 'Action publique éteinte',
  'mise-en-examen-annulee': 'Mise en examen annulée',
  'demande-rejetee': 'Demande rejetée',
};

/** Statuts pour lesquels le rappel de la présomption d'innocence est affiché. */
export const NON_FINAL_STATUSES: ReadonlySet<LegalStatus> = new Set<LegalStatus>([
  'enquete',
  'temoin-assiste',
  'mise-en-examen',
  'renvoi-devant-tribunal',
  'proces-en-cours',
  'condamnation-non-definitive',
  'condamnation-recours-non-documente',
]);

export const PRESUMPTION_NOTICE =
  "Présomption d'innocence : aucune condamnation définitive n'a été prononcée dans cette procédure.";
