import type { ReadingProgressGateway } from '@/src/programmes/gateways/reading-progress.gateway';

export class FakeReadingProgressGateway implements ReadingProgressGateway {
  saved: string[] = [];

  async load() {
    return this.saved;
  }

  async save(sectionIds: string[]) {
    this.saved = sectionIds;
  }
}
