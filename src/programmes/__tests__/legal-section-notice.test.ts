import { LEGAL_DOSSIERS } from '@/src/programmes/data/affaires';
import { PARTIES } from '@/src/programmes/data/parties';
import { presentDossier } from '@/src/programmes/models/legal/legal-presentation';
import {
  LEGAL_SECTION_INCOMPLETE,
  LEGAL_SECTION_NOTICE,
} from '@/src/programmes/models/legal/legal-section-notice';

const EXPECTED =
  "Section en cours de constitution : des procédures, notamment anciennes, sont en cours de vérification juridique et ne figurent pas encore ici. Cette liste n'est donc pas complète et ne permet pas de comparer les partis entre eux.";

describe('Feature: avertissement de la section Procédures', () => {
  it('should use the exact editorial wording', () => {
    expect(LEGAL_SECTION_NOTICE).toBe(EXPECTED);
  });

  it('should be switched by a single flag', () => {
    expect(LEGAL_SECTION_INCOMPLETE).toBe(true);
  });

  it('should show the identical notice for the ten parties, empty dossier included', () => {
    expect(LEGAL_DOSSIERS).toHaveLength(PARTIES.length);
    const notices = LEGAL_DOSSIERS.map((d) => presentDossier(d).notice);
    expect(notices).toHaveLength(10);
    expect(new Set(notices)).toEqual(new Set([EXPECTED]));
  });
});
