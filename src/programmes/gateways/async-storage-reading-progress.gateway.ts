import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Clock } from '@/src/programmes/gateways/clock.gateway';
import type { ReadingProgressGateway } from '@/src/programmes/gateways/reading-progress.gateway';
import { systemClock } from '@/src/programmes/gateways/system-clock.gateway';
import {
  migrateLegacyGuideIds,
  sanitizeEntries,
  type ReadingEntries,
} from '@/src/programmes/models/reading-progress.model';

export type KeyValueStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const KEY = 'progress.v1';
const LEGACY_KEY = 'guide.read-sections';

const parse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export class AsyncStorageReadingProgressGateway implements ReadingProgressGateway {
  constructor(
    private readonly storage: KeyValueStorage = AsyncStorage,
    private readonly clock: Clock = systemClock
  ) {}

  async load(): Promise<ReadingEntries> {
    try {
      const raw = await this.storage.getItem(KEY);
      const legacy = await this.storage.getItem(LEGACY_KEY);
      if (raw !== null) {
        if (legacy !== null) await this.storage.removeItem(LEGACY_KEY);
        return sanitizeEntries(parse(raw));
      }
      if (legacy === null) return {};
      const migrated = migrateLegacyGuideIds(parse(legacy), this.clock.now().toISOString());
      await this.storage.setItem(KEY, JSON.stringify(migrated));
      await this.storage.removeItem(LEGACY_KEY);
      return migrated;
    } catch {
      return {};
    }
  }

  async save(entries: ReadingEntries) {
    try {
      await this.storage.setItem(KEY, JSON.stringify(entries));
    } catch {
      // Stockage indisponible (navigation privée) : la progression reste en mémoire.
    }
  }

  async clear() {
    try {
      await this.storage.removeItem(KEY);
      await this.storage.removeItem(LEGACY_KEY);
    } catch {
      // Rien à effacer si le stockage est indisponible.
    }
  }
}
