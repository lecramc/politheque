import fs from 'node:fs';
import path from 'node:path';

import manifest from '@/src/assemblee/data/manifest.json';
import { StaticAssembleeGateway } from '@/src/assemblee/gateways/static-assemblee.gateway';

const vercel = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../vercel.json'), 'utf8'));

describe('Feature: cache des fichiers de données de l’Assemblée', () => {
  it('should cache the data files for a year because their address changes with the data', async () => {
    const entry = vercel.headers.find(
      (h: { source: string }) => h.source === '/donnees/assemblee/v1/(.*)'
    );
    expect(entry.headers).toContainEqual({
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    });

    const urls: string[] = [];
    const gateway = new StaticAssembleeGateway({
      fetchImpl: (async (url: string) => {
        urls.push(url);
        return { ok: true, json: async () => ({}) };
      }) as unknown as typeof fetch,
    });
    await gateway.loadScrutinDetail(580);
    await gateway.loadDeputes();
    const version = `${manifest.sha256.scrutins.slice(0, 12)}-${manifest.sha256.amo.slice(0, 12)}`;
    expect(urls).toEqual([
      `/donnees/assemblee/v1/scrutins/580.json?v=${version}`,
      `/donnees/assemblee/v1/deputes.json?v=${version}`,
    ]);
  });
});
