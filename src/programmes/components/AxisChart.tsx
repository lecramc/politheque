import React from 'react';
import { useWindowDimensions, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { PartyDot } from '@/src/programmes/components/PartyDot';
import type { AxisPosition } from '@/src/programmes/models/matching.service';
import type { Axis, Party } from '@/src/programmes/models/programme.model';

type Point = {
  key: string;
  label: string;
  color: string;
  position: AxisPosition;
  isUser?: boolean;
};

/** Marge intérieure : un point à ±1 reste dans le cadre avec son libellé. */
const INSET = 0.1;

/** Carte 2D (économie × société) + axe Europe. Positions de -1 à +1. */
export function AxisChart({
  axes,
  user,
  parties,
}: {
  axes: Axis[];
  user: AxisPosition;
  parties: { party: Party; position: AxisPosition }[];
}) {
  const { colors, fonts } = useTheme();
  const { width } = useWindowDimensions();
  const size = Math.min(420, width - 80);
  const eco = axes.find((a) => a.id === 'economique');
  const soc = axes.find((a) => a.id === 'societal');
  const eu = axes.find((a) => a.id === 'europe');

  const points: Point[] = [
    ...parties.map(({ party, position }) => ({
      key: party.id,
      // Sigle court sur la carte pour limiter les chevauchements ; le nom complet est dans la description.
      label: party.shortName,
      color: party.color,
      position,
    })),
    { key: 'vous', label: 'Vous', color: colors.tint, position: user, isUser: true },
  ];

  const toRatio = (v: number) => INSET + ((v + 1) / 2) * (1 - 2 * INSET);
  const caption = { fontSize: 12, color: colors.text.secondary };
  const dot = (p: Point) =>
    p.isUser ? (
      <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: colors.tint }} />
    ) : (
      <PartyDot color={p.color} size={14} />
    );

  // Alternative textuelle : la carte est décrite en mots pour les lecteurs d'écran.
  const describe = (position: AxisPosition) =>
    axes
      .map((axis) => {
        const v = position[axis.id];
        if (v === null) return `${axis.label} : non calculé`;
        const pole = v >= 0 ? axis.positivePole : axis.negativePole;
        return `${axis.label} : ${Math.round(Math.abs(v) * 100)} % vers « ${pole} »`;
      })
      .join(' ; ');
  const summary = [
    `Votre position. ${describe(user)}.`,
    ...parties.map(({ party, position }) => `${party.name}. ${describe(position)}.`),
  ].join(' ');

  return (
    <View
      style={{ gap: 16, alignItems: 'center' }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Carte des positions. ${summary}`}
    >
      <Text style={[caption, { textAlign: 'center' }]}>↑ {soc?.positivePole}</Text>
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: colors.surface.border.tertiary,
          backgroundColor: colors.surface.secondary,
          borderRadius: 8,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: size / 2,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: colors.surface.border.secondary,
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: size / 2,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: colors.surface.border.secondary,
          }}
        />
        {points
          .filter((p) => p.position.economique !== null && p.position.societal !== null)
          .map((p) => (
            <View
              key={p.key}
              style={{
                position: 'absolute',
                left: toRatio(p.position.economique!) * size - 8,
                top: (1 - toRatio(p.position.societal!)) * size - 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                zIndex: p.isUser ? 2 : 1,
              }}
            >
              {dot(p)}
              <Text
                style={{
                  fontSize: 11,
                  ...(p.isUser ? { ...fonts.bold, color: colors.tint } : fonts.regular),
                }}
              >
                {p.label}
              </Text>
            </View>
          ))}
      </View>
      <Text style={[caption, { textAlign: 'center' }]}>↓ {soc?.negativePole}</Text>
      <View style={{ width: size, flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <Text style={[caption, { flex: 1 }]}>← {eco?.negativePole}</Text>
        <Text style={[caption, { flex: 1, textAlign: 'right' }]}>{eco?.positivePole} →</Text>
      </View>

      {eu ? (
        <View style={{ width: size, gap: 6, marginTop: 8 }}>
          <Text style={{ ...fonts.bold, fontSize: 14 }}>{eu.label}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={caption}>{eu.negativePole}</Text>
            <Text style={caption}>{eu.positivePole}</Text>
          </View>
          <View style={{ height: 28, justifyContent: 'center' }}>
            <View style={{ height: 2, backgroundColor: colors.surface.border.tertiary }} />
            {points
              .filter((p) => p.position.europe !== null)
              .map((p) => (
                <View
                  key={p.key}
                  style={{
                    position: 'absolute',
                    left: toRatio(p.position.europe!) * size - 8,
                    zIndex: p.isUser ? 2 : 1,
                  }}
                >
                  {dot(p)}
                </View>
              ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
