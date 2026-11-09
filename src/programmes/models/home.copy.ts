/**
 * Textes de l'accueil (règle de rédaction du § 5.2 de la spec) : phrases courtes, mots du lecteur.
 * Français codé en dur, comme le reste de `src/programmes/`.
 */
export const HOME_COPY = {
  title: 'Comprendre la politique française, sans parti pris',
  lead: 'Dix partis, le même traitement. Chaque information est sourcée et datée.',
  partiesTitle: 'Les dix partis',
  partiesNote: 'Ordre alphabétique.',
  journeyTitle: 'Pour commencer',
  journeyCardTitle: 'Le parcours en six étapes',
  journeyCardText:
    'Les bases, les institutions, les partis, les débats, la présidentielle, le questionnaire.',
  progressLabel: 'Ma progression',
} as const;

export const TASK_COPY = {
  situer: { title: 'Me situer', icon: 'compass-outline' },
  partis: {
    title: 'Ce que veut chaque parti',
    subtitle: 'Programme, positions, histoire',
    icon: 'people-outline',
  },
  comparer: {
    title: 'Comparer deux partis',
    subtitle: 'Côte à côte, sujet par sujet',
    icon: 'git-compare-outline',
  },
  voter: { title: 'Voter en 2027', icon: 'calendar-outline' },
} as const;

/** « 31 affirmations · 5 min · rien n'est envoyé » : le nombre vient du catalogue. */
export const situerSubtitle = (questionCount: number) =>
  `${questionCount} affirmations · 5 min · rien n'est envoyé`;

export const voterSubtitle = (firstRound: string | null, registration: string | null) =>
  [
    firstRound ? `1er tour le ${firstRound}` : null,
    registration ? `s'inscrire jusqu'au ${registration}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
