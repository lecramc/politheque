import { formatPenalty } from '@/src/programmes/models/legal/legal-penalties';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import {
  NON_FINAL_STATUSES,
  PRESUMPTION_NOTICE,
  STATUS_LABELS,
} from '@/src/programmes/models/legal/legal-vocabulary';
import {
  courtSource,
  legalDossierFactory,
  legalEntryFactory,
  legalStepFactory,
  pressSource,
} from '@/src/programmes/models/legal/legal.factory';
import type { LegalEntry, LegalStatus } from '@/src/programmes/models/legal/legal.model';
import { formatPartialDate } from '@/src/programmes/models/seo/dates';

const present = (...entries: LegalEntry[]) => presentDossier(legalDossierFactory({ entries }));
const allEntries = (d: ReturnType<typeof present>) => [...d.ongoing, ...d.closed];

describe('Feature: présentation des procédures', () => {
  it('should label every status with its exact French wording', () => {
    expect(STATUS_LABELS['mise-en-examen']).toBe('Mise en examen');
    expect(STATUS_LABELS['condamnation-non-definitive']).toBe(
      'Condamnation non définitive (recours en cours)'
    );
    expect(STATUS_LABELS.classement).toBe('Classement sans suite');
    expect(Object.keys(STATUS_LABELS)).toHaveLength(14);
  });

  it('should label an annulled mise en examen without any hint of guilt', () => {
    const [entry] = allEntries(present(legalEntryFactory({ status: 'mise-en-examen-annulee' })));
    expect(entry.statusLabel).toBe('Mise en examen annulée');
  });

  it('should add the presumption notice to every non-final status', () => {
    const nonFinal: LegalStatus[] = [
      'enquete',
      'temoin-assiste',
      'mise-en-examen',
      'renvoi-devant-tribunal',
      'proces-en-cours',
      'condamnation-non-definitive',
      'condamnation-recours-non-documente',
    ];
    expect([...NON_FINAL_STATUSES].sort()).toEqual([...nonFinal].sort());
    for (const status of nonFinal) {
      const [entry] = allEntries(present(legalEntryFactory({ status })));
      expect(entry.presumptionNotice, status).toBe(PRESUMPTION_NOTICE);
    }
  });

  it('should state the court and date of a conviction without trace of appeal, never as final', () => {
    const entry = (person: Partial<LegalEntry['person']>) =>
      legalEntryFactory({
        status: 'condamnation-recours-non-documente',
        person: {
          name: 'Jean Dupont',
          sortName: 'Dupont Jean',
          kind: 'personne-physique',
          ...person,
        },
        steps: [
          legalStepFactory({
            date: '2026-06-08',
            kind: 'jugement',
            court: 'Tribunal correctionnel de Paris',
            outcome: 'condamnation',
          }),
        ],
      });
    const label = (e: LegalEntry) => allEntries(present(e))[0].statusLabel;
    const tail =
      " par le tribunal correctionnel de Paris le 8 juin 2026 ; nous n'avons pas trouvé trace d'un recours";
    expect(label(entry({}))).toBe(`Condamné·e${tail}`);
    expect(label(entry({ gender: 'f' }))).toBe(`Condamnée${tail}`);
    expect(label(entry({ gender: 'm' }))).toBe(`Condamné${tail}`);
    expect(label(entry({ name: 'Parti test', kind: 'personne-morale' }))).toBe(
      `Condamnation${tail}`
    );
    expect(label(entry({})).toLowerCase()).not.toContain('définitiv');
    expect(allEntries(present(entry({})))[0].presumptionNotice).toBe(PRESUMPTION_NOTICE);
  });

  it('should say plainly when the date of the facts is unknown', () => {
    const [entry] = allEntries(present(legalEntryFactory({ facts: null })));
    expect(entry.facts).toBe('Date des faits non précisée dans les sources');
  });

  it('should present a civil or administrative decision outside the penal wording', () => {
    const [entry] = allEntries(
      present(
        legalEntryFactory({
          nature: 'civile-administrative',
          status: 'condamnation-definitive',
          category: 'propos-discrimination',
        })
      )
    );
    expect(entry.categoryLabel).toBe('Décision civile ou administrative');
    expect(entry.statusLabel).toBe('Décision définitive défavorable');
  });

  it('should show the editor wording of an entry next to its status, except when generated', () => {
    const publicLabel = 'Dernière information publique : septembre 2022.';
    const [shown] = allEntries(present(legalEntryFactory({ publicLabel })));
    expect(shown.statusDetail).toBe(publicLabel);
    const [generated] = allEntries(
      present(legalEntryFactory({ status: 'condamnation-recours-non-documente', publicLabel }))
    );
    expect(generated.statusDetail).toBeNull();
  });

  it('should name a cour d’appel with its feminine article and omit an unknown court', () => {
    const label = (court: string | undefined, date = '2021-11-17') =>
      allEntries(
        present(
          legalEntryFactory({
            status: 'condamnation-recours-non-documente',
            steps: [
              legalStepFactory({ date, kind: 'arret-appel', court, outcome: 'condamnation' }),
            ],
          })
        )
      )[0].statusLabel;
    expect(label("Cour d'appel d'Aix-en-Provence")).toContain(
      "par la cour d'appel d'Aix-en-Provence le 17 novembre 2021"
    );
    expect(label('Cour de justice de la République')).toContain(
      'par la Cour de justice de la République'
    );
    expect(label(undefined, '1997-12')).toBe(
      "Condamné·e en décembre 1997 ; nous n'avons pas trouvé trace d'un recours"
    );
  });

  it('should not add the notice to a final conviction nor to a final acquittal', () => {
    for (const status of ['condamnation-definitive', 'acquittement', 'non-lieu'] as const) {
      const [entry] = allEntries(present(legalEntryFactory({ status })));
      expect(entry.presumptionNotice, status).toBeNull();
    }
  });

  it('should mention a pending prosecution appeal on a relaxe', () => {
    const appealed = legalEntryFactory({
      status: 'relaxe',
      pendingRemedy: { kind: 'appel', filedBy: 'parquet' },
    });
    const free = legalEntryFactory({ id: 'autre-entree', status: 'relaxe' });
    const dossier = present(appealed, free);
    expect(dossier.ongoing.map((e) => e.id)).toEqual([appealed.id]);
    expect(dossier.ongoing[0].statusLabel).toBe('Relaxe (appel du parquet en cours)');
    expect(dossier.ongoing[0].presumptionNotice).toBe(PRESUMPTION_NOTICE);
    expect(dossier.closed[0].statusLabel).toBe('Relaxe');
  });

  it('should always write « peine d’inéligibilité »', () => {
    expect(formatPenalty({ kind: 'ineligibilite', months: 60, provisionalExecution: true })).toBe(
      "peine d'inéligibilité de 5 ans avec exécution provisoire"
    );
    expect(formatPenalty({ kind: 'ineligibilite', months: 18, provisionalExecution: false })).toBe(
      "peine d'inéligibilité de 18 mois"
    );
  });

  it('should format prison with its suspended part and arrangement', () => {
    expect(
      formatPenalty({
        kind: 'prison',
        months: 48,
        suspendedMonths: 24,
        arrangement: '2 ans aménagés sous bracelet électronique',
      })
    ).toBe(
      "4 ans d'emprisonnement dont 2 ans avec sursis (2 ans aménagés sous bracelet électronique)"
    );
    expect(formatPenalty({ kind: 'prison', months: 30, suspendedMonths: 0 })).toBe(
      "2 ans et 6 mois d'emprisonnement"
    );
    expect(formatPenalty({ kind: 'prison', months: 12, suspendedMonths: 12 })).toBe(
      "1 an d'emprisonnement avec sursis"
    );
    expect(formatPenalty({ kind: 'amende', euros: 100000 })).toBe("100 000 € d'amende");
    expect(formatPenalty({ kind: 'amende', euros: 100000, suspendedEuros: 50000 })).toBe(
      "100 000 € d'amende dont 50 000 € avec sursis"
    );
    expect(formatPenalty({ kind: 'autre', label: 'confiscation de 1 000 000 €' })).toBe(
      'confiscation de 1 000 000 €'
    );
  });

  it('should format dates in full French words', () => {
    expect(formatPartialDate('2016')).toBe('2016');
    expect(formatPartialDate('2016-03')).toBe('mars 2016');
    expect(formatPartialDate('2016-03-01')).toBe('1er mars 2016');
    expect(formatPartialDate('2026-11-04')).toBe('4 novembre 2026');
    const [entry] = allEntries(
      present(
        legalEntryFactory({
          facts: { start: '2004', end: '2016' },
          lastVerified: '2026-11-04',
          nextStep: {
            label: 'Décision de la Cour de cassation',
            expected: '2027-04',
            precision: 'au-plus-tard',
            sources: [pressSource()],
          },
        })
      )
    );
    expect(entry.facts).toBe('Faits de 2004 à 2016');
    expect(entry.lastVerified).toBe('4 novembre 2026');
    expect(entry.nextStep?.text).toBe(
      'Attendue au plus tard en avril 2027 : Décision de la Cour de cassation'
    );
    expect(present(legalEntryFactory({ facts: { start: '2010-05' } })).ongoing[0].facts).toBe(
      'Faits en mai 2010'
    );
  });

  it('should split entries into ongoing and closed groups', () => {
    const ongoing = legalEntryFactory({ id: 'a', status: 'mise-en-examen' });
    const closed = legalEntryFactory({ id: 'b', status: 'non-lieu' });
    const dossier = present(closed, ongoing);
    expect(dossier.ongoing.map((e) => e.id)).toEqual(['a']);
    expect(dossier.closed.map((e) => e.id)).toEqual(['b']);
    expect(dossier.isEmpty).toBe(false);
  });

  it('should list the legal person first, then persons by sort name, then by facts date', () => {
    const person = (id: string, sortName: string, start = '2010') =>
      legalEntryFactory({
        id,
        person: { name: sortName, sortName, kind: 'personne-physique' },
        facts: { start },
      });
    const party = legalEntryFactory({
      id: 'parti',
      scope: 'parti',
      person: { name: 'Parti test', sortName: 'Parti test', kind: 'personne-morale' },
    });
    const dossier = present(
      person('z', 'Zola Emile'),
      person('a2', 'Alpha Jean', '2015'),
      party,
      person('a1', 'Alpha Jean', '2005'),
      person('e', 'Élu Paul')
    );
    expect(dossier.ongoing.map((e) => e.id)).toEqual(['parti', 'a1', 'a2', 'e', 'z']);
  });

  it('should produce the uniform empty state with the review date', () => {
    const dossier = presentDossier(legalDossierFactory({ entries: [], reviewedOn: '2026-11-03' }));
    expect(dossier).toMatchObject({ isEmpty: true, ongoing: [], closed: [] });
    expect(dossier.reviewedOn).toBe('3 novembre 2026');
  });

  it('should present steps with court, decision, penalties and sources, and the heading without evaluation', () => {
    const step = legalStepFactory({
      date: '2020-05-10',
      kind: 'jugement',
      court: 'Tribunal correctionnel de Paris',
      decision: 'Jean Dupont est déclaré coupable de détournement de fonds publics.',
      outcome: 'condamnation',
      penalties: [{ kind: 'amende', euros: 10000 }],
      sources: [courtSource()],
    });
    const [entry] = allEntries(
      present(legalEntryFactory({ status: 'condamnation-definitive', steps: [step] }))
    );
    expect(entry.heading).toBe('Jean Dupont · Assistants parlementaires du parti');
    expect(entry.categoryLabel).toBe('Probité');
    expect(entry.offences).toBe('détournement de fonds publics');
    expect(entry.steps[0]).toMatchObject({
      date: '10 mai 2020',
      court: 'Tribunal correctionnel de Paris',
      penalties: ["10 000 € d'amende"],
    });
    expect(entry.anchor).toBe(entry.id);
  });
});
