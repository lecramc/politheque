import type { Party } from '@/src/programmes/models/programme.model';

import ecologistes from './ecologistes.json';
import horizons from './horizons.json';
import lfi from './lfi.json';
import lr from './lr.json';
import pcf from './pcf.json';
import psPlacePublique from './ps-place-publique.json';
import reconquete from './reconquete.json';
import renaissance from './renaissance.json';
import rn from './rn.json';

// Ajouter un parti : créer son JSON (voir docs/brief-recherche-parti.md) puis l'importer ici.
export const PARTIES = [
  ecologistes,
  horizons,
  lfi,
  lr,
  pcf,
  psPlacePublique,
  reconquete,
  renaissance,
  rn,
] as Party[];
