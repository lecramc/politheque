import { normalizeTitle } from '@/src/assemblee/models/extraction/normalize';
import type { ScrutinCategory, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

export type ScrutinFilters = {
  categorie?: ScrutinCategory | 'toutes';
  resultat?: 'adopte' | 'rejete' | 'tous';
  /** Période, bornes incluses (ISO 8601). */
  du?: string;
  au?: string;
  /** Recherche dans le titre officiel. */
  recherche?: string;
};

export type ScrutinMonth = { mois: string; libelle: string; scrutins: ScrutinSummary[] };

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** Titre ou saisie réduits à des mots comparables : casse, accents et apostrophes ignorés. */
const searchable = (text: string) => normalizeTitle(text).normalize('NFD').replace(/\p{M}/gu, '');

/** Du plus récent au plus ancien ; à date égale, le numéro le plus élevé d'abord. */
export const sortByMostRecent = (scrutins: ScrutinSummary[]): ScrutinSummary[] =>
  [...scrutins].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.numero - a.numero));

export const filterScrutins = (
  scrutins: ScrutinSummary[],
  filters: ScrutinFilters
): ScrutinSummary[] => {
  const words = searchable(filters.recherche ?? '')
    .split(' ')
    .filter(Boolean);
  return scrutins.filter((s) => {
    if (filters.categorie && filters.categorie !== 'toutes' && s.categorie !== filters.categorie) {
      return false;
    }
    if (filters.resultat === 'adopte' && !s.adopte) return false;
    if (filters.resultat === 'rejete' && s.adopte) return false;
    if (filters.du && s.date < filters.du) return false;
    if (filters.au && s.date > filters.au) return false;
    if (words.length > 0) {
      const title = searchable(s.titre);
      if (!words.every((word) => title.includes(word))) return false;
    }
    return true;
  });
};

/** Regroupe une liste déjà triée par mois, en conservant son ordre. */
export const groupByMonth = (scrutins: ScrutinSummary[]): ScrutinMonth[] => {
  const months: ScrutinMonth[] = [];
  for (const s of scrutins) {
    const mois = s.date.slice(0, 7);
    const last = months[months.length - 1];
    if (last && last.mois === mois) {
      last.scrutins.push(s);
    } else {
      months.push({
        mois,
        libelle: `${MONTHS[Number(mois.slice(5, 7)) - 1]} ${mois.slice(0, 4)}`,
        scrutins: [s],
      });
    }
  }
  return months;
};
