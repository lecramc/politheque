import { buildCandidateList } from '@/src/programmes/models/candidates.service';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { etiquetteDetail, labelLines } from '@/src/programmes/models/etiquettes.service';
import type { Catalog, OtherParty } from '@/src/programmes/models/programme.model';

/** Phrase visible, identique pour tous les partis sans fiche détaillée. */
export const OTHER_PARTIES_NOTE =
  "Ces partis n'ont pas encore de fiche détaillée sur Polithèque (programme et positions).";

/** « Fondé en 1968 · Porte-parole : Nathalie Arthaud » ; seulement les champs établis par une source. */
const identityLine = (party: OtherParty): string | null => {
  const parts = [
    party.foundedYear ? `Fondé en ${party.foundedYear}` : null,
    party.leader ? `${party.leader.role} : ${party.leader.name}` : null,
  ].filter((part): part is string => part !== null);
  return parts.length ? parts.join(' · ') : null;
};

/**
 * Cartes courtes des partis présentant un candidat sans avoir de fiche : même gabarit pour tous,
 * ordre alphabétique, étiquettes et sources tirées des mêmes fichiers que les dix fiches. Une carte
 * dont le candidat n'est pas dans la liste des candidats est écartée (le lien serait mort).
 */
export function otherPartyCards(catalog: Catalog) {
  const { circular, parties: entries } = catalog.etiquettes;
  return [...catalog.otherParties.parties]
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .flatMap((party) => {
      const candidate = catalog.candidates.candidates.find((c) => c.id === party.candidateId);
      if (!candidate) return [];
      const entry = entries.find((e) => e.id === party.id);
      return [
        {
          id: party.id,
          name: party.name,
          identity: identityLine(party),
          candidateName: candidate.name,
          candidateHref: `${CONTENUS_2027_PATHS.candidates}#${candidate.id}`,
          labels: labelLines(entry),
          detail: entry ? etiquetteDetail(entry, circular) : null,
          description: party.description,
          sources: party.sources,
        },
      ];
    });
}

export type OtherPartyCard = ReturnType<typeof otherPartyCards>[number];

/** Accès à la liste complète des candidats : le nombre est calculé, jamais saisi ; rien s'il n'y a personne. */
export function candidatesEntry(catalog: Catalog) {
  const count = buildCandidateList(
    catalog.parties,
    catalog.candidates.candidates,
    catalog.candidates.electionId
  ).length;
  if (count === 0) return null;
  return {
    count,
    href: CONTENUS_2027_PATHS.candidates,
    label: `Présidentielle 2027 : ${count > 1 ? `les ${count} candidatures` : `${count} candidature`}`,
  };
}
