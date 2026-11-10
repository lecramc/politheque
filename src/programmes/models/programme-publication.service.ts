import type { Candidacy, Measure, Source, ThemeId } from '@/src/programmes/models/programme.model';

/** Même mention partout où les mesures d'un parti sont listées. */
export const NOT_PUBLISHED = 'Programme 2027 pas encore publié';
export const NOTHING_ON_THEME = 'Rien de publié sur ce thème dans le programme 2027';

/**
 * Ce que le site montre d'un thème du programme 2027 : des mesures, rien sur ce thème (programme
 * partiel), ou la mention « pas encore publié ». Règle éditoriale : seules des mesures tirées d'un
 * document officiel de campagne 2027 sont listées ; `non-publie` ne montre aucune mesure, quoi que
 * contiennent encore les données.
 */
export type ThemeProgramme =
  | { kind: 'mesures'; summary: string; measures: Measure[] }
  | { kind: 'rien' }
  | { kind: 'non-publie' };

export function themeProgramme(
  candidacy: Candidacy | undefined,
  themeId: ThemeId
): ThemeProgramme | null {
  if (!candidacy) return null;
  if (candidacy.programmeState === 'non-publie') return { kind: 'non-publie' };
  const programme = candidacy.themes[themeId];
  const measures = programme?.measures ?? [];
  if (measures.length === 0) return { kind: 'rien' };
  return { kind: 'mesures', summary: programme.summary, measures };
}

/** Mesures listables d'un thème (vide si le programme n'est pas publié ou sans mesure sur ce thème). */
export const themeMeasures = (candidacy: Candidacy | undefined, themeId: ThemeId): Measure[] => {
  const programme = themeProgramme(candidacy, themeId);
  return programme?.kind === 'mesures' ? programme.measures : [];
};

/** Sources de toutes les mesures listables d'une candidature. */
export const publishedMeasureSources = (
  candidacy: Candidacy | undefined,
  themeIds: readonly ThemeId[]
): Source[] =>
  themeIds.flatMap((id) => themeMeasures(candidacy, id).flatMap((measure) => measure.sources));

export type ProgrammeNotice = {
  state: 'non-publie' | 'partiel' | 'publie';
  /** « Programme 2027 pas encore publié » seulement quand aucun programme n'est publié. */
  title: string | null;
  text: string | null;
  sources: Source[];
};

/** Encart en tête de l'onglet Programme ; null quand il n'y a rien à dire (publié, sans texte). */
export function programmeNotice(candidacy: Candidacy): ProgrammeNotice | null {
  const publication = candidacy.programmePublication;
  const state = candidacy.programmeState;
  if (state === 'non-publie') {
    return {
      state,
      title: NOT_PUBLISHED,
      text: publication?.text ?? null,
      sources: publication?.sources ?? [],
    };
  }
  if (!publication) return null;
  return { state, title: null, text: publication.text, sources: publication.sources };
}
