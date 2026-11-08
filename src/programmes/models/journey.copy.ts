/**
 * Vocabulaire de « Ma progression » (passeport) et de l'effacement, centralisé et testé : aucun mot
 * de culpabilité ni de score (« raté », « retard », « score », « niveau », « points », « série »,
 * « bravo », « champion »). Français codé en dur, comme le reste de `src/programmes/`.
 */
export const JOURNEY_COPY = {
  privacy: "Votre progression reste sur cet appareil. Rien n'est envoyé.",
  clear: 'Effacer ma progression',
  clearSheetTitle: 'Effacer votre progression sur cet appareil ?',
  clearSheetText: 'Les pages lues et les tampons seront remis à zéro.',
  clearConfirm: 'Effacer',
  clearCancel: 'Annuler',
  passportTitle: 'Ma progression',
  passportKicker: 'MA PROGRESSION',
  passportHeading: 'Ma progression',
  passportFinishedHeading: 'Vous êtes prêt·e à voter en connaissance de cause',
  quizNote:
    'Le tampon « Me situer » indique que vous avez répondu au questionnaire, jamais ce que vous avez répondu.',
  whatNowTitle: 'Et maintenant ?',
  whatNowText: 'Vérifiez que vous êtes inscrit·e sur les listes électorales.',
  whatNowLabel: 'Comment voter',
  back: 'Comprendre',
} as const;

export const summaryLabel = (stampedCount: number, total: number) =>
  `${stampedCount} sur ${total} étapes`;
