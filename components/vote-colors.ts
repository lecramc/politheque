/**
 * Positions de vote à l'Assemblée (`colors.vote.*`). Module pur (aucun import natif) : testé
 * pour le contraste, repris tel quel par `ThemeContext`.
 *
 * Règles : ni vert ni rouge (connotation bien / mal, daltonisme) ; « pour » et « contre » à au
 * moins 3:1 d'écart de luminance (lisibles en niveaux de gris) ; la teinte ne porte jamais seule
 * l'information (disque plein, disque barré, anneau, point : voir `Hemicycle`). Distinctes des
 * couleurs officielles des groupes, qui n'apparaissent que sur l'arc extérieur, avec leur libellé.
 */
export type VotePalette = Record<
  'pour' | 'contre' | 'contreMark' | 'abstention' | 'nonVotant' | 'aucun',
  string
>;

export const votePalette: { light: VotePalette; dark: VotePalette } = {
  light: {
    /** Disque plein, teinte foncée. */
    pour: '#1B2F66',
    /** Disque plein, teinte claire. */
    contre: '#F0B84A',
    /** Contour et trait diagonal d'un « contre » : sans lui, le disque clair se perd sur le fond. */
    contreMark: '#1B2F66',
    /** Anneau (abstention). */
    abstention: '#4B5468',
    /** Petit point centré (non-votant). */
    nonVotant: '#4B5468',
    /** Contour pointillé très léger (pas de vote enregistré) : décoratif, jamais seul. */
    aucun: '#A9AEBB',
  },
  dark: {
    pour: '#B9CCF7',
    contre: '#8A5E0F',
    contreMark: '#F0C27A',
    abstention: '#B8BFCE',
    nonVotant: '#B8BFCE',
    aucun: '#5B6685',
  },
};
