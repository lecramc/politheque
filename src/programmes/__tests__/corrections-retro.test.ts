import {
  parseRetroSheet,
  renderRetroSheet,
} from '@/src/programmes/models/corrections/corrections-retro';

const commits = [
  {
    sha: 'abc1234',
    date: '2026-11-04',
    subject: 'fix: classements regroupés',
    files: ['src/programmes/data/parties/rn.json', 'src/programmes/data/guide.json'],
  },
  {
    sha: 'def5678',
    date: '2026-11-03',
    subject: 'feat: titres courts',
    files: ['src/programmes/data/parties/lr.json'],
  },
];

describe('Feature: feuille de rétro-remplissage du journal', () => {
  it('should list one section per commit with an empty trailer line to fill in', () => {
    const sheet = renderRetroSheet(commits, '2026-11-03');
    expect(sheet).toContain('## abc1234 · 2026-11-04 · fix: classements regroupés');
    expect(sheet).toContain(
      'Fichiers : src/programmes/data/parties/rn.json, src/programmes/data/guide.json'
    );
    expect(sheet.match(/^Correction-publique:$/gm)).toHaveLength(2);
    expect(sheet).toContain('2026-11-03');
  });

  it('should ignore commits left empty or set to « aucune » and read completed lines with the commit date', () => {
    const sheet = renderRetroSheet(commits, '2026-11-03')
      .replace(
        /(## abc1234[\s\S]*?)Correction-publique:\n/,
        '$1Correction-publique: correction | auto | Classements des partis regroupés dans la famille politique.\n'
      )
      .replace(/(## def5678[\s\S]*?)Correction-publique:\n/, '$1Correction-publique: aucune\n');
    expect(parseRetroSheet(sheet)).toEqual([
      {
        sha: 'abc1234',
        date: '2026-11-04',
        files: ['src/programmes/data/parties/rn.json', 'src/programmes/data/guide.json'],
        message:
          'Correction-publique: correction | auto | Classements des partis regroupés dans la famille politique.',
      },
    ]);
  });
});
