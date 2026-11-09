import { Platform } from 'react-native';

type Paint = { fill?: string; stroke?: string };

/**
 * Couleurs d'un élément SVG (`<Path {...paint({ fill: colors.tint })} />`).
 *
 * Sur le web, les couleurs du thème sont des `var(--…)`. Dans un attribut de présentation SVG
 * (`fill="var(--tint)"`), `var()` dépend du navigateur ; dans une propriété CSS, il est valable
 * partout. On garde donc l'attribut et on pose en plus la même couleur en style (le style
 * l'emporte sur l'attribut). Natif : les attributs seuls, inchangés.
 */
export const paint = (colors: Paint): Paint & { style?: Paint } =>
  Platform.OS === 'web' ? { ...colors, style: { ...colors } } : colors;
