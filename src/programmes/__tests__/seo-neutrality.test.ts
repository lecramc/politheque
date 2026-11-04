import { buildStaticCatalog } from '@/src/programmes/gateways/static-programme.gateway';
import { beforeParenthesis } from '@/src/programmes/models/presentation.service';
import type { Party } from '@/src/programmes/models/programme.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';
import {
  allPageMetas,
  DESCRIPTION_MAX,
  partyLabel,
  partyLinkLabel,
  partyPageContext,
  partySectionMeta,
  TITLE_MAX,
} from '@/src/programmes/models/seo/page-meta';
import { PARTY_SECTIONS, type PartySection } from '@/src/programmes/models/seo/party-sections';

const catalog = buildStaticCatalog();
const SECTIONS = PARTY_SECTIONS.map((s) => s.id);
const EVALUATIVE = /extr[êe]me|radical|populiste|mod[ée]r[ée]|dangereux|irr[ée]aliste|ambitieux/i;

const metaOf = (party: Party, section: PartySection) =>
  partySectionMeta(partyPageContext(party, catalog), section);

/** Remplace tout ce qui varie légitimement (nom, date, candidat) par des marqueurs. */
const maskedDescription = (party: Party, section: PartySection) => {
  const ctx = partyPageContext(party, catalog);
  const candidacy = ctx.presidential?.candidacy;
  let text = metaOf(party, section).description;
  text = text.replace(formatLongDate(party.lastVerified), '{date}');
  if (candidacy) {
    text = text.replace(
      `${candidacy.candidateName} (${beforeParenthesis(candidacy.statusLabel)})`,
      '{candidat}'
    );
  }
  for (const name of [partyLabel(party), party.shortName, party.name])
    text = text.replace(name, '{label}');
  return text;
};

const maskedTitle = (party: Party, section: PartySection) =>
  metaOf(party, section)
    .title.replace(partyLabel(party), '{label}')
    .replace(party.shortName, '{label}');

describe('Feature: neutralité des métadonnées', () => {
  it('should give every party the same four section pages', () => {
    for (const party of catalog.parties) {
      for (const section of SECTIONS) {
        expect(metaOf(party, section).robots, `${party.id} ${section}`).toBe('index, follow');
      }
    }
  });

  it('should produce, for every party and section, a title equal to the template with only the label changed', () => {
    for (const section of SECTIONS) {
      const templates = new Set(catalog.parties.map((p) => maskedTitle(p, section)));
      expect([...templates], section).toHaveLength(1);
    }
  });

  it('should produce, for every party, descriptions equal to the template once name, date and candidate are masked', () => {
    for (const section of SECTIONS) {
      const templates = new Set(catalog.parties.map((p) => maskedDescription(p, section)));
      expect([...templates], section).toHaveLength(1);
    }
  });

  it('should keep every title within the limit and every description between 50 and 160 characters, for every page', () => {
    for (const meta of allPageMetas(catalog)) {
      expect(meta.title.length, meta.path).toBeLessThanOrEqual(TITLE_MAX);
      expect(meta.description.length, meta.path).toBeGreaterThanOrEqual(50);
      expect(meta.description.length, meta.path).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });

  it('should never include the party family nor evaluative adjectives in any title or description', () => {
    // Le guide « Comprendre » explique légitimement ces termes de classement : on contrôle les pages sur les partis.
    for (const meta of allPageMetas(catalog).filter((m) => /^\/(partis|debats)/.test(m.path))) {
      expect(meta.title + meta.description, meta.path).not.toMatch(EVALUATIVE);
    }
    for (const party of catalog.parties) {
      const family = party.family.split(' (')[0];
      for (const section of SECTIONS) {
        const { title, description } = metaOf(party, section);
        expect(title + description, `${party.id} ${section}`).not.toContain(family);
      }
    }
  });

  it('should produce unique titles and descriptions across all indexable pages', () => {
    const indexable = allPageMetas(catalog).filter((m) => m.robots === 'index, follow');
    expect(new Set(indexable.map((m) => m.title)).size).toBe(indexable.length);
    expect(new Set(indexable.map((m) => m.description)).size).toBe(indexable.length);
  });
});

/** Forme d'une valeur JSON : clés et types récursifs, valeurs masquées. */
const shapeOf = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0])] : [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shapeOf(v)]));
  }
  return typeof value;
};

describe('Feature: neutralité des données structurées', () => {
  it('should give every party page the same JSON-LD shape, whatever the party', () => {
    for (const section of SECTIONS) {
      const shapes = catalog.parties.map((p) =>
        JSON.stringify(
          shapeOf(metaOf(p, section).jsonLd?.['@graph'].map((n) => ({ ...n, citation: [] })))
        )
      );
      expect(new Set(shapes).size, section).toBe(1);
    }
  });

  it('should keep every page JSON-LD under 60 KB', () => {
    for (const meta of allPageMetas(catalog)) {
      expect(JSON.stringify(meta.jsonLd ?? {}).length, meta.path).toBeLessThan(60 * 1024);
    }
  });
});

describe('Feature: libellés de liens vers les fiches', () => {
  it('should build the same link label for every party, only the short name changing', () => {
    const labels = new Set(
      catalog.parties.map((p) =>
        partyLinkLabel(p, 'programme-2027').replace(/^.*?(?= pour 2027)/, '…')
      )
    );
    expect(labels.size).toBe(1);
  });

  it('should point debate party links to the 2027 section and stance links to the positions section', () => {
    const party = catalog.parties[0];
    expect(partyLinkLabel(party, 'programme-2027')).toMatch(/pour 2027/);
    expect(partyLinkLabel(party, 'positions')).toBe(party.name);
  });
});
