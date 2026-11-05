/**
 * Présentation d'un chiffre clé : la valeur en gros, la précision en dessous. Coupe au premier
 * « ( », « ; » ou « , soit ». Le texte publié ne change pas : c'est une présentation, pas une donnée.
 */
export function splitFigure(value: string): { headline: string; detail: string | null } {
  const text = value.trim();
  const cuts = [text.indexOf('('), text.indexOf(';'), text.indexOf(', soit')].filter((i) => i > 0);
  if (cuts.length === 0) return { headline: text, detail: null };
  const at = Math.min(...cuts);
  const headline = text.slice(0, at).trim();
  let rest = text.slice(at).trim();
  if (rest.startsWith('(') && rest.endsWith(')') && !rest.slice(1, -1).includes('(')) {
    rest = rest.slice(1, -1).trim();
  } else if (rest.startsWith(';') || rest.startsWith(',')) {
    rest = rest.slice(1).trim();
  }
  return { headline, detail: rest.length > 0 ? rest : null };
}
