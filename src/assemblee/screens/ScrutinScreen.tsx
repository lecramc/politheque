import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from '@/components/ThemeContext';
import { Icon, Text } from '@/components/Themed';
import { Pressable } from '@/components/ui/Pressable';
import { TextLink } from '@/components/ui/TextLink';
import { Article493Note } from '@/src/assemblee/components/Article493Note';
import { DataSourceNote } from '@/src/assemblee/components/DataSourceNote';
import { DeputyVotesTable } from '@/src/assemblee/components/DeputyVotesTable';
import { GroupVotesTable } from '@/src/assemblee/components/GroupVotesTable';
import { Hemicycle } from '@/src/assemblee/components/Hemicycle';
import { HemicycleLegend } from '@/src/assemblee/components/HemicycleLegend';
import { t } from '@/src/assemblee/i18n/translate';
import { positionLabel } from '@/src/assemblee/models/deputy-table';
import type { GroupeOrder } from '@/src/assemblee/models/groupe-order';
import { HEMICYCLE_RATIO } from '@/src/assemblee/models/hemicycle-scene';
import { scrutinViewModel } from '@/src/assemblee/view-models/scrutin.view-model';
import { useViewModel } from '@/src/core/hooks/useViewModel';
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

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 1 }}>
      <Text variant="label">{label}</Text>
      {typeof children === 'string' ? (
        <Text style={{ fontSize: 16, lineHeight: 23, color: colors.text.primary }}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

/**
 * Emplacement du schéma, aux dimensions exactes de l'hémicycle : le pré-rendu et le premier rendu
 * client sont identiques, et la mise en page ne bouge pas quand le détail arrive.
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
  return (
    <View
      style={{
        width: '100%',
        aspectRatio: HEMICYCLE_RATIO,
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
          {t('hemicycle.loading')}
        </Text>
      ) : (
        <>
          <Text role="alert" style={{ fontSize: 15, textAlign: 'center' }}>
            {t('hemicycle.error')}
          </Text>
          <TextLink href={officialUrl}>{t('hemicycle.errorLink')}</TextLink>
          <Pressable
            onPress={onRetry}
            accessibilityRole="button"
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: colors.tint, textDecorationLine: 'underline' }}>
              {t('hemicycle.retry')}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

/** `/assemblee/scrutins/[numero]` : un scrutin, son résultat, le vote de chaque groupe et de chaque député. */
export default function ScrutinScreen() {
  const { numero: raw } = useLocalSearchParams<{ numero: string }>();
  const numero = Number(raw);
  const vm = useViewModel(scrutinViewModel);
  const page = vm.scrutin(numero);
  const { colors, effects, fonts } = useTheme();
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
        title={t('list.title')}
        back={{ label: t('common.backToList'), href: '/assemblee' }}
      >
        <TextLink href="/assemblee" standalone>
          {t('common.backToList')}
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
      back={{ label: t('common.backToList'), href: '/assemblee' }}
    >
      <View style={{ gap: effects.spacing.xs }}>
        <Text variant="caption">{page.heading}</Text>
        <Text variant="title" style={{ fontSize: 24, lineHeight: 31 }}>
          {page.titre}
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          {t('common.officialTitleNote')}
        </Text>
      </View>

      <View style={{ gap: effects.spacing.sm }}>
        <Fact label={t('scrutin.date')}>{page.date}</Fact>
        <Fact label={t('scrutin.category')}>{page.categorie}</Fact>
        <Fact label={t('scrutin.type')}>{page.type}</Fact>
        {page.demandeurs.length ? (
          <Fact label={t('scrutin.requestedBy')}>
            <View style={{ gap: 2 }}>
              {page.demandeurs.map((demandeur) => (
                <Text key={demandeur} style={{ fontSize: 16, lineHeight: 23 }}>
                  {demandeur}
                </Text>
              ))}
            </View>
          </Fact>
        ) : null}
      </View>

      <Section title={t('scrutin.resultTitle')}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: effects.spacing.xs }}>
          <Icon
            name={page.adopte ? 'checkmark-circle-outline' : 'close-circle-outline'}
            variant="secondary"
            size="medium"
          />
          <Text style={{ ...fonts.bold, fontSize: 18, lineHeight: 26, flex: 1, maxWidth: MEASURE }}>
            {page.resultat}
          </Text>
        </View>
        {page.censure ? (
          <Text
            style={{
              fontSize: 15,
              lineHeight: 23,
              color: colors.text.secondary,
              maxWidth: MEASURE,
            }}
          >
            {t('scrutin.censureNote')}
          </Text>
        ) : null}
        {page.article493 ? <Article493Note note={page.article493} /> : null}
        {page.motionsDeCensure.length ? (
          <View style={{ gap: effects.spacing.xs }}>
            <Text variant="label">{t('notes.budgetMotions')}</Text>
            {page.motionsDeCensure.map((motion) => (
              <TextLink key={motion.numero} href={motion.href} standalone>
                {motion.label}
              </TextLink>
            ))}
          </View>
        ) : null}
        <View
          role="group"
          aria-label={t('scrutin.synthesisTitle')}
          style={[
            card,
            {
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: effects.spacing.sm,
              gap: effects.spacing.md,
            },
          ]}
        >
          {page.synthese.map((item) => (
            <View key={item.id} style={{ minWidth: 96, gap: 1 }}>
              <Text plainDigits style={{ ...fonts.bold, fontSize: 22, lineHeight: 28 }}>
                {item.value}
              </Text>
              <Text variant="label">{item.label}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t('groups.title')}>
        <GroupVotesTable
          table={page.groups(order)}
          order={order}
          onOrderChange={setOrder}
          highlight={highlight}
          onSelect={setHighlight}
          interactive={hemicycle.status === 'ready'}
        />
      </Section>

      <Section title={t('hemicycle.title')}>
        <Text
          style={{ fontSize: 15, lineHeight: 23, color: colors.text.secondary, maxWidth: MEASURE }}
        >
          {[
            page.delegations > 0
              ? t('hemicycle.delegationsCount', { count: page.delegations })
              : null,
            page.misesAuPoint > 0
              ? t('hemicycle.misesAuPointCount', { count: page.misesAuPoint })
              : null,
          ]
            .filter(Boolean)
            .join(' ')}
        </Text>
        {hemicycle.status === 'ready' ? (
          <>
            <Hemicycle view={hemicycle} highlight={highlight} onHighlight={setHighlight} />
            <HemicycleLegend censure={hemicycle.censure} />
            {highlighted ? (
              <View
                aria-live="polite"
                style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}
              >
                <Text style={{ fontSize: 14 }}>
                  {t('hemicycle.highlighted', {
                    groupe: `${highlighted.libelle} (${highlighted.abrev})`,
                  })}
                </Text>
                <Pressable
                  onPress={() => setHighlight(null)}
                  accessibilityRole="button"
                  style={{ minHeight: 44, justifyContent: 'center' }}
                >
                  <Text
                    style={{ color: colors.tint, textDecorationLine: 'underline', fontSize: 14 }}
                  >
                    {t('hemicycle.clearHighlight')}
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
          {t('hemicycle.mention')}
        </Text>
        {hemicycle.status === 'ready' ? (
          <>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 21,
                color: colors.text.secondary,
                maxWidth: MEASURE,
              }}
            >
              {t('hemicycle.hint')}
            </Text>
            {hemicycle.unseated.length ? (
              <View style={{ gap: effects.spacing.xs }}>
                <Text variant="caption" headingLevel={3}>
                  {t('hemicycle.unseatedTitle')}
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.secondary, maxWidth: MEASURE }}>
                  {t('hemicycle.unseatedNote')}
                </Text>
                {hemicycle.unseated.map((m) => (
                  <Text key={`${m.depute.id}-${m.vote}`} style={{ fontSize: 15 }}>
                    {`${m.depute.nom} (${m.groupe}) : ${positionLabel(m.vote, hemicycle.censure)}${m.delegation ? ` · ${t('vote.delegation')}` : ''}`}
                  </Text>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Section>

      {hemicycle.status === 'ready' ? (
        <Section title={t('deputies.title')}>
          <DeputyVotesTable view={hemicycle} order={order} />
        </Section>
      ) : null}

      {page.autresVotes.length ? (
        <Section title={t('others.title')}>
          <Text style={{ fontSize: 15, color: colors.text.secondary, maxWidth: MEASURE }}>
            {t('others.lead')}
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
            <TextLink href={page.dossierUrl}>{t('others.dossier')}</TextLink>
          ) : null}
        </Section>
      ) : null}

      {page.citations.length ? (
        <Section title={t('cited.title')}>
          <Text style={{ fontSize: 15, color: colors.text.secondary }}>{t('cited.note')}</Text>
          {page.citations.map((citation) => (
            <TextLink key={citation.href} href={citation.href} standalone>
              {citation.label}
            </TextLink>
          ))}
        </Section>
      ) : null}

      <Section title={t('source.title')}>
        <TextLink href={page.sourceUrl} standalone>
          {t('source.official')}
        </TextLink>
        <DataSourceNote source={page.source} />
        <Text style={{ fontSize: 14, color: colors.text.secondary }}>
          {t('source.licenceLine', { licence: page.source.licence })}
        </Text>
        <TextLink href="/methodologie#votes-assemblee" standalone>
          {t('list.methodLink')}
        </TextLink>
      </Section>
    </Page>
  );
}
