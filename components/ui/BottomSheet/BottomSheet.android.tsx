import { Host, ModalBottomSheet, RNHostView } from '@expo/ui/jetpack-compose';

import { useTheme } from '@/components/ThemeContext';

import type { BottomSheetProps } from '.';

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // Native surface: follows the OS appearance (not the app toggle), so its
  // content — styled with systemColors — stays legible when app theme ≠ OS.
  const { systemTheme, systemColors } = useTheme();

  if (!isOpen) return null;

  return (
    <Host matchContents colorScheme={systemTheme}>
      <ModalBottomSheet
        onDismissRequest={onClose}
        containerColor={systemColors.surface.primary}
        skipPartiallyExpanded
      >
        <RNHostView matchContents>{children}</RNHostView>
      </ModalBottomSheet>
    </Host>
  );
}
