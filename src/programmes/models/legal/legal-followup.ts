import { addDays, daysBetween, endOfPeriod } from '@/src/programmes/models/legal/legal-dates';
import { NON_FINAL_STATUSES } from '@/src/programmes/models/legal/legal-vocabulary';
import type {
  IsoDay,
  IsoPartialDate,
  LegalDossier,
} from '@/src/programmes/models/legal/legal.model';
import { formatLongDate } from '@/src/programmes/models/seo/dates';

/** Au-delà de ce délai après l'échéance, les tests et le build échouent (D-A7). */
export const NEXT_STEP_GRACE_DAYS = 10;
/** Une entrée non définitive non vérifiée depuis plus de 90 jours est à revérifier. */
export const STALE_AFTER_DAYS = 90;

/** Fin de la période : '2027-04' → '2027-04-30' ; '2027' → '2027-12-31'. */
export const expectedDeadline = (expected: IsoPartialDate): IsoDay => endOfPeriod(expected);

export type FollowUp = {
  partyId: string;
  entryId: string;
  heading: string;
  kind: 'a-venir' | 'depassee' | 'a-reverifier';
  date: IsoDay;
  detail: string;
};

export function followUps(dossiers: LegalDossier[], today: IsoDay, horizonDays = 30): FollowUp[] {
  const items: FollowUp[] = [];
  for (const dossier of dossiers) {
    for (const entry of dossier.entries) {
      const base = {
        partyId: dossier.partyId,
        entryId: entry.id,
        heading: `${entry.person.name} · ${entry.caseName}`,
      };
      if (entry.nextStep) {
        const deadline = expectedDeadline(entry.nextStep.expected);
        const days = daysBetween(today, deadline);
        if (days < -NEXT_STEP_GRACE_DAYS) {
          items.push({
            ...base,
            kind: 'depassee',
            date: deadline,
            detail: `échéance « ${entry.nextStep.label} » dépassée de ${-days} jours : mettre l'entrée à jour`,
          });
        } else if (days <= horizonDays) {
          items.push({
            ...base,
            kind: 'a-venir',
            date: deadline,
            detail:
              days >= 0
                ? `« ${entry.nextStep.label} » attendue d'ici le ${formatLongDate(deadline)}`
                : `« ${entry.nextStep.label} » : échéance passée, à mettre à jour avant le ${formatLongDate(addDays(deadline, NEXT_STEP_GRACE_DAYS))}`,
          });
        }
      }
      if (
        NON_FINAL_STATUSES.has(entry.status) &&
        daysBetween(entry.lastVerified, today) > STALE_AFTER_DAYS
      ) {
        items.push({
          ...base,
          kind: 'a-reverifier',
          date: entry.lastVerified,
          detail: `procédure non définitive, dernière vérification le ${formatLongDate(entry.lastVerified)}`,
        });
      }
    }
  }
  return items.sort((a, b) => a.date.localeCompare(b.date) || a.entryId.localeCompare(b.entryId));
}

const KIND_TITLE: Record<FollowUp['kind'], string> = {
  depassee: 'Échéances dépassées (bloquant)',
  'a-venir': 'Échéances à venir',
  'a-reverifier': 'Entrées à revérifier',
};

/** Bloc Markdown à insérer dans docs/a-verifier.md. */
export function renderFollowUpBlock(items: FollowUp[], today: IsoDay): string {
  const lines = [`### Procédures judiciaires : échéances (état au ${formatLongDate(today)})`, ''];
  if (!items.length) return [...lines, 'Aucune échéance ni entrée à revérifier.'].join('\n');
  for (const kind of ['depassee', 'a-venir', 'a-reverifier'] as const) {
    const group = items.filter((i) => i.kind === kind);
    if (!group.length) continue;
    lines.push(`**${KIND_TITLE[kind]}**`, '');
    for (const i of group)
      lines.push(`- ${i.partyId} · ${i.heading} (\`${i.entryId}\`) : ${i.detail}`);
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

const START = '<!-- echeances:start -->';
const END = '<!-- echeances:end -->';

/** Remplace le contenu entre les marqueurs ; les ajoute à la fin du document s'ils manquent. */
export function replaceMarkedBlock(doc: string, block: string): string {
  const start = doc.indexOf(START);
  const end = doc.indexOf(END);
  if (start >= 0 && end > start) {
    return `${doc.slice(0, start + START.length)}\n${block}\n${doc.slice(end)}`;
  }
  return `${doc.trimEnd()}\n\n${START}\n${block}\n${END}\n`;
}
