/** Sections du guide déjà lues : conservées uniquement sur l'appareil du visiteur. */
export interface ReadingProgressGateway {
  load(): Promise<string[]>;
  save(sectionIds: string[]): Promise<void>;
}
