import manifest from '@/src/assemblee/data/manifest.json';
import { store } from '@/src/core/store';

describe('Feature: données de l’Assemblée dans le store global', () => {
  it('should preload the index and the manifest like the catalog, so pages pre-render with their text', () => {
    const { assemblee } = store.getState();
    expect(assemblee.index?.scrutins).toHaveLength(manifest.scrutins);
    expect(assemblee.manifest?.extraitLe).toBe(manifest.extraitLe);
  });

  it('should leave the heavy files to be loaded on demand', () => {
    const { assemblee } = store.getState();
    expect(assemblee.details).toEqual({});
    expect(assemblee.deputes).toEqual({ status: 'idle' });
  });
});
