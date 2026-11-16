// Journal public des corrections (src/programmes/data/corrections.json).
//
//   --from-message <fichier>  hook commit-msg : refuse un commit de données sans trailer
//                             `Correction-publique:` et vérifie que le journal indexé contient
//                             bien chaque correction annoncée (voir --add).
//   --add "<type> | <pages> | <résumé>"
//                             écrit la correction dans le journal et l'indexe (à lancer AVANT
//                             `git commit` : git ne relit pas l'index après le hook commit-msg).
//   --check [--fix]           revalide le journal ; --fix le retrie (après un conflit de fusion).
//   --backfill --since <AAAA-MM-JJ> [--force]
//                             écrit docs/corrections-retro.md (feuille à compléter).
//   --import-retro [fichier]  importe les lignes complétées de la feuille.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JOURNAL = 'src/programmes/data/corrections.json';
const RETRO = 'docs/corrections-retro.md';
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => args[args.indexOf(flag) + 1];

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' });
const stagedFiles = () => git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
const parisToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

const fail = (title, lines = []) => {
  console.error(`\ncorrections : ${title}`);
  for (const line of lines) console.error(`  - ${line}`);
  process.exit(1);
};

// Chemin rapide du hook : aucune donnée touchée, aucun trailer → rien à charger.
// Données concernées : le contenu rédigé (`src/programmes/data/`, hors journal) et les données
// générées de l'Assemblée (`src/assemblee/data/`, `public/donnees/assemblee/`) : un rafraîchissement
// ordinaire s'écrit `Correction-publique: aucune`, un changement de logique qui modifie des chiffres
// déjà publiés exige une entrée au journal.
const DATA_PREFIXES = ['src/programmes/data/', 'src/assemblee/data/', 'public/donnees/assemblee/'];
if (has('--from-message')) {
  const message = fs.readFileSync(valueOf('--from-message'), 'utf8');
  const touchesData = stagedFiles().some(
    (f) => DATA_PREFIXES.some((prefix) => f.startsWith(prefix)) && f !== JOURNAL
  );
  if (!touchesData && !/^Correction-publique:/m.test(message)) process.exit(0);
}

const { module: cli } = await runnerImport(
  '/src/programmes/models/corrections/corrections-cli.ts',
  {
    root,
    configFile: false,
    plugins: [tsconfigPaths()],
    logLevel: 'error',
  }
);

const readJournal = () => JSON.parse(fs.readFileSync(path.join(root, JOURNAL), 'utf8'));
async function writeJournal(entries) {
  const prettier = await import('prettier');
  const file = path.join(root, JOURNAL);
  const options = (await prettier.resolveConfig(file)) ?? {};
  fs.writeFileSync(
    file,
    await prettier.format(JSON.stringify(entries), { ...options, parser: 'json' })
  );
}

const sameCorrection = (c, e) =>
  c.kind === e.kind &&
  c.summary === e.summary &&
  JSON.stringify(c.pages) === JSON.stringify(e.pages);

if (has('--from-message')) {
  const message = fs.readFileSync(valueOf('--from-message'), 'utf8');
  const result = cli.resolveCorrections(message, {
    stagedFiles: stagedFiles(),
    indexablePaths: cli.indexablePaths(),
  });
  if (!result.ok) {
    fail('commit refusé.', [
      ...result.errors,
      'Ajouter en pied de message une ligne :',
      '    Correction-publique: <correction|mise-a-jour|ajout|retrait> | <pages ou auto> | <résumé public>',
      'ou, pour un commit de forme sans effet sur le sens : « Correction-publique: aucune ».',
    ]);
  }
  let staged = [];
  try {
    staged = JSON.parse(git('show', `:${JOURNAL}`));
  } catch {
    // journal absent de l'index : liste vide
  }
  const missing = result.corrections.filter((c) => !staged.some((e) => sameCorrection(c, e)));
  if (missing.length) {
    fail(
      'le journal indexé ne contient pas la correction annoncée. Lancer, puis relancer le commit :',
      missing.map(
        (c) => `npm run corrections:add -- "${c.kind} | ${c.pages.join(', ')} | ${c.summary}"`
      )
    );
  }
  process.exit(0);
}

