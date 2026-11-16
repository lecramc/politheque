import manifest from '@/src/assemblee/data/manifest.json';
import indexData from '@/src/assemblee/data/scrutins-index.json';
import type { AssembleeGateway } from '@/src/assemblee/gateways/assemblee.gateway';
import type {
  AssembleeManifest,
  DeputeDirectory,
  ScrutinDetail,
  ScrutinIndex,
} from '@/src/assemblee/models/scrutin.model';

const DATA_PATH = '/donnees/assemblee/v1';

/** Index et manifeste embarqués dans le bundle (pré-rendu, SEO) ; détails et députés servis en fichiers. */
export const buildStaticIndex = (): ScrutinIndex => indexData as unknown as ScrutinIndex;
export const buildStaticManifest = (): AssembleeManifest =>
  manifest as unknown as AssembleeManifest;

export class StaticAssembleeGateway implements AssembleeGateway {
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;
  private readonly version: string;

  /**
   * `baseUrl` : vide sur le web (même origine, autorisé par `connect-src 'self'`), adresse du site sur
   * natif. L'URL est versionnée par l'empreinte du manifeste : les fichiers sont servis en cache
   * longue durée et changent d'adresse à chaque rafraîchissement des données.
   */
  constructor(options: { fetchImpl?: typeof fetch; baseUrl?: string } = {}) {
    this.fetchImpl = options.fetchImpl ?? ((...args) => fetch(...args));
    this.baseUrl = options.baseUrl ?? '';
    // Détails et annuaire dépendent des deux fichiers sources (scrutins et acteurs).
    this.version = `${manifest.sha256.scrutins.slice(0, 12)}-${manifest.sha256.amo.slice(0, 12)}`;
  }

  async loadIndex(): Promise<ScrutinIndex> {
    return buildStaticIndex();
  }

  async loadManifest(): Promise<AssembleeManifest> {
    return buildStaticManifest();
  }

  loadScrutinDetail(numero: number): Promise<ScrutinDetail> {
    return this.fetchJson<ScrutinDetail>(`scrutins/${numero}.json`);
  }

  loadDeputes(): Promise<DeputeDirectory> {
    return this.fetchJson<DeputeDirectory>('deputes.json');
  }

  private async fetchJson<T>(file: string): Promise<T> {
    const url = `${this.baseUrl}${DATA_PATH}/${file}?v=${this.version}`;
    const response = await this.fetchImpl(url);
    if (!response.ok) throw new Error(`Chargement impossible (${response.status}) : ${file}`);
    return (await response.json()) as T;
  }
}
