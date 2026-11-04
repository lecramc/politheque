import type { ReadingEntries } from '@/src/programmes/models/reading-progress.model';

/** Contenus lus et tampons, conservés uniquement sur l'appareil du visiteur. */
export interface ReadingProgressGateway {
  /** Registre courant (migre l'ancien format si besoin). Ne rejette jamais : {} en cas d'erreur. */
  load(): Promise<ReadingEntries>;
  /** Remplace le registre. Échec silencieux (navigation privée) : la progression reste en mémoire. */
  save(entries: ReadingEntries): Promise<void>;
  /** Supprime `progress.v1` ET l'ancienne clé `guide.read-sections`. */
  clear(): Promise<void>;
}
