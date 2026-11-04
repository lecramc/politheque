import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Accordion } from '@/src/programmes/components/Accordion';
import { AxisGauge } from '@/src/programmes/components/AxisGauge';
import { useIsDesktop } from '@/src/programmes/components/Page';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { STANCE_LABEL } from '@/src/programmes/components/StanceBadge';
import type {
  AxisContribution,
  AxisExplanation,
  groupByPull,
  Lean,
} from '@/src/programmes/models/axis-explanation.service';
import { MIN_AXIS_COUNT } from '@/src/programmes/models/matching.service';
import {
  displayName,
  leanText,
  placementSummary,
} from '@/src/programmes/models/presentation.service';
import type { Axis, AxisId, Party } from '@/src/programmes/models/programme.model';

export interface PartyPlacementView {
  axes: Record<AxisId, AxisExplanation & { lean: Lean; groups: ReturnType<typeof groupByPull> }>;
  placedCount: number;
  positionsCount: number;
}

/** Au-delà, la pastille de sources passe sous l'affirmation au lieu de la réserver à droite. */
const MAX_FONT_SCALE_FOR_OVERLAY = 1.3;
const CHIP_RESERVE = 120;
const STANCE_COLUMN = 112;

function PlacementRow({ item }: { item: AxisContribution }) {
  const { colors, effects, fonts } = useTheme();
  const isDesktop = useIsDesktop();
  const { fontScale } = useWindowDimensions();
  const { question, stance } = item;
  const overlay = !isDesktop && fontScale <= MAX_FONT_SCALE_FOR_OVERLAY;

  const stanceText = (
    <Text
      style={{
        ...fonts.bold,
        fontSize: effects.sizes.text.label,
        color: colors.tint,
        minHeight: 28,
        textAlignVertical: 'center',
        ...(isDesktop
          ? { width: STANCE_COLUMN, paddingTop: 2, minHeight: undefined }
          : { paddingRight: overlay ? CHIP_RESERVE : 0 }),
      }}
    >
      {STANCE_LABEL[String(stance.stance)]}
    </Text>
  );
  const statement = (
    <Text
      style={{
        fontSize: effects.sizes.text.secondary,
        lineHeight: 21,
        color: colors.text.primary,
        ...(isDesktop ? { flex: 1 } : null),
      }}
    >
      {question.statement}
    </Text>
  );
  const chip = stance.sources.length ? (
    <SourceChip compact sources={stance.sources} subject={stance.justification} />
  ) : null;

  return (
    <View
      style={{
        paddingVertical: effects.spacing.sm,
        gap: isDesktop ? effects.spacing.sm : effects.spacing.xxs,
        borderTopWidth: 1,
        borderColor: colors.surface.border.primary,
        position: 'relative',
        ...(isDesktop ? { flexDirection: 'row', alignItems: 'flex-start' } : null),
      }}
    >
      {stanceText}
      {statement}
      {chip ? (
        <View
          style={
            isDesktop
              ? { alignSelf: 'flex-start' }
              : overlay
                ? { position: 'absolute', top: effects.spacing.sm, right: 0 }
                : { alignSelf: 'flex-start' }
          }
        >
          {chip}
        </View>
      ) : null}
    </View>
  );
}

function PullGroup({
  items,
  heading,
}: {
  items: AxisContribution[];
  heading: (count: number) => React.ReactNode;
}) {
  const { colors, effects } = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={{ marginTop: effects.spacing.xs }}>
      <Text
        accessibilityRole="header"
        aria-level={4}
        style={{
          fontSize: effects.sizes.text.label,
          lineHeight: 18,
          color: colors.text.secondary,
          paddingBottom: effects.spacing.xxs,
        }}
      >
        {heading(items.length)}
      </Text>
      {items.map((item) => (
        <PlacementRow key={item.question.id} item={item} />
      ))}
    </View>
  );
}

function AxisPlacement({
  axis,
  explanation,
  party,
  last,
}: {
  axis: Axis;
  explanation: PartyPlacementView['axes'][AxisId];
  party: Party;
  last: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const { lean, groups, position, count } = explanation;
  const text = leanText(lean, axis);
  const side = lean.kind === 'placed' ? lean.side : null;
  const label =
    lean.kind === 'placed'
      ? `${axis.label} : ${text}, d'après ${count} positions. De « ${axis.negativePole} » à « ${axis.positivePole} ».`
      : `${axis.label} : non placé, ${count} positions connues sur ${MIN_AXIS_COUNT} nécessaires.`;
  const small = { fontSize: effects.sizes.text.label, color: colors.text.secondary };
  const pole = (name: string) => (
    <>
      Le tirent vers <Text style={{ ...fonts.bold, color: colors.text.primary }}>« {name} »</Text>
    </>
  );

  return (
    <Accordion
      flat
      last={last}
      title={axis.label}
      subtitle={text}
      trailing={<AxisGauge variant="mini" position={position} color={party.color} />}
    >
      <AxisGauge
        variant="full"
        position={position}
        color={party.color}
        negativePole={axis.negativePole}
        positivePole={axis.positivePole}
        side={side}
        accessibilityLabel={label}
      />
      {lean.kind === 'placed' ? (
        <Text style={small}>
          D'après {count} position{count > 1 ? 's' : ''} publique{count > 1 ? 's' : ''}
        </Text>
      ) : (
        <Text style={small}>
          {count === 0
            ? 'Aucune position publique trouvée sur les affirmations de cet axe.'
            : `Avec moins de ${MIN_AXIS_COUNT} positions, la moyenne ne serait pas fiable : le parti n'apparaît pas sur cet axe de la carte. Voici les positions dont nous disposons.`}
        </Text>
      )}
      <PullGroup
        items={groups.negative}
        heading={(n) => (
          <>
            {pole(axis.negativePole)}
            {` · ${n}`}
          </>
        )}
      />
      <PullGroup
        items={groups.positive}
        heading={(n) => (
          <>
            {pole(axis.positivePole)}
            {` · ${n}`}
          </>
        )}
      />
      <PullGroup
        items={groups.neutral}
        heading={(n) => `Positions mitigées, sans effet sur l'axe · ${n}`}
      />
    </Accordion>
  );
}

/** Carte d'un parti : ses axes, puis les affirmations qui l'y placent, regroupées par sens. */
export function PartyPlacement({
  party,
  axes,
  placement,
}: {
  party: Party;
  axes: Axis[];
  placement: PartyPlacementView;
}) {
  return (
    <Accordion
      title={displayName(party)}
      subtitle={placementSummary({
        placedCount: placement.placedCount,
        axisCount: axes.length,
        positionsCount: placement.positionsCount,
      })}
      leading={<PartyDot color={party.color} size={32} label={party.shortName} />}
    >
      <View style={{ gap: 0 }}>
        {axes.map((axis, index) => (
          <AxisPlacement
            key={axis.id}
            axis={axis}
            party={party}
            explanation={placement.axes[axis.id]}
            last={index === axes.length - 1}
          />
        ))}
      </View>
    </Accordion>
  );
}
