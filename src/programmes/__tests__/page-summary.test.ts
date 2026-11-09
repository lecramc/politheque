import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { ofParty, partySummary } from '@/src/programmes/models/page-summary.service';
import type { Candidacy, CandidacyStatus } from '@/src/programmes/models/programme.model';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

// Neutralité (charte, règle 6) : la phrase de résumé en tête des fiches et des débats suit une
// formule par statut (charte, règle 4), n'emploie que des données publiées et n'évalue rien.
const catalog = buildStaticCatalog();
const state = stateBuilder().withCatalog(catalog).build();
const partySummaryOf = (id: string) => partyViewModel(id)({ dispatch: vi.fn() })(state).summary;
const debateSummaryOf = (id: string) => themeViewModel(id)({ dispatch: vi.fn() })(state).summary;
const featured = catalog.elections.find((e) => e.featured)!;

const DATE = /^Au (1er|\d{1,2}) [a-zéû]+ \d{4}, /;
const EVALUATIVE =
  /extr[êe]me|radical|populiste|mod[ée]r[ée]|dangereux|irr[ée]aliste|ambitieux|favori|principal|crédible|sérieu/i;
/** Fautes d'article : « de Le », « de Les », « à les », « de Parti »… */
const BAD_ARTICLE = /\b(de|à) (Le|Les|le|les) |\bde (Parti|Rassemblement)\b|\bde [AEIOUÉH]/;

const candidacy = (status: CandidacyStatus, statusLabel: string): Candidacy => ({
  ...catalog.parties[0].candidacies[featured.id],
  candidateName: 'Camille Martin',
  status,
  statusLabel,
});
const party = { name: 'Les Exemples', shortName: 'LXP', lastVerified: '2026-11-01' };
const summaryFor = (c: Candidacy | null) =>
  partySummary({
    party,
    candidacy: c,
    electionTitle: "l'élection présidentielle de 2027",
    themeIds: ['economie'],
  });

describe('Feature: phrase de résumé des fiches partis', () => {
  const parties = catalog.parties.filter((p) => p.candidacies[featured.id]);

  it('should open every fiche with a dated sentence naming the candidate', () => {
    expect(parties).toHaveLength(10);
    for (const p of parties) {
      const summary = partySummaryOf(p.id)!;
      expect(summary, p.id).toMatch(DATE);
      expect(summary, p.id).toContain(p.candidacies[featured.id].candidateName);
      expect(summary, p.id).toMatch(
        / ; ses propositions sont recensées dans \d+ thèmes? sur \d+\.$/
      );
    }
  });

  it('should agree with the gender given by the status label', () => {
    for (const p of parties) {
      const c = p.candidacies[featured.id];
      const summary = partySummaryOf(p.id)!;
      if (/^Candidate\b/.test(c.statusLabel)) expect(summary, p.id).toContain('est la candidate');
      if (/^Candidat\b/.test(c.statusLabel)) expect(summary, p.id).toContain('est le candidat');
    }
  });

  it('should contract the article of every party name and never evaluate', () => {
    for (const p of parties) {
      const summary = partySummaryOf(p.id)!;
      expect(summary.replace('de La France insoumise', ''), p.id).not.toMatch(BAD_ARTICLE);
      expect(summary, p.id).not.toMatch(EVALUATIVE);
    }
    expect(partySummaryOf('pcf')).toBe(
      "Au 3 novembre 2026, Fabien Roussel est le candidat investi du Parti communiste français (PCF) pour l'élection présidentielle de 2027 ; ses propositions sont recensées dans 9 thèmes sur 9."
    );
  });

  it.each([
    [
      'declare',
      'Candidate déclarée',
      'Camille Martin est la candidate déclarée des Exemples (LXP) pour',
    ],
    [
      'investi',
      'Candidat investi',
      'Camille Martin est le candidat investi des Exemples (LXP) pour',
    ],
    [
      'investi',
      'Candidate investie',
      'Camille Martin est la candidate investie des Exemples (LXP) pour',
    ],
    [
      'designe',
      'Candidate désignée',
      "est la candidate désignée des Exemples (LXP) pour l'élection présidentielle de 2027, avant un vote des adhérents",
    ],
    [
      'annonce',
      'Candidature annoncée',
      "Camille Martin a annoncé sa candidature à l'élection présidentielle de 2027 pour Les Exemples (LXP), sans l'avoir encore déclarée formellement",
    ],
    [
      'pressenti',
      'Candidate pressentie',
      'Camille Martin est pressentie comme candidate des Exemples (LXP) pour',
    ],
  ] as const)('should phrase the status %s (%s)', (status, label, expected) => {
    expect(summaryFor(candidacy(status, label))).toContain(expected);
  });

  it('should say so when the party has no candidacy', () => {
    expect(summaryFor(null)).toBe(
      "Au 1er novembre 2026, aucune candidature des Exemples (LXP) n'est recensée pour l'élection présidentielle de 2027."
    );
  });

  it('should contract party names', () => {
    expect(ofParty('Rassemblement national')).toBe('du Rassemblement national');
    expect(ofParty('Les Écologistes')).toBe('des Écologistes');
    expect(ofParty('La France insoumise')).toBe('de La France insoumise');
    expect(ofParty('Horizons')).toBe("d'Horizons");
    expect(ofParty('Renaissance')).toBe('de Renaissance');
  });
});

describe('Feature: phrase de résumé des débats', () => {
  it('should open the nine debates with a dated sentence on the same template', () => {
    expect(catalog.themes).toHaveLength(9);
    const skeletons = catalog.themes.map((theme) => {
      const summary = debateSummaryOf(theme.id)!;
      expect(summary, theme.id).toMatch(DATE);
      expect(summary).not.toMatch(EVALUATIVE);
      return summary
        .split(theme.title)
        .join('▢')
        .replace(/^Au (1er|\d+) [a-zéû]+ \d{4}/, 'Au DATE')
        .replace(/\d+/g, '#');
    });
    expect(new Set(skeletons).size, skeletons.join('\n')).toBe(1);
    expect(debateSummaryOf('economie')).toMatch(
      /^Au .+, Polithèque présente les propositions des 10 partis sur le thème « Économie, impôts et dette », par ordre alphabétique, avec \d+ chiffres clés sourcés\.$/
    );
  });

  it('should date the sentence like the page itself (dateModified)', () => {
    const vm = themeViewModel('economie')({ dispatch: vi.fn() })(state);
    const iso = /"dateModified":"(\d{4})-(\d{2})-(\d{2})"/.exec(JSON.stringify(vm.meta?.jsonLd))!;
    expect(vm.summary).toContain(`${Number(iso[3]) === 1 ? '1er' : Number(iso[3])} `);
    expect(vm.summary).toContain(iso[1]);
  });
});
