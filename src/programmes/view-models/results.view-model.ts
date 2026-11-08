import { createSelector } from 'reselect';

import { SITE_URL } from '@/src/core/config/app';
import type { Router } from '@/src/core/hooks/useViewModel';
import type { AppDispatch } from '@/src/core/store/create-store';
import { buildPersonalLink } from '@/src/programmes/models/answer-link.service';
import {
  describeLean,
  explainAxisPosition,
  groupByPull,
} from '@/src/programmes/models/axis-explanation.service';
import {
  agreementsWith,
  answersToValues,
  computeAxisPosition,
  partyToValues,
  rankParties,
} from '@/src/programmes/models/matching.service';
import {
  isFewCompared,
  presentRanking,
  separatingQuestions,
} from '@/src/programmes/models/results-ranking.service';
import {
  answerLabel,
  buildMailto,
  type RecapInput,
} from '@/src/programmes/models/results-recap.service';
import {
  ANSWERS_NOT_KEPT,
  fewComparedNote,
  leadGroupSentence,
  marginSentence,
} from '@/src/programmes/models/results.copy';
import {
  selectAnswers,
  selectCatalog,
  selectResultsLost,
} from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';

/** En dessous de ce nombre de réponses, le résultat n'est pas significatif. */
export const MIN_ANSWERS = 8;

export const resultsViewModel = ({ dispatch, router }: { dispatch: AppDispatch; router: Router }) =>
  createSelector(
    [selectCatalog, selectAnswers, selectResultsLost],
    (catalog, answers, resultsLost) => {
      const parties = catalog?.parties ?? [];
      const questions = catalog?.questions ?? [];
      const answeredCount = Object.values(answers).filter((a) => a.value !== null).length;

      const presented = presentRanking(rankParties(answers, parties), answeredCount);
      const ranking = presented.items.map((proximity) => {
        const party = parties.find((p) => p.id === proximity.partyId)!;
        const fewCompared = isFewCompared(proximity.comparedCount, answeredCount);
        return {
          ...proximity,
          party,
          ...agreementsWith(answers, party, questions),
          /** Comparé sur moins de 80 % des réponses : arc en pointillés et avertissement. */
          fewCompared,
          fewComparedNote: fewCompared
            ? fewComparedNote(answeredCount - proximity.comparedCount)
            : null,
        };
      });
      // Parti de tête listés par ordre alphabétique : aucun second classement dans « départage ».
      const leaderParties = presented.leaders
        .map((id) => parties.find((p) => p.id === id)!)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      const leaderNames = leaderParties.map((p) => p.name);
      const separating = separatingQuestions(answers, leaderParties, questions).map((item) => ({
        id: item.question.id,
        statement: item.question.statement,
        userLabel: answerLabel(item.userValue),
        positions: item.stances.map((s) => ({
          name: parties.find((p) => p.id === s.partyId)!.name,
          stance: s.stance,
        })),
      }));

      const personalLink = buildPersonalLink(SITE_URL, answers);
      const recap: RecapInput = {
        date: new Date(),
        ranking: ranking.map((r) => ({
          name: r.party.name,
          score: r.score,
          comparedCount: r.comparedCount,
        })),
        axes: catalog?.axes ?? [],
        userPosition: computeAxisPosition(answersToValues(answers), questions),
        link: personalLink,
      };
      const alphabetical = [...parties].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

      return {
        ready: parties.length > 0,
        /** Tampon posé mais réponses absentes de la mémoire (page rechargée). */
        resultsLost,
        resultsLostMessage: ANSWERS_NOT_KEPT,
        /** Lien personnel : les réponses sont dans le fragment, jamais envoyées au serveur. */
        personalLink,
        mailto: buildMailto(recap),
        recapDate: recap.date,
        /** Vue imprimable : toutes les questions, positions des partis par ordre alphabétique. */
        printQuestions: questions.map((question) => ({
          question,
          answerLabel: answerLabel(answers[question.id]?.value),
          important: answers[question.id]?.important ?? false,
          positions: alphabetical.map((party) => ({
            party,
            stance: party.stances[question.id] ?? null,
          })),
        })),
        answeredCount,
        enoughAnswers: answeredCount >= MIN_ANSWERS,
        minAnswers: MIN_ANSWERS,
        ranking,
        /** Marge d'incertitude en points, identique pour tous les partis. */
        margin: presented.margin,
        marginSentence: marginSentence(presented.margin),
        /** Partis dont l'écart avec le premier est inférieur à la marge (vide sans score). */
        leadGroup: {
          names: leaderNames,
          sentence: leaderNames.length ? leadGroupSentence(leaderNames, presented.margin) : null,
        },
        /** « Ce qui les départage » : questions où les partis de tête diffèrent le plus. */
        separating,
        themes: catalog?.themes ?? [],
        axes: catalog?.axes ?? [],
        userPosition: computeAxisPosition(answersToValues(answers), questions),
        partyPositions: parties.map((party) => ({
          party,
          position: computeAxisPosition(partyToValues(party), questions),
        })),
        axisExplanations: parties.map((party) => {
          const explanations = explainAxisPosition(party, questions);
          const axes = Object.fromEntries(
            Object.entries(explanations).map(([id, explanation]) => [
              id,
              {
                ...explanation,
                lean: describeLean(explanation),
                groups: groupByPull(explanation.items),
              },
            ])
          ) as {
            [K in keyof typeof explanations]: (typeof explanations)[K] & {
              lean: ReturnType<typeof describeLean>;
              groups: ReturnType<typeof groupByPull>;
            };
          };
          const list = Object.values(axes);
          return {
            party,
            axes,
            placedCount: list.filter((a) => a.position !== null).length,
            positionsCount: list.reduce((total, a) => total + a.count, 0),
          };
        }),
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
    }
  );
