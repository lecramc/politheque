import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { AssembleeManifest } from '@/src/assemblee/models/scrutin.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

export const OFFICIAL_LIST_URL = 'https://www.assemblee-nationale.fr/dyn/17/scrutins';

/** Adresse officielle d'un scrutin sur le site de l'Assemblée nationale. */
export const officialScrutinUrl = (numero: number): string => `${OFFICIAL_LIST_URL}/${numero}`;

/** Mention de source, de licence et de date d'extraction (liste, scrutins, méthode). */
export const sourceNote = (manifest: AssembleeManifest) => ({
  line: COPY.common.source(manifest.licence, formatLongDate(manifest.extraitLe)),
  detail: COPY.common.sourceDetail(
    formatLongDate(manifest.dernier),
    manifest.sha256.scrutins.slice(0, 12)
  ),
  licence: manifest.licence,
});
