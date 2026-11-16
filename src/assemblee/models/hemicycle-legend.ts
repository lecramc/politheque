import { orderedPositions, positionLabel } from '@/src/assemblee/models/deputy-table';
import type { VoteCode } from '@/src/assemblee/models/scrutin.model';
import { SEAT_GLYPHS, type SeatGlyph } from '@/src/assemblee/models/seat-view';

export type LegendEntry = { code: VoteCode; glyph: SeatGlyph; label: string };

/**
 * Légende de base : pour, contre, abstention, n'a pas voté (« ne prend pas part au vote » a la
 * même forme que « n'a pas voté » : la fusion est visuelle, les décomptes restent distincts).
 * Motion de censure : l'Assemblée ne recense que les voix pour.
 */
export const legendEntries = (censure: boolean): LegendEntry[] =>
  orderedPositions(['P', 'C', 'A', '-'], censure).map((code) => ({
    code,
    glyph: SEAT_GLYPHS[code],
    label: positionLabel(code, censure),
  }));
