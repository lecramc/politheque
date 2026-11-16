import { findRegressions } from '@/src/assemblee/models/extraction/regressions';

describe('Feature: garde-fou de la mise à jour automatique', () => {
  it('should report nothing when the dataset is stable or grows', () => {
    expect(
      findRegressions({
        before: { scrutins: 338, unplaced: 70 },
        after: { scrutins: 340, unplaced: 70 },
      })
    ).toEqual([]);
  });

  it('should report a regression when unplaced deputies increase', () => {
    const problems = findRegressions({
      before: { scrutins: 338, unplaced: 70 },
      after: { scrutins: 338, unplaced: 71 },
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('70');
    expect(problems[0]).toContain('71');
  });

  it('should report a regression when scrutins disappear', () => {
    const problems = findRegressions({
      before: { scrutins: 338, unplaced: 70 },
      after: { scrutins: 337, unplaced: 70 },
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('338');
    expect(problems[0]).toContain('337');
  });

  it('should report both regressions at once', () => {
    expect(
      findRegressions({
        before: { scrutins: 338, unplaced: 70 },
        after: { scrutins: 300, unplaced: 90 },
      })
    ).toHaveLength(2);
  });
});
