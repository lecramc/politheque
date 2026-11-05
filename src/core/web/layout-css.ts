import { layout } from '@/components/layout';

/**
 * Feuille responsive du web : le mobile est dans les styles React Native, le desktop se règle ici,
 * par media queries sur les attributs `data-tv` posés avec `tv()` (prop `dataSet` de
 * react-native-web). Le HTML statique et le premier rendu client sont donc identiques.
 *
 * Spécificité : chaque sélecteur est préfixé par `:root` (0,2,0) pour passer devant les classes
 * atomiques de react-native-web (0,1,0), sans `!important`. Conséquence : une propriété surchargée
 * ici doit venir d'un `StyleSheet.create` côté React Native, jamais d'un objet de style en ligne
 * (un style en ligne l'emporterait). Ne surcharger ni transform, ni opacity, ni les largeurs
 * animées (Reanimated).
 *
 * Voir docs/ux/spec-desktop.md §2, §7.
 */
const { breakpoint: bp, gutter, rail, railGap, main, container, railTop } = layout;

const sel = (...names: string[]) => names.map((n) => `:root [data-tv~="${n}"]`).join(',\n');
const rule = (names: string[], body: string) => `${sel(...names)} {\n  ${body}\n}`;

export const layoutCss: string = [
  '/* Travée : mise en page desktop (généré depuis components/layout.ts) */',

  // Base : tout ce qui n'existe qu'à partir d'un seuil est masqué.
  rule(['only-from-md', 'only-from-lg', 'colhead'], 'display: none;'),

  `@media (min-width: ${bp.md}px) {`,
  rule(['only-below-md', 'bottom-bar'], 'display: none;'),
  rule(['only-from-md'], 'display: flex;'),
  rule(['colhead'], 'display: flex;'),
  rule(['scroll-pad'], 'height: 16px;'),
  rule(
    ['container'],
    `max-width: ${layout.single + gutter.md * 2}px; padding-left: ${gutter.md}px; padding-right: ${gutter.md}px;`
  ),
  rule(
    ['grid-2', 'grid-3'],
    'display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px;'
  ),
  rule(['wrap'], 'flex-wrap: wrap;'),
  rule(['footer-text'], 'text-align: left;'),
  rule(['footer-rule'], 'border-top-width: 1px; padding-top: 20px;'),
  // Badge de position : cellule fixe, un seul alignement des ronds par liste.
  rule(['stance-cell'], `width: ${layout.stanceCell.md}px; align-self: center; flex-shrink: 0;`),
  rule(['stance-row'], 'flex-direction: row; align-items: center; column-gap: 16px;'),
  rule(['stance-row-label'], 'flex: 1 1 0%;'),
  // Ligne parti x position : anneau, nom, position, sources alignées à droite.
  rule(
    ['psr'],
    `display: grid; grid-template-columns: 28px 190px ${layout.stanceCell.md}px minmax(0, 1fr); column-gap: 12px; row-gap: 6px; align-items: center;`
  ),
  rule(['psr-src'], 'grid-column: 4; justify-self: end;'),
  rule(['psr-just'], 'grid-column: 2 / -1;'),
  // Titre du parti : 30 px en mobile (StyleSheet), 28 px dans le rail de 296 px.
  rule(['party-name'], 'font-size: 28px; line-height: 33px;'),
  '}',

  `@media (min-width: ${bp.lg}px) {`,
  rule(['only-below-lg'], 'display: none;'),
  rule(['only-from-lg'], 'display: flex;'),
  rule(
    ['container'],
    `max-width: ${container + gutter.lg * 2}px; padding-left: ${gutter.lg}px; padding-right: ${gutter.lg}px;`
  ),
  rule(
    ['rail-layout'],
    `display: grid; grid-template-columns: ${rail.lg}px minmax(0, 1fr); column-gap: ${railGap.lg}px; align-items: start;`
  ),
  rule(['rail'], `position: sticky; top: ${railTop}px;`),
  rule(['main'], `max-width: ${main.lg}px;`),
  rule(['list-col'], `max-width: ${main.xl}px;`),
  rule(['grid-3'], 'grid-template-columns: repeat(3, minmax(0, 1fr));'),
  rule(
    ['grid-3-lg'],
    'display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;'
  ),
  rule(['cal-grid'], 'display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;'),
  rule(['hdr-slot'], 'min-height: 0;'),
  '}',

  `@media (min-width: ${bp.xl}px) {`,
  rule(
    ['rail-layout'],
    `grid-template-columns: ${rail.xl}px minmax(0, ${main.xl}px); column-gap: ${railGap.xl}px;`
  ),
  rule(['main'], `max-width: ${main.xl}px;`),
  // Carte des résultats : légende à côté du tracé (728 px utiles dans la colonne de 768 px).
  rule(['map-layout'], 'flex-direction: row; align-items: flex-start; gap: 28px;'),
  '}',
].join('\n');
