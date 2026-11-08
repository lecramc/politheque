// Fusionne les livrables du questionnaire v3 dans les fiches partis, et seulement eux.
// Ne relit PAS les autres fichiers de docs/codage/ : plusieurs sont en retard sur les fiches
// (LFI q04, q05, q19 ; Écologistes q04, mis à jour au commit 409f6c2) et les réappliquer
// annulerait ces mises à jour.
// Usage : node merge-v3.mjs [racine du dépôt]
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? '.';
const PARTIES = join(ROOT, 'src/programmes/data/parties');
const read = (f) => JSON.parse(readFileSync(join(ROOT, 'docs/codage', f), 'utf8'));
const missing = read('positions-manquantes.json'); // [{ question, partial: true, positions: { <id>: {...} } }]
const added = read('nouvelles-questions.json').filter((q) => q.retained); // 10 partis chacune

const toStance = ({ stance, justification, sources }) => ({
  stance,
  justification,
  sources: sources ?? [],
});
let changes = 0;
for (const file of readdirSync(PARTIES).filter((f) => f.endsWith('.json'))) {
  const path = join(PARTIES, file);
  const party = JSON.parse(readFileSync(path, 'utf8'));
  for (const coding of missing) {
    const position = coding.positions[party.id];
    if (!position) continue;
    if (!(coding.question in party.stances))
      throw new Error(`${party.id} : question inconnue ${coding.question}`);
    party.stances[coding.question] = toStance(position);
    changes += 1;
  }
  for (const coding of added) {
    const position = coding.positions[party.id];
    if (!position) throw new Error(`${coding.question} : position manquante pour ${party.id}`);
    party.stances[coding.question] = toStance(position);
    changes += 1;
  }
  writeFileSync(path, `${JSON.stringify(party, null, 2)}\n`);
}
console.log(
  `${changes} positions écrites (${missing.length} questions complétées, ${added.length} ajoutées).`
);
