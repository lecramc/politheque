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

/** Pastille de l'en-tête : « 2027 », puis « 2027 · J-161 » quand le compte à rebours est connu. */
export const chipLabel = (election: Election, daysLeft: number | null): string => {
  const year = election.rounds[0]?.date.slice(0, 4) ?? '';
  return daysLeft !== null && daysLeft >= 0 ? `${year} · J-${daysLeft}` : year;
};

const shortDay = (isoDate: string) =>
  new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  });

/** Dates à dire avec les mots du lecteur : « 18 avril », « 12 mars » (le terme exact reste dans la page). */
export const electionFacts = (election: Election) => {
  const registration = election.keyDates.find((step) => /inscription/i.test(step.label));
  return {
    firstRound: election.rounds[0] ? shortDay(election.rounds[0].date) : null,
    registrationDeadline: registration ? shortDay(registration.date) : null,
  };
};

/** « Comment voter » en trois gestes. Le détail (pièces, procuration) est dans le guide. */
export const voteSteps = (election: Election): { title: string; text: string }[] => {
  const { registrationDeadline } = electionFacts(election);
  return [
    {
      title: 'Vérifiez votre inscription',
      text: `${registrationDeadline ? `avant le ${registrationDeadline}, ` : ''}sur service-public.fr.`,
    },
    {
      title: 'Le jour du vote',
      text: "apportez une pièce d'identité avec photo (communes de 1 000 habitants ou plus).",
    },
    { title: 'Absent ?', text: 'Donnez procuration à un autre électeur.' },
  ];
};
