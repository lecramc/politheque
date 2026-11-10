import { buildStaticIndex } from '@/src/assemblee/gateways/static-assemblee.gateway';
import { t } from '@/src/assemblee/i18n/translate';
import { assembleeFoldedSnippets } from '@/src/assemblee/models/seo/assemblee-folded-content';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { themeMeasures } from '@/src/programmes/models/programme-publication.service';
import type { Candidacy, Catalog, ThemeId } from '@/src/programmes/models/programme.model';
import { STANCE_LEGEND_TEXT } from '@/src/programmes/models/reading-guides.copy';

const PRESIDENTIAL = 'presidentielle-2027';

const themeIds = (candidacy: Candidacy | undefined) =>
  Object.keys(candidacy?.themes ?? {}) as ThemeId[];

/** Longueur du fragment recherché : assez long pour être unique, assez court pour éviter les balises. */
const SNIPPET_LENGTH = 70;

const snippet = (text: string): string => text.replace(/^[-•*]\s+/, '').slice(0, SNIPPET_LENGTH);

/**
 * Fragments de contenu replié (« En savoir plus », détail d'un thème de programme) que le HTML
 * exporté doit contenir : replié ne veut pas dire absent (le texte reste dans la page, masqué).
 * Un fragment par page concernée ; `[]` pour les autres pages.
 */
export function foldedSnippets(catalog: Catalog, path: string): string[] {
  // Avant le motif des leçons : `/comprendre/lexique` n'en est pas une.
  if (path === CONTENUS_2027_PATHS.lexicon) {
    const more = catalog.lexicon.flatMap((t) => t.more)[0];
    return more ? [snippet(more)] : [];
  }
  if (path === CONTENUS_2027_PATHS.faq) {
    const more = catalog.faq.flatMap((q) => q.more ?? [])[0];
    return more ? [snippet(more)] : [];
  }
  if (path === CONTENUS_2027_PATHS.voter) {
    const more = catalog.voter.sections.flatMap((s) => s.more ?? [])[0];
    return more ? [snippet(more)] : [];
  }
  if (path === CONTENUS_2027_PATHS.candidates) {
    const withdrawn = catalog.candidates.withdrawn[0];
    return withdrawn ? [snippet(withdrawn.summary)] : [];
  }
  // Assemblée : la liste porte l'avertissement « main levée », une page de scrutin son titre, sa
  // date, son résultat et son premier groupe (le détail par député, lui, se charge côté client).
  if (path === '/assemblee') return [t('list.warning')];
  const scrutin = /^\/assemblee\/scrutins\/(\d+)$/.exec(path);
  if (scrutin) {
    const index = buildStaticIndex();
    const found = index.scrutins.find((s) => String(s.numero) === scrutin[1]);
    return found ? assembleeFoldedSnippets(found, index.groupes) : [];
  }
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
    // Sans programme publié, le texte de publication tient lieu de contenu (aucune mesure listée).
    const published = themeIds(candidacy).flatMap((id) => themeMeasures(candidacy, id))[0];
    const text = published?.text ?? candidacy?.programmePublication?.text;
    return text ? [snippet(text)] : [];
  }
  // Les textes des feuilles « Comment lire… » sont publiés ici, dans le HTML.
  if (path === '/methodologie') return [snippet(STANCE_LEGEND_TEXT)];
  return [];
}
