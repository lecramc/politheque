// Écrit public/agenda-presidentielle-2027.ics à partir des données (npm run agenda:build).
// Le test voter-calendar.test.ts vérifie que le fichier commité est à jour.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { runnerImport } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = async (file) =>
  (
    await runnerImport(file, {
      root,
      configFile: false,
      plugins: [tsconfigPaths()],
      logLevel: 'error',
    })
  ).module;
const { buildStaticCatalog } = await load('/src/programmes/gateways/static-programme.gateway.ts');
const { buildIcs, voterCalendarFor } = await load('/src/programmes/models/voter-calendar.ts');
const { AGENDA_FILE } = await load('/src/programmes/models/voter-calendar.copy.ts');

const calendar = voterCalendarFor(buildStaticCatalog());
if (!calendar) throw new Error('Aucune élection liée à la page « Comment voter ».');
fs.writeFileSync(path.join(root, 'public', AGENDA_FILE), buildIcs(calendar));
process.stdout.write(`public/${AGENDA_FILE} : ${calendar.events.length} événements\n`);
