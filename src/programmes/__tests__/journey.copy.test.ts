import {
  HOME_COPY,
  TASK_COPY,
  situerSubtitle,
  voterSubtitle,
} from '@/src/programmes/models/home.copy';
import { JOURNEY_COPY, summaryLabel } from '@/src/programmes/models/journey.copy';

describe('Feature: libellés de la progression et de l’accueil', () => {
  it('should summarise the stamps in plain words', () => {
    expect(summaryLabel(3, 6)).toBe('3 sur 6 étapes');
  });

  it('should send « Ma progression » back to Comprendre, where it is linked', () => {
    expect(JOURNEY_COPY.back).toBe('Comprendre');
    expect(JOURNEY_COPY.passportTitle).toBe('Ma progression');
  });

  it('should write the home task subtitles from real numbers and dates', () => {
    expect(situerSubtitle(31)).toBe("31 affirmations · 5 min · rien n'est envoyé");
    expect(voterSubtitle('18 avril', '12 mars')).toBe(
      "1er tour le 18 avril · s'inscrire avant le 12 mars"
    );
    expect(voterSubtitle('18 avril', null)).toBe('1er tour le 18 avril');
  });

  it('should never use guilt or score vocabulary in any label', () => {
    const forbidden = /raté|retard|score|niveau|points?\b|série|bravo|champion/i;
    const labels = [
      ...Object.values(JOURNEY_COPY),
      ...Object.values(HOME_COPY),
      ...Object.values(TASK_COPY).flatMap((task) => Object.values(task) as string[]),
      summaryLabel(0, 6),
      situerSubtitle(31),
      voterSubtitle('18 avril', '12 mars'),
    ];
    for (const label of labels) expect(label).not.toMatch(forbidden);
  });
});
