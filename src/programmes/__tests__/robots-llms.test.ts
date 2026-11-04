import { APP_NAME, SITE_URL } from '@/src/core/config/app';
import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { buildLlmsTxt } from '@/src/programmes/models/seo/llms';
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
});
