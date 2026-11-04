import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { NodeLabel } from '@/src/programmes/components/NodeLabel';
import { MARKER_WIDTH, NodeMarker } from '@/src/programmes/components/NodeMarker';
import type { JourneyNodeModel } from '@/src/programmes/view-models/journey.view-model';

const MAX_CHIPS = 5;

/**
 * Une étape du chemin. Le lien est reçu du view-model (`node.href`) et rendu par un vrai
 * `<a>` dans l'export statique (référencement, clic milieu).
 * `compact` : ligne de hauteur fixe (aucun saut de mise en page à l'hydratation).
 * `cards` : carte desktop avec les contenus de l'étape en puces cliquables.
 */
export function JourneyNode({
  node,
  variant,
  offset = 0,
  celebrate = false,
  lightUp = false,
}: {
  node: JourneyNodeModel;
  variant: 'compact' | 'cards';
  /** Décalage horizontal en zigzag (compact seulement). */
  offset?: number;
  /** Le tampon de cette étape se pose (gagné pendant la session). */
  celebrate?: boolean;
  /** Ce nœud s'éclaire : l'étape précédente vient d'être terminée. */
  lightUp?: boolean;
}) {
  const { colors, effects, fonts } = useTheme();
  const marker = (
    <NodeMarker
      ratio={node.ratio}
      status={node.status}
      isNext={node.isNext}
      icon={node.icon}
      stamped={node.stamped}
      celebrate={celebrate}
      lightUp={lightUp}
    />
  );

  if (variant === 'compact') {
    return (
      <Link href={node.href as never} asChild>
        <Pressable
          large
          accessibilityRole="link"
          accessibilityLabel={node.accessibilityLabel}
          aria-current={node.isNext ? 'step' : undefined}
          style={{
            flexDirection: 'row',
            gap: effects.spacing.sm,
            paddingLeft: offset,
            height: ROW_HEIGHT,
          }}
        >
          {marker}
          <NodeLabel
            index={node.index}
            title={node.title}
            meta={node.meta}
            cta={node.cta}
            stamped={node.stamped}
          />
        </Pressable>
      </Link>
    );
  }

  const shown = node.chips.slice(0, MAX_CHIPS);
  const hidden = node.chips.length - shown.length;
  return (
    <View style={{ flexDirection: 'row', gap: effects.spacing.md }}>
      <View style={{ width: MARKER_WIDTH, alignItems: 'center' }}>{marker}</View>
      <View
        style={{
          flex: 1,
          gap: effects.spacing.sm,
          padding: effects.spacing.md,
          borderRadius: effects.borderRadius.small,
          borderWidth: node.isNext ? 2 : 1,
          borderColor: node.isNext ? colors.tint : colors.surface.border.primary,
          backgroundColor: colors.surface.primary,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Link href={node.href as never} asChild>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={node.accessibilityLabel}
              aria-current={node.isNext ? 'step' : undefined}
              style={{ flex: 1 }}
            >
              <NodeLabel
                index={node.index}
                title={node.title}
                meta={node.meta}
                cta={node.cta}
                stamped={node.stamped}
                hideMeta
              />
            </Pressable>
          </Link>
          <Text style={{ color: colors.text.secondary }}>{node.meta}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: effects.spacing.xs }}>
          {shown.map((chip) => (
            <Link key={chip.key} href={chip.href as never} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${chip.title}${chip.read ? ', lu' : ''}`}
                style={chipStyle(colors, effects)}
              >
                <Text style={{ fontSize: 14 }}>{chip.title}</Text>
                {chip.read ? <Text style={{ ...fonts.bold, color: colors.tint }}> ✓</Text> : null}
              </Pressable>
            </Link>
          ))}
          {hidden > 0 ? (
            <Link href={node.href as never} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${hidden} autres contenus`}
                style={chipStyle(colors, effects)}
              >
                <Text style={{ fontSize: 14 }}>+ {hidden}</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const ROW_HEIGHT = 118;

const chipStyle = (
  colors: ReturnType<typeof useTheme>['colors'],
  effects: ReturnType<typeof useTheme>['effects']
) => ({
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  minHeight: 36,
  paddingHorizontal: 12,
  borderRadius: effects.borderRadius.round,
  backgroundColor: colors.background.secondary,
  borderWidth: 1,
  borderColor: colors.surface.border.primary,
});
