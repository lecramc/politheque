// Extraction des votes de l'Assemblée nationale (17e législature) depuis l'open data officiel.
//
//   node scripts/assemblee-scrutins.mjs [--download] [--check] [--from <dossier>] [--date AAAA-MM-JJ]
//   npm run assemblee:update   # = --download puis écriture des fichiers
//   npm run assemblee:check    # régénère en mémoire et compare au commité (exit ≠ 0 en cas d'écart)
//
// Sources (Licence Ouverte / Open Licence, Etalab) :
//   - Scrutins.json.zip  : tous les scrutins de la législature
//   - AMO30_…json.zip    : acteurs, mandats, organes (historique)
// Les zips ne sont jamais commités : `.cache/assemblee/<date>/` (gitignoré). `--from <dossier>` lit
// `<dossier>/scrutins.zip` et `<dossier>/amo.zip` (ou, sans l'un des deux, le dernier cache) ; la
// décompression passe par la commande système `unzip` (aucune dépendance de plus).
//
// Toute la logique (périmètre, extraction, compactage) est dans `src/assemblee/models/extraction/`,
// testée sur des fixtures ; ce script n'orchestre que les entrées-sorties. Sortie déterministe :
// deux exécutions sur les mêmes zips donnent les mêmes octets.
//
// Écrit : src/assemblee/data/{manifest,scrutins-index}.json,
//         public/donnees/assemblee/v1/{deputes.json,scrutins/<numero>.json}
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);

const VERSION_SCRIPT = '1.0.0';
const SOURCES = {
  scrutins:
    'https://data.assemblee-nationale.fr/static/openData/repository/17/loi/scrutins/Scrutins.json.zip',
  amo: 'https://data.assemblee-nationale.fr/static/openData/repository/17/amo/tous_acteurs_mandats_organes_xi_legislature/AMO30_tous_acteurs_tous_mandats_tous_organes_historique.json.zip',
};
const LICENCE = 'Licence Ouverte / Open Licence (Etalab)';

const CACHE = path.join(root, '.cache/assemblee');
const DATA_DIR = path.join(root, 'src/assemblee/data');
const PUBLIC_DIR = path.join(root, 'public/donnees/assemblee/v1');
const SCRUTINS_DIR = path.join(PUBLIC_DIR, 'scrutins');

const fail = (message) => {
  console.error(`\nassemblee : ${message}`);
  process.exit(1);
};

const parisToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

const load = async (file) =>
  (
    await runnerImport(file, {
      root,
      configFile: false,
      plugins: [tsconfigPaths()],
      logLevel: 'error',
    })
  ).module;

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const hashOf = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

// ---------------------------------------------------------------------------------------------
// Sources : téléchargement ou dossier fourni
// ---------------------------------------------------------------------------------------------

const download = async (url, file) => {
  const response = await fetch(url);
  if (!response.ok) fail(`téléchargement impossible (${response.status}) : ${url}`);
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  return response.headers.get('last-modified');
};

const toIsoDate = (httpDate) => {
  if (!httpDate) return null;
  const time = Date.parse(httpDate);
  return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10);
};

const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const latestCache = () => {
  if (!fs.existsSync(CACHE)) return null;
  const dates = fs.readdirSync(CACHE).filter(isIsoDate).sort();
  return dates.length ? path.join(CACHE, dates[dates.length - 1]) : null;
};

