import fs from 'node:fs';
import path from 'node:path';

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: { type: string; key: string; value: string }[];
};

const config = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../vercel.json'), 'utf8')
) as { redirects: Redirect[]; cleanUrls?: boolean; trailingSlash?: boolean };
const allRedirects = config.redirects;
const isHostRule = (r: Redirect) => (r.has ?? []).some((h) => h.type === 'host');
/** Règles de chemin : celles de la bascule de domaine sont testées plus bas. */
const redirects = allRedirects.filter((r) => !isHostRule(r));

/** Convertit une source Vercel simple (`:id`, `:id(regex)`) en expression régulière. */
const matcher = (source: string) =>
  new RegExp(
    `^${source.replace(/:(\w+)(\((?:[^()]|\([^()]*\))*\))?/g, (_, __, group?: string) =>
      group ? group : '[^/]+'
    )}$`
  );

/** Première règle qui s'applique (ordre de vercel.json), son `:id` remplacé par celui du chemin. */
const find = (pathname: string, query: Record<string, string> = {}) => {
  const rule = redirects.find(
    (r) =>
      matcher(r.source).test(pathname) &&
      (r.has ?? []).every((h) => h.type === 'query' && query[h.key] === h.value)
  );
  return (
    rule && {
      ...rule,
      destination: rule.destination
        .replace(':id', pathname.split('/')[2]?.replace(/\.html$/, ''))
        .replace(':path', pathname.slice(1, -1)),
    }
  );
};

