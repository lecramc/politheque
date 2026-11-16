import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { Depute } from '@/src/assemblee/models/scrutin.model';

export type Departement = {
  /** Code officiel : « 59 », « 2A », « 971 », « 099 » (Français établis hors de France). */
  code: string;
  nom: string;
};

const collator = new Intl.Collator('fr', { sensitivity: 'base' });

/** Les départements (et collectivités) qui ont au moins un député, une fois chacun, par nom. */
export const departements = (deputes: Depute[]): Departement[] => {
  const byCode = new Map(deputes.map((x) => [x.numDepartement, x.departement]));
  return [...byCode]
    .map(([code, nom]) => ({ code, nom }))
    .sort((a, b) => collator.compare(a.nom, b.nom));
};

/** Minuscules, sans accents ni ponctuation : « Seine-Saint-Denis » et « seine saint denis » se valent. */
export const normalizeQuery = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Mots que l'on tape pour un territoire que son nom officiel ne dit pas. */
const ALIASES: Record<string, string> = { '099': 'francais de l etranger' };

const stripZeros = (code: string) => code.replace(/^0+(?=\d)/, '');

/** Les Français de l'étranger : « 099 » dans la source, « 999 » dans l'usage. */
const sameCode = (code: string, typed: string) =>
  stripZeros(code) === stripZeros(typed) || (code === '099' && typed === '999');

export const findDepartements = (list: Departement[], query: string): Departement[] => {
  const typed = normalizeQuery(query);
  if (typed === '') return [];
  if (/^[0-9][0-9a-z]*$/.test(typed) && /\d/.test(typed)) {
    return list.filter((x) => sameCode(normalizeQuery(x.code), typed));
  }
  const words = typed.split(' ');
  return list.filter((x) => {
    const haystack = normalizeQuery(`${x.nom} ${ALIASES[x.code] ?? ''}`);
    return words.every((w) => haystack.includes(w));
  });
};

export type CirconscriptionRow = {
  numero: number;
  label: string;
  deputeId: string | null;
  nom: string | null;
  vacant: boolean;
};

/** Les circonscriptions d'un département, dans l'ordre des numéros, avec le député en exercice. */
export const circonscriptionsOf = (deputes: Depute[], code: string): CirconscriptionRow[] => {
  const inDepartement = deputes.filter((x) => x.numDepartement === code);
  const numeros = [...new Set(inDepartement.map((x) => x.circonscription))].sort((a, b) => a - b);
  return numeros.map((numero) => {
    const sitting = inDepartement.find((x) => x.circonscription === numero && x.enExercice);
    return {
      numero,
      label: COPY.constituency.circonscription(numero),
      deputeId: sitting?.id ?? null,
      nom: sitting ? `${sitting.prenom} ${sitting.nom}` : null,
      vacant: !sitting,
    };
  });
};

export type DepartementChoice = { code: string; label: string };

/** La liste des départements n'est pas affichée d'office (107 lignes) : dès qu'on tape, ou sur demande. */
export const departementChoices = (list: Departement[], query: string, requested: boolean) => {
  const visible = requested || normalizeQuery(query) !== '';
  const found = normalizeQuery(query) === '' ? list : findDepartements(list, query);
  return {
    visible,
    items: visible
      ? found.map(
          (x): DepartementChoice => ({
            code: x.code,
            label: COPY.constituency.label(x.nom, x.code),
          })
        )
      : [],
    showAllLabel: COPY.constituency.showAll(list.length),
  };
};
