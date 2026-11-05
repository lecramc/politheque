import { promoteDraft, type DraftReview } from '@/src/programmes/models/legal/legal-promotion';
import { legalEntryFactory, legalStepFactory } from '@/src/programmes/models/legal/legal.factory';
import type { LegalEntry } from '@/src/programmes/models/legal/legal.model';

const ctx = { today: '2026-11-04', partyIds: ['parti-test'] };
const retained: DraftReview = { decision: 'retenu' };

const draftEntry = (over: Partial<LegalEntry> = {}, review: DraftReview = retained) => ({
  ...legalEntryFactory(over),
  review,
});
const draft = (overrides: Record<string, unknown> = {}) => ({
  partyId: 'parti-test',
  reviewedOn: '2026-11-03',
  crossCheck: { by: 'XY', on: '2026-11-03' },
  humanValidation: { by: 'ZW', on: '2026-11-04' },
  entries: [draftEntry()],
  ...overrides,
});

describe('Feature: promotion d’un dossier validé', () => {
  it('should refuse a draft without cross-check or human validation', () => {
    for (const missing of ['crossCheck', 'humanValidation']) {
      const result = promoteDraft(draft({ [missing]: null }), ctx);
      expect(result.ok, missing).toBe(false);
      if (!result.ok) expect(result.errors.join()).toContain(missing);
    }
  });

  it('should drop non-retenu entries and report them', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry({ id: 'garde' }),
          draftEntry(
            { id: 'ecartee' },
            { decision: 'non-retenu', reason: 'Une seule source solide.' }
          ),
        ],
      }),
      ctx
    );
    expect(result).toMatchObject({
      ok: true,
      dropped: [{ id: 'ecartee', reason: 'Une seule source solide.' }],
    });
    if (result.ok) expect(result.dossier.entries.map((e) => e.id)).toEqual(['garde']);
  });

  it('should refuse a cas-limite entry without explicit human validation', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            { id: 'limite' },
            { decision: 'cas-limite', reason: 'Condamnation amnistiée.' }
          ),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join()).toContain('limite');
  });

  it('should publish a validated cas-limite entry without its review metadata', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            { id: 'limite' },
            {
              decision: 'cas-limite',
              reason: 'Fait sans lien direct avec la fonction.',
              humanValidation: { by: 'ZW', on: '2026-11-04' },
            }
          ),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.dossier.entries[0]).not.toHaveProperty('review');
      expect(result.dossier.entries[0].id).toBe('limite');
    }
  });

  it('should never copy reviewer names into the published dossier', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry(
            {},
            {
              decision: 'cas-limite',
              reason: 'Raison.',
              humanValidation: { by: 'Reviewer Name', on: '2026-11-04' },
            }
          ),
        ],
        crossCheck: { by: 'Cross Checker', on: '2026-11-03' },
        humanValidation: { by: 'Human Validator', on: '2026-11-04' },
        notes: 'note interne',
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    const json = JSON.stringify(result.ok ? result.dossier : null);
    for (const leaked of ['Reviewer Name', 'Cross Checker', 'Human Validator', 'note interne'])
      expect(json).not.toContain(leaked);
    if (result.ok)
      expect(Object.keys(result.dossier)).toEqual(['partyId', 'reviewedOn', 'entries']);
  });

  it('should refuse a draft whose entries fail validation, listing every issue', () => {
    const result = promoteDraft(
      draft({
        entries: [
          draftEntry({ id: 'a', steps: [legalStepFactory({ sources: [] })] }),
          draftEntry({ id: 'b', caseName: 'Un scandale' }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.includes('a') && e.includes('sources'))).toBe(true);
      expect(result.errors.some((e) => e.includes('b') && e.includes('vocabulaire'))).toBe(true);
    }
  });

  it('should be deterministic (same draft, same output), sorted by entry id', () => {
    const entries = [draftEntry({ id: 'zz' }), draftEntry({ id: 'aa' })];
    const first = promoteDraft(draft({ entries }), ctx);
    const second = promoteDraft(draft({ entries: [...entries].reverse() }), ctx);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    if (first.ok) expect(first.dossier.entries.map((e) => e.id)).toEqual(['aa', 'zz']);
  });
});

