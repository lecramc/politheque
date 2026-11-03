import React from 'react';
import { Platform, Text, View } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import HeaderButtonRight from '@/components/shared/HeaderButtonRight';
import { useTheme } from '@/components/ThemeContext';
import { toSFSymbol } from '@/components/ui/icon-symbol-map';

export type HeaderAction = {
  /** Libellé accessibilité / voice-over du bar item. */
  label: string;
  /** Ionicons — fallback Android, et clé de résolution du SF Symbol iOS via la map. */
  ionicon: string;
  /** SF Symbol iOS — optionnel : par défaut résolu depuis `ionicon` (icon-symbol-map). */
  sfSymbol?: SFSymbol;
  onPress: () => void;
  /** Badge natif (iOS 26+) — ex. nombre de notifications en attente. */
  badge?: number | string;
  /** Couleur du badge (token thème) — l'appelant la fournit car ce helper
   * n'est pas un composant et n'a pas accès à useTheme(). */
  badgeColor?: string;
  badgeTextColor?: string;
};

// Resolve the iOS bar-item SF Symbol: explicit override → shared map → safe
// fallback. A missing mapping warns in dev so it gets added, never crashes.
function resolveSfSymbol(action: HeaderAction): SFSymbol {
  const sf = action.sfSymbol ?? toSFSymbol(action.ionicon);
  if (sf) return sf;
  if (__DEV__) {
    console.warn(
      `[HeaderActions] No SF Symbol mapped for Ionicons "${action.ionicon}" — add it to icon-symbol-map.`
    );
  }
  return 'circle';
}

/**
 * Actions de header uniformes pour les Stack.Screen options.
 *
 * iOS 26 : un `headerRight` custom est monté comme UN SEUL UIBarButtonItem,
 * que le système enveloppe dans une pilule liquid glass partagée. Ce helper
 * déclare de vrais bar items séparés (`sharesBackground: false` → une bulle
 * par bouton) via `unstable_headerRightItems`, et retombe sur une rangée de
 * `HeaderButtonRight` sur Android.
 *
 * Usage : `<Stack.Screen options={{ title, ...headerRightActions([...]) }} />`
 */
export function headerRightActions(actions: HeaderAction[]) {
  if (Platform.OS === 'ios') {
    return {
      unstable_headerRightItems: () =>
        actions.map((action) => ({
          type: 'button' as const,
          label: action.label,
          icon: { type: 'sfSymbol' as const, name: resolveSfSymbol(action) },
          sharesBackground: false,
          ...(action.badge != null
            ? {
                badge: {
                  value: String(action.badge),
                  ...(action.badgeColor
                    ? {
                        style: {
                          backgroundColor: action.badgeColor,
                          color: action.badgeTextColor,
                        },
                      }
                    : {}),
                },
              }
            : {}),
          onPress: action.onPress,
        })),
    };
  }
  return {
    headerRight: () => <HeaderActionsRow actions={actions} />,
  };
}

function HeaderActionsRow({ actions }: { actions: HeaderAction[] }) {
  const { colors, effects } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: effects.spacing.md }}>
      {actions.map((action) => (
        <View key={action.ionicon}>
          <HeaderButtonRight iconName={action.ionicon} onPress={action.onPress} />
          {action.badge != null && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -4,
                right: -6,
                minWidth: 16,
                height: 16,
                paddingHorizontal: 4,
                borderRadius: effects.borderRadius.round,
                backgroundColor: colors.accent.error,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 10.5, fontWeight: '700' }}>
                {action.badge}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
