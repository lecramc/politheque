import { groupPageSources } from '@/src/programmes/models/page-sources.service';
import type { Source } from '@/src/programmes/models/programme.model';

const source = (url: string, kind: Source['kind'], date = '2026-01'): Source => ({
  title: url,
  url,
  date,
  kind,
});

describe('Feature: sources en bas de page', () => {
  it('should list each URL once, grouped by kind, official sources first', () => {
    const groups = groupPageSources([
      source('https://presse.fr/a', 'presse'),
      source('https://insee.fr/x', 'statistique'),
      source('https://presse.fr/a', 'presse'),
    ]);
    expect(groups.map((g) => g.kind)).toEqual(['statistique', 'presse']);
    expect(groups[1].sources).toHaveLength(1);
  });

  it('should put the most recent source first within a group', () => {
    const groups = groupPageSources([
      source('https://a.fr', 'presse', '2024-01'),
      source('https://b.fr', 'presse', '2026-05'),
    ]);
    expect(groups[0].sources.map((s) => s.url)).toEqual(['https://b.fr', 'https://a.fr']);
  });
});