const source = (title: string, url: string, kind = 'presse') => ({
  title,
  url,
  date: '2026-07-07',
  kind,
});
const brouillonEntry = (over: Record<string, unknown> = {}) => ({
  id: 'parti-test-dupont-assistants',
  affaire: 'Assistants parlementaires',
  personne: 'Jean Dupont',
  typePersonne: 'personne-physique',
  scope: 'dirigeant',
  fonctionAuMomentDesFaits: 'président du parti, député européen',
  partiAuMomentDesFaits: 'Parti test',
  rattachement: 'Dirigeant actuel.',
  nature: 'penale',
  categorie: 'probite',
  infraction: 'Détournement de fonds publics (art. 432-15 du code pénal)',
  juridiction:
    'Tribunal correctionnel de Paris (31 mars 2025) ; cour d’appel de Paris (7 juillet 2026)',
  datesFaits: '2004-2016',
  dateDecision: '2026-07-07',
  peine: '18 mois de prison avec sursis',
  recours: 'Aucun recours connu.',
  statut: 'condamnation-recours-non-documente',
  resume: 'Jean Dupont a été déclaré coupable de détournement de fonds publics.',
  prochaineEtape: null,
  casLimite: null,
  presomptionInnocence: false,
  reactions: [],
  sources: [
    source(
      'Décision de la cour d’appel de Paris',
      'https://www.courdappel.fr/decision',
      'statistique'
    ),
    source('Article du Monde', 'https://www.lemonde.fr/article'),
  ],
  verification: { niveau: 'recoupee', recoupement: 'ok', aVerifier: [] },
  derniereVerification: '2026-11-04',
  ...over,
});
const brouillon = (over: Record<string, unknown> = {}) => ({
  partyId: 'parti-test',
  schemaVersion: 'brouillon-2',
  dateRecherche: '2026-11-04',
  entries: [brouillonEntry()],
  aRecouper: [brouillonEntry({ id: 'a-recouper' })],
  nonRetenu: [{ personne: 'X', fait: 'Y', raison: 'Z' }],
  aTransferer: [],
  renvois: [],
  crossCheck: { by: 'XY', on: '2026-11-04' },
  humanValidation: { by: 'ZW', on: '2026-11-04' },
  ...over,
});

