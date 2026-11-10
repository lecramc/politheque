import type { Candidacy, Measure, Source, ThemeId } from '@/src/programmes/models/programme.model';
import { partyHref } from '@/src/programmes/models/seo/party-sections';

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
  /** `notice` : la mention à afficher telle quelle, identique pour tous les partis. */
  | { kind: 'rien'; notice: string }
  | { kind: 'non-publie'; notice: string };

export function themeProgramme(
  candidacy: Candidacy | undefined,
  themeId: ThemeId
): ThemeProgramme | null {
  if (!candidacy) return null;
  if (candidacy.programmeState === 'non-publie')
    return { kind: 'non-publie', notice: NOT_PUBLISHED };
  const programme = candidacy.themes[themeId];
  const measures = programme?.measures ?? [];
  if (measures.length === 0) return { kind: 'rien', notice: NOTHING_ON_THEME };
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
  /** Toujours un titre : « Programme 2027 pas encore publié », « … publié en partie », « … publié ». */
  title: string;
  /** Une ligne ; le seul comptage est celui des thèmes du site (jamais le découpage du parti). */
  text: string | null;
  /** Détail de la publication (livrets, dates…), à replier ; seulement pour un programme partiel. */
  detail: string | null;
  sources: Source[];
  /** Programme pas encore publié : renvoi vers l'onglet Positions, pour ne pas laisser une page vide. */
  positionsLink: { label: string; href: string } | null;
};

const TITLES: Record<ProgrammeNotice['state'], string> = {
  'non-publie': NOT_PUBLISHED,
  partiel: 'Programme 2027 publié en partie',
  publie: 'Programme 2027 publié',
};

const themesCovered = (candidacy: Candidacy, themeIds: readonly ThemeId[]) => {
  const covered = themeIds.filter((id) => themeMeasures(candidacy, id).length > 0).length;
  return `Ses propositions sont recensées dans ${covered} ${covered > 1 ? 'thèmes' : 'thème'} sur ${themeIds.length}.`;
};

/** Carte d'état en tête de l'onglet Programme : même gabarit (titre, ligne, sources) dans les trois états. */
export function programmeNotice(
  candidacy: Candidacy,
  { partyId, themeIds }: { partyId: string; themeIds: readonly ThemeId[] }
): ProgrammeNotice {
  const state = candidacy.programmeState;
  const publication = candidacy.programmePublication;
  const sources = publication?.sources ?? [];
  const title = TITLES[state];
  if (state === 'non-publie') {
    return {
      state,
      title,
      text: publication?.text ?? null,
      detail: null,
      sources,
      positionsLink: {
        label: 'En attendant, voir ses positions →',
        href: partyHref(partyId, 'positions'),
      },
    };
  }
  const count = themesCovered(candidacy, themeIds);
  if (state === 'partiel') {
    return {
      state,
      title,
      text: `Le parti a publié une partie de son programme. ${count}`,
      detail: publication?.text ?? null,
      sources,
      positionsLink: null,
    };
  }
  return {
    state,
    title,
    text: [publication?.text, count].filter(Boolean).join(' '),
    detail: null,
    sources,
    positionsLink: null,
  };
}
