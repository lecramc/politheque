import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Article493Note } from '@/src/assemblee/components/Article493Note';
import { DataSourceNote } from '@/src/assemblee/components/DataSourceNote';
import { DeputySearch } from '@/src/assemblee/components/DeputySearch';
import { GroupVotes } from '@/src/assemblee/components/GroupVotes';
import { Hemicycle } from '@/src/assemblee/components/Hemicycle';
import { HemicycleLegend } from '@/src/assemblee/components/HemicycleLegend';
import { VerdictBlock } from '@/src/assemblee/components/VerdictBlock';
import { COPY } from '@/src/assemblee/models/assemblee.copy';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';
import { HEMICYCLE_RATIO, HEMICYCLE_RATIO_COMPACT } from '@/src/assemblee/models/hemicycle-scene';
import { scrutinViewModel } from '@/src/assemblee/view-models/scrutin.view-model';
import { Only } from '@/src/core/components/Only';
import { useViewModel } from '@/src/core/hooks/useViewModel';
import { Accordion } from '@/src/programmes/components/Accordion';
import { Page } from '@/src/programmes/components/Page';

const MEASURE = 680;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { effects } = useTheme();
  return (
    <View style={{ gap: effects.spacing.sm }}>
      <Text variant="title" headingLevel={2} style={{ fontSize: 24, lineHeight: 30 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Emplacement du schéma, aux dimensions exactes de l'hémicycle : le pré-rendu et le premier rendu
 * client sont identiques, et la mise en page ne bouge pas quand le détail arrive. Deux cadres, un
 * par taille d'écran (cadre serré sur mobile, cadre avec étiquettes ensuite), choisis par CSS.
 */
function HemicyclePlaceholder({
  loading,
  officialUrl,
  onRetry,
}: {
  loading: boolean;
  officialUrl: string;
  onRetry: () => void;
}) {
  const { colors, effects } = useTheme();
  const frame = (ratio: number) => (
    <View
      style={{
        width: '100%',
        aspectRatio: ratio,
        alignItems: 'center',
        justifyContent: 'center',
        gap: effects.spacing.xs,
        padding: effects.spacing.md,
        borderRadius: effects.borderRadius.small,
        borderWidth: 1,
        borderColor: colors.surface.border.primary,
        backgroundColor: colors.surface.secondary,
      }}
    >
      {loading ? (
        <Text style={{ fontSize: 15, color: colors.text.secondary, textAlign: 'center' }}>
          {COPY.hemicycle.loading}
        </Text>
      ) : (
        <>
          <Text role="alert" style={{ fontSize: 15, textAlign: 'center' }}>
            {COPY.hemicycle.error}
          </Text>
          <TextLink href={officialUrl}>{COPY.hemicycle.errorLink}</TextLink>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {COPY.hemicycle.retry}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
  return (
    <>
      <Only below="md">{frame(HEMICYCLE_RATIO_COMPACT)}</Only>
      <Only from="md">{frame(HEMICYCLE_RATIO)}</Only>
    </>
  );
}

/**
 * `/assemblee/scrutins/[numero]` : un vote. Dans l'ordre : l'en-tête, le titre officiel, le
 * verdict, le vote des groupes, l'hémicycle, la recherche d'un député, les détails du vote, puis
 * les autres votes sur le texte, les notes et la source.
 */
export default function ScrutinScreen() {
  const { numero: raw } = useLocalSearchParams<{ numero: string }>();
  const numero = Number(raw);
  const vm = useViewModel(scrutinViewModel);
  const page = vm.scrutin(numero);
  const { colors, effects } = useTheme();
  const [order, setOrder] = useState<GroupeOrder>('places');
  const [highlight, setHighlight] = useState<number | null>(null);

  // Détail par député et annuaire : seulement côté client, après le rendu qui correspond au HTML.
  useEffect(() => {
    setHighlight(null);
    if (page) vm.load(numero);
  }, [numero, !!page]);

  if (!page) {
    return (
      <Page
        loading={vm.status !== 'loaded'}
        title={COPY.list.title}
        back={{ label: COPY.common.backToList, href: '/assemblee' }}
      >
        <TextLink href="/assemblee" standalone>
          {COPY.common.backToList}
        </TextLink>
      </Page>
    );
  }

  const { hemicycle } = page;
  const highlighted =
    hemicycle.status === 'ready'
      ? hemicycle.groupes(order).find((g) => g.index === highlight)
      : undefined;
  const card = {
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: colors.surface.border.primary,
    borderRadius: effects.borderRadius.small,
    overflow: 'hidden' as const,
  };

  return (
    <Page
      meta={page.meta}
      loading={vm.status !== 'loaded'}
      back={{ label: COPY.common.backToList, href: '/assemblee' }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="caption">{page.heading}</Text>
        <Text variant="title" style={{ fontSize: 24, lineHeight: 31 }}>
          {page.titre}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>{page.titleNote}</Text>
      </View>

      <VerdictBlock verdict={page.verdict} />

      <Section title={COPY.groups.title}>
        <GroupVotes
          table={page.groups(order)}
          order={order}
          onOrderChange={setOrder}
          highlight={highlight}
          onSelect={setHighlight}
          interactive={hemicycle.status === 'ready'}
        />
      </Section>

      <Section title={COPY.hemicycle.title}>
        {hemicycle.status === 'ready' ? (
          <>
            <Hemicycle view={hemicycle} highlight={highlight} onHighlight={setHighlight} />
            <HemicycleLegend entries={hemicycle.legend} />
            {highlighted ? (
              <View
                aria-live="polite"
                style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}
              >
                <Text style={{ fontSize: 14 }}>{COPY.hemicycle.highlighted(highlighted.name)}</Text>
                <Pressable
                  onPress={() => setHighlight(null)}
                  accessibilityRole="button"
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text
                    style={{ color: colors.tint, textDecorationLine: 'underline', fontSize: 14 }}
                  >
                    {COPY.hemicycle.clearHighlight}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : (
          <HemicyclePlaceholder
            loading={hemicycle.status === 'loading'}
            officialUrl={hemicycle.status === 'error' ? hemicycle.officialUrl : page.sourceUrl}
            onRetry={() => vm.load(numero)}
          />
        )}
        <Text
          style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary, maxWidth: MEASURE }}
        >
          {COPY.hemicycle.mention}
        </Text>
        {hemicycle.status === 'ready' ? (
          <>
            <Only below="md">
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
                {COPY.hemicycle.hintTouch}
              </Text>
            </Only>
            <Only from="md">
              <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text.secondary }}>
                {COPY.hemicycle.hintHover}
              </Text>
            </Only>
            {hemicycle.unseatedLines.length ? (
              <View style={{ gap: effects.spacing.xs }}>
                <Text variant="caption" headingLevel={3}>
                  {COPY.hemicycle.unseatedTitle}
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary, maxWidth: MEASURE }}>
                  {COPY.hemicycle.unseatedNote}
                </Text>
                {hemicycle.unseatedLines.map((line) => (
                  <Text key={line} style={{ fontSize: 15 }}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Section>

      {hemicycle.status === 'ready' ? (
        <Section title={COPY.deputies.title}>
          <DeputySearch view={hemicycle} order={order} />
        </Section>
      ) : null}

      <Accordion title={COPY.details.title} headingLevel={2}>
        <View style={{ gap: effects.spacing.sm }}>
          {page.details.map((fact) => (
            <View key={fact.id} style={{ gap: 1 }}>
              <Text variant="label">{fact.label}</Text>
              {fact.values.map((value) => (
                <Text
                  key={value}
                  plainDigits
                  style={{ fontSize: 16, lineHeight: 23, color: colors.text.primary }}
                >
                  {value}
                </Text>
              ))}
            </View>
          ))}
          {page.glossary.map((line) => (
            <Text
              key={line}
              style={{
                fontSize: 14,
                lineHeight: 21,
                color: colors.text.secondary,
                maxWidth: MEASURE,
              }}
            >
              {line}
            </Text>
          ))}
        </View>
      </Accordion>

      {page.autresVotes.length ? (
        <Section title={COPY.others.title}>
          <Text style={{ fontSize: 15, color: colors.text.secondary, maxWidth: MEASURE }}>
            {COPY.others.lead}
          </Text>
          <View style={card}>
            {page.autresVotes.map((other, index) => (
              <Link key={other.numero} href={other.href as never} asChild>
                <Pressable
                  large
                  accessibilityRole="link"
                  style={{
                    gap: 3,
                    padding: effects.spacing.sm,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderColor: colors.surface.border.primary,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.text.secondary }}>
                    {`${other.date} · ${other.categorie} · ${other.resultat}`}
                  </Text>
                  <Text style={{ fontSize: 15, lineHeight: 22 }}>{other.titre}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
          {page.dossierUrl ? (
            <TextLink href={page.dossierUrl}>{COPY.others.dossier}</TextLink>
          ) : null}
        </Section>
      ) : null}

      {page.citations.length ? (
        <Section title={COPY.cited.title}>
          <Text style={{ fontSize: 15, color: colors.text.secondary }}>{COPY.cited.note}</Text>
          {page.citations.map((citation) => (
            <TextLink key={citation.href} href={citation.href} standalone>
              {citation.label}
            </TextLink>
          ))}
        </Section>
      ) : null}

      {page.article493 ? <Article493Note note={page.article493} /> : null}
      {page.motionsDeCensure.length ? (
        <View style={{ gap: effects.spacing.xs }}>
          <Text variant="label">{COPY.notes.budgetMotions}</Text>
          {page.motionsDeCensure.map((motion) => (
            <TextLink key={motion.numero} href={motion.href} standalone>
              {motion.label}
            </TextLink>
          ))}
        </View>
      ) : null}

      <Section title={COPY.source.title}>
        <TextLink href={page.sourceUrl} standalone>
          {COPY.source.official}
        </TextLink>
        <DataSourceNote source={page.source} />
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          {COPY.source.licenceLine(page.source.licence)}
        </Text>
        <TextLink href="/methodologie#votes-assemblee" standalone>
          {COPY.list.methodLink}
        </TextLink>
      </Section>
    </Page>
  );
}
