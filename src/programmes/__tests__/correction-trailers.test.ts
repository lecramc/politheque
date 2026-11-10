import {
  pagesForDataPath,
  parseCorrectionTrailers,
  resolveCorrections,
} from '@/src/programmes/models/corrections/correction-trailers';

const SUMMARY = 'Date de fondation du Front national corrigée : 5 octobre 1972 (et non 1973).';
const line = (type: string, pages: string, summary = SUMMARY) =>
  `Correction-publique: ${type} | ${pages} | ${summary}`;
const message = (...lines: string[]) => `fix: date de fondation\n\n${lines.join('\n')}\n`;

const INDEXABLE = [
  '/partis/rn',
  '/partis/rn/programme-2027',
  '/partis/rn/histoire',
  '/me-situer',
  '/comprendre',
];
const resolve = (msg: string, stagedFiles: string[] = []) =>
  resolveCorrections(msg, { stagedFiles, indexablePaths: INDEXABLE });

describe('Feature: lecture des trailers de correction', () => {
  it('should read one public correction with its type, pages and summary', () => {
    const parsed = parseCorrectionTrailers(message(line('correction', '/partis/rn/histoire')));
    expect(parsed.errors).toEqual([]);
    expect(parsed.corrections).toEqual([
      { kind: 'correction', pages: ['/partis/rn/histoire'], summary: SUMMARY },
    ]);
  });

  it('should read several corrections from the same message', () => {
    const parsed = parseCorrectionTrailers(
      message(
        line('correction', '/partis/rn/histoire, /partis/rn'),
        line(
          'mise-a-jour',
          'auto',
          'Candidature de Marine Tondelier : vote des adhérents du 13 décembre 2026.'
        )
      )
    );
    expect(parsed.corrections).toHaveLength(2);
    expect(parsed.corrections[0].pages).toEqual(['/partis/rn/histoire', '/partis/rn']);
    expect(parsed.corrections[1]).toMatchObject({ kind: 'mise-a-jour', pages: 'auto' });
  });

  it('should recognise the explicit opt-out « aucune »', () => {
    const parsed = parseCorrectionTrailers(message('Correction-publique: aucune'));
    expect(parsed).toEqual({ corrections: [], optOut: true, errors: [] });
  });

  it('should only read trailers at the start of a line', () => {
    const parsed = parseCorrectionTrailers(
      `fix: x\n\nvoir  Correction-publique: ${'correction'} | /partis/rn | ${SUMMARY}\n# ${line('ajout', '/partis/rn')}`
    );
    expect(parsed).toEqual({ corrections: [], optOut: false, errors: [] });
  });

  it('should reject an unknown type', () => {
    const parsed = parseCorrectionTrailers(message(line('modification', '/partis/rn')));
    expect(parsed.errors).toHaveLength(1);
    expect(parsed.errors[0]).toMatch(/type/i);
  });

  it('should reject a summary shorter than 20 or longer than 300 characters', () => {
    expect(
      parseCorrectionTrailers(message(line('ajout', '/partis/rn', 'Trop court.'))).errors
    ).toHaveLength(1);
    expect(
      parseCorrectionTrailers(message(line('ajout', '/partis/rn', 'a'.repeat(301)))).errors
    ).toHaveLength(1);
    expect(
      parseCorrectionTrailers(message(line('ajout', '/partis/rn', 'a'.repeat(300)))).errors
    ).toEqual([]);
  });

  it('should reject evaluative terms, working notes and ISO dates in a summary', () => {
    const bad = [
      'Retrait du passage scandaleux, ce scandale ne figure plus sur la fiche du parti.',
      'Position corrigée : source à vérifier avant publication de la nouvelle version.',
      'Date de fondation corrigée : 1972-10-05 au lieu de 1973 sur la fiche du parti.',
    ];
    for (const summary of bad) {
      expect(
        parseCorrectionTrailers(message(line('correction', '/partis/rn', summary))).errors,
        summary
      ).toHaveLength(1);
    }
  });

  it('should resolve « auto » pages from staged data file paths', () => {
    expect(pagesForDataPath('src/programmes/data/parties/rn.json')).toEqual([
      '/partis/rn/programme-2027',
    ]);
    expect(pagesForDataPath('src/programmes/data/affaires/rn.json')).toEqual([
      '/partis/rn/procedures-judiciaires',
    ]);
    expect(pagesForDataPath('src/programmes/data/guide.json')).toEqual(['/comprendre']);
    expect(pagesForDataPath('src/programmes/data/themes.json')).toEqual(['/partis']);
    expect(pagesForDataPath('src/programmes/data/elections/presidentielle-2027.json')).toEqual([
      '/elections/presidentielle-2027',
    ]);
    expect(pagesForDataPath('src/programmes/data/questions.ts')).toEqual(['/me-situer']);
    expect(pagesForDataPath('src/programmes/data/parties/index.ts')).toEqual([]);
    expect(pagesForDataPath('src/programmes/data/corrections.json')).toEqual([]);

    const result = resolve(message(line('correction', 'auto')), [
      'src/programmes/data/parties/rn.json',
      'src/programmes/data/questions.ts',
    ]);
    expect(result).toMatchObject({
      ok: true,
      corrections: [{ pages: ['/partis/rn/programme-2027', '/me-situer'] }],
    });
  });

  it('should require a trailer when data files are staged', () => {
    const staged = ['src/programmes/data/parties/rn.json'];
    expect(resolve('fix: x\n', staged)).toMatchObject({ ok: false });
    expect(resolve(message('Correction-publique: aucune'), staged)).toMatchObject({
      ok: true,
      optOut: true,
      corrections: [],
    });
    expect(
      resolve('fix: x\n', ['src/programmes/data/corrections.json', 'README.md'])
    ).toMatchObject({ ok: true, corrections: [] });
  });

  it('should require a trailer when the generated data of the Assemblée change, « aucune » for a routine refresh', () => {
    const staged = [
      'src/assemblee/data/scrutins-index.json',
      'public/donnees/assemblee/v1/scrutins/580.json',
    ];
    expect(resolve('build: données de l’Assemblée\n', staged)).toMatchObject({ ok: false });
    expect(resolve(message('Correction-publique: aucune'), staged)).toMatchObject({
      ok: true,
      optOut: true,
      corrections: [],
    });
    // aucune page à déduire automatiquement : les pages se citent explicitement
    expect(pagesForDataPath(staged[0])).toEqual([]);
  });

  it('should reject pages that are not indexable pages of the route registry', () => {
    const result = resolve(message(line('correction', '/partis/inconnu')));
    expect(result).toMatchObject({ ok: false });
  });
});
