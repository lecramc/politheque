import { stancesByTheme } from '@/src/programmes/models/stances-by-theme.service';

const themes = [
  { id: 'economie', title: 'Économie' },
  { id: 'immigration', title: 'Immigration' },
  { id: 'ecologie', title: 'Écologie' },
] as const;

const q = (id: string, theme: string) => ({ question: { id, theme }, stance: null });

describe('Feature: positions regroupées par thème', () => {
  it('should group stances under their theme, in the order of the themes list', () => {
    const groups = stancesByTheme(
      [q('q1', 'ecologie'), q('q2', 'economie'), q('q3', 'immigration'), q('q4', 'economie')],
      [...themes]
    );
    expect(groups.map((g) => g.theme.id)).toEqual(['economie', 'immigration', 'ecologie']);
    expect(groups[0].items.map((i) => i.question.id)).toEqual(['q2', 'q4']);
  });

  it('should keep the order of the questions inside a theme', () => {
    const groups = stancesByTheme([q('b', 'economie'), q('a', 'economie')], [...themes]);
    expect(groups[0].items.map((i) => i.question.id)).toEqual(['b', 'a']);
  });

  it('should skip themes without any question', () => {
    const groups = stancesByTheme([q('q1', 'economie')], [...themes]);
    expect(groups.map((g) => g.theme.id)).toEqual(['economie']);
  });

  it('should give the same group order whatever the party, whatever the stances', () => {
    const questions = [q('q1', 'ecologie'), q('q2', 'economie')];
    const withStance = questions.map((item) => ({ ...item, stance: { stance: 2 } }));
    const order = (items: typeof questions) =>
      stancesByTheme(items, [...themes]).map((g) => g.theme.id);
    expect(order(withStance as never)).toEqual(order(questions));
  });

  it('should not lose a question whose theme is unknown', () => {
    const groups = stancesByTheme([q('q1', 'economie'), q('q9', 'inconnu')], [...themes]);
    const ids = groups.flatMap((g) => g.items.map((i) => i.question.id));
    expect(ids).toEqual(['q1', 'q9']);
  });
});
