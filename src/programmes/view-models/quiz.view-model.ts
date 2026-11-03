import { createSelector } from 'reselect';

import type { Router } from '@/src/core/hooks/useViewModel';
import type { AppDispatch } from '@/src/core/store/create-store';
import type { AnswerValue } from '@/src/programmes/models/matching.service';
import {
  selectAnswers,
  selectCatalog,
  selectQuiz,
} from '@/src/programmes/store/programmes.selector';
import { quizActions } from '@/src/programmes/store/quiz.slice';

export const ANSWER_CHOICES: { value: AnswerValue; label: string }[] = [
  { value: 2, label: "Tout à fait d'accord" },
  { value: 1, label: "Plutôt d'accord" },
  { value: 0, label: 'Neutre' },
  { value: -1, label: "Plutôt pas d'accord" },
  { value: -2, label: "Pas du tout d'accord" },
  { value: null, label: "Je ne sais pas / pas d'avis" },
];

export const quizViewModel = ({ dispatch, router }: { dispatch: AppDispatch; router: Router }) =>
  createSelector([selectCatalog, selectQuiz, selectAnswers], (catalog, quiz, answers) => {
    const questions = catalog?.questions ?? [];
    const total = questions.length;
    const index = Math.min(quiz.currentIndex, Math.max(total - 1, 0));
    const question = questions[index] ?? null;
    const theme = catalog?.themes.find((t) => t.id === question?.theme) ?? null;
    const answered = question ? question.id in quiz.values : false;
    const isLast = index === total - 1;
    const themeOrder = [...new Set(questions.map((q) => q.theme))];

    const showResults = () => {
      dispatch(quizActions.finish());
      router.push('/me-situer/resultats');
    };

    return {
      ready: total > 0,
      question,
      themeTitle: theme?.title ?? '',
      themeCount: themeOrder.length,
      themeIndex: question ? themeOrder.indexOf(question.theme) : 0,
      index,
      total,
      progress: total === 0 ? 0 : (index + 1) / total,
      answeredCount: Object.values(answers).filter((a) => a.value !== null).length,
      selectedValue: answered && question ? quiz.values[question.id] : undefined,
      important: question ? !!quiz.important[question.id] : false,
      canGoBack: index > 0,
      choices: ANSWER_CHOICES,
      /** Enregistre la réponse immédiatement (rien n'est perdu si l'on quitte). */
      record: (value: AnswerValue) => {
        if (question) dispatch(quizActions.answer({ questionId: question.id, value }));
      },
      /** Passe à la question suivante, ou aux résultats après la dernière. */
      next: () => {
        if (isLast) showResults();
        else dispatch(quizActions.goTo(index + 1));
      },
      choose: (value: AnswerValue) => {
        if (!question) return;
        dispatch(quizActions.answer({ questionId: question.id, value }));
        if (isLast) showResults();
        else dispatch(quizActions.goTo(index + 1));
      },
      toggleImportant: () => question && dispatch(quizActions.toggleImportant(question.id)),
      back: () => dispatch(quizActions.goTo(index - 1)),
      showResults,
      restart: () => dispatch(quizActions.restart()),
    };
  });
