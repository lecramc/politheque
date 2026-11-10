import { t } from '@/src/assemblee/i18n/translate';
import type {
  ScrutinCategory,
  ScrutinSummary,
  ScrutinType,
} from '@/src/assemblee/models/scrutin.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

export const categoryLabel = (category: ScrutinCategory): string => t(`category.${category}`);

export const voteTypeLabel = (type: ScrutinType): string => t(`voteType.${type}`);

/** Titre officiel : seule la première lettre est mise en capitale, jamais réécrit ni résumé. */
export const capitalizeTitle = (title: string): string =>
  title.charAt(0).toLocaleUpperCase('fr') + title.slice(1);

/** « Adopté » / « Rejeté » ; au féminin pour une motion. */
export const resultLabel = (scrutin: Pick<ScrutinSummary, 'adopte' | 'type'>): string => {
  const feminine = scrutin.type === 'MOC';
  const key = scrutin.adopte ? (feminine ? 'adoptee' : 'adopte') : feminine ? 'rejetee' : 'rejete';
  return t(`result.${key}`);
};

export const scrutinHeading = (scrutin: Pick<ScrutinSummary, 'numero' | 'date'>): string =>
  t('scrutin.pageTitle', { numero: scrutin.numero, date: formatLongDate(scrutin.date) });

/** Décompte d'une ligne de liste. Censure : l'Assemblée ne recense que les voix pour. */
export const countsLabel = (scrutin: ScrutinSummary): string => {
  const { pour, contre, abstentions, requis } = scrutin.synthese;
  return scrutin.type === 'MOC'
    ? t('list.countsCensure', { count: pour, requis })
    : t('list.counts', {
        pour,
        contre,
        abstentions: t('list.abstentions', { count: abstentions }),
      });
};

/** La source sépare plusieurs demandeurs par des retours à la ligne. */
export const requesters = (demandeur: string | null): string[] =>
  (demandeur ?? '')
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
