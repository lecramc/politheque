import type { ProgrammeGateway } from '@/src/programmes/gateways/programme.gateway';
import { emptyCatalog } from '@/src/programmes/models/empty-catalog';
import type { Catalog } from '@/src/programmes/models/programme.model';

export class FakeProgrammeGateway implements ProgrammeGateway {
  catalog: Catalog = emptyCatalog();
  error: Error | null = null;

  async loadCatalog(): Promise<Catalog> {
    if (this.error) throw this.error;
    return this.catalog;
  }
}
