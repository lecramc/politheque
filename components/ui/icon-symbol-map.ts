import type { SFSymbol } from 'sf-symbols-typescript';

/**
 * Single source of truth for Ionicons → SF Symbol equivalences.
 *
 * Lets components expose ONE `icon` prop (an Ionicons name) and resolve the
 * native SF Symbol on iOS, instead of every caller passing both an Ionicons name
 * and an SF Symbol. Extend this map as new icons are used in buttons — only the
 * icons that actually need a native iOS rendering require an entry.
 */
// Only the icons actually resolved today (Button `icon`, IconButton `name`,
// HeaderActions `ionicon`). Add an entry when a new button needs one — the dev
// warning in HeaderActions points out a missing mapping.
export const IONICON_TO_SF_SYMBOL: Record<string, SFSymbol> = {
  link: 'link',
  'chevron-back': 'chevron.left',
  'share-outline': 'square.and.arrow.up',
  'settings-outline': 'gearshape',
  'file-tray-outline': 'tray',
  'ellipsis-horizontal': 'ellipsis',
};

/** Resolve an Ionicons name to its SF Symbol equivalent, if one is mapped. */
export function toSFSymbol(ionicon: string): SFSymbol | undefined {
  return IONICON_TO_SF_SYMBOL[ionicon];
}
