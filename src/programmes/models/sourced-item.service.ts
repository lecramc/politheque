// Présentation des éléments « titre court + texte sourcé ». Aucune affirmation n'est réécrite.

/** Longueur maximale d'un titre rédigé (charte, règle de rédaction 10). */
export const TITLE_MAX_LENGTH = 60;

const normalizeSpaces = (s: string) => s.replace(/[\u00a0\u202f]/g, ' ');

/**
 * Corps affiché sous le titre : le texte intégral, sans le préfixe « {titre} : » quand il le répète
 * (les espaces insécables sont traités comme des espaces). La lettre suivante passe en capitale.
 */
export const bodyText = ({ title, text }: { title: string; text: string }): string => {
  const t = normalizeSpaces(title);
  const n = normalizeSpaces(text);
  const match = n.match(/^(.*?)\s*:\s+/);
  if (!match || match[1] !== t) return text;
  const rest = text.slice(match[0].length);
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};