const prepareSource = async () => {
  if (has('--download')) {
    const date = valueOf('--date') ?? parisToday();
    const dir = path.join(CACHE, date);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Téléchargement dans ${path.relative(root, dir)} …`);
    const lastModifiedScrutins = await download(SOURCES.scrutins, path.join(dir, 'scrutins.zip'));
    const lastModifiedAmo = await download(SOURCES.amo, path.join(dir, 'amo.zip'));
    const meta = {
      extraitLe: date,
      publieLe: { scrutins: toIsoDate(lastModifiedScrutins), amo: toIsoDate(lastModifiedAmo) },
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
    // Archives fraîches : on ne réutilise jamais un ancien dossier décompressé.
    for (const name of ['scrutins', 'amo']) {
      fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
    return dir;
  }
  const given = valueOf('--from');
  const dir = given ? path.resolve(root, given) : latestCache();
  if (!dir || !fs.existsSync(dir)) {
    fail(
      'aucune source : lancer `npm run assemblee:update` (téléchargement) ou fournir `--from <dossier>` contenant scrutins.zip et amo.zip.'
    );
  }
  return dir;
};

const unzipOnce = (zip, target) => {
  if (!fs.existsSync(zip)) fail(`fichier manquant : ${zip}`);
  if (fs.existsSync(target)) return;
  fs.mkdirSync(target, { recursive: true });
  execFileSync('unzip', ['-q', '-o', zip, '-d', target], { stdio: 'inherit' });
};

const readJsonDir = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));

const sourceMeta = (dir) => {
  const metaFile = path.join(dir, 'meta.json');
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
  const extraitLe =
    valueOf('--date') ??
    meta.extraitLe ??
    (isIsoDate(path.basename(dir))
      ? path.basename(dir)
      : fs.statSync(path.join(dir, 'scrutins.zip')).mtime.toISOString().slice(0, 10));
  return { extraitLe, publieLe: meta.publieLe ?? { scrutins: null, amo: null } };
};

// ---------------------------------------------------------------------------------------------
// Fichiers produits
// ---------------------------------------------------------------------------------------------

const readPrevious = () => {
  const previous = new Map();
  const indexFile = path.join(DATA_DIR, 'scrutins-index.json');
  if (!fs.existsSync(indexFile)) return previous;
  const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  for (const { updatedAt, ...summary } of index.scrutins) {
    const detailFile = path.join(SCRUTINS_DIR, `${summary.numero}.json`);
    if (!fs.existsSync(detailFile)) continue;
    const detail = JSON.parse(fs.readFileSync(detailFile, 'utf8'));
    previous.set(summary.numero, { hash: hashOf([summary, detail]), updatedAt });
  }
  return previous;
};

const buildOutputs = ({ dataset, meta, sha, resolveUpdatedAt, rules }) => {
  const previous = readPrevious();
  const outputs = new Map();

  const summaries = dataset.scrutins.map(({ summary, detail }) => ({
    ...summary,
    updatedAt: resolveUpdatedAt({
      previous: previous.get(summary.numero),
      hash: hashOf([summary, detail]),
      extractedOn: meta.extraitLe,
    }),
  }));
  summaries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.numero - a.numero));

  const indexText =
    `{"groupes":${JSON.stringify(dataset.groupes)},\n"scrutins":[\n` +
    summaries.map((s) => JSON.stringify(s)).join(',\n') +
    '\n]}\n';
  outputs.set(path.join(DATA_DIR, 'scrutins-index.json'), indexText);

  for (const { detail } of dataset.scrutins) {
    outputs.set(path.join(SCRUTINS_DIR, `${detail.numero}.json`), JSON.stringify(detail) + '\n');
  }
  outputs.set(
    path.join(PUBLIC_DIR, 'deputes.json'),
    JSON.stringify({ deputes: dataset.deputes }) + '\n'
  );

  const dates = dataset.scrutins.map((s) => s.summary.date).sort();
  const votes = dataset.scrutins.reduce(
    (n, { detail }) =>
      n +
      [...detail.votes].filter((v) => 'PCAN'.includes(v)).length +
      detail.sansPlace.filter((m) => 'PCAN'.includes(m.vote)).length,
    0
  );
  const manifest = {
    sources: SOURCES,
    licence: LICENCE,
    extraitLe: meta.extraitLe,
    publieLe: meta.publieLe,
    sha256: sha,
    scrutins: dataset.scrutins.length,
    votes,
    premier: dates[0],
    dernier: dates[dates.length - 1],
    versionScript: VERSION_SCRIPT,
    regles: rules,
  };
  outputs.set(path.join(DATA_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return { outputs, summaries, manifest };
};

const orphans = () =>
  fs.existsSync(SCRUTINS_DIR)
    ? fs.readdirSync(SCRUTINS_DIR).map((f) => path.join(SCRUTINS_DIR, f))
    : [];

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} Ko`;
const gzipSize = (text) => zlib.gzipSync(text, { level: 9 }).length;

const report = ({ outputs, summaries, manifest }, dataset) => {
  const detailTexts = [...outputs]
    .filter(([file]) => file.startsWith(SCRUTINS_DIR))
    .map(([, text]) => text);
  const rawIndex = outputs.get(path.join(DATA_DIR, 'scrutins-index.json'));
  const rawDeputes = outputs.get(path.join(PUBLIC_DIR, 'deputes.json'));
  const totalRaw = detailTexts.reduce((n, t) => n + Buffer.byteLength(t), 0);
  const totalGzip = detailTexts.reduce((n, t) => n + gzipSize(t), 0);
  const count = (key) =>
    summaries.reduce((acc, s) => {
      const keys = key === 'regles' ? s.regles : [s[key]];
      for (const k of keys) acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});
  console.log(
    `\n${manifest.scrutins} scrutins, ${manifest.votes} votes nominatifs, ${dataset.deputes.length} députés, ${dataset.groupes.length} groupes`
  );
  console.log(`du ${manifest.premier} au ${manifest.dernier}, extrait le ${manifest.extraitLe}`);
  console.log(
    `index           : ${kb(Buffer.byteLength(rawIndex))} brut, ${kb(gzipSize(rawIndex))} gzip`
  );
  console.log(
    `détail moyen    : ${kb(totalRaw / detailTexts.length)} brut, ${kb(totalGzip / detailTexts.length)} gzip (total ${kb(totalRaw)} / ${kb(totalGzip)})`
  );
  console.log(
    `deputes.json    : ${kb(Buffer.byteLength(rawDeputes))} brut, ${kb(gzipSize(rawDeputes))} gzip`
  );
  console.log('par règle       :', JSON.stringify(count('regles')));
  console.log('par catégorie   :', JSON.stringify(count('categorie')));
  console.log('par type        :', JSON.stringify(count('type')));
  if (dataset.unplaced.length) {
    console.log(
      `ATTENTION : ${dataset.unplaced.length} député(s) sans place libre connue (non affichés)`
    );
    if (has('--verbose')) {
      for (const u of dataset.unplaced) console.log(`  scrutin ${u.numero} : ${u.acteurRef}`);
    }
    const unplacedVotes = dataset.scrutins.reduce((n, s) => n + s.detail.sansPlace.length, 0);
    if (unplacedVotes) {
      console.log(`  dont ${unplacedVotes} listé(s) sous le schéma (sansPlace)`);
    }
  }
};

// ---------------------------------------------------------------------------------------------
// Programme
// ---------------------------------------------------------------------------------------------

const dir = await prepareSource();
const scrutinsZip = path.join(dir, 'scrutins.zip');
const amoZip = path.join(dir, 'amo.zip');
unzipOnce(scrutinsZip, path.join(dir, 'scrutins'));
unzipOnce(amoZip, path.join(dir, 'amo'));

const { classifyScrutin, isUnclassifiedSolemn, PERIMETER_RULES } = await load(
  '/src/assemblee/models/extraction/perimeter.ts'
);
const { parseActeur, parseGroupe } = await load('/src/assemblee/models/extraction/amo.ts');
const { compactDataset } = await load('/src/assemblee/models/extraction/compact.ts');
const { resolveUpdatedAt } = await load('/src/assemblee/models/extraction/updated-at.ts');

const allScrutins = readJsonDir(path.join(dir, 'scrutins/json')).map((file) => file.scrutin);
const unclassified = allScrutins.filter(isUnclassifiedSolemn);
if (unclassified.length) {
  fail(
    `${unclassified.length} scrutin(s) solennel(s) ou motion(s) que la liste fermée ne reconnaît pas :\n` +
      unclassified.map((raw) => `  - n° ${raw.numero} : ${raw.titre}`).join('\n')
  );
}
const rawScrutins = allScrutins.filter((raw) => classifyScrutin(raw).inclus);
const acteurs = readJsonDir(path.join(dir, 'amo/json/acteur'))
  .map((file) => parseActeur(file.acteur))
  .filter(Boolean);
const groupes = readJsonDir(path.join(dir, 'amo/json/organe'))
  .map((file) => parseGroupe(file.organe))
  .filter(Boolean);

const dataset = compactDataset({ scrutins: rawScrutins, acteurs, groupes });
const result = buildOutputs({
  dataset,
  meta: sourceMeta(dir),
  sha: { scrutins: sha256(scrutinsZip), amo: sha256(amoZip) },
  resolveUpdatedAt,
  rules: PERIMETER_RULES,
});
report(result, dataset);

if (has('--check')) {
  const differences = [];
  for (const [file, text] of result.outputs) {
    if (!fs.existsSync(file)) differences.push(`manquant : ${path.relative(root, file)}`);
    else if (fs.readFileSync(file, 'utf8') !== text) {
      differences.push(`différent : ${path.relative(root, file)}`);
    }
  }
  for (const file of orphans()) {
    if (!result.outputs.has(file)) differences.push(`orphelin : ${path.relative(root, file)}`);
  }
  if (differences.length) {
    console.error(`\nassemblee : ${differences.length} écart(s) avec les fichiers commités`);
    for (const line of differences.slice(0, 30)) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log('\nassemblee : aucun écart avec les fichiers commités.');
} else {
  fs.mkdirSync(SCRUTINS_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const file of orphans()) if (!result.outputs.has(file)) fs.rmSync(file);
  for (const [file, text] of result.outputs) fs.writeFileSync(file, text);
  console.log(`\nassemblee : ${result.outputs.size} fichiers écrits.`);
}
