import type {
  Catalog,
  Party,
  PartyStance,
  PartyThemeProgramme,
  Question,
  Theme,
} from '@/src/programmes/models/programme.model';
import { stancesByTheme } from '@/src/programmes/models/stances-by-theme.service';

export type CompareQuestion = {
  question: Question;
  /** Dans l'ordre choisi : le premier parti à gauche. */
  stances: [PartyStance | null, PartyStance | null];
  /** Même position nette des deux côtés. Jamais comptée, jamais agrégée. */
  same: boolean;
};

export type CompareTheme = {
  theme: Theme;
  programmes: [PartyThemeProgramme | null, PartyThemeProgramme | null];
  questions: CompareQuestion[];
};

export type Comparison = {
  parties: [Party, Party];
  themes: CompareTheme[];
};

/**
 * Programme par thème et positions de deux partis, côte à côte. Les thèmes suivent l'ordre du
 * catalogue et les questions celui du questionnaire, quelle que soit la paire : aucune pondération,
 * aucun score, aucun classement, aucun nombre d'accords (charte, règle de neutralité).
 */
export function compareParties(catalog: Catalog, aId: string, bId: string): Comparison | null {
  const a = catalog.parties.find((p) => p.id === aId);
  const b = catalog.parties.find((p) => p.id === bId);
  if (!a || !b || a.id === b.id) return null;
  const election = catalog.elections.find((e) => e.featured);
  const programmeOf = (party: Party, theme: Theme) =>
    (election && party.candidacies[election.id]?.themes[theme.id]) || null;

  const rows = catalog.questions.map((question) => ({ question }));
  const groups = stancesByTheme(rows, catalog.themes);
  return {
    parties: [a, b],
    themes: groups
      .map((group) => group.theme)
      .map((theme) => ({
        theme,
        programmes: [programmeOf(a, theme), programmeOf(b, theme)] as CompareTheme['programmes'],
        questions: catalog.questions
          .filter((question) => question.theme === theme.id)
          .map((question) => {
            const sa = a.stances[question.id] ?? null;
            const sb = b.stances[question.id] ?? null;
            return {
              question,
              stances: [sa, sb] as CompareQuestion['stances'],
              same: sa?.stance != null && sa.stance === sb?.stance,
            };
          }),
      })),
  };
}

/**
 * Lit `?a=&b=` : seuls des partis connus et distincts sont retenus. Aucune paire par défaut :
 * sans paramètre valide, les deux sélecteurs sont vides (décision D11).
 */
export function parseCompareParams(
  params: { a?: string; b?: string },
  partyIds: readonly string[]
): [string | null, string | null] {
  const known = (id?: string) => (id && partyIds.includes(id) ? id : null);
  const a = known(params.a);
  const b = known(params.b);
  return [a, b && b !== a ? b : null];
}
