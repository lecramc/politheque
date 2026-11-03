import { Text as DefaultText, View as DefaultView } from 'react-native';

import { useTheme } from './ThemeContext';

export type TextProps = DefaultText['props'] & {
  variant?: 'body' | 'title' | 'subtitle' | 'caption' | 'quote';
};
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  const { style, variant = 'body', ...otherProps } = props;
  const { colors, effects, fonts } = useTheme();

  const getTextStyle = () => {
    switch (variant) {
      case 'title':
        return {
          fontSize: effects.sizes.text.title,
          lineHeight: Math.round(effects.sizes.text.title * 1.2),
          ...fonts.display,
          color: colors.text.strong,
        };
      case 'subtitle':
        return {
          fontSize: effects.sizes.text.subtitle,
          ...fonts.medium,
          color: colors.text.secondary,
        };
      case 'caption':
        return {
          fontSize: effects.sizes.text.caption,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
          ...fonts.medium,
          color: colors.text.secondary,
        };
      case 'quote':
        return {
          fontSize: effects.sizes.text.quote,
          fontStyle: 'italic' as const,
          lineHeight: 22,
          color: colors.text.secondary,
        };
      case 'body':
      default:
        return {
          fontSize: effects.sizes.text.body,
          ...fonts.regular,
          color: colors.text.primary,
        };
    }
  };

  return <DefaultText style={[getTextStyle(), style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  return <DefaultView style={[style]} {...otherProps} />;
}

export { ThemedButton, ThemedContainer } from './ui';
export { Icon } from './ui/Icon';
export { Pressable } from './ui/Pressable';
