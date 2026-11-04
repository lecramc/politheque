// Promotion des brouillons validés : docs/affaires/<id>.json → src/programmes/data/affaires/<id>.json
// (artefact généré, jamais édité à la main) + regénération de data/affaires/index.ts.
//
//   node scripts/promote-affaires.mjs <partyId|--all> [--dry-run] [--from <dossier>]
//
// Accepte le schéma « brouillon-2 » de docs/affaires/SCHEMA.md (et l'ancien format revue/review).
// Refus tant que manquent : crossCheck, humanValidation, validationHumaine (cas limite),
// avisJuridiqueRendu (avis juridique) ; jamais de validation présumée.
//
// `--all` : tous ou aucun. Les dix brouillons doivent être promouvables, sinon rien n'est écrit.
// Code de sortie non nul au moindre refus, avec la liste complète des erreurs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const fromIndex = args.indexOf('--from');
const draftsDir = path.resolve(root, fromIndex >= 0 ? args[fromIndex + 1] : 'docs/affaires');
const outDir = path.join(root, 'src/programmes/data/affaires');
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--from');

const load = async (file) =>
  (
    await runnerImport(file, {
      root,
      configFile: false,
      plugins: [tsconfigPaths()],
      logLevel: 'error',
    })
  ).module;

if (!target && !has('--all')) {
  console.error(
    'Usage : node scripts/promote-affaires.mjs <partyId|--all> [--dry-run] [--from <dossier>]'
  );
  process.exit(2);
}

const { PARTIES } = await load('/src/programmes/data/parties/index.ts');
const { promoteDraft } = await load('/src/programmes/models/legal/legal-promotion.ts');
const partyIds = PARTIES.map((p) => p.id);
const ids = has('--all') ? partyIds : [target];
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());

const results = [];
const errors = [];
for (const id of ids) {
  const file = path.join(draftsDir, `${id}.json`);
  if (!fs.existsSync(file)) {
    errors.push(`${id} : brouillon introuvable (${path.relative(root, file)})`);
    continue;
  }
  const result = promoteDraft(JSON.parse(fs.readFileSync(file, 'utf8')), { today, partyIds });
  if (!result.ok) errors.push(...result.errors.map((e) => `${id} : ${e}`));
  else results.push({ id, ...result });
}

for (const r of results) {
  console.log(
    `${r.id} : ${r.dossier.entries.length} entrée(s) publiable(s), ${r.dropped.length} écartée(s)`
  );
  for (const d of r.dropped) console.log(`    écartée ${d.id} : ${d.reason}`);
}
if (errors.length) {
  console.error(`\n${errors.length} erreur(s), rien n'a été écrit :`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
if (has('--dry-run')) {
  console.log('\n--dry-run : aucun fichier écrit.');
  process.exit(0);
}

const prettier = await import('prettier');
const format = async (file, text, parser) =>
  prettier.format(text, { ...((await prettier.resolveConfig(file)) ?? {}), parser });

fs.mkdirSync(outDir, { recursive: true });
for (const r of results) {
  const file = path.join(outDir, `${r.id}.json`);
  fs.writeFileSync(file, await format(file, JSON.stringify(r.dossier, null, 2), 'json'));
}

const published = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -'.json'.length))
  .sort();
const name = (id) => id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const indexFile = path.join(outDir, 'index.ts');
const index = [
  '// Généré par scripts/promote-affaires.mjs : ne pas éditer à la main.',
  '// Les dossiers viennent de docs/affaires/<id>.json après vérification croisée et validation',
  '// humaine. Tous les partis ou aucun : tant que les dix dossiers ne sont pas publiés, la section',
  "// « Procédures judiciaires » n'existe pas.",
  ...published.map((id) => `import ${name(id)} from '@/src/programmes/data/affaires/${id}.json';`),
  "import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';",
  '',
  published.length
    ? `export const LEGAL_DOSSIERS = [${published.map(name).join(', ')}] as unknown as LegalDossier[];`
    : 'export const LEGAL_DOSSIERS: LegalDossier[] = [];',
  '',
].join('\n');
fs.writeFileSync(indexFile, await format(indexFile, index, 'typescript'));
console.log(
  `\n${results.length} dossier(s) écrit(s) ; index.ts régénéré (${published.length} publié(s)).`
);
