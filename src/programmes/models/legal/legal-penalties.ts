import type { Penalty } from '@/src/programmes/models/legal/legal.model';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** 60 → « 5 ans » ; 18 → « 18 mois » ; 30 → « 2 ans et 6 mois » ; 12 → « 1 an ». */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  // Les décisions disent « 18 mois » mais « 2 ans et 6 mois » : en mois sous deux ans.
  if (months < 24 && rest !== 0) return `${months} mois`;
  if (rest === 0) return plural(years, 'an', 'ans');
  return `${plural(years, 'an', 'ans')} et ${rest} mois`;
}

/** 100000 → « 100 000 € ». */
export const formatEuros = (euros: number) =>
  `${String(euros).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} €`;

/** Texte uniforme d'une peine ; l'inéligibilité s'écrit toujours « peine d'inéligibilité ». */
export function formatPenalty(p: Penalty): string {
  switch (p.kind) {
    case 'prison': {
      const base = `${formatDuration(p.months)} d'emprisonnement`;
      const sursis =
        p.suspendedMonths === 0
          ? ''
          : p.suspendedMonths === p.months
            ? ' avec sursis'
            : ` dont ${formatDuration(p.suspendedMonths)} avec sursis`;
      return `${base}${sursis}${p.arrangement ? ` (${p.arrangement})` : ''}`;
    }
    case 'amende':
      return `${formatEuros(p.euros)} d'amende${
        p.suspendedEuros ? ` dont ${formatEuros(p.suspendedEuros)} avec sursis` : ''
      }`;
    case 'ineligibilite':
      return `peine d'inéligibilité de ${formatDuration(p.months)}${
        p.provisionalExecution ? ' avec exécution provisoire' : ''
      }`;
    case 'autre':
      return p.label;
  }
}
