import { splitIdeals } from '@/src/programmes/models/ideals.service';

const ideal = (title: string) => ({ title, text: '', sources: [] });

describe('Feature: séparation des idéaux et des classements', () => {
  it('should put « Classement… » and « Nuancier… » ideals apart, keeping order', () => {
    const ideals = [
      ideal('Ce que disent ses statuts'),
      ideal('Classement par la presse'),
      ideal('Thèmes mis en avant'),
      ideal("Nuancier du ministère de l'Intérieur"),
    ];
    const { classification, others } = splitIdeals(ideals);
    expect(classification.map((i) => i.title)).toEqual([
      'Classement par la presse',
      "Nuancier du ministère de l'Intérieur",
    ]);
    expect(others.map((i) => i.title)).toEqual([
      'Ce que disent ses statuts',
      'Thèmes mis en avant',
    ]);
  });

  it('should return empty lists when there are no ideals', () => {
    expect(splitIdeals([])).toEqual({ classification: [], others: [] });
  });
});
