import {
  expectedDeadline,
  followUps,
  NEXT_STEP_GRACE_DAYS,
  renderFollowUpBlock,
  replaceMarkedBlock,
} from '@/src/programmes/models/legal/legal-followup';
import {
  legalDossierFactory,
  legalEntryFactory,
  pressSource,
} from '@/src/programmes/models/legal/legal.factory';
import type { LegalEntry } from '@/src/programmes/models/legal/legal.model';

const withNext = (expected: string, over: Partial<LegalEntry> = {}) =>
  legalEntryFactory({
    nextStep: {
      label: 'Décision de la Cour de cassation',
      expected,
      precision: 'au-plus-tard',
      sources: [pressSource()],
    },
    ...over,
  });
const follow = (entries: LegalEntry[], today: string) =>
  followUps([legalDossierFactory({ entries })], today);

describe('Feature: suivi des échéances judiciaires', () => {
  it('should treat a month-precision date as due at the end of that month', () => {
    expect(expectedDeadline('2027-04')).toBe('2027-04-30');
    expect(expectedDeadline('2027-02')).toBe('2027-02-28');
    expect(expectedDeadline('2027')).toBe('2027-12-31');
    expect(expectedDeadline('2027-04-12')).toBe('2027-04-12');
  });

  it('should list next steps due within 30 days', () => {
    const entry = withNext('2026-11-20');
    expect(follow([entry], '2026-11-04')).toMatchObject([
      { kind: 'a-venir', entryId: entry.id, partyId: 'parti-test', date: '2026-11-20' },
    ]);
    expect(follow([withNext('2027-04')], '2026-11-04')).toEqual([]);
    expect(follow([withNext('2026-12-04')], '2026-11-04')).toHaveLength(1);
    expect(follow([withNext('2026-12-05')], '2026-11-04')).toEqual([]);
  });

  it('should flag next steps overdue beyond the grace period', () => {
    expect(NEXT_STEP_GRACE_DAYS).toBe(10);
    // Échéance au 30 avril : dépassée à partir du 11 mai.
    const entry = withNext('2027-04', { lastVerified: '2027-04-01' });
    expect(follow([entry], '2027-05-10').map((f) => f.kind)).toEqual(['a-venir']);
    expect(follow([entry], '2027-05-11').map((f) => f.kind)).toEqual(['depassee']);
  });

  it('should flag non-final entries not verified for more than 90 days', () => {
    const stale = legalEntryFactory({ lastVerified: '2026-01-01' });
    expect(follow([stale], '2026-04-01').map((f) => f.kind)).toEqual([]);
    expect(follow([stale], '2026-04-02').map((f) => f.kind)).toEqual(['a-reverifier']);
    const finalized = legalEntryFactory({ status: 'non-lieu', lastVerified: '2026-01-01' });
    expect(follow([finalized], '2026-11-04')).toEqual([]);
  });

  it('should replace the marked block of a-verifier.md and keep the rest intact', () => {
    const doc = 'Avant\n\n<!-- echeances:start -->\nancien\n<!-- echeances:end -->\n\nAprès\n';
    const out = replaceMarkedBlock(doc, 'nouveau');
    expect(out).toBe(
      'Avant\n\n<!-- echeances:start -->\nnouveau\n<!-- echeances:end -->\n\nAprès\n'
    );
    expect(replaceMarkedBlock(out, 'nouveau')).toBe(out);
    const appended = replaceMarkedBlock('Texte sans marqueurs\n', 'bloc');
    expect(appended.startsWith('Texte sans marqueurs\n')).toBe(true);
    expect(appended).toContain('<!-- echeances:start -->\nbloc\n<!-- echeances:end -->');
  });

  it('should render a readable markdown block, including the empty case', () => {
    const items = follow([withNext('2026-11-20')], '2026-11-04');
    const block = renderFollowUpBlock(items, '2026-11-04');
    expect(block).toContain('4 novembre 2026');
    expect(block).toContain('parti-test');
    expect(block).toContain('20 novembre 2026');
    expect(renderFollowUpBlock([], '2026-11-04')).toContain('Aucune échéance');
  });
});
