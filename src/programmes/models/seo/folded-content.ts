import type { Catalog } from '@/src/programmes/models/programme.model';
import { STANCE_LEGEND_TEXT } from '@/src/programmes/models/reading-guides.copy';

const PRESIDENTIAL = 'presidentielle-2027';

/** Longueur du fragment recherché : assez long pour être unique, assez court pour éviter les balises. */
const SNIPPET_LENGTH = 70;

const snippet = (text: string): string => text.replace(/^[-•*]\s+/, '').slice(0, SNIPPET_LENGTH);

/**
 * Fragments de contenu replié (« En savoir plus », détail d'un thème de programme) que le HTML
 * exporté doit contenir : replié ne veut pas dire absent (le texte reste dans la page, masqué).
 * Un fragment par page concernée ; `[]` pour les autres pages.
 */
export function foldedSnippets(catalog: Catalog, path: string): string[] {
  const guide = /^\/comprendre\/([^/]+)$/.exec(path);
  if (guide) {
    const more = catalog.guide
      .find((s) => s.id === guide[1])
      ?.blocks.flatMap((b) => b.more ?? [])[0];
    return more ? [snippet(more)] : [];
  }
  const debate = /^\/debats\/([^/]+)$/.exec(path);
  if (debate) {
    const more = catalog.themes.find((t) => t.id === debate[1])?.contextMore;
    return more ? [snippet(more)] : [];
  }
  const programme = /^\/partis\/([^/]+)\/programme-2027$/.exec(path);
  if (programme) {
    const candidacy = catalog.parties.find((p) => p.id === programme[1])?.candidacies[PRESIDENTIAL];
    const measure = Object.values(candidacy?.themes ?? {}).flatMap((t) => t.measures)[0];
    return measure ? [snippet(measure.text)] : [];
  }
  // Les textes des feuilles « Comment lire… » sont publiés ici, dans le HTML.
  if (path === '/methodologie') return [snippet(STANCE_LEGEND_TEXT)];
  return [];
}
