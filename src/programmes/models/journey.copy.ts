import type { JourneyItemKind, JourneyStepId } from '@/src/programmes/models/journey.model';
import type { StepProgress } from '@/src/programmes/models/journey.service';

/**
 * Vocabulaire du parcours, centralisé et testé : aucun mot de culpabilité ni de score
 * (« raté », « retard », « score », « niveau », « points », « série », « bravo », « champion »).
 * Français codé en dur, comme le reste de `src/programmes/` (pas d'i18n pour l'instant).
 */
export const JOURNEY_COPY = {
  introKicker: 'Votre parcours citoyen',
  introTitle: 'Comprendre la politique française, une étape à la fois',
  introLead:
    'Six étapes dans un ordre conseillé. Vous pouvez aussi aller directement où vous voulez.',
  arrivalKicker: 'Arrivée',
  arrivalText: 'Vous êtes prêt·e à voter en connaissance de cause.',
  privacy: "Votre progression reste sur cet appareil. Rien n'est envoyé.",
  clear: 'Effacer',
  clearSheetTitle: 'Effacer votre progression sur cet appareil ?',
  clearSheetText: 'Les pages lues et les tampons seront remis à zéro.',
  clearConfirm: 'Effacer',
  clearCancel: 'Annuler',
  passportTitle: 'Mon passeport',
  passportKicker: 'PASSEPORT DU CITOYEN',
  passportHeading: 'Passeport du citoyen',
  passportFinishedHeading: 'Vous êtes prêt·e à voter en connaissance de cause',
  quizNote:
    'Le tampon « Me situer » indique que vous avez répondu au questionnaire, jamais ce que vous avez répondu.',
  whatNowTitle: 'Et maintenant ?',
  whatNowText: 'Vérifiez que vous êtes inscrit·e sur les listes électorales.',
  whatNowLabel: 'Comment voter',
  orderNote: 'Ordre alphabétique',
  back: 'Parcours',
  stepNotFound: 'Étape introuvable',
  continueLabel: 'Continuer',
  startLabel: 'Commencer',
} as const;

/** Bloc parcours en bas d'une fiche parti (mêmes mots pour les dix partis). */
export const PARTY_JOURNEY_COPY = {
  readTitle: 'Fiche lue.',
  unreadTitle: 'Pas encore lue.',
  stampRule: 'Le tampon se pose quand vous arrivez ici ou ouvrez « Positions ».',
  count: (read: number, total: number) =>
    `${read} ${read > 1 ? 'fiches lues' : 'fiche lue'} sur ${total}`,
  completed: (total: number, stepTitle: string) =>
    `Les ${total} fiches sont lues : l'étape « ${stepTitle} » est terminée.`,
  privacy: "Rien n'est envoyé : la progression reste sur cet appareil.",
  nextParty: (name: string) => `Fiche suivante (ordre alphabétique) : ${name}`,
} as const;

export const STEP_INTROS: Record<JourneyStepId, string> = {
  'les-bases':
    'Trois lectures pour poser les repères : gauche et droite, classement des partis, repérage de la désinformation.',
  'les-institutions':
    "Qui décide quoi : les institutions, les pouvoirs du président, l'Union européenne et le budget.",
  'les-partis':
    'Une fiche par parti : histoire, idées, positions. Le même format pour tous, classés par ordre alphabétique.',
  'les-grands-debats': 'Les grands sujets du débat public, présentés sans hiérarchie.',
  'presidentielle-2027': 'Le scrutin, les règles pour voter et les candidatures.',
  'me-situer': 'Un questionnaire pour situer vos idées, sans jamais enregistrer vos réponses.',
};

const NEW_WORD: Record<string, [string, string]> = {
  débat: ['nouveau', 'nouveaux'],
};
const newWord = (unit: string, count: number) =>
  (NEW_WORD[unit] ?? ['nouvelle', 'nouvelles'])[count > 1 ? 1 : 0];

const unitOf = (p: StepProgress, count: number) => (count > 1 ? p.step.unit.many : p.step.unit.one);

export function stepMeta(
  p: StepProgress,
  opts: { daysLeft?: number | null; questionCount?: number } = {}
): string {
  const { step, readCount, total } = p;
  let meta: string;
  if (step.id === 'me-situer') {
    meta =
      p.status === 'done'
        ? 'Questionnaire terminé'
        : opts.questionCount
          ? `${opts.questionCount} affirmations · 5 min`
          : '5 min';
  } else if (readCount === 0) {
    meta = `${total} ${unitOf(p, total)}`;
  } else {
    meta = `${readCount} sur ${total} ${unitOf(p, total)}`;
    if (p.newItems > 0) {
      meta += ` · ${p.newItems} ${newWord(step.unit.one, p.newItems)} ${unitOf(p, p.newItems)}`;
    }
  }
  if (step.id === 'presidentielle-2027' && opts.daysLeft != null) meta += ` · J-${opts.daysLeft}`;
  return meta;
}

export const ctaLabel = (p: StepProgress): 'Commencer' | 'Continuer' =>
  p.readCount === 0 ? 'Commencer' : 'Continuer';

const STATUS_WORD = { todo: 'à commencer', 'in-progress': 'en cours', done: 'terminée' } as const;

export function nodeAccessibilityLabel(
  p: StepProgress,
  isNext: boolean,
  total: number,
  opts: { daysLeft?: number | null; questionCount?: number } = {}
): string {
  const parts = [
    `Étape ${p.step.index} sur ${total} : ${p.step.title}`,
    stepMeta(p, opts),
    STATUS_WORD[p.status],
  ];
  if (p.stamped) parts.push('tampon obtenu');
  if (isNext) parts.push('étape conseillée');
  return parts.join(', ');
}

/** Encart de l'étape des partis : texte fixe, sans lien avec les réponses au questionnaire. */
export function stepInvite(p: StepProgress): string | null {
  if (p.step.id !== 'les-partis') return null;
  const remaining = p.total - p.readCount;
  if (remaining <= 0) return null;
  const fiches = remaining > 1 ? 'fiches' : 'fiche';
  return `Encore ${remaining} ${fiches} à découvrir. Lire tous les partis, y compris ceux dont on se sent loin, c'est la meilleure façon de se faire un avis.`;
}

const ITEM_LABELS: Record<JourneyItemKind, { read: string; unread: string }> = {
  party: { read: 'Fiche lue', unread: 'À découvrir' },
  debate: { read: 'Débat lu', unread: 'À découvrir' },
  guide: { read: 'Lu', unread: 'À lire' },
  election: { read: 'Lu', unread: 'À lire' },
  quiz: { read: 'Fait', unread: 'À faire' },
};

export const itemStatusLabel = (kind: JourneyItemKind, read: boolean) =>
  read ? ITEM_LABELS[kind].read : ITEM_LABELS[kind].unread;

export const summaryLabel = (stampedCount: number, total: number) =>
  `${stampedCount} sur ${total} étapes`;

export const passportLabel = (stampedCount: number, total: number) =>
  `${stampedCount} ${stampedCount > 1 ? 'tampons' : 'tampon'} sur ${total}`;

export const stepFootnote = (p: StepProgress) =>
  `Le tampon de l'étape s'obtient avec ${p.total > 1 ? `les ${p.total}` : 'le'} ${unitOf(p, p.total)}. Rien n'est bloqué en attendant.`;
