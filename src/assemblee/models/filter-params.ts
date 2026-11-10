import type { ScrutinFilters } from '@/src/assemblee/models/scrutin-filters';
import type { ScrutinCategory, ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

/** Filtres de la liste tels que l'adresse les porte (`?categorie=&resultat=&annee=&q=`). */
export type ListFilters = {
  categorie: ScrutinCategory | 'toutes';
  resultat: 'adopte' | 'rejete' | 'tous';
  /** Année civile (« 2025 »), qui borne la période du 1er janvier au 31 décembre. */
  annee: string | null;
  recherche: string;
};

type Query = Record<string, string | string[] | undefined>;

export const CATEGORIES: ScrutinCategory[] = [
  'texte',
  'article-unique',
  'censure',
  'declaration',
  'premiere-partie-budget',
  'resolution',
  'autre',
];

const first = (value: unknown): string | undefined => {
  const one = Array.isArray(value) ? value[0] : value;
  return typeof one === 'string' ? one : undefined;
};

export const parseFilterParams = (query: Query): ListFilters => {
  const categorie = first(query.categorie);
  const resultat = first(query.resultat);
  const annee = first(query.annee);
  return {
    categorie: CATEGORIES.includes(categorie as ScrutinCategory)
      ? (categorie as ScrutinCategory)
      : 'toutes',
    resultat: resultat === 'adopte' || resultat === 'rejete' ? resultat : 'tous',
    annee: annee && /^\d{4}$/.test(annee) ? annee : null,
    recherche: (first(query.q) ?? '').trim(),
  };
};

/** Seulement les filtres actifs : une adresse sans filtre reste `/assemblee`. */
export const filtersToParams = (filters: ListFilters): Record<string, string> => ({
  ...(filters.categorie !== 'toutes' ? { categorie: filters.categorie } : {}),
  ...(filters.resultat !== 'tous' ? { resultat: filters.resultat } : {}),
  ...(filters.annee ? { annee: filters.annee } : {}),
  ...(filters.recherche ? { q: filters.recherche } : {}),
});

/** Du formulaire de filtres aux critères du modèle pur de filtrage. */
export const toScrutinFilters = (filters: ListFilters): ScrutinFilters => ({
  categorie: filters.categorie,
  resultat: filters.resultat,
  recherche: filters.recherche,
  ...(filters.annee ? { du: `${filters.annee}-01-01`, au: `${filters.annee}-12-31` } : {}),
});

export const yearsOf = (scrutins: ScrutinSummary[]): string[] =>
  [...new Set(scrutins.map((s) => s.date.slice(0, 4)))].sort();
