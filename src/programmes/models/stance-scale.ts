import type { Stance } from '@/src/programmes/models/programme.model';

/**
 * Grammaire visuelle unique « pour / contre », pour tout le site : positions des partis, votes de
 * l'Assemblée, légendes, méthodologie. Une valeur = une forme, une teinte, un mot.
 *
 * Forme (jamais la teinte seule) :
 * - `disc`            disque plein                      : Pour
 * - `disc-outline`    disque en contour                 : Plutôt pour
 * - `disc-slash`      disque barré, plein               : Contre
 * - `outline-slash`   disque barré, en contour          : Plutôt contre
 * - `outline-equal`   contour et signe « = »            : Mitigé (positions des partis)
 * - `ring`            anneau épais                      : Abstention (vote)
 * - `half`            demi-disque                       : Partagé (groupe divisé)
 * - `dashed`          contour pointillé                 : Pas de position claire / n'a pas voté
 *
 * Teinte (`colors.vote`, distincte des couleurs des groupes et des partis) :
 * pour = gris anthracite (quasi blanc en sombre), contre = ambre cerclé de sombre, milieu = gris.
 * Le « plutôt » ne change pas la teinte : il passe du plein au contour. Le milieu de l'échelle
 * n'est jamais fondu : Mitigé, Abstention et Partagé gardent chacun leur mot et leur forme.
 */
export type ScaleGlyph =
  | 'disc'
  | 'disc-outline'
  | 'disc-slash'
  | 'outline-slash'
  | 'outline-equal'
  | 'ring'
  | 'half'
  | 'dashed';

export type ScaleValue =
  | 'pour'
  | 'plutotPour'
  | 'mitige'
  | 'plutotContre'
  | 'contre'
  | 'abstention'
  | 'partage'
  | 'absent'
  | 'inconnu';

export type ScaleTone = 'pour' | 'contre' | 'neutre';

export type ScaleEntry = { glyph: ScaleGlyph; tone: ScaleTone; label: string };

/** Une entrée par valeur : forme, famille de teinte et mot exact. */
export const STANCE_SCALE_ENTRIES: Record<ScaleValue, ScaleEntry> = {
  pour: { glyph: 'disc', tone: 'pour', label: 'Pour' },
  plutotPour: { glyph: 'disc-outline', tone: 'pour', label: 'Plutôt pour' },
  mitige: { glyph: 'outline-equal', tone: 'neutre', label: 'Mitigé' },
  plutotContre: { glyph: 'outline-slash', tone: 'contre', label: 'Plutôt contre' },
  contre: { glyph: 'disc-slash', tone: 'contre', label: 'Contre' },
  abstention: { glyph: 'ring', tone: 'neutre', label: 'Abstention' },
  partage: { glyph: 'half', tone: 'neutre', label: 'Partagé' },
  absent: { glyph: 'dashed', tone: 'neutre', label: 'Absent' },
  inconnu: { glyph: 'dashed', tone: 'neutre', label: 'Pas de position claire' },
};

const BY_STANCE: Record<string, ScaleValue> = {
  '2': 'pour',
  '1': 'plutotPour',
  '0': 'mitige',
  '-1': 'plutotContre',
  '-2': 'contre',
  null: 'inconnu',
};

/** Valeur de l'échelle d'une position de parti (`null` : pas de position claire). */
export const scaleValueOfStance = (stance: Stance | null): ScaleValue => BY_STANCE[String(stance)];

/** Ordre de lecture : du pour au contre, le « pas de position claire » en dernier. */
const GROUP_ORDER: (Stance | null)[] = [2, 1, 0, -1, -2, null];

export type StanceGroup<T> = {
  stance: Stance | null;
  label: string;
  glyph: ScaleGlyph;
  items: T[];
};

/**
 * Regroupe des positions de partis par réponse, dans l'ordre de l'échelle ; les partis restent
 * en ordre alphabétique dans chaque groupe. Les réponses sans parti sont omises. Aucun décompte.
 */
export const groupByStance = <
  T extends { party: { name: string }; stance: { stance: Stance | null } | null },
>(
  positions: T[]
): StanceGroup<T>[] =>
  GROUP_ORDER.map((stance) => {
    const entry = STANCE_SCALE_ENTRIES[scaleValueOfStance(stance)];
    return {
      stance,
      label: entry.label,
      glyph: entry.glyph,
      items: positions
        .filter((p) => (p.stance?.stance ?? null) === stance)
        .sort((a, b) => a.party.name.localeCompare(b.party.name, 'fr')),
    };
  }).filter((group) => group.items.length > 0);

/** Forme d'une position de parti. */
export const glyphOfStance = (stance: Stance | null): ScaleGlyph =>
  STANCE_SCALE_ENTRIES[scaleValueOfStance(stance)].glyph;

/** Famille de teinte d'une position de parti. */
export const toneOfStance = (stance: Stance | null): ScaleTone =>
  STANCE_SCALE_ENTRIES[scaleValueOfStance(stance)].tone;
