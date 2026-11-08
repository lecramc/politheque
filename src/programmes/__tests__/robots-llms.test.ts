import { APP_NAME, SITE_URL } from '@/src/core/config/app';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { legalDossierFactory } from '@/src/programmes/models/legal/legal.factory';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
import { buildLlmsFullTxt } from '@/src/programmes/models/seo/llms-full';
import {
  AI_TRAINING_BOTS,
  buildRobotsTxt,
  SEARCH_AND_ANSWER_BOTS,
} from '@/src/programmes/models/seo/robots';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';

const catalog = buildStaticCatalog();
const urls = expandRoutes(catalog);

describe('Feature: robots.txt', () => {
  it('should allow every crawler on the whole site by default', () => {
    const robots = buildRobotsTxt({ allowTraining: true });
    expect(robots).toContain('User-agent: *\nAllow: /');
    expect(robots).not.toMatch(/Disallow/);
  });

  it('should reference the absolute sitemap URL', () => {
    expect(buildRobotsTxt({ allowTraining: true })).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it('should give search and answer bots an explicit complete group', () => {
    const robots = buildRobotsTxt({ allowTraining: true });
    for (const bot of SEARCH_AND_ANSWER_BOTS) expect(robots).toContain(`User-agent: ${bot}\n`);
    expect(robots).toMatch(/User-agent: Googlebot\n(User-agent: [^\n]+\n)*Allow: \//);
  });

  it('should disallow training bots only when allowTraining is false', () => {
    expect(buildRobotsTxt({ allowTraining: true })).not.toContain('GPTBot');
    const blocked = buildRobotsTxt({ allowTraining: false });
    for (const bot of AI_TRAINING_BOTS) expect(blocked).toContain(`User-agent: ${bot}\n`);
    expect(blocked).toContain('Disallow: /');
  });

  it('should never disallow a noindex page', () => {
    const robots = buildRobotsTxt({ allowTraining: true });
    for (const u of urls.filter((x) => !x.indexable))
      expect(robots).not.toContain(`Disallow: ${u.path}`);
  });
});

describe('Feature: llms.txt', () => {
  const llms = buildLlmsTxt(catalog, urls);

  it('should start with the site name and a one-line neutral summary', () => {
    expect(llms.startsWith(`# ${APP_NAME}\n\n> `)).toBe(true);
  });

  it('should list parties in alphabetical order with their four pages', () => {
    const order = catalog.parties.map((p) => llms.indexOf(`${SITE_URL}/partis/${p.id}`));
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(llms).toContain(`${SITE_URL}/partis/rn/histoire`);
    expect(llms).toContain(`${SITE_URL}/partis/rn/programme-2027`);
  });

  it('should only list indexable URLs', () => {
    expect(llms).not.toMatch(/passeport|resultats|parcours/);
  });

  it('should state the latest verification date', () => {
    expect(llms).toMatch(/Dernière vérification : \d{4}-\d{2}-\d{2}/);
  });

  it('should include the attribution instructions and a link to the methodology', () => {
    expect(llms).toContain('## Citer');
    expect(llms).toContain(`${SITE_URL}/methodologie`);
  });

  it('should describe each key page on its line, with the same wording for every party', () => {
    expect(llms).toMatch(new RegExp(`\\(${SITE_URL}/methodologie\\): .+`));
    const lines = catalog.parties.map(
      (p) => llms.split('\n').find((l) => l.includes(`(${SITE_URL}/partis/${p.id}/positions)`))!
    );
    const descriptions = lines.map((l) => l.replace(/^.*\): /, ''));
    expect(new Set(descriptions).size).toBe(1);
  });

  it('should point to llms-full.txt', () => {
    expect(llms).toContain(`(${SITE_URL}/llms-full.txt)`);
  });

  it('should link the corrections journal in the charter section', () => {
    expect(llms).toContain(`(${SITE_URL}/corrections)`);
  });
});

describe('Feature: llms.txt et procédures judiciaires', () => {
  it('should list procedures pages in llms.txt with the citation instruction', () => {
    const unpublished = { ...catalog, legal: [] };
    const none = buildLlmsTxt(unpublished, expandRoutes(unpublished));
    expect(none).not.toContain('procedures-judiciaires');
    expect(none).not.toContain('statut exact');

    const published = {
      ...catalog,
      legal: catalog.parties.map((p) => legalDossierFactory({ partyId: p.id })),
    };
    const llms = buildLlmsTxt(published, expandRoutes(published));
    expect(llms).toContain(`${SITE_URL}/partis/rn/procedures-judiciaires`);
    expect(llms).toContain(': Procédures judiciaires]');
    expect(llms).toContain(
      "Procédures judiciaires : citer le statut exact et la date de vérification ; une procédure non définitive n'établit pas la culpabilité."
    );
  });
});

describe('Feature: llms-full.txt', () => {
  const full = buildLlmsFullTxt(catalog);

  it('should contain a guide paragraph, a party measure and a party stance justification', () => {
    const block = catalog.guide[0].blocks[0];
    expect(full).toContain(block.paragraphs[0]);
    const rn = catalog.parties.find((p) => p.id === 'rn')!;
    const [question] = catalog.questions;
    expect(full).toContain(rn.stances[question.id].justification);
  });

  it('should list parties in alphabetical order', () => {
    const names = [...catalog.parties]
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
      .map((p) => full.indexOf(`## ${p.name} (`));
    expect(names).toEqual([...names].sort((a, b) => a - b));
    expect(names.every((i) => i >= 0)).toBe(true);
  });
});
