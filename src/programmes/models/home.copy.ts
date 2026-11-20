/**
 * Textes de l'accueil (règle de rédaction du § 5.2 de la spec) : phrases courtes, mots du lecteur.
 * Français codé en dur, comme le reste de `src/programmes/`.
 */
export const HOME_COPY = {
  title: 'Comprendre la politique française, sans parti pris',
  lead: 'Les institutions, les dix partis, les votes à l’Assemblée. Chaque information est sourcée et datée.',
  tasksTitle: 'Par où commencer ?',
  partiesTitle: 'Les dix partis',
  partiesNote: 'Ordre alphabétique.',
  journeyTitle: 'Pour commencer',
  journeyCardTitle: 'Le parcours en six étapes',
  journeyCardText:
    'Les bases, les institutions, les partis, les débats, la présidentielle, le questionnaire.',
  progressLabel: 'Ma progression',
} as const;

/**
 * Points d'entrée de l'accueil : une rubrique (`kicker`, comme dans la navigation), un verbe
 * d'action, une ligne, une icône. « Comparer deux partis » est fusionné dans « Partis ».
 */
export const TASK_COPY = {
  comprendre: {
    kicker: 'Comprendre',
    title: 'Comprendre les institutions et les lois',
    subtitle: 'Qui décide quoi, comment une loi est votée',
    icon: 'book-outline',
  },
  partis: {
    kicker: 'Partis',
    title: 'Découvrir ce que veut chaque parti',
    subtitle: 'Programme, positions, histoire, comparaison',
    icon: 'people-outline',
  },
  assemblee: {
    kicker: 'Assemblée',
    title: 'Voir qui vote quoi à l’Assemblée',
    subtitle: 'Les grands votes, groupe par groupe, et votre député',
    icon: 'business-outline',
  },
  situer: { kicker: 'Me situer', title: 'Me situer', icon: 'compass-outline' },
  voter: { kicker: '2027', title: 'Préparer le vote en 2027', icon: 'calendar-outline' },
} as const;

/** Sous-titre de la carte « Présidentielle 2027 : les N candidatures ». */
export const CANDIDATES_LINK_COPY = { subtitle: 'Qui se présente, programme, sources' } as const;

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
