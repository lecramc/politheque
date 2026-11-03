import { candidatesOf, daysUntil, nextRound } from '@/src/programmes/models/election.service';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Election } from '@/src/programmes/models/programme.model';

const election: Election = {
  id: 'presidentielle-2027',
  type: 'presidentielle',
  title: 'Présidentielle 2027',
  status: 'a-venir',
  featured: true,
  summary: '',
  summarySources: [],
  rounds: [
    { label: '1er tour', date: '2027-04-18', sources: [] },
    { label: '2nd tour', date: '2027-05-02', sources: [] },
  ],
  keyDates: [],
  guideSectionIds: [],
  candidaciesNote: '',
};

const candidacy = {
  candidateName: 'X',
  status: 'declare' as const,
  statusLabel: 'Candidat déclaré',
  candidate: 'X',
  programmeStatus: 'p',
  themes: emptyThemes(),
};

describe('Feature: calendrier électoral', () => {
  it('should count the days left before the first round', () => {
    expect(daysUntil('2027-04-18', new Date('2026-11-03T10:00:00Z'))).toBe(166);
  });

  it('should count in Paris time, not UTC', () => {
    // 23h30 UTC le 17 avril = 01h30 à Paris le 18 avril : c'est le jour du vote.
    expect(daysUntil('2027-04-18', new Date('2027-04-17T23:30:00Z'))).toBe(0);
  });

  it('should point to the second round once the first one is past', () => {
    expect(nextRound(election, new Date('2027-04-20T10:00:00Z'))?.label).toBe('2nd tour');
  });

  it('should list only parties running in the election, alphabetically', () => {
    const parties = [
      partyFactory({ id: 'z', name: 'Zèbre', candidacies: { 'presidentielle-2027': candidacy } }),
      partyFactory({ id: 'sans', name: 'Absent' }),
      partyFactory({ id: 'a', name: 'Abeille', candidacies: { 'presidentielle-2027': candidacy } }),
    ];
    expect(candidatesOf(election, parties).map((c) => c.party.id)).toEqual(['a', 'z']);
  });
});
