import { createSelector } from 'reselect';

import { chipLabel, daysUntil, nextRound } from '@/src/programmes/models/election.service';
import { selectFeaturedElection } from '@/src/programmes/store/programmes.selector';

/**
 * Pastille « 2027 · J-161 » de l'en-tête, vers la page de l'élection mise en avant. « J-n » dépend du
 * jour : calculé seulement après l'hydratation (`hydrated`), sinon le client rejouerait un texte
 * différent du HTML statique.
 */
export const electionChipViewModel = (hydrated: boolean, now: Date = new Date()) =>
  createSelector([selectFeaturedElection], (election) => {
    if (!election) return null;
    const round = hydrated ? nextRound(election, now) : null;
    return {
      href: `/elections/${election.id}`,
      label: chipLabel(election, round ? daysUntil(round.date, now) : null),
      accessibilityLabel: round
        ? `${election.title} : ${daysUntil(round.date, now)} jours avant le ${round.label}`
        : election.title,
    };
  });
