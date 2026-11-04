import type { Party, PartyStance, ThemeId } from '@/src/programmes/models/programme.model';

export const THEME_IDS: ThemeId[] = [
  'economie',
  'travail',
  'immigration',
  'securite',
  'ecologie',
  'sante',
  'education',
  'europe',
  'institutions',
];

export const emptyThemes = () =>
  Object.fromEntries(
    THEME_IDS.map((id) => [id, { summary: '', measures: [] }])
  ) as unknown as Party['candidacies'][string]['themes'];

export const partyFactory = (
  overrides: Partial<Party> & { stanceValues?: Record<string, PartyStance['stance']> } = {}
): Party => {
  const { stanceValues = {}, ...rest } = overrides;
  return {
    id: 'parti-test',
    name: 'Parti test',
    shortName: 'PT',
    color: '#888888',
    family: 'Test',
    description: '',
    foundedYear: 2000,
    leader: { name: 'Prénom Nom', role: 'présidé par' },
    keyIdeas: [],
    lastVerified: '2026-11-03',
    stances: Object.fromEntries(
      Object.entries(stanceValues).map(([id, stance]) => [
        id,
        { stance, justification: '', sources: [] },
      ])
    ),
    candidacies: {},
    ...rest,
  };
};
