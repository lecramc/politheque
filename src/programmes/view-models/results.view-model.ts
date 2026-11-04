import { createSelector } from 'reselect';

import type { Router } from '@/src/core/hooks/useViewModel';
import type { AppDispatch } from '@/src/core/store/create-store';
import { explainAxisPosition } from '@/src/programmes/models/axis-explanation.service';
import {
  agreementsWith,
  answersToValues,
  computeAxisPosition,
  partyToValues,
  rankParties,
} from '@/src/programmes/models/matching.service';
import { selectAnswers, selectCatalog } from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';

/** En dessous de ce nombre de réponses, le résultat n'est pas significatif. */
export const MIN_ANSWERS = 8;

export const resultsViewModel = ({ dispatch, router }: { dispatch: AppDispatch; router: Router }) =>
  createSelector([selectCatalog, selectAnswers], (catalog, answers) => {
    const parties = catalog?.parties ?? [];
    const questions = catalog?.questions ?? [];
    const answeredCount = Object.values(answers).filter((a) => a.value !== null).length;

    const ranking = rankParties(answers, parties).map((proximity) => {
      const party = parties.find((p) => p.id === proximity.partyId)!;
      return { ...proximity, party, ...agreementsWith(answers, party, questions) };
    });

    return {
      ready: parties.length > 0,
      answeredCount,
      enoughAnswers: answeredCount >= MIN_ANSWERS,
      minAnswers: MIN_ANSWERS,
      ranking,
      themes: catalog?.themes ?? [],
      axes: catalog?.axes ?? [],
      userPosition: computeAxisPosition(answersToValues(answers), questions),
      partyPositions: parties.map((party) => ({
        party,
        position: computeAxisPosition(partyToValues(party), questions),
      })),
      axisExplanations: parties.map((party) => ({
        party,
        axes: explainAxisPosition(party, questions),
      })),
      details: questions
        .filter((q) => answers[q.id]?.value != null)
        .map((question) => ({
          question,
          userValue: answers[question.id].value,
          important: answers[question.id].important,
          positions: parties.map((party) => ({
            party,
            stance: party.stances[question.id] ?? null,
          })),
        })),
      restart: () => {
        dispatch(quizActions.restart());
        router.replace('/me-situer');
      },
    };
  });
