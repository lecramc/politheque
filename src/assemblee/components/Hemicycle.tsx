import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, useWindowDimensions, View } from 'react-native';
import Svg, { G, Text as SvgText } from 'react-native-svg';

import { layout as siteLayout } from '@/components/layout';
import { duration } from '@/components/motion';
import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Enter } from '@/components/ui/Enter';
import { GroupArcPath } from '@/src/assemblee/components/GroupArcPath';
import { SeatMark } from '@/src/assemblee/components/SeatMark';
import { hitTest, pixelToModel, type PointerKind } from '@/src/assemblee/models/hemicycle-hit';
import type { HemicycleView } from '@/src/assemblee/view-models/scrutin.view-model';
import { paint } from '@/src/core/web/svg-paint';

type Ready = Extract<HemicycleView, { status: 'ready' }>;

/** Taille des abréviations de groupe, en pixels réels (le schéma est mis à l'échelle). */
const LABEL_PX = 12;
const DIMMED = 0.18;
/** Sous cette largeur : cadre serré pleine largeur, sans étiquettes de groupe (les groupes sont nommés au-dessus). */
const NARROW_BELOW = siteLayout.breakpoint.md;

/**
 * Hémicycle schématique : sièges rangés groupe par groupe, dans l'ordre du plan officiel de
 * l'Assemblée (ce n'est pas le plan exact de la salle). Deux codages indépendants : la couleur
 * officielle du groupe est sur l'arc extérieur (cerné d'un contour fin) et le vote est dans la
 * forme du siège (disque, barré, anneau, pointillé), sans couleur de groupe sur le siège : les
 * deux informations ne se brouillent pas, et chacune se lit sans l'autre. Une image pour les technologies d'assistance (`role="img"`, un seul
 * `aria-label` résumé) : la liste des députés est l'alternative complète.
 *
 * Écran étroit : le schéma prend toute la largeur (sièges plus grands), sans étiquettes ; toucher
 * l'hémicycle met en évidence le groupe le plus proche, sans viser un siège. Écran large : arc
 * étiqueté, survol d'un siège pour voir le député, clic pour l'épingler. Mouvement réduit :
 * l'apparition est instantanée.
 */
