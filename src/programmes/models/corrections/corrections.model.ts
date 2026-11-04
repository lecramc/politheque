/** Date de lancement public (D-B2) : le journal ne couvre rien d'antérieur. */
export const CORRECTIONS_START = '2026-11-03';

export const CORRECTION_KINDS = ['correction', 'mise-a-jour', 'ajout', 'retrait'] as const;
export type CorrectionKind = (typeof CORRECTION_KINDS)[number];

export const CORRECTION_KIND_LABELS: Record<CorrectionKind, string> = {
  correction: 'Correction',
  'mise-a-jour': 'Mise à jour',
  ajout: 'Ajout',
  retrait: 'Retrait',
};

export const SUMMARY_MIN = 20;
export const SUMMARY_MAX = 300;

export interface CorrectionEntry {
  /** Lisible et stable : `${date}-${slug(summary) tronqué à 48}` ; suffixe -2, -3 en cas de collision. Ancre. */
  id: string;
  /** AAAA-MM-JJ, date du commit (Europe/Paris). */
  date: string;
  kind: CorrectionKind;
  /** Chemins canoniques du registre des routes (au moins un) : '/partis/rn/histoire'. */
  pages: string[];
  /** 20 à 300 caractères, une ou deux phrases, dates en toutes lettres. */
  summary: string;
}
