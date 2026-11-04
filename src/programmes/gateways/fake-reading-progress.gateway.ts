import type { ReadingProgressGateway } from '@/src/programmes/gateways/reading-progress.gateway';
import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';

export class FakeReadingProgressGateway implements ReadingProgressGateway {
  entries: ReadingEntries = {};
  saveCount = 0;
  cleared = false;

  async load() {
    return this.entries;
  }

  async save(entries: ReadingEntries) {
    this.entries = entries;
    this.saveCount++;
  }

  async clear() {
    this.entries = {};
    this.cleared = true;
  }
}
