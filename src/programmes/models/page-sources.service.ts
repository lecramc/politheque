import type { Source, SourceKind } from '@/src/programmes/models/programme.model';

const KIND_ORDER: SourceKind[] = [
  'statistique',
  'justice',
  'vote',
  'proposition-de-loi',
  'programme',
  'declaration',
  'presse',
];

export const KIND_GROUP_LABEL: Record<SourceKind, string> = {
  statistique: 'Sources officielles et ouvrages de référence',
  justice: 'Décisions de justice',
  vote: "Votes à l'Assemblée",
  'proposition-de-loi': 'Propositions de loi',
  programme: 'Programmes et textes des partis',
  declaration: 'Déclarations',
  presse: 'Presse',
};

/** Toutes les sources d'une page, sans doublon (même URL), groupées par nature puis par date. */
export const groupPageSources = (sources: Source[]) => {
  const unique = [...new Map(sources.map((s) => [s.url, s])).values()];
  return KIND_ORDER.map((kind) => ({
    kind,
    label: KIND_GROUP_LABEL[kind],
    sources: unique
      .filter((s) => s.kind === kind)
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'fr')),
  })).filter((group) => group.sources.length > 0);
};
