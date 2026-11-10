import { normalizeTitle } from '@/src/assemblee/models/extraction/normalize';
import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

/** Constitution du 4 octobre 1958, article 49 (texte en vigueur sur le site du Conseil constitutionnel). */
export const ARTICLE_49_SOURCE_URL =
  'https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur';

/** Motion de censure déposée au titre de l'article 49, alinéa 3 : détectée dans le titre officiel. */
export const isArticle493Motion = (scrutin: Pick<ScrutinSummary, 'type' | 'titre'>): boolean =>
  scrutin.type === 'MOC' && /article 49, alinéa 3\b/.test(normalizeTitle(scrutin.titre));

/** La note sur l'article 49, alinéa 3, accompagne les motions de l'alinéa 3 et les votes sur une partie de loi financière. */
export const needsArticle493Note = (
  scrutin: Pick<ScrutinSummary, 'type' | 'titre' | 'categorie'>
): boolean => isArticle493Motion(scrutin) || scrutin.categorie === 'partie-budget';

/**
 * Motions de l'alinéa 3 rattachées au même dossier législatif officiel que le vote sur une partie
 * de loi financière. Aucun rapprochement par date : sans dossier commun, rien n'est affirmé.
 */
export const censureMotionsOnSameText = (
  scrutin: ScrutinSummary,
  all: ScrutinSummary[]
): ScrutinSummary[] =>
  scrutin.categorie === 'partie-budget' && scrutin.dossier
    ? all.filter(
        (other) => isArticle493Motion(other) && other.dossier?.uid === scrutin.dossier?.uid
      )
    : [];
