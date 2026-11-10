import { catalogFactory } from '@/src/programmes/models/catalog.factory';
import { emptyThemes, partyFactory } from '@/src/programmes/models/party.factory';
import type { Candidacy, Party, Source } from '@/src/programmes/models/programme.model';
import { foldedSnippets } from '@/src/programmes/models/seo/folded-content';
import { buildLlmsFullTxt } from '@/src/programmes/models/seo/llms-full';
import {
  debateMeta,
  partyPageContext,
  partySectionMeta,
} from '@/src/programmes/models/seo/page-meta';
import { expandRoutes } from '@/src/programmes/models/seo/site-routes';

const source = (title: string): Source => ({
  title,
  url: `https://exemple.fr/${title}`,
  date: '2026-11-10',
  kind: 'programme',
});

const candidacy = (
  id: string,
  state: Candidacy['programmeState'],
  withMeasure: boolean
): Candidacy => {
  const themes = emptyThemes();
  if (withMeasure) {
    themes.economie = {
      summary: 'Résumé économie.',
      measures: [{ text: 'Mesure économie du programme.', sources: [source(`mesure-${id}`)] }],
    };
  }
  return {
    candidateName: 'Jeanne Dupont',
    status: 'declare',
    statusLabel: 'Candidate déclarée',
    candidate: 'Jeanne Dupont est candidate.',
    programmeStatus: 'Statut.',
    programmeState: state,
    programmePublication: {
      text: 'Texte de publication du programme.',
      date: null,
      sources: [source('publication')],
    },
    themes,
  };
};

const party = (id: string, state: Candidacy['programmeState'], withMeasure: boolean): Party =>
  partyFactory({
    id,
    name: `Parti ${id}`,
    candidacies: { 'presidentielle-2027': candidacy(id, state, withMeasure) },
  });

// `withMeasure` à vrai pour « non-publie » : des données anciennes encore présentes ne doivent rien changer.
const catalog = catalogFactory({
  parties: [
    party('pub', 'publie', true),
    party('partiel', 'partiel', true),
    party('vide', 'non-publie', true),
  ],
});

describe('Feature: texte intégral pour les moteurs de réponse', () => {
  const full = buildLlmsFullTxt(catalog);
  const section = (id: string) => {
    const start = full.indexOf(`## Parti ${id} (`);
    return full.slice(
      start,
      full.indexOf('\n## ', start + 1) === -1 ? undefined : full.indexOf('\n## ', start + 1)
    );
  };

  it('should state that the programme is not published instead of listing measures', () => {
    const text = section('vide');
    expect(text).toContain('Programme 2027 pas encore publié');
    expect(text).toContain('Texte de publication du programme.');
    expect(text).not.toContain('Mesure économie du programme.');
  });

  it('should say nothing is published on a theme a partial programme leaves out', () => {
    const text = section('partiel');
    expect(text).toContain('Mesure économie du programme.');
    expect(text).toContain('Rien de publié sur ce thème dans le programme 2027');
  });
});

describe('Feature: contenu replié attendu dans le HTML', () => {
  it('should expect the publication text when the programme is not published', () => {
    expect(foldedSnippets(catalog, '/partis/vide/programme-2027')).toEqual([
      'Texte de publication du programme.',
    ]);
  });

  it('should expect the first measure otherwise', () => {
    expect(foldedSnippets(catalog, '/partis/pub/programme-2027')).toEqual([
      'Mesure économie du programme.',
    ]);
  });
});

describe('Feature: métadonnées et sources des pages', () => {
  const metaOf = (id: string) => {
    const p = catalog.parties.find((x) => x.id === id)!;
    return partySectionMeta(partyPageContext(p, catalog), 'programme');
  };

  it('should describe a programme that is not published as such', () => {
    expect(metaOf('vide').description).toContain('programme 2027 pas encore publié');
    expect(metaOf('pub').description).toContain('programme 2027 en 1 thème');
  });

  it('should cite only the measures that are listed on a debate page', () => {
    const economie = catalog.themes.find((t) => t.id === 'economie')!;
    const graph = JSON.stringify(debateMeta(economie, catalog).jsonLd);
    expect(graph).toContain('mesure-pub');
    expect(graph).not.toContain('mesure-vide');
  });

  it('should keep every route of a catalog with a party without measure', () => {
    expect(() => expandRoutes(catalog)).not.toThrow();
  });
});
