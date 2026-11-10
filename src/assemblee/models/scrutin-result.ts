import type { ScrutinSummary } from '@/src/assemblee/models/scrutin.model';

const plural = (n: number, singular: string, pluralForm = `${singular}s`) =>
  `${n} ${n > 1 ? pluralForm : singular}`;

/**
 * Phrase de résultat factuelle, sans commentaire. Pour une motion de censure, l'Assemblée ne
 * recense que les voix « pour » : on les compare à la majorité des membres, sans « contre ».
 */
export const scrutinResultSentence = (scrutin: ScrutinSummary): string => {
  const { pour, contre, abstentions, requis } = scrutin.synthese;
  if (scrutin.type === 'MOC') {
    return `Motion ${scrutin.adopte ? 'adoptée' : 'rejetée'} : ${plural(pour, 'voix', 'voix')} pour, ${requis} ${requis > 1 ? 'requises' : 'requise'} (majorité des membres de l'Assemblée).`;
  }
  return `${scrutin.adopte ? 'Adopté' : 'Rejeté'} : ${pour} pour, ${contre} contre, ${plural(abstentions, 'abstention')}. Majorité requise : ${plural(requis, 'voix', 'voix')}.`;
};
