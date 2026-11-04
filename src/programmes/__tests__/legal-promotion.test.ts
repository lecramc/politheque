import { promoteDraft, type DraftReview } from '@/src/programmes/models/legal/legal-promotion';
import { legalEntryFactory, legalStepFactory } from '@/src/programmes/models/legal/legal.factory';
import type { LegalEntry } from '@/src/programmes/models/legal/legal.model';

const ctx = { today: '2026-11-04', partyIds: ['parti-test'] };
const retained: DraftReview = { decision: 'retenu' };

const draftEntry = (over: Partial<LegalEntry> = {}, review: DraftReview = retained) => ({
  ...legalEntryFactory(over),
  review,
});
const draft = (overrides: Record<string, unknown> = {}) => ({
  partyId: 'parti-test',
  reviewedOn: '2026-11-03',
  crossCheck: { by: 'XY', on: '2026-11-03' },
  humanValidation: { by: 'ZW', on: '2026-11-04' },
  entries: [draftEntry()],
  ...overrides,
});

describe('Feature: promotion d’un dossier validé', () => {
  it('should refuse a draft without cross-check or human validation', () => {
    for (const missing of ['crossCheck', 'humanValidation']) {
      const result = promoteDraft(draft({ [missing]: null }), ctx);
      expect(result.ok, missing).toBe(false);
      if (!result.ok) expect(result.errors.join()).toContain(missing);
    }
  });

  it('should drop non-retenu entries and report them', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry({ id: 'garde' }),
          draftEntry(
            { id: 'ecartee' },
            { decision: 'non-retenu', reason: 'Une seule source solide.' }
          ),
        ],
      }),
      ctx
    );
    expect(result).toMatchObject({
      ok: true,
      dropped: [{ id: 'ecartee', reason: 'Une seule source solide.' }],
    });
    if (result.ok) expect(result.dossier.entries.map((e) => e.id)).toEqual(['garde']);
  });

  it('should refuse a cas-limite entry without explicit human validation', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            { id: 'limite' },
            { decision: 'cas-limite', reason: 'Condamnation amnistiée.' }
          ),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join()).toContain('limite');
  });

  it('should publish a validated cas-limite entry without its review metadata', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            { id: 'limite' },
            {
              decision: 'cas-limite',
              reason: 'Fait sans lien direct avec la fonction.',
              humanValidation: { by: 'ZW', on: '2026-11-04' },
            }
          ),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dossier.entries[0]).not.toHaveProperty('review');
      expect(result.dossier.entries[0].id).toBe('limite');
    }
  });

  it('should never copy reviewer names into the published dossier', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            {},
            {
              decision: 'cas-limite',
              reason: 'Raison.',
              humanValidation: { by: 'Reviewer Name', on: '2026-11-04' },
            }
          ),
        ],
        crossCheck: { by: 'Cross Checker', on: '2026-11-03' },
        humanValidation: { by: 'Human Validator', on: '2026-11-04' },
        notes: 'note interne',
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    const json = JSON.stringify(result.ok ? result.dossier : null);
    for (const leaked of ['Reviewer Name', 'Cross Checker', 'Human Validator', 'note interne'])
      expect(json).not.toContain(leaked);
    if (result.ok)
      expect(Object.keys(result.dossier)).toEqual(['partyId', 'reviewedOn', 'entries']);
  });

  it('should refuse a draft whose entries fail validation, listing every issue', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry({ id: 'a', steps: [legalStepFactory({ sources: [] })] }),
          draftEntry({ id: 'b', caseName: 'Un scandale' }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('a') && e.includes('sources'))).toBe(true);
      expect(result.errors.some((e) => e.includes('b') && e.includes('vocabulaire'))).toBe(true);
    }
  });

  it('should be deterministic (same draft, same output), sorted by entry id', () => {
    const entries = [draftEntry({ id: 'zz' }), draftEntry({ id: 'aa' })];
    const first = promoteDraft(draft({ entries }), ctx);
    const second = promoteDraft(draft({ entries: [...entries].reverse() }), ctx);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    if (first.ok) expect(first.dossier.entries.map((e) => e.id)).toEqual(['aa', 'zz']);
  });
});
