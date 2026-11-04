import type {
  LegalDossier,
  LegalEntry,
  LegalStep,
} from '@/src/programmes/models/legal/legal.model';
import type { Source } from '@/src/programmes/models/programme.model';

export const pressSource = (domain = 'lemonde.fr', date = '2016-03-01'): Source => ({
  title: `Article de presse ${domain}`,
  url: `https://www.${domain}/article`,
  date,
  kind: 'presse',
});

export const courtSource = (domain = 'courdecassation.fr', date = '2016-03-01'): Source => ({
  title: `Décision ${domain}`,
  url: `https://www.${domain}/decision`,
  date,
  kind: 'justice',
});

export const partySource = (): Source => ({
  title: 'Communiqué du parti',
  url: 'https://www.parti-test.fr/communique',
  date: '2016-03-01',
  kind: 'declaration',
});

export const legalStepFactory = (overrides: Partial<LegalStep> = {}): LegalStep => ({
  date: '2016-03-01',
  kind: 'ouverture-enquete',
  court: 'Parquet de Paris',
  decision: "Ouverture d'une enquête préliminaire.",
  outcome: null,
  sources: [pressSource()],
  ...overrides,
});

/** Entrée minimale valide : enquête en cours, deux sources indépendantes de domaines différents. */
export const legalEntryFactory = (overrides: Partial<LegalEntry> = {}): LegalEntry => ({
  id: 'assistants-parlementaires-dupont-jean',
  caseName: 'Assistants parlementaires du parti',
  person: { name: 'Jean Dupont', sortName: 'Dupont Jean', kind: 'personne-physique' },
  scope: 'dirigeant',
  roleAtTheTime: 'président du parti, député européen',
  category: 'probite',
  offences: ['détournement de fonds publics'],
  facts: { start: '2010', end: '2014' },
  status: 'enquete',
  steps: [legalStepFactory()],
  pendingRemedy: null,
  nextStep: null,
  sources: [pressSource('lemonde.fr'), courtSource('courdecassation.fr')],
  lastVerified: '2026-11-03',
  ...overrides,
});

export const legalDossierFactory = (overrides: Partial<LegalDossier> = {}): LegalDossier => ({
  partyId: 'parti-test',
  reviewedOn: '2026-11-03',
  entries: [legalEntryFactory()],
  ...overrides,
});
