/** Fichier iCalendar servi tel quel (public/), à la racine du site. */
export const AGENDA_FILE = 'agenda-presidentielle-2027.ics';
export const AGENDA_PATH = `/${AGENDA_FILE}`;

export const AGENDA_COPY = {
  button: 'Ajouter les dates à mon agenda',
  calendarName: 'Voter en 2027 — Polithèque',
  roundDescription: 'Jour du scrutin.',
  calculatedPrefix: 'Date calculée.',
  detailsPrefix: 'Démarches et sources :',
} as const;
