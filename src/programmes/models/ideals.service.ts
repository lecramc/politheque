import type { TitledSourcedText } from '@/src/programmes/models/programme.model';

const CLASSIFICATION_TITLE = /^(Classement|Nuancier)/;

/** Un idéal est un classement du parti (et non une idée) si son titre commence par « Classement » ou « Nuancier ». */
export const isClassificationIdeal = (ideal: TitledSourcedText): boolean =>
  CLASSIFICATION_TITLE.test(ideal.title);

/** Sépare les idéaux « idées » des classements, en conservant l'ordre. */
export function splitIdeals(ideals: TitledSourcedText[]): {
  classification: TitledSourcedText[];
  others: TitledSourcedText[];
} {
  return {
    classification: ideals.filter(isClassificationIdeal),
    others: ideals.filter((ideal) => !isClassificationIdeal(ideal)),
  };
}
