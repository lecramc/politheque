import { filtersToParams, parseFilterParams, yearsOf } from '@/src/assemblee/models/filter-params';
import { scrutinFactory } from '@/src/assemblee/models/scrutin.factory';

describe('Feature: filtres de la liste dans l’adresse', () => {
  it('should read no filter from an empty query', () => {
    expect(parseFilterParams({})).toEqual({
      categorie: 'toutes',
      resultat: 'tous',
      annee: null,
      recherche: '',
    });
  });

  it('should read valid values and ignore unknown ones', () => {
    expect(
      parseFilterParams({ categorie: 'censure', resultat: 'rejete', annee: '2025', q: ' Mayotte ' })
    ).toEqual({ categorie: 'censure', resultat: 'rejete', annee: '2025', recherche: 'Mayotte' });
    expect(
      parseFilterParams({ categorie: 'inconnue', resultat: 'x', annee: '25', q: 12 as never })
    ).toEqual({
      categorie: 'toutes',
      resultat: 'tous',
      annee: null,
      recherche: '',
    });
  });

  it('should take the first value when a parameter is repeated', () => {
    expect(parseFilterParams({ categorie: ['texte', 'censure'] }).categorie).toBe('texte');
  });

  it('should write only the filters that are set', () => {
    expect(
      filtersToParams({ categorie: 'toutes', resultat: 'tous', annee: null, recherche: '' })
    ).toEqual({});
    expect(
      filtersToParams({
        categorie: 'texte',
        resultat: 'adopte',
        annee: '2026',
        recherche: 'budget',
      })
    ).toEqual({ categorie: 'texte', resultat: 'adopte', annee: '2026', q: 'budget' });
  });

  it('should list the years of the legislature, oldest first', () => {
    const scrutins = [
      scrutinFactory({ date: '2026-02-01' }),
      scrutinFactory({ date: '2024-10-08' }),
      scrutinFactory({ date: '2025-03-10' }),
      scrutinFactory({ date: '2025-04-10' }),
    ];
    expect(yearsOf(scrutins)).toEqual(['2024', '2025', '2026']);
  });
});