describe('Feature: promotion d’un brouillon-2 (schéma des dossiers docs/affaires)', () => {
  it('should refuse a brouillon without cross-check or human validation', () => {
    for (const missing of ['crossCheck', 'humanValidation']) {
      const result = promoteDraft(brouillon({ [missing]: undefined }), ctx);
      expect(result.ok, missing).toBe(false);
      if (!result.ok) expect(result.errors.join()).toContain(missing);
    }
  });

  it('should convert an entry into the published format and ignore working sections', () => {
    const result = promoteDraft(brouillon(), ctx);
    expect(result.ok ? [] : result.errors).toEqual([]);
    if (!result.ok) return;
    expect(Object.keys(result.dossier)).toEqual(['partyId', 'reviewedOn', 'entries']);
    expect(result.dossier.reviewedOn).toBe('2026-11-04');
    expect(result.dossier.entries.map((e) => e.id)).toEqual(['parti-test-dupont-assistants']);
    expect(result.dossier.entries[0]).toMatchObject({
      caseName: 'Assistants parlementaires',
      person: { name: 'Jean Dupont', sortName: 'Dupont Jean', kind: 'personne-physique' },
      category: 'probite',
      facts: { start: '2004', end: '2016' },
      status: 'condamnation-recours-non-documente',
      pendingRemedy: null,
      lastVerified: '2026-11-04',
    });
    expect(result.dossier.entries[0].steps).toMatchObject([
      {
        date: '2026-07-07',
        kind: 'arret-appel',
        court: 'cour d’appel de Paris',
        outcome: 'condamnation',
        penalties: [{ kind: 'autre', label: '18 mois de prison avec sursis' }],
      },
    ]);
    const json = JSON.stringify(result.dossier);
    for (const internal of ['rattachement', 'verification', 'aVerifier', 'schemaVersion'])
      expect(json).not.toContain(internal);
  });

  it('should refuse a cas limite without human validation, and an unvalidated legal opinion', () => {
    const limited = promoteDraft(
      brouillon({ entries: [brouillonEntry({ casLimite: 'Appartenance actuelle à confirmer.' })] }),
      ctx
    );
    expect(limited.ok).toBe(false);
    if (!limited.ok) expect(limited.errors.join()).toContain('validation humaine');

    const advice = promoteDraft(
      brouillon({
        entries: [brouillonEntry({ avisJuridique: ['Réhabilitation de plein droit'] })],
      }),
      ctx
    );
    expect(advice.ok).toBe(false);
    if (!advice.ok) expect(advice.errors.join()).toContain('avis juridique');
  });

  it('should publish a validated cas limite and legal opinion without leaking them', () => {
    const validated = { by: 'ZW', on: '2026-11-04' };
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({
            casLimite: 'Appartenance actuelle à confirmer.',
            validationHumaine: validated,
            avisJuridique: ['Réhabilitation de plein droit'],
            avisJuridiqueRendu: validated,
          }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    const json = JSON.stringify(result.ok ? result.dossier : null);
    for (const leaked of ['Appartenance actuelle', 'Réhabilitation', 'avisJuridique', 'ZW'])
      expect(json).not.toContain(leaked);
  });

  it('should keep the editor wording of libellePublic as publicLabel', () => {
    const libellePublic =
      'Enquête préliminaire confirmée en mars 2022 ; dernière information publique : septembre 2022.';
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({
            statut: 'enquete',
            dateDecision: null,
            peine: null,
            juridiction: 'Parquet national financier',
            libellePublic,
          }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dossier.entries[0].publicLabel).toBe(libellePublic);
  });

  it('should derive a pending remedy for a non-final conviction and an annulment outcome', () => {
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({
            id: 'a',
            statut: 'condamnation-non-definitive',
            recours: 'Pourvoi en cassation formé par la personne.',
          }),
          brouillonEntry({
            id: 'b',
            statut: 'mise-en-examen-annulee',
            peine: null,
            resume: 'La mise en examen a été annulée par la chambre de l’instruction.',
          }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dossier.entries[0].pendingRemedy).toMatchObject({ kind: 'pourvoi-en-cassation' });
    expect(result.dossier.entries[1].steps[0].outcome).toBe('annulation');
  });

  it('should promote a rejected civil request with a rejection outcome', () => {
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({
            nature: 'civile-administrative',
            statut: 'demande-rejetee',
            peine: null,
            resume: 'Le tribunal a débouté le demandeur de sa demande.',
          }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.dossier.entries[0]).toMatchObject({
      status: 'demande-rejetee',
      nature: 'civile-administrative',
    });
    expect(result.dossier.entries[0].steps.at(-1)?.outcome).toBe('rejet');
  });

  it('should date an undated step from the earliest precise source, never from a bare year', () => {
    const dated = (date: string, host = 'lemonde.fr') => ({
      ...source('Article', `https://www.${host}/a`),
      date,
    });
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({
            statut: 'enquete',
            dateDecision: null,
            peine: null,
            sources: [dated('2026'), dated('2026-10-22', 'liberation.fr'), dated('2025-12')],
          }),
        ],
      }),
      ctx
    );
    expect(result.ok ? result.dossier.entries[0].steps[0].date : result).toBe('2025-12');
  });

  it('should flag a civil or administrative decision as such', () => {
    const result = promoteDraft(
      brouillon({
        entries: [
          brouillonEntry({ nature: 'civile-administrative', statut: 'condamnation-definitive' }),
        ],
      }),
      ctx
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.dossier.entries[0].nature).toBe('civile-administrative');
  });
});
