// Généré par scripts/promote-affaires.mjs : ne pas éditer à la main.
// Les dossiers viennent de docs/affaires/<id>.json après vérification croisée et validation
// humaine. Tous les partis ou aucun : tant que les dix dossiers ne sont pas publiés, la section
// « Procédures judiciaires » n'existe pas.
import ecologistes from '@/src/programmes/data/affaires/ecologistes.json';
import horizons from '@/src/programmes/data/affaires/horizons.json';
import lfi from '@/src/programmes/data/affaires/lfi.json';
import lr from '@/src/programmes/data/affaires/lr.json';
import nouvelleEnergie from '@/src/programmes/data/affaires/nouvelle-energie.json';
import pcf from '@/src/programmes/data/affaires/pcf.json';
import psPlacePublique from '@/src/programmes/data/affaires/ps-place-publique.json';
import reconquete from '@/src/programmes/data/affaires/reconquete.json';
import renaissance from '@/src/programmes/data/affaires/renaissance.json';
import rn from '@/src/programmes/data/affaires/rn.json';
import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';

export const LEGAL_DOSSIERS = [
  ecologistes,
  horizons,
  lfi,
  lr,
  nouvelleEnergie,
  pcf,
  psPlacePublique,
  reconquete,
  renaissance,
  rn,
] as unknown as LegalDossier[];
