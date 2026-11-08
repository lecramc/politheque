import { createSelector } from 'reselect';

import { electionFacts } from '@/src/programmes/models/election.service';
import {
  HOME_COPY,
  situerSubtitle,
  TASK_COPY,
  voterSubtitle,
} from '@/src/programmes/models/home.copy';
import { stepHref } from '@/src/programmes/models/journey.model';
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
    [selectCatalog, selectFeaturedElection, selectProgressStatus, selectJourneyProgress],
    (catalog, election, progressStatus, progress) => {
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
                href: `/elections/${election.id}`,
                primary: false,
              },
            ]
          : []),
      ];

      const first = progress.steps[0];
      const next = hydrated && progress.hasStarted ? progress.next : null;
      const lower = (title: string) => title.charAt(0).toLowerCase() + title.slice(1);
      return {
        title: HOME_COPY.title,
        tasks,
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
