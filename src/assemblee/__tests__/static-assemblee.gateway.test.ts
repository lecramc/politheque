import manifest from '@/src/assemblee/data/manifest.json';
import { StaticAssembleeGateway } from '@/src/assemblee/gateways/static-assemblee.gateway';
import { detailFactory } from '@/src/assemblee/models/scrutin.factory';

// Les fichiers dépendent des deux sources (scrutins et acteurs) : l'adresse change si l'une change.
const VERSION = `${manifest.sha256.scrutins.slice(0, 12)}-${manifest.sha256.amo.slice(0, 12)}`;

const fakeFetch = (body: unknown, ok = true, status = 200) => {
  const calls: string[] = [];
  const impl = (async (url: string) => {
    calls.push(url);
    return { ok, status, json: async () => body } as Response;
  }) as unknown as typeof fetch;
  return { calls, impl };
};

describe('Feature: données de l’Assemblée embarquées et servies en fichiers statiques', () => {
  it('should embed the index and the manifest in the bundle, consistent with each other', async () => {
    const gateway = new StaticAssembleeGateway();
    const [index, loadedManifest] = await Promise.all([
      gateway.loadIndex(),
      gateway.loadManifest(),
    ]);
    expect(index.scrutins).toHaveLength(loadedManifest.scrutins);
    expect(loadedManifest.extraitLe).toBe(manifest.extraitLe);
  });

  it('should fetch the nominative detail of a scrutin on the same origin, with a versioned URL', async () => {
    const detail = detailFactory({ numero: 580 });
    const { calls, impl } = fakeFetch(detail);
    const gateway = new StaticAssembleeGateway({ fetchImpl: impl });
    await expect(gateway.loadScrutinDetail(580)).resolves.toEqual(detail);
    expect(calls).toEqual([`/donnees/assemblee/v1/scrutins/580.json?v=${VERSION}`]);
  });

  it('should fetch the deputy directory once from the same folder', async () => {
    const { calls, impl } = fakeFetch({ deputes: [] });
    const gateway = new StaticAssembleeGateway({ fetchImpl: impl });
    await expect(gateway.loadDeputes()).resolves.toEqual({ deputes: [] });
    expect(calls).toEqual([`/donnees/assemblee/v1/deputes.json?v=${VERSION}`]);
  });

  it('should prefix the site address on native, where there is no same origin', async () => {
    const { calls, impl } = fakeFetch(detailFactory());
    const gateway = new StaticAssembleeGateway({
      fetchImpl: impl,
      baseUrl: 'https://politheque.revaamp.com',
    });
    await gateway.loadScrutinDetail(1);
    expect(calls[0]).toBe(
      `https://politheque.revaamp.com/donnees/assemblee/v1/scrutins/1.json?v=${VERSION}`
    );
  });

  it('should reject with the HTTP status when the file cannot be loaded', async () => {
    const { impl } = fakeFetch(null, false, 404);
    const gateway = new StaticAssembleeGateway({ fetchImpl: impl });
    await expect(gateway.loadScrutinDetail(999999)).rejects.toThrow(/404/);
  });
});
