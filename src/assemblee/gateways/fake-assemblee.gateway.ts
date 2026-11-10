import type { AssembleeGateway } from '@/src/assemblee/gateways/assemblee.gateway';
import {
  directoryFactory,
  indexFactory,
  manifestFactory,
} from '@/src/assemblee/models/scrutin.factory';
import type {
  AssembleeManifest,
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';

export class FakeAssembleeGateway implements AssembleeGateway {
  index: ScrutinIndex = indexFactory();
  manifest: AssembleeManifest = manifestFactory();
  details: Record<number, ScrutinDetail> = {};
  directory: DeputeDirectory = directoryFactory();
  /** Fait échouer le chargement de l'annuaire ou du détail de ces scrutins. */
  error: Error | null = null;
  failingScrutins = new Set<number>();
  /** Appels reçus : permettent de vérifier qu'un chargement n'a lieu qu'une fois. */
  detailCalls: number[] = [];
  deputesCalls = 0;

  async loadIndex(): Promise<ScrutinIndex> {
    return this.index;
  }

  async loadManifest(): Promise<AssembleeManifest> {
    return this.manifest;
  }

  async loadScrutinDetail(numero: number): Promise<ScrutinDetail> {
    this.detailCalls.push(numero);
    if (this.error || this.failingScrutins.has(numero)) {
      throw this.error ?? new Error(`Détail du scrutin ${numero} indisponible`);
    }
    const detail = this.details[numero];
    if (!detail) throw new Error(`Scrutin ${numero} inconnu`);
    return detail;
  }

  async loadDeputes(): Promise<DeputeDirectory> {
    this.deputesCalls += 1;
    if (this.error) throw this.error;
    return this.directory;
  }
}
