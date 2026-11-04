import { Link } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import type { Breadcrumb as BreadcrumbTrail } from '@/src/programmes/models/seo/page-meta';

/** Fil d'Ariane visible (desktop) : même liste que le BreadcrumbList du JSON-LD. */
export function Breadcrumb({ trail }: { trail: BreadcrumbTrail }) {
  const { colors } = useTheme();
  return (
    <View
      role="navigation"
      aria-label="Fil d'Ariane"
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
    >
      {trail.map((crumb, index) => {
        const last = index === trail.length - 1;
        return (
          <View key={crumb.path} style={{ flexDirection: 'row', gap: 6 }}>
            {last ? (
              <Text aria-current="page" style={{ fontSize: 14, color: colors.text.secondary }}>
                {crumb.name}
              </Text>
            ) : (
              <>
                <Link href={crumb.path as never}>
                  <Text style={{ fontSize: 14, color: colors.tint }}>{crumb.name}</Text>
                </Link>
                <Text style={{ fontSize: 14, color: colors.text.secondary }}>›</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}
