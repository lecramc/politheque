import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { tv } from '@/src/core/web/tv';
import { AxisChart } from '@/src/programmes/components/AxisChart';
import { describeLean } from '@/src/programmes/models/axis-explanation.service';
import type { AxisPosition } from '@/src/programmes/models/matching.service';
import { leanText } from '@/src/programmes/models/presentation.service';
import type { Axis, Party, PartyStance, Question } from '@/src/programmes/models/programme.model';
import { formatLongDate, METHOD_REMINDER } from '@/src/programmes/models/results-recap.service';
import { STANCE_SHORT_LABEL } from '@/src/programmes/models/stance-labels';

type Props = {
  date: Date;
  ranking: { party: Party; score: number | null; comparedCount: number }[];
  axes: Axis[];
  userPosition: AxisPosition;
  partyPositions: { party: Party; position: AxisPosition }[];
  questions: {
    question: Question;
    answerLabel: string;
    important: boolean;
    positions: { party: Party; stance: PartyStance | null }[];
  }[];
};

/**
 * Vue récapitulative, invisible à l'écran (`print-only`) et seule affichée à l'impression :
 * proximités, carte, les affirmations avec la réponse de l'utilisateur et la position de chaque
 * parti (ordre alphabétique). Elle n'est rendue qu'avec les résultats, jamais dans le HTML statique.
 */
export function ResultsPrint({
  date,
  ranking,
  axes,
  userPosition,
  partyPositions,
  questions,
}: Props) {
  const { effects, fonts } = useTheme();
  const small = { fontSize: 13, lineHeight: 18 } as const;
  return (
    <View {...tv('print-only')} style={{ gap: effects.spacing.md }}>
      <View style={{ gap: effects.spacing.xxs }}>
        <Text style={{ ...fonts.display, fontSize: 26 }}>Mes résultats Travée</Text>
        <Text style={small}>{formatLongDate(date)}</Text>
        <Text style={small}>
          {METHOD_REMINDER} Un parti n'est noté que si au moins 5 de vos réponses peuvent être
          comparées à ses positions. Méthode : page « Méthodologie » du site.
        </Text>
      </View>

      <View {...tv('print-avoid')} style={{ gap: effects.spacing.xxs }}>
        <Text style={{ ...fonts.bold, fontSize: 18 }}>Proximité avec chaque parti</Text>
        {ranking.map(({ party, score, comparedCount }) => (
          <Text key={party.id} style={small}>
            {party.name} : {score === null ? 'non calculable' : `${score} %`} ({comparedCount}{' '}
            question
            {comparedCount > 1 ? 's' : ''} comparée{comparedCount > 1 ? 's' : ''})
          </Text>
        ))}
      </View>

      <View {...tv('print-avoid')} style={{ gap: effects.spacing.xxs }}>
        <Text style={{ ...fonts.bold, fontSize: 18 }}>Ma carte</Text>
        <AxisChart axes={axes} user={userPosition} parties={partyPositions} />
        {axes.map((axis) => {
          const position = userPosition[axis.id];
          return (
            <Text key={axis.id} style={small}>
              {axis.label} :{' '}
              {position === null
                ? 'non placé (trop peu de réponses sur cet axe)'
                : leanText(describeLean({ position, count: 0 }), axis)}
            </Text>
          );
        })}
      </View>

      <Text style={{ ...fonts.bold, fontSize: 18 }}>
        Les {questions.length} affirmations, ma réponse et les positions des partis
      </Text>
      {questions.map(({ question, answerLabel, important, positions }, index) => (
        <View
          key={question.id}
          {...tv('print-avoid')}
          style={{ gap: effects.spacing.xxs, borderTopWidth: 1, paddingTop: 6 }}
        >
          <Text style={{ ...fonts.bold, ...small }}>
            {index + 1}. {question.statement}
          </Text>
          <Text style={small}>
            Ma réponse : {answerLabel}
            {important ? ' (compte double)' : ''}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {positions.map(({ party, stance }) => (
              <Text key={party.id} style={{ ...small, width: '50%' }}>
                {party.name} : {STANCE_SHORT_LABEL[String(stance?.stance ?? null)]}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
