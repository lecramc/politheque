import React from 'react';
import { Path } from 'react-native-svg';

import type { ArcSegment } from '@/src/assemblee/models/hemicycle-scene';
import { useMarkOutline } from '@/src/core/hooks/useMarkOutline';
import { paint } from '@/src/core/web/svg-paint';

/** Épaisseur du trait de couleur et du contour fin qui l'entoure, en unités du schéma. */
const ARC_WIDTH = 0.05;
const OUTLINE_WIDTH = 0.066;

/**
 * Arc extérieur d'un groupe, dans un `<Svg>` : la couleur officielle du groupe, cernée d'un
 * contour fin pour que les couleurs claires restent visibles en clair comme en sombre. Il porte
 * le groupe ; la forme du siège (hors composition) porte le vote.
 */
export function GroupArcPath({ arc }: { arc: ArcSegment }) {
  const outline = useMarkOutline(arc.color);
  return (
    <>
      <Path
        d={arc.path}
        fill="none"
        strokeWidth={OUTLINE_WIDTH}
        strokeLinecap="butt"
        {...paint({ stroke: outline })}
      />
      <Path
        d={arc.path}
        fill="none"
        strokeWidth={ARC_WIDTH}
        strokeLinecap="butt"
        {...paint({ stroke: arc.color })}
      />
    </>
  );
}
