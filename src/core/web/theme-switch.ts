/* global window */
/** Posé sur `<html>` le temps d'un changement de thème : coupe les transitions (voir webTheme). */
export const THEME_SWITCH_ATTRIBUTE = 'data-theme-switching';

/**
 * Pendant un changement de thème, aucune transition : sans cela, les zones cliquables (fond et
 * bordure en transition) restaient claires après le reste de la page. `!important` : certaines
 * transitions sont en ligne (réponses du questionnaire).
 */
export const themeSwitchCss = `:root[${THEME_SWITCH_ATTRIBUTE}] *,:root[${THEME_SWITCH_ATTRIBUTE}] *::before,:root[${THEME_SWITCH_ATTRIBUTE}] *::after{transition:none!important}`;

type ThemeSwitchWindow = Pick<Window, 'matchMedia' | 'requestAnimationFrame' | 'document'>;

/**
 * Web : quand la préférence système change (clair ↔ sombre), les variables CSS changent d'un coup,
 * mais les fonds en transition (rubrique active, pastille 2027, onglet actif) mettaient 160 ms de
 * plus à suivre, en passant par des teintes claires. L'attribut posé dans l'écouteur (exécuté avant
 * le recalcul des styles de la même image) coupe les transitions le temps de deux images.
 * Renvoie la fonction de désinscription.
 */
export const guardThemeSwitch = (
  win: ThemeSwitchWindow | undefined = typeof window === 'undefined' ? undefined : window
): (() => void) => {
  // Natif : pas de `matchMedia`, rien à faire.
  if (!win?.matchMedia) return () => undefined;
  const query = win.matchMedia('(prefers-color-scheme: dark)');
  const root = win.document.documentElement;
  const onChange = () => {
    root.setAttribute(THEME_SWITCH_ATTRIBUTE, '');
    win.requestAnimationFrame(() =>
      win.requestAnimationFrame(() => root.removeAttribute(THEME_SWITCH_ATTRIBUTE))
    );
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};
