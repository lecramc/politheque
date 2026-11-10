import { isAggregator } from '@/src/programmes/models/aggregators';
import type {
  KeyIdea,
  Measure,
  MeasureRef,
  Party,
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
  'politiste',
  'encyclopedie',
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

/**
 * Thème d'une idée : celui de sa première mesure ; sans mesure (programme 2027 non publié), celui de
 * sa première question liée.
 */
export const keyIdeaTheme = (
  idea: KeyIdea,
  questions: readonly { id: string; theme: ThemeId }[] = []
): ThemeId =>
  (idea.measureRefs[0]?.split('.')[0] as ThemeId | undefined) ??
  questions.find((q) => q.id === idea.relatedQuestionIds[0])!.theme;

/** Ordre fixe des thèmes du site, identique pour tous les partis : l'ordre ne dit rien du parti. */
export const sortKeyIdeasByTheme = (
  ideas: KeyIdea[],
  themeOrder: readonly ThemeId[],
  questions: readonly { id: string; theme: ThemeId }[] = []
): KeyIdea[] =>
  [...ideas].sort(
    (a, b) =>
      themeOrder.indexOf(keyIdeaTheme(a, questions)) -
      themeOrder.indexOf(keyIdeaTheme(b, questions))
  );

/** Fiche suivante dans l'ordre alphabétique ; après la dernière, on revient à la première. */
export const nextPartyInJourney = (parties: Party[], currentId: string): Party => {
  const ordered = [...parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const index = ordered.findIndex((party) => party.id === currentId);
  return ordered[(index + 1) % ordered.length];
};

export const KEY_IDEAS_COUNT = 4;

const hasFourVerifiedIdeas = (party: Party, electionId: string) =>
  party.keyIdeas.length === KEY_IDEAS_COUNT &&
  new Set(party.keyIdeas.map((idea) => keyIdeaTheme(idea))).size === KEY_IDEAS_COUNT &&
  party.keyIdeas.every((idea) => isKeyIdeaVerified(party, electionId, idea));

/**
 * Les idées clés se tirent des mesures du programme 2027 : un parti dont le programme n'est pas
 * encore publié n'en montre pas (sa fiche affiche « Programme 2027 pas encore publié » à la place).
 */
export const hasKeyIdeas = (party: Party, electionId: string): boolean =>
  party.candidacies[electionId]?.programmeState !== 'non-publie';

/**
 * Même gabarit, même règle pour tous : « Ce qu'il propose » n'est affiché que si chaque parti dont le
 * programme 2027 est publié (en tout ou partie) a 4 idées de 4 thèmes différents, toutes recoupées.
 * Sinon, pour aucun ; les partis sans programme publié montrent la mention à la place.
 */
export const hasKeyIdeasSection = (parties: Party[], electionId: string): boolean => {
  const concerned = parties.filter((party) => hasKeyIdeas(party, electionId));
  return (
    concerned.length > 0 && concerned.every((party) => hasFourVerifiedIdeas(party, electionId))
  );
};
