import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import {
  correctionId,
  groupByMonth,
  mergeCorrections,
  pageLabels,
  validateJournal,
} from '@/src/programmes/models/corrections/corrections.service';

const entry = (over: Partial<CorrectionEntry> = {}): CorrectionEntry => ({
  id: '2026-11-03-date-de-fondation-corrigee',
  date: '2026-11-03',
  kind: 'correction',
  pages: ['/partis/rn/histoire'],
  summary: 'Date de fondation corrigée : 5 octobre 1972 (et non 1973).',
  ...over,
});
const incoming = (summary: string, over = {}) => ({
  kind: 'ajout' as const,
  pages: ['/partis/rn'],
  summary,
  ...over,
});

describe('Feature: journal des corrections', () => {
  it('should build a stable readable id from date and summary', () => {
    expect(correctionId('2026-11-03', 'Candidature déclarée à l’élection : été 2026.', [])).toBe(
      '2026-11-03-candidature-declaree-a-l-election-ete-2026'
    );
    const long = correctionId('2026-11-03', 'a'.repeat(100), []);
    expect(long).toBe(`2026-11-03-${'a'.repeat(48)}`);
  });

  it('should suffix an id that collides on the same day', () => {
    const taken = ['2026-11-03-meme-resume'];
    expect(correctionId('2026-11-03', 'Même résumé', taken)).toBe('2026-11-03-meme-resume-2');
    expect(correctionId('2026-11-03', 'Même résumé', [...taken, '2026-11-03-meme-resume-2'])).toBe(
      '2026-11-03-meme-resume-3'
    );
  });

  it('should not duplicate an entry when the same message is processed twice', () => {
    const once = mergeCorrections(
      [],
      [incoming('Un ajout de fiche pour le parti X.')],
      '2026-11-04'
    );
    const twice = mergeCorrections(
      once,
      [incoming('Un ajout de fiche pour le parti X.')],
      '2026-11-05'
    );
    expect(twice).toEqual(once);
  });

  it('should never modify an existing entry when merging', () => {
    const existing = [entry()];
    const frozen = JSON.parse(JSON.stringify(existing)) as typeof existing;
    const merged = mergeCorrections(
      existing,
      [incoming('Un ajout de fiche pour le parti X.')],
      '2026-11-04'
    );
    expect(existing).toEqual(frozen);
    expect(merged.find((e) => e.id === existing[0].id)).toEqual(frozen[0]);
    expect(merged).toHaveLength(2);
  });

  it('should sort entries by date, most recent first, newest additions first within a day', () => {
    const merged = mergeCorrections(
      [entry({ id: 'b', date: '2026-11-05' }), entry({ id: 'a', date: '2026-11-03' })],
      [
        incoming('Premier ajout du jour pour le parti X.'),
        incoming('Second ajout du jour pour le parti X.'),
      ],
      '2026-11-05'
    );
    expect(merged.map((e) => e.date)).toEqual([
      '2026-11-05',
      '2026-11-05',
      '2026-11-05',
      '2026-11-03',
    ]);
    expect(merged.slice(0, 2).map((e) => e.summary)).toEqual([
      'Premier ajout du jour pour le parti X.',
      'Second ajout du jour pour le parti X.',
    ]);
    expect(merged[2].id).toBe('b');
  });

  it('should group entries by month with French month labels', () => {
    const groups = groupByMonth([
      entry({ id: 'a', date: '2026-12-02' }),
      entry({ id: 'b', date: '2026-11-30' }),
      entry({ id: 'c', date: '2026-11-03' }),
    ]);
    expect(groups.map((g) => g.label)).toEqual(['Décembre 2026', 'Novembre 2026']);
    expect(groups[1].entries.map((e) => e.id)).toEqual(['b', 'c']);
  });

  it('should label each page link with the last breadcrumb name of the page', () => {
    const labels = pageLabels([
      {
        path: '/partis/rn/histoire',
        breadcrumb: [
          { name: 'Accueil', path: '/' },
          { name: 'Rassemblement national', path: '/partis/rn' },
          { name: 'Histoire', path: '/partis/rn/histoire' },
        ],
      },
      { path: '/', breadcrumb: [] },
    ]);
    expect(labels['/partis/rn/histoire']).toBe('Histoire');
    expect(labels['/']).toBe('Accueil');
  });

  it('should reject a journal with duplicate ids, unsorted dates, a future date or an unknown page', () => {
    const ctx = { today: '2026-11-10', indexablePaths: ['/partis/rn/histoire'] };
    expect(validateJournal([entry()], ctx)).toEqual([]);
    expect(validateJournal([entry(), entry()], ctx).join()).toMatch(/identifiant/);
    expect(
      validateJournal(
        [entry({ id: 'a', date: '2026-11-03' }), entry({ id: 'b', date: '2026-11-04' })],
        ctx
      ).join()
    ).toMatch(/trié/);
    expect(validateJournal([entry({ date: '2026-11-11' })], ctx).join()).toMatch(/futur/);
    expect(validateJournal([entry({ pages: ['/nulle-part'] })], ctx).join()).toMatch(/page/);
    expect(validateJournal([entry({ date: '2026-10-01' })], ctx).join()).toMatch(/lancement/);
  });
});