const toPath = (destination: string) => destination.replace(/[#?].*$/, '');

describe('Feature: redirections des adresses retirées (spec § 1.2)', () => {
  it.each([
    ['/parcours/les-bases', '/comprendre#les-bases'],
    ['/parcours/les-institutions', '/comprendre#les-institutions'],
    ['/parcours/les-partis', '/partis'],
    ['/parcours/les-grands-debats', '/partis#debats'],
    ['/parcours/presidentielle-2027', '/comprendre#presidentielle-2027'],
    ['/parcours/me-situer', '/me-situer'],
    ['/debats', '/partis#debats'],
  ])('should redirect %s to %s with a 301', (from, to) => {
    expect(find(from)).toMatchObject({ destination: to, permanent: true });
  });

  it('should redirect /elections to the 2027 election with a temporary 302 (décision D6)', () => {
    expect(find('/elections')).toMatchObject({
      destination: '/elections/presidentielle-2027',
      permanent: false,
    });
  });

  it('should send the bare party address to the programme tab, which keeps its own URL (décision D7)', () => {
    expect(find('/partis/rn')).toMatchObject({
      destination: '/partis/rn/programme-2027',
      permanent: true,
    });
    expect(find('/partis/rn/programme-2027')).toBeUndefined();
  });

  it('should not redirect the compare tool, nor any kept address', () => {
    for (const kept of [
      '/partis',
      '/partis/comparer',
      '/partis/rn/positions',
      '/partis/rn/histoire',
      '/partis/rn/procedures-judiciaires',
      '/debats/immigration',
      '/elections/presidentielle-2027',
      '/comprendre',
      '/comprendre/institutions',
      '/passeport',
      '/me-situer',
      '/me-situer/resultats',
    ]) {
      expect(find(kept), kept).toBeUndefined();
    }
  });

  it('should send every old ?onglet= link straight to its final address, with no chain', () => {
    expect(find('/partis/rn', { onglet: 'programme' })?.destination).toBe(
      '/partis/rn/programme-2027'
    );
    expect(find('/partis/rn', { onglet: 'histoire' })?.destination).toBe('/partis/rn/histoire');
    expect(find('/partis/rn', { onglet: 'positions' })?.destination).toBe('/partis/rn/positions');
  });

  it('should never chain two redirects: no destination is itself redirected', () => {
    for (const redirect of redirects) {
      const target = toPath(redirect.destination.replace(':id', 'rn'));
      expect(find(target), `${redirect.source} → ${redirect.destination}`).toBeUndefined();
    }
  });
});

describe('Feature: adresse nue d’une fiche, un seul saut (audit SEO)', () => {
  // Vercel applique `trailingSlash` et `cleanUrls` AVANT les `redirects` : avec `trailingSlash: false`,
  // /partis/rn/ faisait /partis/rn puis /programme-2027 (2 sauts). La barre finale est donc retirée
  // par une règle à nous, placée en dernier, après les règles précises.
  // Limite connue : `cleanUrls` (indispensable pour servir /x depuis x.html) redirige toujours
  // /partis/rn.html vers /partis/rn avant nos règles, d'où 2 sauts pour cette forme, jamais liée.
  it('should not let Vercel strip the trailing slash before our own rules', () => {
    expect(config.trailingSlash).toBeUndefined();
    expect(config.cleanUrls).toBe(true);
  });

  it('should strip a trailing slash in one hop, last, after the precise rules', () => {
    expect(find('/comprendre/')).toMatchObject({ destination: '/comprendre', permanent: true });
    expect(find('/partis/rn/positions/')).toMatchObject({ destination: '/partis/rn/positions' });
    expect(find('/')).toBeUndefined();
    expect(redirects.at(-1)?.source).toBe('/:path(.+)/');
  });

  it('should send /partis/rn/ and /partis/rn.html straight to the programme tab', () => {
    for (const bare of ['/partis/rn/', '/partis/rn.html']) {
      expect(find(bare), bare).toMatchObject({
        destination: '/partis/rn/programme-2027',
        permanent: true,
      });
    }
  });
});

describe('Feature: bascule vers politheque.revaamp.com', () => {
  const NEW = 'https://politheque.revaamp.com';
  const onOldHost = allRedirects.filter((r) =>
    (r.has ?? []).some((h) => h.type === 'host' && h.value === 'travee-ebon.vercel.app')
  );
  const findOld = (pathname: string, query: Record<string, string> = {}) => {
    const rule = onOldHost.find(
      (r) =>
        matcher(r.source).test(pathname) &&
        (r.has ?? []).every(
          (h) => h.type === 'host' || (h.type === 'query' && query[h.key] === h.value)
        )
    );
    return (
      rule && {
        ...rule,
        destination: rule.destination
          .replace(':id', pathname.split('/')[2]?.replace(/\.html$/, ''))
          .replace(':path', pathname.slice(1).replace(/\/$/, '')),
      }
    );
  };

  it('should send every old-host URL to the new domain with a 301, keeping the path', () => {
    expect(findOld('/')).toMatchObject({ destination: `${NEW}/`, permanent: true });
    expect(findOld('/comprendre/institutions')).toMatchObject({
      destination: `${NEW}/comprendre/institutions`,
      permanent: true,
    });
    expect(findOld('/n-existe-pas')).toMatchObject({ permanent: true });
  });

  it('should keep the Search Console and Bing verification files on the old host', () => {
    expect(findOld('/google1a2b3c4d5e6f.html')).toBeUndefined();
    expect(findOld('/BingSiteAuth.xml')).toBeUndefined();
    // `cleanUrls` redirige d'abord /googleXXX.html vers /googleXXX sur le même hôte : cette forme
    // doit aussi rester servie, sinon la vérification part vers le nouveau domaine.
    expect(findOld('/googleffef207cbb352571')).toBeUndefined();
    expect(findOld('/BingSiteAuth')).toBeUndefined();
    expect(findOld('/googleapis.html')).toBeUndefined();
  });

  it('should send every retired old-host address to its final address in one hop, always permanent', () => {
    expect(findOld('/debats')).toMatchObject({ destination: `${NEW}/partis#debats` });
    expect(findOld('/elections')).toMatchObject({
      destination: `${NEW}/elections/presidentielle-2027`,
      permanent: true,
    });
    expect(findOld('/parcours/les-bases')?.destination).toBe(`${NEW}/comprendre#les-bases`);
    for (const bare of ['/partis/rn', '/partis/rn/', '/partis/rn.html']) {
      expect(findOld(bare)?.destination, bare).toBe(`${NEW}/partis/rn/programme-2027`);
    }
    expect(findOld('/comprendre/institutions/')?.destination).toBe(
      `${NEW}/comprendre/institutions`
    );
    expect(findOld('/partis/rn', { onglet: 'histoire' })?.destination).toBe(
      `${NEW}/partis/rn/histoire`
    );
    for (const r of onOldHost) expect(r.permanent).toBe(true);
  });

  it('should not catch the compare tool before the bare-fiche rules, and keep a plain path as is', () => {
    expect(findOld('/partis/comparer')?.destination).toBe(`${NEW}/partis/comparer`);
  });

  it('should list the old-host rules before the others', () => {
    const indexes = allRedirects
      .map((r, i) => (onOldHost.includes(r) ? i : -1))
      .filter((i) => i >= 0);
    expect(indexes).toEqual(onOldHost.map((_, i) => i));
  });
});
