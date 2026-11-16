import type {
  AssembleeManifest,
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';

export interface AssembleeGateway {
  loadIndex(): Promise<ScrutinIndex>;
  loadManifest(): Promise<AssembleeManifest>;
  loadScrutinDetail(numero: number): Promise<ScrutinDetail>;
  loadDeputes(): Promise<DeputeDirectory>;
}