if (has('--add')) {
  const line = valueOf('--add');
  const result = cli.resolveCorrections(`${cli.TRAILER_KEY} ${line}`, {
    stagedFiles: stagedFiles(),
    indexablePaths: cli.indexablePaths(),
  });
  if (!result.ok) fail('correction refusée.', result.errors);
  if (!result.corrections.length) {
    console.log('corrections : « aucune », rien à écrire.');
    process.exit(0);
  }
  const before = readJournal();
  const after = cli.mergeCorrections(before, result.corrections, parisToday());
  if (after.length === before.length) {
    console.log('corrections : déjà présente dans le journal.');
  } else {
    await writeJournal(after);
    console.log(`corrections : ${after.length - before.length} entrée(s) ajoutée(s).`);
  }
  git('add', JOURNAL);
  process.exit(0);
}

if (has('--check')) {
  let entries = readJournal();
  if (has('--fix')) {
    entries = cli.sortCorrections(entries);
    await writeJournal(entries);
  }
  const errors = cli.validateJournal(entries, {
    today: parisToday(),
    indexablePaths: cli.indexablePaths(),
  });
  if (errors.length) fail(`${errors.length} anomalie(s) dans le journal.`, errors);
  console.log(`corrections : journal valide (${entries.length} entrée(s)).`);
  process.exit(0);
}

if (has('--backfill')) {
  const since = valueOf('--since');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since ?? '')) fail('--since AAAA-MM-JJ est obligatoire.');
  if (fs.existsSync(path.join(root, RETRO)) && !has('--force'))
    fail(`${RETRO} existe déjà (--force pour l'écraser).`);
  const log = execFileSync(
    'git',
    [
      'log',
      '--reverse',
      `--since=${since}T00:00:00+01:00`,
      '--date=format-local:%Y-%m-%d',
      '--format=@@%h|%ad|%s',
      '--name-only',
      '--',
      'src/programmes/data',
    ],
    { cwd: root, encoding: 'utf8', env: { ...process.env, TZ: 'Europe/Paris' } }
  );
  const commits = log
    .split('@@')
    .filter(Boolean)
    .map((block) => {
      const [head, ...files] = block.split('\n').filter(Boolean);
      const [sha, date, ...subject] = head.split('|');
      return { sha, date, subject: subject.join('|'), files: files.filter((f) => f !== JOURNAL) };
    })
    .filter((c) => c.files.length && c.date >= since);
  fs.writeFileSync(path.join(root, RETRO), cli.renderRetroSheet(commits, since));
  console.log(`corrections : ${commits.length} commit(s) listé(s) dans ${RETRO}. À compléter.`);
  process.exit(0);
}

if (has('--import-retro')) {
  const file = args[args.indexOf('--import-retro') + 1];
  const sheet = fs.readFileSync(
    path.join(root, file && !file.startsWith('--') ? file : RETRO),
    'utf8'
  );
  const items = cli.parseRetroSheet(sheet).sort((a, b) => a.date.localeCompare(b.date));
  const indexablePaths = cli.indexablePaths();
  const errors = [];
  let entries = readJournal();
  for (const item of items) {
    const result = cli.resolveCorrections(item.message, {
      stagedFiles: item.files,
      indexablePaths,
    });
    if (!result.ok) errors.push(...result.errors.map((e) => `${item.sha} : ${e}`));
    else entries = cli.mergeCorrections(entries, result.corrections, item.date);
  }
  if (errors.length) fail('import refusé, rien écrit.', errors);
  const problems = cli.validateJournal(entries, { today: parisToday(), indexablePaths });
  if (problems.length) fail('journal invalide après import, rien écrit.', problems);
  await writeJournal(entries);
  console.log(`corrections : ${entries.length} entrée(s) dans le journal.`);
  process.exit(0);
}

fail('aucune action. Voir l’en-tête de scripts/corrections.mjs.');
