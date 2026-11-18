import type { Groupe } from '@/src/assemblee/models/scrutin.model';

/**
 * Couleur d'un groupe : la couleur officielle de l'Assemblée nationale (plan de l'hémicycle,
 * assemblee-nationale.fr/dyn/vos-deputes/hemicycle, consulté le 18 novembre 2026), pour tous les
 * groupes sans exception : ce sont les couleurs de l'institution, pas un choix éditorial. Elles
 * viennent des données (`couleurOfficielle`). Les couleurs claires (HOR, SOC, LIOT) restent
 * lisibles grâce à un contour fin ; l'abréviation du groupe est toujours écrite à côté : la
 * couleur n'est jamais la seule information.
 */
export const GROUP_FALLBACK_COLOR = '#8D949A';

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

/** Couleur officielle du groupe ; gris neutre si elle manque ou n'est pas un `#RRGGBB`. */
export const groupColor = (groupe: Pick<Groupe, 'couleurOfficielle'>): string =>
  HEX_COLOR.test(groupe.couleurOfficielle) ? groupe.couleurOfficielle : GROUP_FALLBACK_COLOR;
