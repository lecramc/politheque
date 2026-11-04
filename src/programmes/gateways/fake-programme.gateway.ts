import type { ProgrammeGateway } from '@/src/programmes/gateways/programme.gateway';
import type { Catalog } from '@/src/programmes/models/programme.model';

export class FakeProgrammeGateway implements ProgrammeGateway {
  catalog: Catalog = {
    parties: [],
    elections: [],
    themes: [],
    questions: [],
    axes: [],
    guide: [],
    corrections: [],
    legal: [],
  };
  error: Error | null = null;

  async loadCatalog(): Promise<Catalog> {
    if (this.error) throw this.error;
    return this.catalog;
  }
}
