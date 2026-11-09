import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { stateBuilder } from '@/src/programmes/store/state-builder';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';
import { themeViewModel } from '@/src/programmes/view-models/theme.view-model';

// Neutralité (charte, règle 6) : la phrase de résumé en tête des fiches et des débats suit un seul
// gabarit, n'emploie que des données publiées et n'évalue rien (audit SEO v2, § 5.1).
const catalog = buildStaticCatalog();
const state = stateBuilder().withCatalog(catalog).build();
const partySummaryOf = (id: string) => partyViewModel(id)({ dispatch: vi.fn() })(state).summary;
const debateSummaryOf = (id: string) => themeViewModel(id)({ dispatch: vi.fn() })(state).summary;

const DATE = /^Au (1er|\d{1,2}) [a-zéû]+ \d{4}, /;
const EVALUATIVE =
  /extr[êe]me|radical|populiste|mod[ée]r[ée]|dangereux|irr[ée]aliste|ambitieux|seul|principal|favori|grand parti|crédible|sérieu/i;

/** Gabarit : on retire tout ce qui vient des données, il doit rester le même texte partout. */
const skeleton = (text: string, values: string[]) =>
  values
    .reduce((acc, value) => acc.split(value).join('▢'), text)
    .replace(/\d+/g, '#')
    .replace(/\b(de|d')\s?▢/g, 'DE▢');

describe('Feature: phrase de résumé des fiches partis', () => {
  const featured = catalog.elections.find((e) => e.featured)!;
  const parties = catalog.parties.filter((p) => p.candidacies[featured.id]);

  it('should open every fiche with a dated sentence', () => {
    expect(parties).toHaveLength(10);
    for (const party of parties) expect(partySummaryOf(party.id), party.id).toMatch(DATE);
  });

  it('should use the same template for the ten parties', () => {
    const skeletons = parties.map((party) => {
      const c = party.candidacies[featured.id];
      const status = c.statusLabel.charAt(0).toLowerCase() + c.statusLabel.slice(1);
      return skeleton(partySummaryOf(party.id)!, [
        `${party.name} (${party.shortName})`,
        party.name,
        c.candidateName,
        status,
        ...['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août'],
        ...['septembre', 'octobre', 'novembre', 'décembre'],
      ]).replace('#er', '#');
    });
    expect(new Set(skeletons).size, skeletons.join('\n')).toBe(1);
  });

  it('should state the candidacy and the date taken from the data', () => {
    expect(partySummaryOf('rn')).toBe(
      `Au 3 novembre 2026, Rassemblement national (RN) : candidature de Marine Le Pen à l'élection présidentielle de 2027 (candidate déclarée) ; propositions recensées dans ${
        catalog.themes.filter(
          (t) =>
            (catalog.parties.find((p) => p.id === 'rn')!.candidacies[featured.id].themes[t.id]
              ?.measures.length ?? 0) > 0
        ).length
      } thèmes sur ${catalog.themes.length}.`
    );
    expect(partySummaryOf('reconquete')).toContain("candidature d'Éric Zemmour");
  });

  it('should never evaluate a party', () => {
    for (const party of parties) expect(partySummaryOf(party.id)).not.toMatch(EVALUATIVE);
  });
});

describe('Feature: phrase de résumé des débats', () => {
  it('should open the nine debates with a dated sentence on the same template', () => {
    expect(catalog.themes).toHaveLength(9);
    const skeletons = catalog.themes.map((theme) => {
      const summary = debateSummaryOf(theme.id)!;
      expect(summary, theme.id).toMatch(DATE);
      expect(summary).not.toMatch(EVALUATIVE);
      return skeleton(summary, [theme.title]).replace(/^Au #(er)? [a-zéû]+ #/, 'Au DATE');
    });
    expect(new Set(skeletons).size, skeletons.join('\n')).toBe(1);
  });

  it('should date the sentence like the page itself (dateModified)', () => {
    const vm = themeViewModel('economie')({ dispatch: vi.fn() })(state);
    const graph = JSON.stringify(vm.meta?.jsonLd);
    const iso = /"dateModified":"(\d{4})-(\d{2})-(\d{2})"/.exec(graph)!;
    expect(vm.summary).toContain(`${Number(iso[3]) === 1 ? '1er' : Number(iso[3])} `);
    expect(vm.summary).toContain(iso[1]);
  });
});
