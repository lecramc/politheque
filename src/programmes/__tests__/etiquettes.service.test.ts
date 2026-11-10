import {
  circularLine,
  etiquetteDetail,
  labelLines,
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
    expect(NO_CLASSIFICATION).toBe('pas de classement du parti');
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
