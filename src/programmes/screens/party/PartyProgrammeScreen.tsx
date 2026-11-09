import { Link, useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { useColorStyle } from '@/components/webTheme';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { KeyIdeaList } from '@/src/programmes/components/KeyIdeaList';
import { PageSources } from '@/src/programmes/components/PageSources';
import { SectionTitle } from '@/src/programmes/components/SectionTitle';
import { SeoHead } from '@/src/programmes/components/SeoHead';
import { SourceChip } from '@/src/programmes/components/SourceChip';
import { StatusChip } from '@/src/programmes/components/StatusChip';
import { TabPanel } from '@/src/programmes/components/Tabs';
import { firstSentence } from '@/src/programmes/models/presentation.service';
import { legacyTabRedirect, partyHref } from '@/src/programmes/models/seo/party-sections';
import { partyViewModel } from '@/src/programmes/view-models/party.view-model';

/**
 * Onglet « Programme » : /partis/[id]/programme-2027, adresse de l'onglet par défaut. `/partis/[id]`
 * rend le même écran, avec un canonical vers cette adresse (alias, jamais indexé).
 *
 * Ordre : « Ce qu'il propose » (les 4 idées), la candidature (texte entier), le programme thème par
 * thème, puis les sources. Les anciens liens `?onglet=` sont redirigés (effet, jamais au rendu).
 */
export default function PartyProgrammeScreen() {
  const { id, onglet } = useLocalSearchParams<{ id: string; onglet?: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const vm = useViewModel(partyViewModel(id));
  const { colors, effects, fonts } = useTheme();
  const c = useColorStyle();
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const alias = !pathname.endsWith('/programme-2027');

  useEffect(() => {
    const target = legacyTabRedirect(id, onglet);
    if (target && !target.endsWith('/programme-2027')) router.replace(target as never);
    else if (target) router.setParams({ onglet: undefined });
  }, [id, onglet, router]);

  const party = vm.party;
  const presidential = vm.presidential;
  if (!party) return null;
  const meta = alias ? vm.aliasMeta : vm.metaBySection?.['programme'];
  const candidacy = presidential?.candidacy ?? null;

  return (
    <TabPanel id="programme" style={{ gap: effects.spacing.lg }}>
      {meta ? <SeoHead meta={meta} /> : null}
      {/* Phrase datée et autonome, même gabarit pour les dix partis (audit SEO § 5.1). */}
      {vm.summary ? (
        <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text.secondary }}>
          {vm.summary}
        </Text>
      ) : null}
      {vm.keyIdeas ? <KeyIdeaList keyIdeas={vm.keyIdeas} partyName={party.name} /> : null}

      {candidacy ? (
        <View
          style={{
            backgroundColor: colors.tintSoft,
            borderRadius: effects.borderRadius.small,
            padding: effects.spacing.md,
            gap: effects.spacing.xs,
          }}
        >
          <SectionTitle>Présidentielle 2027</SectionTitle>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: effects.spacing.xs }}>
            <Text style={{ ...fonts.bold, fontSize: 16 }}>{candidacy.candidateName}</Text>
            <StatusChip label={candidacy.statusLabel} />
          </View>
          <Text style={{ fontSize: 16, lineHeight: 25 }}>{candidacy.candidate}</Text>
          <Text style={{ fontSize: 15, color: colors.text.secondary }}>
            {firstSentence(candidacy.programmeStatus)}
          </Text>
        </View>
      ) : null}

      {presidential ? (
        <View style={{ gap: effects.spacing.xs }}>
          <SectionTitle>Son programme, thème par thème</SectionTitle>
          {presidential.sections.map(({ theme, programme }) =>
            programme ? (
              <Accordion
                key={theme.id}
                title={theme.title}
                subtitle={firstSentence(programme.summary)}
                leading={<Icon name={theme.icon} variant="onGlass" size="small" />}
                open={openTheme === theme.id}
                onToggle={(o) => setOpenTheme(o ? theme.id : null)}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 15 }}>
                  {programme.summary}
                </Text>
                {programme.measures.map((measure) => (
                  <View
                    key={measure.text}
                    style={[styles.measure, c((p) => ({ borderColor: p.surface.border.primary }))]}
                  >
                    <Text style={styles.measureText}>{measure.text}</Text>
                    <SourceChip sources={measure.sources} subject={measure.text} />
                  </View>
                ))}
                <TextLink href={`/debats/${theme.id}`} standalone>
                  {`Le grand débat : ${theme.title}`}
                </TextLink>
              </Accordion>
            ) : null
          )}
        </View>
      ) : null}

      <PageSources
        sources={vm.sourcesBySection['programme']}
        verifiedOn={vm.verifiedOn}
        updatedOn={vm.updatedOn}
      />
      {vm.nextParty ? (
        <Link href={partyHref(vm.nextParty.id) as never} asChild>
          <Pressable accessibilityRole="link" style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ ...fonts.bold, fontSize: 16, color: colors.tint }}>
              {`Parti suivant (A-Z) : ${vm.nextParty.name} →`}
            </Text>
          </Pressable>
        </Link>
      ) : null}
    </TabPanel>
  );
}

const styles = StyleSheet.create({
  measure: { gap: 6, paddingTop: 10, borderTopWidth: 1 },
  measureText: { fontSize: 16, lineHeight: 24 },
});
