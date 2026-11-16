import { REPORT_ISSUES_URL, SITE_URL } from '@/src/core/config/app';
import { REPORT_COPY } from '@/src/programmes/models/report-error.copy';

export type ReportLinks = { mailto: string | null; github: string };

/**
 * Le titre est borné : le reste du corps est de longueur fixe, donc le mailto reste sous
 * `MAILTO_MAX_LENGTH` (1800), même avec des caractères accentués encodés sur 6 octets.
 */
const TITLE_MAX = 120;

const clamp = (text: string) =>
  text.length > TITLE_MAX ? `${text.slice(0, TITLE_MAX - 1)}…` : text;

/**
 * Liens de signalement d'une page. `null` hors pages de contenu indexables (questionnaire,
 * résultats, pages introuvables). Le corps ne contient que l'adresse, le titre et les rubriques.
 */
export function buildReportLinks({
  pathname,
  title,
  indexable,
  email,
}: {
  pathname: string;
  title: string;
  indexable: boolean;
  email: string | null;
}): ReportLinks | null {
  if (!indexable) return null;
  const shortTitle = clamp(title);
  const subject = encodeURIComponent(`${REPORT_COPY.subjectPrefix}${shortTitle}`);
  const body = encodeURIComponent(
    [
      `${REPORT_COPY.pageLine}${SITE_URL}${pathname}`,
      `${REPORT_COPY.titleLine}${shortTitle}`,
      '',
      REPORT_COPY.inexactField,
      '',
      REPORT_COPY.sourceField,
    ].join('\n')
  );
  return {
    mailto: email ? `mailto:${email}?subject=${subject}&body=${body}` : null,
    github: `${REPORT_ISSUES_URL}?title=${subject}&body=${body}`,
  };
}
