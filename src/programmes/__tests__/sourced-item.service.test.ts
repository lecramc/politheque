import { describe, expect, it } from 'vitest';

import { bodyText } from '@/src/programmes/models/sourced-item.service';

describe("Feature: corps d'un élément titré", () => {
  it('should remove the title prefix and capitalize the rest', () => {
    expect(bodyText({ title: 'Gaullisme', text: 'Gaullisme : le parti se réclame…' })).toBe(
      'Le parti se réclame…'
    );
  });

  it('should treat non-breaking spaces as spaces', () => {
    expect(
      bodyText({ title: 'Rapport\u00a0au RN', text: 'Rapport au\u00a0RN\u202f: le parti…' })
    ).toBe('Le parti…');
  });

  it('should capitalize an accented first letter', () => {
    expect(
      bodyText({
        title: '« Dédiabolisation » et tournant social',
        text: '« Dédiabolisation » et tournant social : à partir de 2011…',
      })
    ).toBe('À partir de 2011…');
  });

  it('should keep the full text when it does not start with the title', () => {
    const text = 'Les encyclopédies le classent à droite : Universalis…';
    expect(bodyText({ title: 'Classement par les encyclopédies', text })).toBe(text);
  });
});
