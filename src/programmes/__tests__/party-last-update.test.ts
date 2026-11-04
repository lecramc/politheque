import type { CorrectionEntry } from '@/src/programmes/models/corrections/corrections.model';
import { partyLastUpdate } from '@/src/programmes/models/corrections/party-last-update';

const entry = (
  date: string,
  pages: string[],
  kind: CorrectionEntry['kind'] = 'correction'
): CorrectionEntry => ({
  id: `${date}-${pages[0]}-${kind}`,
  date,
  kind,
  pages,
  summary: 'Résumé de la correction publiée au journal.',
});

describe('Feature: dernière mise à jour d’une fiche, dérivée du journal', () => {
  it('should be null when the journal does not touch the party', () => {
    expect(partyLastUpdate('rn', [entry('2026-11-04', ['/partis/lfi/histoire'])])).toBeNull();
    expect(partyLastUpdate('rn', [])).toBeNull();
  });

  it('should be the date of the latest entry touching any page of the party', () => {
    const journal = [
      entry('2026-11-05', ['/partis/lfi']),
      entry('2026-11-04', ['/partis/rn/histoire']),
      entry('2026-11-03', ['/partis/rn', '/partis/lfi']),
    ];
    expect(partyLastUpdate('rn', journal)).toBe('2026-11-04');
  });

  it('should not confuse a party with another whose id starts the same way', () => {
    expect(partyLastUpdate('ps', [entry('2026-11-04', ['/partis/ps-place-publique'])])).toBeNull();
    expect(
      partyLastUpdate('ps-place-publique', [
        entry('2026-11-04', ['/partis/ps-place-publique/positions']),
      ])
    ).toBe('2026-11-04');
  });

  it('should count every kind of entry, additions and removals included', () => {
    expect(partyLastUpdate('rn', [entry('2026-11-04', ['/partis/rn'], 'retrait')])).toBe(
      '2026-11-04'
    );
    expect(partyLastUpdate('rn', [entry('2026-11-04', ['/partis/rn'], 'ajout')])).toBe(
      '2026-11-04'
    );
  });

  it('should not depend on the order of the journal', () => {
    const journal = [entry('2026-11-03', ['/partis/rn']), entry('2026-11-06', ['/partis/rn'])];
    expect(partyLastUpdate('rn', journal)).toBe('2026-11-06');
  });
});
