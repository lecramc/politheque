import fs from 'node:fs';
import path from 'node:path';

import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import {
  buildIcs,
  escapeIcsText,
  foldIcsLine,
  voterCalendarEvents,
  voterCalendarFor,
} from '@/src/programmes/models/voter-calendar';
import { AGENDA_COPY, AGENDA_FILE } from '@/src/programmes/models/voter-calendar.copy';

const catalog = buildStaticCatalog();
const bytes = (s: string) => Buffer.byteLength(s, 'utf8');

describe('Feature: échappement et pliage iCalendar (RFC 5545)', () => {
  it('should escape backslashes, semicolons, commas and newlines', () => {
    expect(escapeIcsText('a, b; c\\d\ne')).toBe('a\\, b\\; c\\\\d\\ne');
  });

  it('should leave a short line untouched', () => {
    expect(foldIcsLine('SUMMARY:court')).toBe('SUMMARY:court');
  });

  it('should fold long lines at 75 octets without cutting a multi-byte character', () => {
    const original = `DESCRIPTION:${'é'.repeat(100)}`;
    const lines = foldIcsLine(original).split('\r\n');
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) expect(bytes(line)).toBeLessThanOrEqual(75);
    for (const line of lines.slice(1)) expect(line.startsWith(' ')).toBe(true);
    expect(lines.map((l, i) => (i ? l.slice(1) : l)).join('')).toBe(original);
  });
});

describe('Feature: dates clés à l’agenda', () => {
  const events = voterCalendarFor(catalog)!.events;

  it('should only contain the dates already sourced in the data, in calendar order', () => {
    expect(events.map((e) => e.date)).toEqual([
      '2027-03-12',
      '2027-04-08',
      '2027-04-18',
      '2027-05-02',
    ]);
  });

  it('should give each event a clear title, the voter page URL and a stable unique id', () => {
    expect(events[0].title).toBe("Élection présidentielle 2027 : Date limite d'inscription");
    expect(events[2].title).toBe('Élection présidentielle 2027 : 1er tour');
    for (const e of events) expect(e.description).toContain('/elections/presidentielle-2027/voter');
    expect(new Set(events.map((e) => e.uid)).size).toBe(events.length);
  });

  it('should build events from the election and the voter guide', () => {
    const election = catalog.elections.find((e) => e.id === catalog.voter.electionId)!;
    expect(voterCalendarEvents(election, catalog.voter, 'https://x.test/voter')).toHaveLength(4);
  });
});

describe('Feature: fichier .ics', () => {
  const ics = buildIcs(voterCalendarFor(catalog)!);

  it('should be a CRLF-terminated VCALENDAR with all-day events', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
    expect(ics).toContain('DTSTART;VALUE=DATE:20270312\r\nDTEND;VALUE=DATE:20270313\r\n');
    expect(ics).toContain('DTSTART;VALUE=DATE:20270502\r\nDTEND;VALUE=DATE:20270503\r\n');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(4);
  });

  it('should be deterministic: DTSTAMP derives from lastVerified', () => {
    expect(ics).toContain(`DTSTAMP:${catalog.voter.lastVerified.replace(/-/g, '')}T000000Z`);
    expect(buildIcs(voterCalendarFor(catalog)!)).toBe(ics);
  });

  it('should keep every line within 75 octets', () => {
    for (const line of ics.split('\r\n')) expect(bytes(line)).toBeLessThanOrEqual(75);
  });

  it('should match the committed static file served by the site (npm run agenda:build)', () => {
    const file = fs.readFileSync(path.join(process.cwd(), 'public', AGENDA_FILE), 'utf8');
    expect(file).toBe(ics);
  });
});

describe('Feature: libellés de l’agenda', () => {
  it('should offer a clear button label and a file name', () => {
    expect(AGENDA_COPY.button).toBe('Ajouter les dates à mon agenda');
    expect(AGENDA_FILE).toBe('agenda-presidentielle-2027.ics');
  });
});
