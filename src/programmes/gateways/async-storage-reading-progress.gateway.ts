import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReadingProgressGateway } from '@/src/programmes/gateways/reading-progress.gateway';

const KEY = 'guide.read-sections';

export class AsyncStorageReadingProgressGateway implements ReadingProgressGateway {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }

  async save(sectionIds: string[]) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(sectionIds));
    } catch {
      // Stockage indisponible (navigation privée) : la progression reste en mémoire.
    }
  }
}
