import {
  AsyncStorageReadingProgressGateway,
  type KeyValueStorage,
} from '@/src/programmes/gateways/async-storage-reading-progress.gateway';
import { FakeClock } from '@/src/programmes/gateways/fake-clock.gateway';

const NOW = '2026-11-04T10:00:00.000Z';
const EARLIER = '2026-10-01T08:00:00.000Z';

class MemoryStorage implements KeyValueStorage {
  data: Record<string, string> = {};
  async getItem(key: string) {
    return key in this.data ? this.data[key] : null;
  }
  async setItem(key: string, value: string) {
    this.data[key] = value;
  }
  async removeItem(key: string) {
    delete this.data[key];
  }
}

const setup = () => {
  const storage = new MemoryStorage();
  const gateway = new AsyncStorageReadingProgressGateway(storage, new FakeClock());
  return { storage, gateway };
};

describe('Feature: stockage local de la progression', () => {
  it('should load an empty registry when nothing is stored', async () => {
    const { gateway } = setup();
    expect(await gateway.load()).toEqual({});
  });

  it('should migrate guide.read-sections to progress.v1 and remove the legacy key', async () => {
    const { gateway, storage } = setup();
    storage.data['guide.read-sections'] = JSON.stringify(['institutions']);
    expect(await gateway.load()).toEqual({ 'guide:institutions': NOW });
    expect(JSON.parse(storage.data['progress.v1'])).toEqual({ 'guide:institutions': NOW });
    expect('guide.read-sections' in storage.data).toBe(false);
  });

  it('should prefer progress.v1 when both keys exist and remove the legacy key', async () => {
    const { gateway, storage } = setup();
    storage.data['progress.v1'] = JSON.stringify({ 'party:lfi': EARLIER });
    storage.data['guide.read-sections'] = JSON.stringify(['institutions']);
    expect(await gateway.load()).toEqual({ 'party:lfi': EARLIER });
    expect('guide.read-sections' in storage.data).toBe(false);
  });

  it('should return an empty registry when stored JSON is corrupted', async () => {
    const { gateway, storage } = setup();
    storage.data['progress.v1'] = '{oops';
    expect(await gateway.load()).toEqual({});
  });

  it('should save the registry under progress.v1 as a flat key → ISO date object', async () => {
    const { gateway, storage } = setup();
    await gateway.save({ 'party:lfi': EARLIER });
    expect(JSON.parse(storage.data['progress.v1'])).toEqual({ 'party:lfi': EARLIER });
  });

  it('should remove both keys when clearing', async () => {
    const { gateway, storage } = setup();
    storage.data['progress.v1'] = '{}';
    storage.data['guide.read-sections'] = '[]';
    await gateway.clear();
    expect(storage.data).toEqual({});
  });

  it('should not throw when the storage is unavailable', async () => {
    const broken: KeyValueStorage = {
      getItem: () => Promise.reject(new Error('denied')),
      setItem: () => Promise.reject(new Error('denied')),
      removeItem: () => Promise.reject(new Error('denied')),
    };
    const gateway = new AsyncStorageReadingProgressGateway(broken, new FakeClock());
    expect(await gateway.load()).toEqual({});
    await expect(gateway.save({ 'party:lfi': NOW })).resolves.toBeUndefined();
    await expect(gateway.clear()).resolves.toBeUndefined();
  });
});
