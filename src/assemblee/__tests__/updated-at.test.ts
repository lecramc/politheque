import { resolveUpdatedAt } from '@/src/assemblee/models/extraction/updated-at';

describe('Feature: date de mise à jour d’un scrutin', () => {
  it('should keep updatedAt when the content hash is unchanged', () => {
    expect(
      resolveUpdatedAt({
        previous: { hash: 'abc', updatedAt: '2026-11-03' },
        hash: 'abc',
        extractedOn: '2026-11-10',
      })
    ).toBe('2026-11-03');
  });

  it('should use the extraction date when the content changed', () => {
    expect(
      resolveUpdatedAt({
        previous: { hash: 'abc', updatedAt: '2026-11-03' },
        hash: 'def',
        extractedOn: '2026-11-10',
      })
    ).toBe('2026-11-10');
  });

  it('should use the extraction date for a new scrutin', () => {
    expect(resolveUpdatedAt({ previous: undefined, hash: 'abc', extractedOn: '2026-11-10' })).toBe(
      '2026-11-10'
    );
  });
});
