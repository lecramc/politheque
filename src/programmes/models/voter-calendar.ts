import { SITE_URL } from '@/src/core/config/app';
import type { Catalog, Election, VoterGuide } from '@/src/programmes/models/programme.model';
import { AGENDA_COPY } from '@/src/programmes/models/voter-calendar.copy';

export interface CalendarEvent {
  uid: string;
  /** Jour entier, AAAA-MM-JJ. */
  date: string;
  title: string;
  description: string;
}

export interface VoterCalendar {
  name: string;
  /** Date de dernière vérification (AAAA-MM-JJ) : sert de DTSTAMP, pour une sortie déterministe. */
  verifiedOn: string;
  events: CalendarEvent[];
}

const UID_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

/** Dates déjà sourcées : tours de l'élection puis dates calculées du guide, par ordre de calendrier. */
export function voterCalendarEvents(
  election: Election,
  voter: VoterGuide,
  pageUrl: string
): CalendarEvent[] {
  const details = `${AGENDA_COPY.detailsPrefix} ${pageUrl}`;
  const rounds = election.rounds.map((round, index) => ({
    uid: `${election.id}-tour-${index + 1}@${UID_DOMAIN}`,
    date: round.date,
    title: `${election.title} : ${round.label}`,
    description: `${AGENDA_COPY.roundDescription} ${details}`,
  }));
  const calculated = voter.sections.flatMap((section) =>
    (section.calculated ?? []).map((item, index) => ({
      uid: `${election.id}-${section.id}-${index + 1}@${UID_DOMAIN}`,
      date: item.date,
      title: `${election.title} : ${item.label}`,
      description: `${AGENDA_COPY.calculatedPrefix} ${item.rule} ${details}`,
    }))
  );
  return [...calculated, ...rounds].sort((a, b) => a.date.localeCompare(b.date));
}

export function voterCalendarFor(catalog: Catalog): VoterCalendar | null {
  const election = catalog.elections.find((e) => e.id === catalog.voter.electionId);
  if (!election) return null;
  return {
    name: AGENDA_COPY.calendarName,
    verifiedOn: catalog.voter.lastVerified,
    events: voterCalendarEvents(
      election,
      catalog.voter,
      `${SITE_URL}/elections/${election.id}/voter`
    ),
  };
}

export const escapeIcsText = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Plie à 75 octets UTF-8 par ligne (RFC 5545 §3.1), sans couper un caractère. */
export function foldIcsLine(line: string): string {
  const parts: string[] = [];
  let current = '';
  let size = 0;
  for (const char of line) {
    const n = Buffer.byteLength(char, 'utf8');
    if (size + n > 75) {
      parts.push(current);
      current = '';
      size = 1; // l'espace de continuation
    }
    current += char;
    size += n;
  }
  parts.push(current);
  return parts.map((p, i) => (i ? ` ${p}` : p)).join('\r\n');
}

const compact = (iso: string) => iso.replace(/-/g, '');

const nextDay = (iso: string) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function buildIcs(calendar: VoterCalendar): string {
  const stamp = `${compact(calendar.verifiedOn)}T000000Z`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Polithèque//Voter 2027//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(calendar.name)}`,
    ...calendar.events.flatMap((e) => [
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(e.date)}`,
      `DTEND;VALUE=DATE:${compact(nextDay(e.date))}`,
      `SUMMARY:${escapeIcsText(e.title)}`,
      `DESCRIPTION:${escapeIcsText(e.description)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ];
  return `${lines.map(foldIcsLine).join('\r\n')}\r\n`;
}
