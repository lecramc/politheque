// Après `expo export --platform web` : 404, fichiers SEO générés, contrôle du HTML exporté.
// Fait échouer le build au premier écart (liste complète des erreurs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const WEIGHT_WARNING = 200 * 1024;

// 1. Comportement historique : 404 et pas de plan du site Expo.
fs.copyFileSync(path.join(dist, '+not-found.html'), path.join(dist, '404.html'));
fs.rmSync(path.join(dist, '_sitemap.html'), { force: true });

// 2. Génération des fichiers à partir du catalogue (modules purs de src/programmes/models/seo).
const { module: seo } = await runnerImport('/src/programmes/models/seo/build-files.ts', {
  root,
  configFile: false,
  plugins: [tsconfigPaths()],
  logLevel: 'error',
});
const { auditHtml } = (
  await runnerImport('/src/programmes/models/seo/html-audit.ts', {
    root,
    configFile: false,
    plugins: [tsconfigPaths()],
    logLevel: 'error',
  })
).module;
const { module: legal } = await runnerImport('/src/programmes/models/legal/legal-cli.ts', {
  root,
  configFile: false,
  plugins: [tsconfigPaths()],
  logLevel: 'error',
});
const files = seo.buildSeoFiles();
fs.writeFileSync(path.join(dist, 'sitemap.xml'), files.sitemap);
fs.writeFileSync(path.join(dist, 'robots.txt'), files.robots);
fs.writeFileSync(path.join(dist, 'llms.txt'), files.llms);
fs.writeFileSync(path.join(dist, 'llms-full.txt'), files.llmsFull);

// 3. Contrôle de l'export.
const errors = [];

// Procédures judiciaires : une échéance dépassée de plus de 10 jours fait échouer le build
// (information périmée sur une personne) ; les autres suivis sont des avertissements.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
const followUps = legal.publishedFollowUps(today);
for (const item of followUps) {
  const line = `procédures judiciaires, ${item.partyId} / ${item.entryId} : ${item.detail}`;
  if (item.kind === 'depassee') errors.push(line);
  else console.warn(`Avertissement : ${line}`);
}
const htmlFileFor = (urlPath) =>
  [`${urlPath}.html`, `${urlPath}/index.html`]
    .map((rel) => path.join(dist, rel))
    .find((file) => fs.existsSync(file));
const expectedFiles = new Set();
const weights = [];

for (const page of files.pages) {
  const file = urlPathToFile(page.path);
  if (!file) {
    errors.push(`${page.path} : aucun fichier HTML exporté (generateStaticParams oublié ?)`);
    continue;
  }
  expectedFiles.add(file);
  const html = fs.readFileSync(file, 'utf8');
  weights.push([page.path, Buffer.byteLength(html)]);
  for (const issue of auditHtml(html, page)) {
    errors.push(`${issue.path} [${issue.rule}] ${issue.detail}`);
  }
}

function urlPathToFile(urlPath) {
  return urlPath === '/' ? htmlFileFor('/index') : htmlFileFor(urlPath);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
const IGNORED = new Set(['404.html', '+not-found.html']);
// Expo expanse les paramètres du layout `[id]` à toutes ses pages : sans dossier publié, la section
// « Procédures judiciaires » est exportée pour chaque parti alors qu'elle n'existe pas (tous ou
// aucun). Ces pages hors registre sont retirées au lieu de faire échouer le build.
const UNPUBLISHED_SECTION = /^partis[\\/][^\\/]+[\\/]procedures-judiciaires\.html$/;
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
  if (!expectedFiles.has(file) && UNPUBLISHED_SECTION.test(path.relative(dist, file))) {
    fs.rmSync(file);
  }
}
// Gabarits de routes dynamiques (`[id].html`, `partis/[id]/…`) : jamais des adresses publiques, et
// ils masqueraient la 404 pour un identifiant inconnu. Retirés de `dist/`.
const walkDirs = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return [full, ...walkDirs(full)];
    });
const TEMPLATE = /\[[^\]]+\]/;
for (const entry of walkDirs(dist).filter((d) => TEMPLATE.test(path.basename(d)))) {
  fs.rmSync(entry, { recursive: true, force: true });
}
for (const file of walk(dist).filter((f) => TEMPLATE.test(path.basename(f)))) {
  fs.rmSync(file, { force: true });
}
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
  const relative = path.relative(dist, file);
  if (IGNORED.has(relative)) continue;
  // Fichiers de vérification Search Console (public/google<code>.html) : pas des pages du site.
  if (/^google[0-9a-f]+\.html$/.test(relative)) continue;
  if (!expectedFiles.has(file)) {
    errors.push(`${path.relative(dist, file)} : page exportée absente du registre des routes`);
  }
}

// 4. Rapport de poids.
weights.sort((a, b) => b[1] - a[1]);
console.log('Poids HTML (5 plus lourdes) :');
for (const [p, bytes] of weights.slice(0, 5)) {
  console.log(
    `  ${p} : ${(bytes / 1024).toFixed(0)} Ko${bytes > WEIGHT_WARNING ? '  ⚠ > 200 Ko' : ''}`
  );
}

if (errors.length) {
  console.error(`\n${errors.length} erreur(s) dans l'export :`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(
  `Export vérifié : ${files.pages.length} pages, sitemap, robots.txt, llms.txt et llms-full.txt écrits.`
);
