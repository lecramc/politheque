import {
  circularLine,
  etiquetteDetail,
  labelLines,
  labelsInline,
  LABELS_LINK,
  LABELS_SHEET_TITLE,
  NO_CLASSIFICATION,
  usedByText,
} from '@/src/programmes/models/etiquettes.service';
import type {
  EtiquettesFile,
  PartyEtiquettes,
  Source,
} from '@/src/programmes/models/programme.model';

const source = (kind: Source['kind'], url = `https://example.org/${kind}`): Source => ({
  title: `Source ${kind}`,
  url,
  date: '2026-02-02',
  kind,
});

const entry = (overrides: Partial<PartyEtiquettes> = {}): PartyEtiquettes => ({
  id: 'p',
  name: 'Parti',
  ministry: {
    bloc: 'Gauche',
    nuance: 'SOC',
    note: 'Nuance propre.',
    sources: [source('statistique')],
  },
  ministryNullReason: null,
  press: { label: 'Gauche', note: 'Presse.', scholars: [], sources: [source('presse')] },
  pressNullReason: null,
  ...overrides,
});

const circular: EtiquettesFile['circular'] = {
  title: "Circulaire relative à l'attribution des nuances",
  nor: 'INTP2602966C',
  date: '2026-02-02',
  url: 'https://www.legifrance.gouv.fr/circulaire/id/45645',
};

describe("Feature: les deux lignes d'étiquettes sous le nom du parti", () => {
  it('should always give two lines, even when both classifications say the same thing', () => {
    expect(labelLines(entry())).toEqual([
      { id: 'ministere', title: "Ministère de l'Intérieur", value: 'Gauche' },
      { id: 'presse', title: 'Presse et politistes', value: 'Gauche' },
    ]);
  });

  it('should say there is no classification of the party when a classification is null', () => {
    const lines = labelLines(entry({ ministry: null, press: null }));
    expect(lines.map((l) => l.value)).toEqual([NO_CLASSIFICATION, NO_CLASSIFICATION]);
    expect(NO_CLASSIFICATION).toBe('non classé');
  });

  it('should keep the same two lines for a party without any entry', () => {
    expect(labelLines(undefined).map((l) => l.id)).toEqual(['ministere', 'presse']);
  });
});

describe("Feature: qui emploie l'étiquette", () => {
  it('should say the press alone when no scholar nor reference work uses it', () => {
    expect(usedByText(entry().press!)).toBe('la presse seule');
  });

  it('should name the scholars and mention reference works when they use it', () => {
    const press = {
      label: 'Gauche radicale',
      note: '',
      scholars: ['Gilles Finchelstein', 'Manuel Cervera-Marzal'],
      sources: [source('politiste'), source('encyclopedie'), source('presse')],
    };
    expect(usedByText(press)).toBe(
      'la presse, des encyclopédies et des politistes ou analystes (Gilles Finchelstein, Manuel Cervera-Marzal)'
    );
  });
});

describe('Feature: détail des étiquettes', () => {
  it('should date the circular and give its reference', () => {
    expect(circularLine(circular)).toBe('Circulaire du 2 février 2026 (NOR INTP2602966C)');
  });

  it("should list the Conseil d'État decisions found in the ministry sources", () => {
    const decision = source('justice', 'https://www.conseil-etat.fr/decision');
    const detail = etiquetteDetail(
      entry({
        ministry: {
          bloc: 'Extrême gauche',
          nuance: 'FI',
          note: '',
          sources: [source('statistique'), decision],
        },
      }),
      circular
    );
    expect(detail.ministry.councilOfState).toEqual([
      { ...decision, label: `${decision.title} (2 février 2026)` },
    ]);
  });

  it('should explain why a classification is missing instead of leaving it empty', () => {
    const detail = etiquetteDetail(
      entry({
        ministry: null,
        ministryNullReason: 'Parti non nommé.',
        press: null,
        pressNullReason: 'Aucun classement établi.',
      }),
      circular
    );
    expect(detail.ministry.nullReason).toBe('Parti non nommé.');
    expect(detail.press.nullReason).toBe('Aucun classement établi.');
  });

  it('should gather every source once, whichever block cites it', () => {
    const shared = source('presse', 'https://example.org/shared');
    const detail = etiquetteDetail(
      entry({
        ministry: { bloc: 'Gauche', nuance: 'SOC', note: '', sources: [shared] },
        press: {
          label: 'Gauche',
          note: '',
          scholars: [],
          sources: [shared, source('presse', 'https://example.org/other')],
        },
        party: { text: 'Le parti dit…', sources: [source('declaration')] },
      }),
      circular
    );
    expect(detail.sources.map((s) => s.url)).toEqual([
      'https://example.org/shared',
      'https://example.org/other',
      'https://example.org/declaration',
    ]);
  });
});

describe("Feature: phrase en clair en tête de la feuille d'étiquettes", () => {
  const summaryOf = (e: PartyEtiquettes) => etiquetteDetail(e, circular).summary;

  it('should say in plain words how the ministry and the press classify the party', () => {
    expect(
      summaryOf(
        entry({
          ministry: { bloc: 'Extrême gauche', nuance: 'FI', note: '', sources: [] },
          press: {
            label: 'Gauche radicale',
            note: '',
            scholars: ['Gilles Finchelstein'],
            sources: [],
          },
        })
      )
    ).toBe(
      "Le ministère de l'Intérieur classe ce parti à l'extrême gauche (circulaire de 2026). La presse et les politistes emploient « gauche radicale »."
    );
  });

  it('should name the press alone when no political scientist uses the label', () => {
    expect(summaryOf(entry())).toBe(
      "Le ministère de l'Intérieur classe ce parti à gauche (circulaire de 2026). La presse emploie « gauche »."
    );
  });

  it('should say a classification is missing instead of omitting its sentence', () => {
    expect(summaryOf(entry({ ministry: null, press: null }))).toBe(
      "Le ministère de l'Intérieur ne classe pas ce parti. Ni la presse ni les politistes n'emploient de classement établi pour ce parti."
    );
  });

  it('should name a bloc that has no plain phrase between quotes', () => {
    const divers = entry({ ministry: { bloc: 'Divers', nuance: 'DIV', note: '', sources: [] } });
    expect(summaryOf(divers)).toContain(
      'classe ce parti dans le bloc « Divers » (circulaire de 2026).'
    );
  });
});

describe('Feature: classements dans les listes et libellés de la feuille', () => {
  it('should give one short line with both classifications, even when they agree', () => {
    expect(labelsInline(labelLines(entry()))).toBe(
      'Ministère : Gauche · Presse et politistes : Gauche'
    );
  });

  it('should keep the same short line for a party that is not classified', () => {
    expect(labelsInline(labelLines(undefined))).toBe(
      'Ministère : non classé · Presse et politistes : non classé'
    );
  });

  it('should word the link and the sheet title as questions about where the classifications come from', () => {
    expect(LABELS_LINK).toBe("D'où vient ce classement ?");
    expect(LABELS_SHEET_TITLE).toBe("D'où viennent ces classements ?");
  });
});
