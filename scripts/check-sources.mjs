// Vérifie que chaque URL citée en source répond. Usage : node scripts/check-sources.mjs [--json rapport.json]
// 2xx/3xx = OK ; 401/403/429 = site qui bloque les robots (à vérifier à la main) ; 404/410/erreur réseau = lien cassé.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA = 'src/programmes/data';
const files = [
  ...readdirSync(join(DATA, 'parties')).filter((f) => f.endsWith('.json')).map((f) => join(DATA, 'parties', f)),
  ...readdirSync(join(DATA, 'elections')).filter((f) => f.endsWith('.json')).map((f) => join(DATA, 'elections', f)),
  join(DATA, 'themes.json'),
  join(DATA, 'guide.json'),
];

const urls = new Map();
for (const file of files) {
  for (const [, url] of readFileSync(file, 'utf8').matchAll(/"url":\s*"([^"]+)"/g)) {
    if (!urls.has(url)) urls.set(url, new Set());
    urls.get(url).add(file.replace(`${DATA}/`, ''));
  }
}

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

const check = async (url) => {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'user-agent': UA, accept: 'text/html,application/pdf,*/*' },
      signal: AbortSignal.timeout(20000),
    });
    res.body?.cancel();
    return res.status;
  } catch (error) {
    return `ERREUR ${error.cause?.code ?? error.name}`;
  }
};

const entries = [...urls.entries()];
const results = [];
let next = 0;
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (next < entries.length) {
      const [url, where] = entries[next++];
      results.push({ url, status: await check(url), files: [...where] });
    }
  })
);

const category = (s) =>
  typeof s === 'number' && s < 400 ? 'ok' : [401, 403, 429, 999].includes(s) ? 'bloque' : 'casse';
const summary = { ok: 0, bloque: 0, casse: 0 };
for (const r of results) summary[category(r.status)]++;
console.log(`${results.length} URL uniques : ${summary.ok} OK, ${summary.bloque} bloquées aux robots, ${summary.casse} cassées`);
for (const r of results.filter((r) => category(r.status) === 'casse').sort((a, b) => a.url.localeCompare(b.url))) {
  console.log(`CASSÉ ${r.status}  ${r.url}  (${r.files.join(', ')})`);
}
const out = process.argv.indexOf('--json');
if (out > 0) writeFileSync(process.argv[out + 1], JSON.stringify(results, null, 2));
