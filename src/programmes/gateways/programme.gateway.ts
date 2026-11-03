import type { Catalog } from '@/src/programmes/models/programme.model';

export interface ProgrammeGateway {
  loadCatalog(): Promise<Catalog>;
}
