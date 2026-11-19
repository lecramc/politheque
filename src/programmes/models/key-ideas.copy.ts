import { KEY_IDEAS_COUNT } from '@/src/programmes/models/key-ideas.service';

/**
 * Phrase commune sous « Ce qu'il propose » quand un parti a moins de 4 idées recoupées ; rien à 4.
 * Même texte pour tous, seul le nombre change.
 */
export const keyIdeasNote = (count: number): string | null =>
  count >= KEY_IDEAS_COUNT
    ? null
    : `${count} idées clés recoupées par deux sources ; les autres propositions publiées figurent thème par thème ci-dessous.`;