export function Hemicycle({
  view,
  highlight,
  onHighlight,
}: {
  view: Ready;
  highlight: number | null;
  onHighlight: (groupe: number | null) => void;
}) {
  const { colors, fonts } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const compact = screenWidth < NARROW_BELOW;
  const box = compact ? view.compactBox : view.box;
  const { layout, seats, arcs } = view;
  const [size, setSize] = useState({ width: 343, height: 343 / box.ratio });
  const [hover, setHover] = useState<{ place: number; pinned: boolean } | null>(null);
  const pointerKind = useRef<PointerKind>(Platform.OS === 'web' ? 'fine' : 'coarse');
  const wrap = useRef<View>(null);

  const bySeatPlace = useMemo(() => new Map(seats.map((s) => [s.place, s])), [seats]);
  const scene = useMemo(
    () => ({
      box,
      seats: layout.seats,
      seatRadius: layout.seatRadius,
      arcs,
      groupOf: (place: number) => bySeatPlace.get(place)?.groupeIndex ?? null,
    }),
    [box, layout, arcs, bySeatPlace]
  );

  const hoverAt = useCallback(
    (px: number, py: number, pin: boolean) => {
      const hit = hitTest(scene, pixelToModel(box, size, px, py), pointerKind.current);
      if (hit?.kind === 'seat') {
        const seat = bySeatPlace.get(hit.place);
        if (seat?.depute) setHover({ place: hit.place, pinned: pin });
        else if (pin) setHover(null);
        return;
      }
      if (pin && (hit?.kind === 'arc' || hit?.kind === 'group')) {
        onHighlight(highlight === hit.groupe ? null : hit.groupe);
        return;
      }
      if (pin || !hover?.pinned) setHover(null);
    },
    [scene, box, size, bySeatPlace, onHighlight, highlight, hover?.pinned]
  );

  // Survol (web, souris ou stylet) : écouteurs DOM, qui lisent le type de pointeur.
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const node = wrap.current as unknown as HTMLElement | null;
    if (!node) return undefined;
    const rememberKind = (e: PointerEvent) => {
      pointerKind.current = e.pointerType === 'touch' ? 'coarse' : 'fine';
    };
    const onMove = (e: PointerEvent) => {
      rememberKind(e);
      if (e.pointerType === 'touch') return;
      const rect = node.getBoundingClientRect();
      hoverAt(e.clientX - rect.left, e.clientY - rect.top, false);
    };
    const onLeave = () => setHover((current) => (current?.pinned ? current : null));
    node.addEventListener('pointerdown', rememberKind);
    // `mousemove` en plus de `pointermove` : certains navigateurs et outils ne déclenchent que l'un des deux.
    const onMouse = (e: MouseEvent) => {
      pointerKind.current = 'fine';
      const rect = node.getBoundingClientRect();
      hoverAt(e.clientX - rect.left, e.clientY - rect.top, false);
    };
    node.addEventListener('pointermove', onMove);
    node.addEventListener('mousemove', onMouse);
    node.addEventListener('pointerleave', onLeave);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('pointerdown', rememberKind);
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('mousemove', onMouse);
      node.removeEventListener('pointerleave', onLeave);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [hoverAt]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0) setSize({ width, height });
  };

  const unitsPerPixel = box.width / size.width;
  const labelSize = LABEL_PX * unitsPerPixel;
  const dimmed = highlight !== null;
  const inGroup = (groupe: number | null) => !dimmed || groupe === highlight;

  const drawSeats = (visible: (groupe: number | null) => boolean) =>
    seats
      .filter((seat) => visible(seat.groupeIndex))
      .map((seat) => (
        <SeatMark
          key={seat.place}
          cx={seat.x}
          cy={seat.y}
          r={layout.seatRadius}
          glyph={seat.glyph}
          vote={colors.vote}
        />
      ));

  const tooltip = hover && !compact ? view.tooltipOf(hover.place) : null;
  const tooltipWidth = 190;
  const hoveredSeat = hover ? layout.seats.find((s) => s.place === hover.place) : null;
  const tipX = hoveredSeat ? ((hoveredSeat.x - box.minX) / box.width) * size.width : 0;
  const tipY = hoveredSeat ? ((hoveredSeat.y - box.minY) / box.height) * size.height : 0;

  return (
    <View
      ref={wrap}
      role="img"
      aria-label={view.ariaLabel}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onResponderRelease={(e) => {
        const native = e.nativeEvent as unknown as { locationX?: number; locationY?: number };
        if (native.locationX === undefined || native.locationY === undefined) return;
        hoverAt(native.locationX, native.locationY, true);
      }}
      style={{ width: '100%', aspectRatio: box.ratio, position: 'relative' }}
    >
      {/* Le dessin ne reçoit aucun événement : le cadre seul les reçoit (position relative à lui). */}
      <View pointerEvents="none" style={{ width: '100%', height: '100%' }}>
        <Enter kind="fade" duration={duration.page} style={{ width: '100%', height: '100%' }}>
          <Svg
            width="100%"
            height="100%"
            viewBox={`${box.minX} ${box.minY} ${box.width} ${box.height}`}
          >
            {dimmed ? <G opacity={DIMMED}>{drawSeats((g) => !inGroup(g))}</G> : null}
            <G>{drawSeats(inGroup)}</G>
            {arcs.map((arc) => {
              const active = !dimmed || highlight === arc.groupe;
              return (
                <G key={arc.groupe} opacity={active ? 1 : DIMMED}>
                  <GroupArcPath arc={arc} />
                  {compact ? null : (
                    <SvgText
                      x={arc.labelX}
                      y={arc.labelY}
                      fontSize={labelSize}
                      fontFamily={(active && dimmed ? fonts.bold : fonts.medium).fontFamily}
                      textAnchor={arc.labelAnchor}
                      alignmentBaseline="middle"
                      {...paint({ fill: colors.text.primary })}
                    >
                      {arc.abrev}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>
        </Enter>
      </View>
      {tooltip ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: tooltipWidth,
            left: Math.min(Math.max(tipX - tooltipWidth / 2, 0), size.width - tooltipWidth),
            top: tipY < 70 ? tipY + 14 : tipY - 62,
            padding: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.surface.border.tertiary,
            backgroundColor: colors.surface.primary,
          }}
        >
          <Text style={{ fontSize: 14, lineHeight: 19, color: colors.text.primary }}>
            {tooltip}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
