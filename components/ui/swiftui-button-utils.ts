/**
 * Shared SwiftUI button style mappings used by Button.ios.tsx and IconButton.ios.tsx.
 */

export type SwiftUIButtonStyle =
  | 'glass'
  | 'glassProminent'
  | 'automatic'
  | 'borderedProminent'
  | 'plain';

export function mapVariantToSwiftUIButtonStyle(
  variant: 'primary' | 'secondary' | 'plain' | 'tertiary' | 'danger' | 'tint' | 'brand'
): SwiftUIButtonStyle {
  switch (variant) {
    case 'primary':
      return 'glassProminent';
    case 'secondary':
      return 'glass';
    case 'plain':
    case 'tertiary':
      return 'plain';
    case 'tint':
    case 'brand':
    case 'danger':
      return 'borderedProminent';
    default:
      return 'automatic';
  }
}

export function mapVariantToSwiftUIRole(
  variant: 'primary' | 'secondary' | 'plain' | 'tertiary' | 'danger' | 'tint' | 'brand'
): 'default' | 'cancel' | 'destructive' | undefined {
  if (variant === 'danger') return 'destructive';
  return undefined;
}
