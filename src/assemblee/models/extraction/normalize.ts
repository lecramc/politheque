const TYPOGRAPHIC_APOSTROPHES = /[‘’ʼ]/g; // U+2018, U+2019, U+02BC → apostrophe droite

/** Normalisation d'un titre pour les tests de périmètre : apostrophes, casse, espaces. */
export const normalizeTitle = (title: string): string =>
  title.replace(TYPOGRAPHIC_APOSTROPHES, "'").replace(/\s+/g, ' ').trim().toLowerCase();

/** L'open data donne tantôt un tableau, tantôt un objet seul, tantôt null, parfois des trous. */
export const asList = <T>(value: T | (T | null | undefined)[] | null | undefined): T[] => {
  if (value === null || value === undefined) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.filter((item): item is T => item !== null && item !== undefined);
};
