/**
 * Bandeau « Dernier grand vote à l'Assemblée » de l'accueil. Que des faits : le titre officiel, la
 * date, le résultat, la position de chaque groupe. Aucun commentaire sur le vote.
 */
export const HOME_VOTE_COPY = {
  title: "Dernier grand vote à l'Assemblée",
  /** La règle de choix, fixe : écrite ici, appliquée dans `latest-major-vote.ts`. */
  method:
    "Le plus récent des grands votes (texte entier, motion de censure, confiance ou déclaration du Gouvernement). Même règle pour tous les groupes, rangés de la gauche à la droite comme dans l'hémicycle.",
  openVote: 'Voir le détail du vote',
  allVotes: 'Tous les votes',
  allVotesHref: '/assemblee',
  law: 'Comment une loi est votée',
  lawHref: '/comprendre/comment-une-loi-est-votee',
} as const;
