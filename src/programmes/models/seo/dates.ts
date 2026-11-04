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

/** « 2016 » → « 2016 », « 2016-03 » → « mars 2016 », « 2016-03-01 » → « 1er mars 2016 ». */
export function formatPartialDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  if (!month) return String(year);
  return day ? formatLongDate(iso) : `${MONTHS[month - 1]} ${year}`;
}

/** « 2026-11-03 » → « 3 novembre 2026 » (sans fuseau : calcul sur la chaîne ISO). */
export function formatLongDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const dayLabel = day === 1 ? '1er' : String(day);
  return `${dayLabel} ${MONTHS[month - 1]} ${year}`;
}

/** Date ISO la plus récente d'une liste ; null si aucune date réelle. */
export function maxIsoDate(dates: (string | null | undefined)[]): string | null {
  const real = dates.filter((d): d is string => !!d);
  return real.length ? real.reduce((a, b) => (b > a ? b : a)) : null;
}
