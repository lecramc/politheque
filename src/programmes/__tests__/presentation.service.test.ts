import guide from '@/src/programmes/data/guide.json';
import { JOURNEY_GUIDE_IDS } from '@/src/programmes/models/journey.model';
import {
  afterFirstSentence,
  beforeParenthesis,
  displayName,
  firstSentence,
  GUIDE_GROUPS,
  leanText,
  placementSummary,
  readingMinutes,
  stepLabel,
} from '@/src/programmes/models/presentation.service';

describe('Feature: formes courtes', () => {
  it('should keep only the first sentence', () => {
    expect(firstSentence('Le parti est fondé en 1972. Il change de nom en 2018.')).toBe(
      'Le parti est fondé en 1972.'
    );
  });

  it('should not cut on abbreviations followed by a lowercase word', () => {
    expect(firstSentence('Environ 6 M. de personnes. Suite.')).toBe('Environ 6 M. de personnes.');
  });

  it('should return what follows the first sentence', () => {
    expect(afterFirstSentence('Première. Deuxième. Troisième.')).toBe('Deuxième. Troisième.');
  });

  it('should drop the parenthesised detail of a label', () => {
    expect(beforeParenthesis('Extrême droite (qualification de la presse)')).toBe('Extrême droite');
  });

  it('should estimate at least one minute of reading', () => {
    expect(readingMinutes(['court'])).toBe(1);
    expect(readingMinutes([Array(600).fill('mot').join(' ')])).toBe(3);
  });

  it('should place every guide section in exactly one group', () => {
    const grouped = GUIDE_GROUPS.flatMap((g) => g.sectionIds).sort();
    expect(grouped).toEqual(guide.map((s) => s.id).sort());
  });

  it('should group the guide like the citizen journey (one taxonomy)', () => {
    expect(GUIDE_GROUPS.map((g) => [g.title, g.sectionIds])).toEqual([
      ['Les bases', JOURNEY_GUIDE_IDS['les-bases']],
      ['Les institutions', JOURNEY_GUIDE_IDS['les-institutions']],
      ['La présidentielle 2027', JOURNEY_GUIDE_IDS['presidentielle-2027']],
    ]);
  });
});

describe('Feature: nom affiché des partis', () => {
  it('should spell out the three-letter codes', () => {
    expect(displayName({ id: 'horizons', shortName: 'HOR' })).toBe('Horizons');
    expect(displayName({ id: 'ps-place-publique', shortName: 'PS-PP' })).toBe(
      'PS – Place publique'
    );
  });

  it('should fall back to the short name', () => {
    expect(displayName({ id: 'inconnu', shortName: 'XY' })).toBe('XY');
  });
});

describe('Feature: libellé du calendrier', () => {
  it('should keep the title and flag a computed date', () => {
    expect(
      stepLabel('Dépôt des parrainages (6e vendredi — date calculée, à confirmer par le décret)')
    ).toEqual({ title: 'Dépôt des parrainages', note: 'Date calculée, à confirmer' });
  });

  it('should have no note otherwise', () => {
    expect(stepLabel('Premier tour (détail)').note).toBeNull();
  });
});

describe('Feature: phrase décrivant la position sur un axe', () => {
  const axis = { negativePole: 'Pôle A', positivePole: 'Pôle B' };

  it('should say "au centre" for a centred position', () => {
    expect(leanText({ kind: 'placed', strength: 'centre', side: null }, axis)).toBe(
      "Au centre de l'axe"
    );
  });

  it('should name the pole, with the strength of the lean', () => {
    expect(leanText({ kind: 'placed', strength: 'plutot', side: 'negative' }, axis)).toBe(
      'Plutôt vers « Pôle A »'
    );
    expect(leanText({ kind: 'placed', strength: 'nettement', side: 'positive' }, axis)).toBe(
      'Nettement vers « Pôle B »'
    );
  });

  it('should explain how many positions are known when unplaced', () => {
    expect(leanText({ kind: 'unplaced', count: 3, minimum: 4 }, axis)).toBe(
      'Non placé : 3 positions connues, il en faut 4'
    );
    expect(leanText({ kind: 'unplaced', count: 1, minimum: 4 }, axis)).toBe(
      'Non placé : 1 position connue, il en faut 4'
    );
    expect(leanText({ kind: 'unplaced', count: 0, minimum: 4 }, axis)).toBe(
      'Non placé : aucune position connue'
    );
  });
});

describe('Feature: sous-titre de la carte de placement d’un parti', () => {
  it('should say how many axes the party is placed on and how many positions it has', () => {
    expect(placementSummary({ placedCount: 3, axisCount: 3, positionsCount: 21 })).toBe(
      'Placé sur 3 axes sur 3 · 21 positions'
    );
    expect(placementSummary({ placedCount: 1, axisCount: 3, positionsCount: 1 })).toBe(
      'Placé sur 1 axe sur 3 · 1 position'
    );
  });

  it('should say the party is not placed when no axis is placed', () => {
    expect(placementSummary({ placedCount: 0, axisCount: 3, positionsCount: 2 })).toBe(
      'Non placé : trop peu de positions connues'
    );
  });
});
