import {
  candidatesOf,
  chipLabel,
  daysUntil,
  electionFacts,
  nextRound,
  voteSteps,
} from '@/src/programmes/models/election.service';
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
  programmeState: 'non-publie' as const,
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

describe('Feature: pastille « 2027 » de l’en-tête', () => {
  it('should show only the year of the first round before the countdown is known', () => {
    expect(chipLabel(election, null)).toBe('2027');
  });

  it('should add the days left once the countdown is known', () => {
    expect(chipLabel(election, 161)).toBe('2027 · J-161');
  });

  it('should show J-0 on the day of the vote and nothing negative after', () => {
    expect(chipLabel(election, 0)).toBe('2027 · J-0');
    expect(chipLabel(election, -3)).toBe('2027');
  });
});

describe('Feature: faits du scrutin pour l’accueil et « Comment voter »', () => {
  const withRegistration: Election = {
    ...election,
    keyDates: [
      {
        label:
          'Date limite de dépôt des 500 parrainages au Conseil constitutionnel (date calculée)',
        date: '2027-03-12',
        sources: [],
      },
      {
        label: "Date limite d'inscription sur les listes électorales, en ligne comme en mairie",
        date: '2027-03-12',
        sources: [],
      },
    ],
  };

  it('should give the first round and the registration deadline in the reader words', () => {
    expect(electionFacts(withRegistration)).toEqual({
      firstRound: '18 avril',
      registrationDeadline: '12 mars',
    });
  });

  it('should give no registration deadline when the data has none', () => {
    expect(electionFacts(election).registrationDeadline).toBeNull();
  });

  it('should explain how to vote in three gestures, the same wording for every election', () => {
    const steps = voteSteps(withRegistration);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toEqual({
      title: 'Vérifiez votre inscription',
      text: 'au plus tard le 12 mars, sur service-public.fr.',
    });
    expect(steps[1].title).toBe('Le jour du vote');
    expect(steps[2].title).toBe('Absent ?');
  });

  it('should keep a registration step even without a deadline in the data', () => {
    expect(voteSteps(election)[0].text).toBe('sur service-public.fr.');
  });
});
