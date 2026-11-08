import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';
import type { Party, Source } from '@/src/programmes/models/programme.model';
import type { PartySection } from '@/src/programmes/models/seo/party-sections';

/** Sources affichées sur une section de la fiche (et citées dans son JSON-LD). */
export function partySectionSources(
  party: Party,
  section: PartySection,
  electionId: string | null,
  legal: LegalDossier | null = null
): Source[] {
  const history = party.history;
  switch (section) {
    case 'histoire':
      return history
        ? [
            history.origins,
            ...history.timeline,
            ...(history.whyCreated ? [history.whyCreated] : []),
            ...(history.figures ?? []),
            ...(history.thought ?? history.ideals),
          ].flatMap((item) => item.sources)
        : [];
    case 'positions':
      return Object.values(party.stances).flatMap((s) => s.sources);
    case 'procedures':
      return (legal?.entries ?? []).flatMap((entry) => [
        ...entry.sources,
        ...entry.steps.flatMap((step) => step.sources),
        ...(entry.nextStep?.sources ?? []),
      ]);
    case 'programme': {
      // Fusion des deux anciennes listes (« En bref » et « Programme 2027 »), sans doublon d'adresse.
      const candidacy = electionId ? party.candidacies[electionId] : undefined;
      const measures = candidacy
        ? Object.values(candidacy.themes).flatMap((t) => t.measures.flatMap((m) => m.sources))
        : [];
      const all = [...(history?.ideals ?? []).flatMap((i) => i.sources), ...measures];
      return all.filter((source, index) => all.findIndex((s) => s.url === source.url) === index);
    }
  }
}
