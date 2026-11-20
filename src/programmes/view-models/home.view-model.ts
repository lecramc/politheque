import { createSelector } from 'reselect';

import { latestMajorVoteGrid } from '@/src/assemblee/models/latest-major-vote';
import { selectAssembleeIndex } from '@/src/assemblee/store/assemblee.selector';
import { CONTENUS_2027_PATHS } from '@/src/programmes/models/contenus-2027';
import { electionFacts } from '@/src/programmes/models/election.service';
import { HOME_VOTE_COPY } from '@/src/programmes/models/home-vote.copy';
import {
  CANDIDATES_LINK_COPY,
  HOME_COPY,
  situerSubtitle,
  TASK_COPY,
  voterSubtitle,
} from '@/src/programmes/models/home.copy';
import { stepHref } from '@/src/programmes/models/journey.model';
import { candidatesEntry } from '@/src/programmes/models/other-parties.service';
import { partyHref } from '@/src/programmes/models/seo/party-sections';
import {
  selectCatalog,
  selectFeaturedElection,
  selectJourneyProgress,
  selectProgressStatus,
} from '@/src/programmes/store/programmes.selector';

/**
 * Accueil : quatre tâches, les dix partis en accès direct (ordre alphabétique, même forme pour
 * tous) et une carte « Le parcours ». La progression n'est lue qu'après l'hydratation : le HTML
 * statique et le premier rendu client sont identiques. Les réponses au questionnaire ne sont jamais lues.
 */
export const homeViewModel = () =>
  createSelector(
    [
      selectCatalog,
      selectFeaturedElection,
      selectProgressStatus,
      selectJourneyProgress,
      selectAssembleeIndex,
    ],
    (catalog, election, progressStatus, progress, assembleeIndex) => {
      const hydrated = progressStatus === 'ready';
      const facts = election ? electionFacts(election) : null;
      const tasks = [
        {
          id: 'situer' as const,
          ...TASK_COPY.situer,
          subtitle: situerSubtitle(catalog?.questions.length ?? 0),
          href: '/me-situer',
          primary: true,
        },
        { id: 'partis' as const, ...TASK_COPY.partis, href: '/partis', primary: false },
        {
          id: 'comparer' as const,
          ...TASK_COPY.comparer,
          href: '/partis/comparer',
          primary: false,
        },
        ...(election && facts
          ? [
              {
                id: 'voter' as const,
                ...TASK_COPY.voter,
                subtitle: voterSubtitle(facts.firstRound, facts.registrationDeadline),
                // Un clic : la page « Comment voter » quand elle existe pour cette élection.
                href:
                  catalog?.voter.electionId === election.id
                    ? CONTENUS_2027_PATHS.voter
                    : `/elections/${election.id}`,
                primary: false,
              },
            ]
          : []),
      ];

      const latestVote = assembleeIndex ? latestMajorVoteGrid(assembleeIndex) : null;
      const entry = election && catalog ? candidatesEntry(catalog) : null;
      const first = progress.steps[0];
      const next = hydrated && progress.hasStarted ? progress.next : null;
      const lower = (title: string) => title.charAt(0).toLowerCase() + title.slice(1);
      return {
        title: HOME_COPY.title,
        tasks,
        /**
         * Après les tâches : le plus récent des grands votes (règle fixe, même source que la grille de
         * `/assemblee`). Les données sont embarquées : le bandeau est dans le HTML statique.
         */
        latestVote: latestVote
          ? {
              title: HOME_VOTE_COPY.title,
              method: HOME_VOTE_COPY.method,
              grid: latestVote,
              vote: { label: HOME_VOTE_COPY.openVote, href: latestVote.columns[0].href },
              allVotes: { label: HOME_VOTE_COPY.allVotes, href: HOME_VOTE_COPY.allVotesHref },
              law: { label: HOME_VOTE_COPY.law, href: HOME_VOTE_COPY.lawHref },
            }
          : null,
        /** Sous les tâches : la liste complète des candidats, près de « Voter en 2027 ». */
        candidatesLink: entry
          ? { href: entry.href, label: entry.label, subtitle: CANDIDATES_LINK_COPY.subtitle }
          : null,
        parties: [...(catalog?.parties ?? [])]
          .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
          .map((party) => ({
            id: party.id,
            name: party.name,
            shortName: party.shortName,
            color: party.color,
            href: partyHref(party.id),
          })),
        journey: {
          title: HOME_COPY.journeyCardTitle,
          text: HOME_COPY.journeyCardText,
          href: stepHref(next?.step ?? first.step),
          cta: next
            ? `Continuer : ${lower(next.step.title)}`
            : `Commencer : ${lower(first.step.title)} (${first.total} leçons)`,
        },
      };
    }
  );
