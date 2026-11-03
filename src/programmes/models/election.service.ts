import type { Election, Party } from '@/src/programmes/models/programme.model';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Date du jour à Paris (AAAA-MM-JJ), quel que soit le fuseau de l'appareil. */
export const parisDay = (now: Date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

const utcMidnight = (isoDate: string) =>
  Date.UTC(
    Number(isoDate.slice(0, 4)),
    Number(isoDate.slice(5, 7)) - 1,
    Number(isoDate.slice(8, 10))
  );

/** Jours restant avant une date ISO (AAAA-MM-JJ), comptés en jours calendaires de Paris. */
export const daysUntil = (isoDate: string, now: Date): number =>
  Math.round((utcMidnight(isoDate) - utcMidnight(parisDay(now))) / DAY_MS);

export const nextRound = (election: Election, now: Date) =>
  election.rounds.find((round) => daysUntil(round.date, now) >= 0) ?? null;

/** Partis ayant une candidature à cette élection, par ordre alphabétique. */
export const candidatesOf = (election: Election, parties: Party[]) =>
  parties
    .filter((party) => party.candidacies[election.id])
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .map((party) => ({ party, candidacy: party.candidacies[election.id] }));

export const formatLongDate = (isoDate: string) =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
