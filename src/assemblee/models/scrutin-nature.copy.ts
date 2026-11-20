/** Textes de la nature d'un vote, de ses étapes et des liens d'aide sur la page d'un scrutin. */
export const NATURE_COPY = {
  natures: [
    'Amendement',
    'Article',
    'Texte entier',
    'Motion de censure',
    'Motion de rejet',
    'Partie du budget',
    'Déclaration du Gouvernement',
  ],
  /** Étapes reconnues quand le titre officiel les donne entre parenthèses. */
  stages: [
    'première lecture',
    'deuxième lecture',
    'troisième lecture',
    'nouvelle lecture',
    'lecture définitive',
    'texte de la commission mixte paritaire',
  ],
  helpTitle: 'Pour comprendre ce vote',
  lessonLabel: 'Comment une loi est votée',
  lessonHref: '/comprendre/comment-une-loi-est-votee',
  /** Libellé du lien, par identifiant de `lexique.json`. */
  lexicon: {
    'motion-de-censure': 'Motion de censure',
    'question-de-confiance': 'Question de confiance',
    'loi-de-finances': 'Loi de finances',
    plfss: 'Loi de financement de la Sécurité sociale',
    'projet-et-proposition-de-loi': 'Projet et proposition de loi',
    'commission-mixte-paritaire': 'Commission mixte paritaire',
    lecture: 'Lecture d’un texte',
    'scrutin-public-solennel': 'Scrutin public solennel',
    'scrutin-public': 'Scrutin public',
    abstention: 'Abstention',
  },
  officialTitleLabel: 'Titre officiel',
} as const;
