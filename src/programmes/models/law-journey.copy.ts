/**
 * Frise du parcours d'une loi (leçon « Comment une loi est votée »). Une phrase par étape, avec
 * l'article de la Constitution du 4 octobre 1958 qui la fonde, vérifié le 20 novembre 2026 sur le
 * texte en vigueur (conseil-constitutionnel.fr, à jour de la révision du 8 mars 2024).
 */
export const LAW_JOURNEY_ID = 'comment-une-loi-est-votee';

export type LawJourneyStep = {
  id: string;
  title: string;
  text: string;
  /** Numéro de l'article de la Constitution. */
  article: number;
  /** Étape qui n'a lieu que dans certains cas. */
  optional?: boolean;
};

export const LAW_JOURNEY: readonly LawJourneyStep[] = [
  {
    id: 'depot',
    title: 'Dépôt',
    text: "Le Gouvernement dépose un projet de loi, ou des députés ou sénateurs une proposition de loi, sur le bureau de l'une des deux assemblées.",
    article: 39,
  },
  {
    id: 'commission',
    title: 'Commission',
    text: 'Une commission permanente examine le texte et peut le modifier.',
    article: 43,
  },
  {
    id: 'seance',
    title: 'Séance publique',
    text: "Tous les élus de l'assemblée discutent en séance le texte adopté par la commission, puis le votent.",
    article: 42,
  },
  {
    id: 'navette',
    title: 'Navette avec le Sénat',
    text: "Le texte passe d'une assemblée à l'autre, pour que les deux adoptent un texte identique.",
    article: 45,
  },
  {
    id: 'cmp',
    title: 'Commission mixte paritaire',
    text: 'En cas de désaccord, une commission de sept députés et sept sénateurs peut proposer un texte commun.',
    article: 45,
    optional: true,
  },
  {
    id: 'lecture-definitive',
    title: 'Lecture définitive',
    text: "Si la commission mixte échoue, le Gouvernement peut demander à l'Assemblée nationale de statuer définitivement.",
    article: 45,
    optional: true,
  },
  {
    id: 'conseil-constitutionnel',
    title: 'Conseil constitutionnel',
    text: 'Avant la promulgation, la loi peut être déférée au Conseil constitutionnel, qui juge sa conformité à la Constitution.',
    article: 61,
    optional: true,
  },
  {
    id: 'promulgation',
    title: 'Promulgation',
    text: 'Le Président de la République promulgue la loi dans les quinze jours qui suivent sa transmission au Gouvernement.',
    article: 10,
  },
];
