import type { Axis, Question } from '@/src/programmes/models/programme.model';

export const AXES: Axis[] = [
  {
    id: 'economique',
    label: 'Économie',
    negativePole: "Redistribution et intervention de l'État",
    positivePole: 'Marché et réduction de la dépense publique',
  },
  {
    id: 'societal',
    label: 'Société',
    negativePole: 'Libertés individuelles et ouverture',
    positivePole: 'Autorité et contrôle des frontières',
  },
  {
    id: 'europe',
    label: 'Europe',
    negativePole: 'Souveraineté nationale',
    positivePole: 'Intégration européenne',
  },
];

// Formulations volontairement alternées : être d'accord ne pousse pas toujours dans le même sens.
export const QUESTIONS: Question[] = [
  {
    id: 'q01-isf',
    theme: 'economie',
    statement:
      'Il faut taxer davantage les plus grandes fortunes (rétablir un ISF ou créer un impôt plancher sur les très hauts patrimoines).',
    help: "L'ISF a été remplacé en 2018 par l'IFI, qui ne taxe que l'immobilier. La « taxe Zucman », un impôt minimum de 2 % sur les patrimoines de plus de 100 M€, a été adoptée par l'Assemblée nationale en février 2025 puis rejetée par le Sénat en juin 2025 ; proposée de nouveau dans le budget 2026, elle a été rejetée par l'Assemblée (octobre 2025) et par le Sénat.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q02-depenses',
    theme: 'economie',
    statement:
      'La priorité budgétaire doit être de réduire les dépenses publiques pour faire baisser la dette.',
    help: 'La dette publique atteint 119 % du PIB mi-2026 et le déficit public était de 5,1 % du PIB en 2025. Les options : baisser les dépenses, augmenter les recettes (impôts), ou parier sur la croissance.',
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q03-charges',
    theme: 'economie',
    statement:
      'Il faut baisser les impôts et cotisations payés par les entreprises pour améliorer leur compétitivité.',
    help: 'Les impôts de production et les cotisations patronales sont parmi les plus élevés de l’UE. Leur baisse coûte des recettes à l’État.',
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q04-retraite',
    theme: 'travail',
    statement: "L'âge légal de départ à la retraite doit revenir à 62 ans ou moins.",
    help: "La réforme de 2023 a porté l'âge légal progressivement de 62 à 64 ans. La loi de financement de la Sécurité sociale pour 2026 a suspendu ce relèvement : l'âge légal reste fixé à 62 ans et 9 mois jusqu'au 1er janvier 2028.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q05-smic',
    theme: 'travail',
    statement: "L'État doit augmenter nettement le SMIC, au-delà de sa revalorisation automatique.",
    help: "Le SMIC est revalorisé chaque année selon l'inflation et les salaires. Un « coup de pouce » est une hausse supplémentaire décidée par le gouvernement.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q06-chomage',
    theme: 'travail',
    statement:
      "Les règles d'accès à l'assurance chômage et au RSA doivent être durcies (durée, contreparties).",
    help: "Depuis 2025, les allocataires du RSA doivent en principe effectuer 15 heures d'activité hebdomadaires. Les règles du chômage ont été resserrées plusieurs fois depuis 2019 ; pour les ruptures conventionnelles intervenues depuis le 1er septembre 2026, la durée maximale d'indemnisation a été ramenée à 15 mois pour les moins de 55 ans (en métropole).",
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q07-immigration',
    theme: 'immigration',
    statement:
      "Il faut réduire fortement l'immigration légale (regroupement familial, titres de séjour).",
    help: '384 230 premiers titres de séjour ont été délivrés en 2025 (+11 % sur un an) : environ 118 000 pour études, 92 600 pour motifs humanitaires, 51 200 pour motifs économiques, le reste principalement pour motifs familiaux.',
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q08-preference',
    theme: 'immigration',
    statement:
      'Certaines aides sociales et le logement social devraient être réservés en priorité aux Français.',
    help: 'C’est la « préférence nationale » (ou « priorité nationale »). Ses partisans proposent de l’inscrire dans la Constitution, notamment par référendum ; ses opposants estiment qu’elle contredit le principe d’égalité.',
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q09-regularisation',
    theme: 'immigration',
    statement:
      'Il faut faciliter la régularisation des travailleurs sans papiers dans les métiers qui recrutent difficilement.',
    help: 'Les « métiers en tension » (BTP, restauration, aide à domicile…) peinent à recruter. La loi immigration de janvier 2024 a créé, à titre expérimental et jusqu’au 31 décembre 2026, une régularisation possible pour les travailleurs sans papiers de ces métiers ; une circulaire de janvier 2025 a durci les conditions de régularisation, et le nombre de régularisations a baissé de 10 % en 2025.',
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q10-peines-planchers',
    theme: 'securite',
    statement:
      'Il faut rétablir des peines minimales obligatoires (peines planchers) pour certains délits.',
    help: 'Des peines planchers ont existé de 2007 à 2014 pour les récidivistes. Elles limitent la marge d’appréciation du juge.',
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q11-police',
    theme: 'securite',
    statement:
      "Il faut un contrôle indépendant de la police et la remise d'un récépissé lors des contrôles d'identité.",
    help: "Les enquêtes sur les policiers et les gendarmes sont aujourd'hui menées par l'IGPN et l'IGGN, qui dépendent du ministère de l'Intérieur. Le récépissé vise à limiter les contrôles « au faciès ».",
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q12-nucleaire',
    theme: 'ecologie',
    statement: 'La France doit construire de nouveaux réacteurs nucléaires.',
    help: "Le nucléaire a produit environ 68 % de l'électricité française en 2025. La programmation pluriannuelle de l'énergie adoptée en février 2026 prévoit six nouveaux réacteurs EPR2, dont le premier est attendu vers 2038.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q13-renouvelables',
    theme: 'ecologie',
    statement: "Il faut accélérer le développement de l'éolien et du solaire.",
    help: "Les énergies renouvelables représentaient 23 % de la consommation finale d'énergie en 2024, pour un objectif légal de 33 % en 2030. L'éolien suscite des oppositions locales (paysage, bruit).",
    axis: null,
    direction: 1,
  },
  {
    id: 'q14-normes-agricoles',
    theme: 'ecologie',
    statement: 'Il faut alléger les normes environnementales imposées aux agriculteurs.',
    help: "La loi Duplomb (2025) visait notamment à réautoriser l'acétamipride, un pesticide interdit ; cette mesure, contestée par une pétition de plus de 2 millions de signatures, a été censurée par le Conseil constitutionnel. La loi d'urgence agricole (2026) l'a réintroduite par dérogation encadrée, ce que le Conseil constitutionnel a validé.",
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q15-medecins',
    theme: 'sante',
    statement:
      "Il faut réguler l'installation des médecins pour les obliger à exercer là où ils manquent.",
    help: "Environ 6 millions de personnes n'ont pas de médecin traitant. Une proposition de loi régulant l'installation a été adoptée par l'Assemblée en mai 2025 ; son examen au Sénat n'est pas achevé. Les syndicats de médecins défendent la liberté d'installation.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q16-fin-de-vie',
    theme: 'sante',
    statement:
      'La loi de 2026 qui légalise une aide active à mourir strictement encadrée doit être maintenue.',
    help: "La loi créant un « droit à l'aide à mourir » a été adoptée définitivement le 15 juillet 2026 (291 voix contre 241), puis validée sous réserves par le Conseil constitutionnel le 14 août 2026. Certains partis proposent de l'abroger ou de la restreindre. Le vote est souvent laissé à la conscience de chaque parlementaire.",
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q17-ecole-privee',
    theme: 'education',
    statement:
      "Les écoles privées sous contrat devraient recevoir moins d'argent public ou être soumises à davantage d'obligations de mixité sociale.",
    help: 'L’enseignement privé sous contrat scolarise environ 17,6 % des élèves (plus de 2 millions), et plus d’un collégien ou lycéen sur cinq. Selon la Cour des comptes, l’État finance environ 55 % de ses dépenses dans le premier degré et 67 % dans le second, principalement en payant les enseignants.',
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q18-ukraine',
    theme: 'europe',
    statement: "La France doit continuer à soutenir militairement l'Ukraine.",
    help: 'La France livre des armes et forme des soldats ukrainiens depuis 2022. Elle participe à la « coalition des volontaires » sur les garanties de sécurité.',
    axis: 'europe',
    direction: 1,
  },
  {
    id: 'q19-droit-europeen',
    theme: 'europe',
    statement:
      'Le droit français devrait primer sur le droit européen lorsque les deux entrent en conflit.',
    help: 'Aujourd’hui, les traités européens s’imposent aux lois françaises (mais pas à la Constitution, selon le Conseil d’État et le Conseil constitutionnel).',
    axis: 'europe',
    direction: -1,
  },
  {
    id: 'q20-defense-europe',
    theme: 'europe',
    statement:
      "L'Union européenne doit s'endetter en commun pour financer sa défense et ses investissements.",
    help: "L'UE a emprunté en commun à grande échelle pour la première fois en 2020 (plan de relance post-Covid). Le programme SAFE, adopté en mai 2025, prévoit jusqu'à 150 Md€ de prêts pour la défense, financés par l'emprunt de l'UE ; la France a signé en juin 2026 un prêt d'environ 15 Md€.",
    axis: 'europe',
    direction: 1,
  },
  {
    id: 'q21-libre-echange',
    theme: 'europe',
    statement:
      "La France doit s'opposer aux accords de libre-échange comme celui avec le Mercosur.",
    help: "L'accord UE-Mercosur réduit les droits de douane avec l'Argentine, le Brésil, le Paraguay et l'Uruguay. Signé en janvier 2026 malgré le vote contre de la France, il s'applique provisoirement depuis le 1er mai 2026, en attendant un avis de la Cour de justice de l'UE saisie par le Parlement européen. Les agriculteurs français y sont largement opposés.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q22-vie-republique',
    theme: 'institutions',
    statement:
      'Il faut changer de Constitution (VIe République) pour réduire fortement les pouvoirs du président.',
    help: 'La Ve République (1958) donne au président des pouvoirs étendus : dissolution, nomination du Premier ministre, article 16, référendum.',
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q23-referendum',
    theme: 'institutions',
    statement:
      "Il faut organiser des référendums sur l'immigration, y compris en modifiant la Constitution pour le permettre.",
    help: "L'article 11 de la Constitution ne permet pas aujourd'hui de référendum direct sur l'immigration, selon la majorité des constitutionnalistes.",
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q24-proportionnelle',
    theme: 'institutions',
    statement: 'Il faut instaurer la proportionnelle aux élections législatives.',
    help: 'Les députés sont élus au scrutin majoritaire à deux tours par circonscription. La proportionnelle a été utilisée une seule fois sous la Ve République, en 1986.',
    axis: null,
    direction: 1,
  },
];
