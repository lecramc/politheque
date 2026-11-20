import { positionsPreview } from '@/src/programmes/models/positions-preview.service';

const q = (id: string, theme: string) => ({ question: { id, theme }, stance: null });
const themes = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => ({ id, title: id }));

describe('Feature: aperçu des positions quand le programme n’est pas publié', () => {
  it('should take the first question of each of the first five themes, in theme order', () => {
    const items = [q('f1', 'f'), q('b2', 'b'), q('a1', 'a'), q('a2', 'a'), q('b1', 'b')].concat(
      ['c', 'd', 'e'].map((t) => q(`${t}1`, t))
    );
    const preview = positionsPreview(items, themes);
    expect(preview.items.map((i) => i.question.id)).toEqual(['a1', 'b2', 'c1', 'd1', 'e1']);
  });

  it('should skip themes without question and always state the rule', () => {
    const preview = positionsPreview([q('c1', 'c')], themes);
    expect(preview.items.map((i) => i.question.id)).toEqual(['c1']);
    expect(preview.rule).toMatch(/première question de chacun des 5 premiers thèmes/);
  });
});
