// Rapport d'échéances des procédures judiciaires publiées → bloc balisé de docs/a-verifier.md.
//   node scripts/affaires-echeances.mjs [--file <fichier>]
// À lancer manuellement, en début de chaque session de mise à jour.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fileIndex = args.indexOf('--file');
const target = path.resolve(root, fileIndex >= 0 ? args[fileIndex + 1] : 'docs/a-verifier.md');

const { module: legal } = await runnerImport('/src/programmes/models/legal/legal-cli.ts', {
  root,
  configFile: false,
  plugins: [tsconfigPaths()],
  logLevel: 'error',
});
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
const items = legal.publishedFollowUps(today);
const doc = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
fs.writeFileSync(target, legal.replaceMarkedBlock(doc, legal.renderFollowUpBlock(items, today)));

const overdue = items.filter((i) => i.kind === 'depassee').length;
console.log(
  `${items.length} élément(s) dans ${path.relative(root, target)} (dont ${overdue} dépassé(s)).`
);
process.exit(overdue ? 1 : 0);
