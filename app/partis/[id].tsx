import { PARTIES } from '@/src/programmes/data/parties';

export { default } from '@/src/programmes/screens/PartyScreen';

// Export statique : une page HTML par parti (référencement, partage de lien).
export function generateStaticParams() {
  return PARTIES.map((party) => ({ id: party.id }));
}
