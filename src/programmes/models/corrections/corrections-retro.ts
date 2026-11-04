import { TRAILER_KEY } from '@/src/programmes/models/corrections/correction-trailers';

export type RetroCommit = { sha: string; date: string; subject: string; files: string[] };
export type RetroItem = { sha: string; date: string; files: string[]; message: string };

/** Feuille de travail : une section par commit de données, à compléter par l'éditeur. */
export function renderRetroSheet(commits: readonly RetroCommit[], since: string): string {
  return [
    '# Rétro-remplissage du journal des corrections',
    '',
    `Commits touchant aux données depuis le ${since}. Pour chaque commit, compléter la ligne`,
    `\`${TRAILER_KEY}\` (\`type | pages ou auto | résumé public\`), ou écrire \`aucune\`. Une ligne vide est ignorée.`,
    'Le résumé est rédigé pour le lecteur (pas une copie du message de commit). Puis :',
    '`npm run corrections:import-retro`.',
    '',
    ...commits.flatMap((c) => [
      `## ${c.sha} · ${c.date} · ${c.subject}`,
      `Fichiers : ${c.files.join(', ')}`,
      `${TRAILER_KEY}`,
      '',
    ]),
  ].join('\n');
}

/** Lignes complétées de la feuille (les lignes vides et « aucune » sont ignorées). */
export function parseRetroSheet(sheet: string): RetroItem[] {
  const items: RetroItem[] = [];
  let current: { sha: string; date: string; files: string[]; lines: string[] } | null = null;
  const flush = () => {
    if (current?.lines.length)
      items.push({
        sha: current.sha,
        date: current.date,
        files: current.files,
        message: current.lines.join('\n'),
      });
  };
  for (const line of sheet.split(/\r?\n/)) {
    const heading = /^## (\S+) · (\d{4}-\d{2}-\d{2}) · /.exec(line);
    if (heading) {
      flush();
      current = { sha: heading[1], date: heading[2], files: [], lines: [] };
    } else if (current && line.startsWith('Fichiers : ')) {
      current.files = line.slice('Fichiers : '.length).split(', ').filter(Boolean);
    } else if (current && line.startsWith(TRAILER_KEY)) {
      const body = line.slice(TRAILER_KEY.length).trim();
      if (body && body !== 'aucune') current.lines.push(line.trim());
    }
  }
  flush();
  return items;
}
