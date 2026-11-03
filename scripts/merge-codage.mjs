// Fusionne les positions codées (docs/codage/<question>.json) dans les fiches partis
// et retire les questions supprimées du questionnaire. Usage : node scripts/merge-codage.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PARTIES = 'src/programmes/data/parties';
const CODAGE = 'docs/codage';
const REMOVED = ['q03-charges', 'q11-police', 'q21-libre-echange', 'q22-vie-republique'];

const codings = readdirSync(CODAGE)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(join(CODAGE, f), 'utf8')));

for (const file of readdirSync(PARTIES).filter((f) => f.endsWith('.json'))) {
  const path = join(PARTIES, file);
  const party = JSON.parse(readFileSync(path, 'utf8'));
  for (const id of REMOVED) delete party.stances[id];
  for (const coding of codings) {
    const position = coding.positions[party.id];
    if (!position) throw new Error(`${coding.question} : position manquante pour ${party.id}`);
    party.stances[coding.question] = {
      stance: position.stance,
      justification: position.justification,
      sources: position.sources ?? [],
    };
  }
  writeFileSync(path, `${JSON.stringify(party, null, 2)}\n`);
}
console.log(`${codings.length} questions fusionnées dans les fiches partis.`);
