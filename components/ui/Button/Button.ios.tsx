import { Button as IOSButton, Host, ProgressView, Text as SwiftText } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize as controlSizeModifier,
  disabled as disabledModifier,
  fixedSize,
  frame,
  labelStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { toSFSymbol } from '@/components/ui/icon-symbol-map';
import {
  mapVariantToSwiftUIButtonStyle,
  mapVariantToSwiftUIRole,
} from '@/components/ui/swiftui-button-utils';

import type { ButtonSize, ButtonVariant } from './Button';

const mapSizeToControlSize = (
  size: ButtonSize
): 'mini' | 'small' | 'regular' | 'large' | 'extraLarge' => {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
      return 'regular';
    case 'large':
      return 'large';
  }
};

type IOSProps = {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  fullWidth?: boolean;
  // Ionicons name; resolved to its SF Symbol equivalent for a native
  // `titleAndIcon` label. Falls back to no icon if the name isn't mapped.
  icon?: string;
  onGlass?: boolean;
};

export default function ButtonIOS({
  onPress,
  children,
  disabled: isDisabled,
  loading = false,
  variant = 'secondary',
  size = 'large',
  color,
  fullWidth = true,
  icon,
  onGlass = false,
}: IOSProps) {
  const { theme, systemTheme, colors } = useTheme();
  // Sur une sheet native (qui suit l'OS), le Host doit suivre le thème système
  // et non le toggle app, sinon le bouton se désaligne quand app ≠ système.
  const hostColorScheme = onGlass ? systemTheme : theme;

  const resolvedColor = color ?? (variant === 'brand' ? colors.tint : undefined);
  // SF Symbol + text label → native `titleAndIcon` button (label/systemImage
  // props instead of SwiftText children, which would drop the icon).
  const systemImage = icon ? toSFSymbol(icon) : undefined;
  const withIcon = !!systemImage && !loading;
  const modifiers = [
    buttonStyle(mapVariantToSwiftUIButtonStyle(variant)),
    controlSizeModifier(mapSizeToControlSize(size)),
    disabledModifier(isDisabled || loading),
    ...(fullWidth ? [] : [fixedSize({ horizontal: true })]),
    ...(resolvedColor ? [tint(resolvedColor)] : []),
    ...(withIcon ? [labelStyle('titleAndIcon')] : []),
  ];

  const host = (
    <Host matchContents={{ vertical: true, horizontal: !fullWidth }} colorScheme={hostColorScheme}>
      {withIcon ? (
        <IOSButton
          onPress={onPress}
          role={mapVariantToSwiftUIRole(variant)}
          label={typeof children === 'string' ? children : undefined}
          systemImage={systemImage as never}
          modifiers={modifiers}
        />
      ) : (
        <IOSButton onPress={onPress} role={mapVariantToSwiftUIRole(variant)} modifiers={modifiers}>
          {loading ? (
            <ProgressView modifiers={[frame({ width: 16, height: 16 })]} />
          ) : (
            <SwiftText modifiers={fullWidth ? [frame({ maxWidth: 9999 })] : []}>
              {children}
            </SwiftText>
          )}
        </IOSButton>
      )}
    </Host>
  );

  if (fullWidth) {
    return <View style={{ width: '100%' }}>{host}</View>;
  }

  return host;
}
