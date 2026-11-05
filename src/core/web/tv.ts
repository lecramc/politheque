import { Platform } from 'react-native';

/**
 * Crochet CSS (`data-tv`) pour la feuille responsive web (`layout-css.ts`).
 * Sans effet en natif. Plusieurs noms : `tv('stance-row', 'chev')` (sélecteur `~=`).
 */
export const tv = (...names: string[]) =>
  (Platform.OS === 'web' ? { dataSet: { tv: names.join(' ') } } : {}) as object;
