import { BottomSheet as SwiftBottomSheet, Host, RNHostView } from '@expo/ui/swift-ui';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/components/ThemeContext';

import type { BottomSheetProps } from '.';

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  // Native surface: follows the OS appearance (not the app toggle), so its
  // content — styled with systemColors — stays legible when app theme ≠ OS.
  const { systemTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <Host style={StyleSheet.absoluteFill} colorScheme={systemTheme}>
      <SwiftBottomSheet
        isPresented={isOpen}
        onIsPresentedChange={(v) => {
          if (!v) onClose();
        }}
        fitToContents
      >
        <RNHostView matchContents>{children}</RNHostView>
      </SwiftBottomSheet>
    </Host>
  );
}
