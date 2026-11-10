/**
 * Positions de vote à l'Assemblée (`colors.vote.*`). Module pur (aucun import natif) : testé
 * pour le contraste, repris tel quel par `ThemeContext`.
 *
 * Règles : ni vert ni rouge (connotation bien / mal, daltonisme) ; aucune teinte bleue ni
 * aucune couleur proche d'une couleur officielle de groupe (« pour » : gris anthracite en clair,
 * quasi blanc en sombre, à ΔE ≥ 20 de chacune, testé) ; « pour » et « contre » à au moins 3:1
 * d'écart de luminance (lisibles en niveaux de gris) ; chaque symbole dessiné à au moins 3:1 du
 * fond de page. La teinte ne porte jamais seule l'information (disque plein, disque barré, anneau,
 * point, pointillé : voir `Hemicycle`).
 */
export type VotePalette = Record<
  'pour' | 'contre' | 'contreMark' | 'abstention' | 'nonVotant' | 'aucun',
  string
>;

export const votePalette: { light: VotePalette; dark: VotePalette } = {
  light: {
    /** Disque plein, gris anthracite. */
    pour: '#1A1A1A',
    /** Disque plein, teinte claire. */
    contre: '#F0B84A',
    /** Contour et trait diagonal d'un « contre » : sans lui, le disque clair se perd sur le fond. */
    contreMark: '#1A1A1A',
    /** Anneau (abstention). */
    abstention: '#555555',
    /** Petit point centré (non-votant). */
    nonVotant: '#555555',
    /** Contour pointillé (pas de vote enregistré) : jamais seul, mais lisible (3:1 au moins). */
    aucun: '#767676',
  },
  dark: {
    pour: '#FFFFFF',
    contre: '#8A5E0F',
    contreMark: '#F0C27A',
    abstention: '#BDBDBD',
    nonVotant: '#BDBDBD',
    aucun: '#8C8C8C',
  },
};
