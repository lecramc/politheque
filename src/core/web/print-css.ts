/**
 * Feuille d'impression (« Télécharger en PDF / imprimer » = `window.print()`), sans bibliothèque.
 * Crochets `data-tv` posés avec `tv()` :
 * - `print-only`   : bloc invisible à l'écran, seul visible à l'impression (vue récapitulative) ;
 * - `no-print`     : masqué à l'impression (navigation, bandeaux, pied de page, contenu à l'écran) ;
 * - `print-avoid`  : bloc qu'on évite de couper entre deux feuilles ;
 * - `print-flow`   : zone de défilement qui doit s'étendre sur plusieurs feuilles.
 * Même règle de spécificité que `layout-css.ts` : préfixe `:root`, jamais `!important`.
 */
const sel = (name: string) => `:root [data-tv~="${name}"]`;

export const printCss: string = [
  '/* Polithèque : impression */',
  `${sel('print-only')} {\n  display: none;\n}`,
  '@media print {',
  '@page {\n  margin: 14mm;\n}',
  // Le document RN-web est une colonne de 100 % de hauteur, rognée : on la laisse s'écouler.
  'html, body, #root {\n  height: auto;\n  overflow: visible;\n  display: block;\n}',
  `${sel('print-only')} {\n  display: block;\n}`,
  `${sel('no-print')} {\n  display: none;\n}`,
  `${sel('print-flow')} {\n  display: block;\n  position: static;\n  height: auto;\n  overflow: visible;\n}`,
  `${sel('rail')} {\n  display: none;\n}`,
  `${sel('rail-layout')} {\n  display: block;\n}`,
  `${sel('main')} {\n  max-width: none;\n}`,
  `${sel('container')} {\n  max-width: none;\n  padding-left: 0;\n  padding-right: 0;\n}`,
  `${sel('print-avoid')} {\n  break-inside: avoid;\n}`,
  // Encre sur papier, quel que soit le thème de l'écran.
  `${sel('print-only')},\n:root [data-tv~="print-only"] * {\n  color: #111111;\n}`,
  '}',
].join('\n');
