import { isAggregator } from '@/src/programmes/models/aggregators';
import type {
  KeyIdea,
  Measure,
  MeasureRef,
  Party,
  Question,
  Source,
  SourceKind,
  ThemeId,
} from '@/src/programmes/models/programme.model';
import { verificationLevel } from '@/src/programmes/models/verification.service';

const resolveMeasure = (party: Party, electionId: string, ref: MeasureRef): Measure | undefined => {
  const [themeId, index] = ref.split('.');
  const themes = party.candidacies[electionId]?.themes as
    | Record<string, { measures: Measure[] }>
    | undefined;
  return themes?.[themeId]?.measures[Number(index)];
};

/** Sources des seules mesures référencées : ce que l'idée « dit », par opposition à ce qui la recoupe. */
export const keyIdeaMeasureSources = (party: Party, electionId: string, idea: KeyIdea): Source[] =>
  idea.measureRefs.flatMap((ref) => resolveMeasure(party, electionId, ref)?.sources ?? []);

/**
 * Sources d'une idée : celles de ses mesures, puis celles des positions de ses questions liées
 * pour ce parti, dédoublonnées par URL. Rien n'est ajouté à la fiche : tout est déjà dans les données.
 */
export const keyIdeaSources = (party: Party, electionId: string, idea: KeyIdea): Source[] => {
  const all = [
    ...keyIdeaMeasureSources(party, electionId, idea),
    ...idea.relatedQuestionIds.flatMap((id) => party.stances[id]?.sources ?? []),
  ];
  return [...new Map(all.map((source) => [source.url, source])).values()];
};

/** Hiérarchie de la charte (règle 2), de la plus forte à la plus faible. */
const KIND_STRENGTH: SourceKind[] = [
  'programme',
  'vote',
  'proposition-de-loi',
  'declaration',
  'presse',
  'statistique',
  'justice',
];

/** Origine affichée : la source la plus forte, puis la plus récente. Ne réécrit pas l'âge d'une source. */
export const keyIdeaOrigin = (sources: Source[]): { kind: SourceKind; date: string } => {
  const [best] = [...sources].sort(
    (a, b) =>
      KIND_STRENGTH.indexOf(a.kind) - KIND_STRENGTH.indexOf(b.kind) || b.date.localeCompare(a.date)
  );
  return { kind: best.kind, date: best.date };
};

/**
 * Règle de la charte (règle 11) : au moins 2 sources de domaines enregistrables distincts, dont
 * une indépendante du parti — le niveau « recoupée » du service de vérification. Les agrégateurs
 * restent affichés s'ils sont dans les données, mais ne comptent pas (charte, règle 7).
 */
export const isKeyIdeaVerified = (party: Party, electionId: string, idea: KeyIdea): boolean =>
  verificationLevel(
    keyIdeaSources(party, electionId, idea).filter((source) => !isAggregator(source.url))
  ) === 'croisee';

export const keyIdeaTheme = (idea: KeyIdea): ThemeId =>
  idea.measureRefs[0].split('.')[0] as ThemeId;

/** Ordre fixe des thèmes du site, identique pour tous les partis : l'ordre ne dit rien du parti. */
export const sortKeyIdeasByTheme = (ideas: KeyIdea[], themeOrder: readonly ThemeId[]): KeyIdea[] =>
  [...ideas].sort(
    (a, b) => themeOrder.indexOf(keyIdeaTheme(a)) - themeOrder.indexOf(keyIdeaTheme(b))
  );

/**
 * Les grandes questions : pour chaque thème, dans l'ordre des questions, la première à laquelle
 * les partis ont tous une position non nulle (au plus une par thème). Même liste pour tous.
 */
export const glanceQuestionIds = (questions: Question[], parties: Party[]): string[] => {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const question of questions) {
    if (seen.has(question.theme)) continue;
    if (parties.every((party) => party.stances[question.id]?.stance != null)) {
      seen.add(question.theme);
      ids.push(question.id);
    }
  }
  return ids;
};

/** Fiche suivante dans l'ordre alphabétique ; après la dernière, on revient à la première. */
export const nextPartyInJourney = (parties: Party[], currentId: string): Party => {
  const ordered = [...parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const index = ordered.findIndex((party) => party.id === currentId);
  return ordered[(index + 1) % ordered.length];
};

export const KEY_IDEAS_COUNT = 4;

const hasFourVerifiedIdeas = (party: Party, electionId: string) =>
  party.keyIdeas.length === KEY_IDEAS_COUNT &&
  new Set(party.keyIdeas.map(keyIdeaTheme)).size === KEY_IDEAS_COUNT &&
  party.keyIdeas.every((idea) => isKeyIdeaVerified(party, electionId, idea));

/**
 * Même gabarit, même nombre, même règle pour tous : « Ce qu'il propose » n'est affiché que si les
 * dix fiches ont chacune 4 idées de 4 thèmes différents, toutes recoupées. Sinon, pour aucune.
 */
export const hasKeyIdeasSection = (parties: Party[], electionId: string): boolean =>
  parties.length > 0 && parties.every((party) => hasFourVerifiedIdeas(party, electionId));
