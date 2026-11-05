import { validateLegalDossier } from '@/src/programmes/models/legal/legal-validation';
import {
  courtSource,
  legalDossierFactory,
  legalEntryFactory,
  legalStepFactory,
  partySource,
  pressSource,
} from '@/src/programmes/models/legal/legal.factory';
import type { LegalDossier, LegalEntry } from '@/src/programmes/models/legal/legal.model';

const ctx = { today: '2026-11-04', partyIds: ['parti-test', 'autre'] };
const check = (dossier: unknown) => validateLegalDossier(dossier, ctx);
const checkEntry = (overrides: Partial<LegalEntry> | Record<string, unknown>) =>
  check(legalDossierFactory({ entries: [legalEntryFactory(overrides as Partial<LegalEntry>)] }));
const rules = (issues: ReturnType<typeof check>) => issues.map((i) => i.rule);

const conviction = (over = {}) =>
  legalStepFactory({
    date: '2020-05-10',
    kind: 'jugement',
    court: 'Tribunal correctionnel de Paris',
    decision: 'Jean Dupont est déclaré coupable de détournement de fonds publics.',
    outcome: 'condamnation',
    penalties: [{ kind: 'prison', months: 24, suspendedMonths: 24 }],
    ...over,
  });

describe('Feature: validation d’un dossier de procédures', () => {
  it('should accept a minimal valid entry', () => {
    expect(checkEntry({})).toEqual([]);
  });

  it('should reject an entry without status', () => {
    const entry = { ...legalEntryFactory() } as Record<string, unknown>;
    delete entry.status;
    expect(rules(check({ ...legalDossierFactory(), entries: [entry] }))).toContain('statut');
  });

  it('should reject a status outside the closed list', () => {
    expect(rules(checkEntry({ status: 'blanchi' as never }))).toContain('statut');
  });

  it('should reject an entry sourced by a single domain', () => {
    const issues = checkEntry({
      steps: [legalStepFactory({ sources: [pressSource('lemonde.fr')] })],
      sources: [pressSource('lemonde.fr'), pressSource('lemonde.fr')],
    });
    expect(rules(issues)).toContain('sources');
  });

  it('should reject an entry whose only second source comes from the party', () => {
    const issues = checkEntry({
      steps: [legalStepFactory({ sources: [pressSource('lemonde.fr')] })],
      sources: [pressSource('lemonde.fr'), partySource()],
    });
    expect(rules(issues)).toContain('sources');
  });

  it('should accept a court decision plus one national press article', () => {
    expect(
      checkEntry({
        steps: [legalStepFactory({ sources: [courtSource('legifrance.gouv.fr')] })],
        sources: [pressSource('lemonde.fr')],
      })
    ).toEqual([]);
  });

  it('should require at least one source on every step', () => {
    expect(rules(checkEntry({ steps: [legalStepFactory({ sources: [] })] }))).toContain('sources');
  });

  it('should reject non-ISO dates', () => {
    expect(rules(checkEntry({ steps: [legalStepFactory({ date: '1er mars 2016' })] }))).toContain(
      'dates'
    );
    expect(rules(checkEntry({ facts: { start: '2010-13' } }))).toContain('dates');
    expect(rules(checkEntry({ lastVerified: '2026-02-30' }))).toContain('dates');
  });

  it('should reject steps out of chronological order', () => {
    const issues = checkEntry({
      steps: [legalStepFactory({ date: '2018-01-01' }), legalStepFactory({ date: '2016-01-01' })],
    });
    expect(rules(issues)).toContain('dates');
  });

  it('should reject facts that end after the first step', () => {
    expect(rules(checkEntry({ facts: { start: '2010', end: '2018' } }))).toContain('dates');
  });

  it('should reject a date in the future of today', () => {
    expect(rules(checkEntry({ steps: [legalStepFactory({ date: '2027-01-01' })] }))).toContain(
      'dates'
    );
    expect(rules(check(legalDossierFactory({ reviewedOn: '2026-12-01' })))).toContain('dates');
  });

  it('should reject an entry without lastVerified or verified before its latest step', () => {
    const entry = { ...legalEntryFactory() } as Record<string, unknown>;
    delete entry.lastVerified;
    expect(rules(check({ ...legalDossierFactory(), entries: [entry] }))).toContain('forme');
    expect(
      rules(
        checkEntry({
          steps: [legalStepFactory({ date: '2016-03-01' })],
          lastVerified: '2016-02-01',
        })
      )
    ).toContain('dates');
  });

  it('should reject a next step expected before the latest step', () => {
    const nextStep = {
      label: 'Décision attendue',
      expected: '2016-02',
      precision: 'annoncee' as const,
      sources: [pressSource()],
    };
    expect(rules(checkEntry({ nextStep }))).toContain('dates');
    expect(checkEntry({ nextStep: { ...nextStep, expected: '2027-04' } })).toEqual([]);
  });

  it('should reject a final conviction with a pending remedy', () => {
    const issues = checkEntry({
      status: 'condamnation-definitive',
      steps: [conviction()],
      pendingRemedy: { kind: 'appel', filedBy: 'personne' },
    });
    expect(rules(issues)).toContain('coherence');
    expect(
      checkEntry({ status: 'condamnation-definitive', steps: [conviction()], pendingRemedy: null })
    ).toEqual([]);
  });

  it('should reject a non-final conviction without a pending remedy', () => {
    const issues = checkEntry({
      status: 'condamnation-non-definitive',
      steps: [conviction()],
      pendingRemedy: null,
    });
    expect(rules(issues)).toContain('coherence');
  });

  it('should accept an entry whose date of facts is unknown (null), never a made-up one', () => {
    expect(checkEntry({ facts: null })).toEqual([]);
  });

  it('should accept a conviction without trace of appeal only if no remedy is known', () => {
    const status = 'condamnation-recours-non-documente' as const;
    expect(checkEntry({ status, steps: [conviction()], pendingRemedy: null })).toEqual([]);
    const withRemedy = checkEntry({
      status,
      steps: [conviction()],
      pendingRemedy: { kind: 'appel', filedBy: 'personne' },
    });
    expect(rules(withRemedy)).toContain('coherence');
    expect(rules(checkEntry({ status, steps: [legalStepFactory()] }))).toContain('coherence');
  });

  it('should accept an annulled mise en examen only if the last step annuls it', () => {
    const status = 'mise-en-examen-annulee' as const;
    const annulled = legalStepFactory({
      kind: 'mise-en-examen',
      decision: 'La mise en examen est annulée par la chambre de l’instruction.',
      outcome: 'annulation',
    });
    expect(checkEntry({ status, steps: [annulled] })).toEqual([]);
    expect(rules(checkEntry({ status, steps: [legalStepFactory()] }))).toContain('coherence');
  });

  it('should accept a rejected request only if the last step is a civil decision of rejection', () => {
    const status = 'demande-rejetee' as const;
    const rejected = legalStepFactory({
      kind: 'jugement',
      court: 'Tribunal judiciaire de Paris',
      decision: 'Le tribunal déboute le demandeur de sa demande.',
      outcome: 'rejet',
    });
    expect(checkEntry({ status, nature: 'civile-administrative', steps: [rejected] })).toEqual([]);
    expect(rules(checkEntry({ status, steps: [legalStepFactory()] }))).toContain('coherence');
  });

  it('should reject penalties on a step that is not a conviction', () => {
    const issues = checkEntry({
      steps: [legalStepFactory({ penalties: [{ kind: 'amende', euros: 1000 }] })],
    });
    expect(rules(issues)).toContain('coherence');
  });

  it('should reject a relaxe whose last decision is not a relaxe', () => {
    const issues = checkEntry({ status: 'relaxe', steps: [conviction()] });
    expect(rules(issues)).toContain('coherence');
    const ok = checkEntry({
      status: 'relaxe',
      steps: [
        legalStepFactory({
          date: '2020-05-10',
          kind: 'jugement',
          decision: 'Jean Dupont est relaxé.',
          outcome: 'relaxe',
        }),
      ],
    });
    expect(ok).toEqual([]);
  });

  it('should reject penalties with non-integer or inconsistent amounts', () => {
    const issues = checkEntry({
      status: 'condamnation-definitive',
      steps: [conviction({ penalties: [{ kind: 'prison', months: 12, suspendedMonths: 18 }] })],
    });
    expect(rules(issues)).toContain('peines');
    expect(
      rules(
        checkEntry({
          status: 'condamnation-definitive',
          steps: [conviction({ penalties: [{ kind: 'amende', euros: 10.5 }] })],
        })
      )
    ).toContain('peines');
  });

  it('should reject a legal person outside the party scope', () => {
    const morale = { name: 'Parti test', sortName: 'Parti test', kind: 'personne-morale' as const };
    expect(rules(checkEntry({ person: morale, scope: 'dirigeant' }))).toContain('personne');
    expect(rules(checkEntry({ scope: 'parti' }))).toContain('personne');
    expect(checkEntry({ person: morale, scope: 'parti' })).toEqual([]);
  });

  it('should reject evaluative terms in every text field', () => {
    const bad = {
      caseName: 'Un scandale au Parlement',
      roleAtTheTime: 'président sulfureux',
      offences: ['détournement notoire'],
    };
    for (const [field, value] of Object.entries(bad)) {
      expect(rules(checkEntry({ [field]: value })), field).toContain('vocabulaire');
    }
    expect(
      rules(checkEntry({ steps: [legalStepFactory({ decision: 'Il a été blanchi.' })] }))
    ).toContain('vocabulaire');
    expect(
      rules(checkEntry({ steps: [legalStepFactory({ court: 'Tribunal tristement connu' })] }))
    ).toContain('vocabulaire');
  });

  it('should reject « inculpé » and accept « déclaré coupable »', () => {
    expect(
      rules(checkEntry({ steps: [legalStepFactory({ decision: 'Jean Dupont est inculpé.' })] }))
    ).toContain('vocabulaire');
    expect(
      rules(checkEntry({ steps: [legalStepFactory({ decision: 'La personne est coupable.' })] }))
    ).toContain('vocabulaire');
    expect(
      checkEntry({
        status: 'condamnation-definitive',
        steps: [conviction({ decision: 'Elle est déclarée coupable de détournement de fonds.' })],
      })
    ).toEqual([]);
  });

  it('should accept « faits présumés » (a qualification), not a presumption notice', () => {
    const steps = [
      legalStepFactory({
        decision: 'Information judiciaire sur des faits présumés de corruption.',
      }),
    ];
    expect(checkEntry({ steps })).toEqual([]);
  });

  it('should reject a hand-written presumption of innocence notice and working notes', () => {
    expect(
      rules(
        checkEntry({
          steps: [legalStepFactory({ decision: "Il reste présumé innocent jusqu'au jugement." })],
        })
      )
    ).toContain('vocabulaire');
    expect(
      rules(checkEntry({ steps: [legalStepFactory({ decision: 'Détail à vérifier.' })] }))
    ).toContain('notes-de-travail');
  });

  it('should reject duplicate entry ids and unknown party ids', () => {
    const dup = legalDossierFactory({ entries: [legalEntryFactory(), legalEntryFactory()] });
    expect(rules(check(dup))).toContain('unicite');
    expect(rules(check(legalDossierFactory({ partyId: 'inconnu' })))).toContain('unicite');
  });

  it('should reject a malformed dossier instead of throwing', () => {
    expect(rules(check(null))).toContain('forme');
    expect(
      rules(check({ partyId: 'parti-test', reviewedOn: '2026-11-03', entries: 'x' }))
    ).toContain('forme');
    const dossier: LegalDossier = legalDossierFactory();
    expect(check(dossier)).toEqual([]);
  });
});
