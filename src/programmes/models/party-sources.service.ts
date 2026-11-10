import type { LegalDossier } from '@/src/programmes/models/legal/legal.model';
import { publishedMeasureSources } from '@/src/programmes/models/programme-publication.service';
import type { Party, Source, ThemeId } from '@/src/programmes/models/programme.model';
import type { PartySection } from '@/src/programmes/models/seo/party-sections';

const uniqueByUrl = (all: Source[]) =>
  all.filter((source, index) => all.findIndex((s) => s.url === source.url) === index);

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
      // Un programme non publié n'a ni mesure ni idée clé : seules les sources de la publication comptent.
      if (candidacy?.programmeState === 'non-publie') {
        return uniqueByUrl(candidacy.programmePublication?.sources ?? []);
      }
      const measures = publishedMeasureSources(
        candidacy,
        Object.keys(candidacy?.themes ?? {}) as ThemeId[]
      );
      const all = [
        ...(candidacy?.programmePublication?.sources ?? []),
        ...(history?.ideals ?? []).flatMap((i) => i.sources),
        ...measures,
      ];
      return uniqueByUrl(all);
    }
  }
}
