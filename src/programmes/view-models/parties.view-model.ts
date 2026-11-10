import { createSelector } from 'reselect';

import { labelLines, labelsInline } from '@/src/programmes/models/etiquettes.service';
import {
  candidatesEntry,
  OTHER_PARTIES_NOTE,
  otherPartyCards,
} from '@/src/programmes/models/other-parties.service';
import { selectCatalog, selectCatalogStatus } from '@/src/programmes/store/programmes.selector';

export const partiesViewModel = () =>
  createSelector([selectCatalog, selectCatalogStatus], (catalog, status) => ({
    status,
    // Ordre alphabétique : aucune hiérarchie implicite entre les partis.
    parties: [...(catalog?.parties ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    /** Les deux classements, en une ligne courte, pour chaque parti (même forme pour les dix). */
    labelsInlineByParty: Object.fromEntries(
      (catalog?.parties ?? []).map((party) => [
        party.id,
        labelsInline(labelLines(catalog?.etiquettes.parties.find((e) => e.id === party.id))),
      ])
    ),
    // Les neuf grands débats : leurs adresses `/debats/[id]` ne changent pas.
    debates: (catalog?.themes ?? []).map((theme) => ({
      id: theme.id,
      title: theme.title,
      icon: theme.icon,
      href: `/debats/${theme.id}`,
    })),
    /** Accès à la liste complète des candidats (le nombre est calculé). */
    candidatesEntry: catalog ? candidatesEntry(catalog) : null,
    /** Partis sans fiche qui présentent un candidat : cartes courtes, ordre alphabétique. */
    otherParties: catalog ? otherPartyCards(catalog) : [],
    otherPartiesNote: OTHER_PARTIES_NOTE,
    /** Sans paire choisie : les deux sélecteurs s'ouvrent vides. */
    compareHref: '/partis/comparer',
  }));
