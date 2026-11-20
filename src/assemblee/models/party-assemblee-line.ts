import type { PartyAssembleePanel } from '@/src/assemblee/models/party-assemblee';

export type PartyAssembleeLine = {
  /** Couleur officielle du groupe ; null sans groupe. */
  color: string | null;
  lead: string;
  link: { label: string; href: string } | null;
};

/** Ligne d'en-tête de fiche parti, même forme pour les dix : le groupe et le lien vers ses votes. */
export const partyAssembleeLine = (panel: PartyAssembleePanel): PartyAssembleeLine =>
  panel.kind === 'group'
    ? {
        color: panel.color,
        lead: `${panel.title} : groupe ${panel.name} · ${panel.count}`,
        link: { label: 'voir ses votes', href: panel.all.href },
      }
    : { color: null, lead: "Pas de groupe à l'Assemblée", link: null };
