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

// Questionnaire v2 (docs/questionnaire-v2.md) : une idée par affirmation, formulations alternées
// (être d'accord ne pousse pas toujours dans le même sens), positions documentables pour ≥ 8 partis.
// Ids supprimés en v2, à ne pas réutiliser : q03-charges, q11-police, q21-libre-echange, q22-vie-republique.
export const QUESTIONS: Question[] = [
  {
    id: 'q01-isf',
    theme: 'economie',
    statement:
      "Il faut créer un impôt minimum sur les plus grandes fortunes (plus de 100 millions d'euros).",
    help: "Cette « taxe Zucman » obligerait environ 1 800 foyers à payer chaque année au moins 2 % de leur patrimoine en impôts. Adoptée par l'Assemblée en février 2025 puis rejetée par le Sénat, elle a de nouveau été rejetée par les députés lors de l'examen des budgets 2026 (octobre 2025) et 2027 (16 octobre 2026). Depuis 2018, l'impôt sur la fortune (ISF) est remplacé par l'IFI, qui ne taxe que l'immobilier.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q02-depenses',
    theme: 'economie',
    statement:
      'La priorité budgétaire doit être de réduire les dépenses publiques pour faire baisser la dette.',
    help: 'La dette publique atteint 119 % du PIB au 2e trimestre 2026, et le déficit public était de 5,1 % du PIB en 2025. Pour le réduire, on peut baisser les dépenses, augmenter les impôts ou compter sur la croissance.',
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q25-successions',
    theme: 'economie',
    statement: "Il faut baisser les impôts sur l'héritage (droits de succession).",
    help: "Chaque enfant peut recevoir 100 000 € de chacun de ses parents sans payer d'impôt. Au-delà, le taux augmente par tranches, de 5 % à 45 %. Ce montant n'a pas été relevé depuis 2012. Le taux réellement payé est souvent bien plus bas que le taux maximal : environ 9 % pour un enfant qui hérite de 200 000 €, par exemple.",
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q26-nationalisations',
    theme: 'economie',
    statement:
      "L'État devrait nationaliser les entreprises stratégiques menacées de fermeture, comme ArcelorMittal.",
    help: "Nationaliser, c'est faire passer une entreprise sous le contrôle de l'État. Une proposition de loi pour nationaliser ArcelorMittal France (sidérurgie) a été adoptée par l'Assemblée en novembre 2025, rejetée par le Sénat en février 2026, puis adoptée à nouveau par les députés le 11 juin 2026. Le gouvernement s'y oppose et le texte n'est pas en vigueur.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q28-prix-energie',
    theme: 'economie',
    statement: 'Il faut baisser la TVA sur les factures d’électricité.',
    help: "Depuis le 1er août 2025, toute la facture d'électricité, abonnement compris, est soumise à une TVA de 20 %. L'abonnement était auparavant taxé à 5,5 %. Baisser cette TVA réduirait les factures des ménages, mais aussi les recettes de l'État. Le pouvoir d'achat et le prix de l'énergie figurent parmi les premières préoccupations des Français en 2026.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q04-retraite',
    theme: 'travail',
    statement: "L'âge légal de départ à la retraite doit être ramené à 62 ans.",
    help: "La réforme de 2023 prévoyait de porter progressivement l'âge légal de 62 à 64 ans. La loi de financement de la Sécurité sociale pour 2026 a suspendu ce relèvement : l'âge légal reste fixé à 62 ans et 9 mois jusqu'au 1er janvier 2028.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q05-smic',
    theme: 'travail',
    statement:
      'Le gouvernement doit augmenter le SMIC plus que ce que prévoit la loi (« coup de pouce »).',
    help: "Le SMIC augmente automatiquement selon l'inflation et les salaires. Il a été revalorisé de 2,41 % le 1er juin 2026. Un « coup de pouce » est une hausse supplémentaire décidée par le gouvernement. Ses partisans y voient un gain de pouvoir d'achat, ses opposants un risque pour l'emploi peu qualifié.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q06-chomage',
    theme: 'travail',
    statement: "Il faut durcir les règles de l'assurance chômage.",
    help: "Les règles du chômage ont été resserrées plusieurs fois depuis 2019, en dernier lieu par une loi de juin 2026. Pour les ruptures conventionnelles conclues depuis le 1er septembre 2026, la durée maximale d'indemnisation est de 15 mois pour les moins de 55 ans (en métropole). Les partisans d'un durcissement veulent encourager la reprise d'emploi, ses opposants dénoncent une perte de protection.",
    axis: 'economique',
    direction: 1,
  },
  {
    id: 'q27-temps-de-travail',
    theme: 'travail',
    statement: 'Il faut augmenter la durée légale du travail au-delà de 35 heures par semaine.',
    help: "La durée légale est de 35 heures par semaine depuis les lois Aubry (1998-2000). Au-delà, les heures sont payées en heures supplémentaires. Les salariés travaillent en moyenne 36,2 heures par semaine, temps partiel compris (Insee-Dares, 2023). Certains proposent de relever ou d'annualiser cette durée, d'autres de la réduire, par exemple à 32 heures.",
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
      'Les Français devraient passer avant les étrangers pour obtenir un logement social ou certaines aides sociales.',
    help: "C'est la « préférence nationale » (ou « priorité nationale »). Ses partisans proposent de l'inscrire dans la Constitution, notamment par référendum. Ses opposants estiment qu'elle est contraire au principe d'égalité inscrit dans la Constitution.",
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q09-regularisation',
    theme: 'immigration',
    statement:
      'Il faut faciliter la régularisation des travailleurs sans papiers dans les métiers qui recrutent difficilement.',
    help: "Les « métiers en tension » (BTP, restauration, aide à domicile…) peinent à recruter. La loi immigration de janvier 2024 a créé, à titre expérimental jusqu'au 31 décembre 2026, une régularisation possible pour ces travailleurs. Aucune prolongation n'a été votée à ce jour. Une circulaire de janvier 2025 a durci les conditions de régularisation, et le nombre de régularisations a baissé en 2025.",
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q10-peines-planchers',
    theme: 'securite',
    statement:
      'Il faut rétablir des peines minimales obligatoires (peines planchers) pour certains délits.',
    help: "Des peines planchers ont existé de 2007 à 2014 pour les récidivistes. Elles limitent la liberté du juge pour fixer la peine. Le projet de loi « SURE » présenté en mars 2026 prévoit des peines minimales. Il a été adopté par le Sénat en avril 2026 et son examen n'est pas terminé.",
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q29-cannabis',
    theme: 'securite',
    statement:
      "Il faut légaliser la vente et la consommation de cannabis, sous le contrôle de l'État.",
    help: 'Consommer du cannabis est un délit en France. Les consommateurs peuvent recevoir une amende forfaitaire, portée de 200 à 500 € par la loi « RIPOST » promulguée en août 2026. Les partisans de la légalisation mettent en avant la lutte contre les trafics et la prévention, ses opposants les risques pour la santé, en particulier chez les jeunes.',
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q34-mineurs',
    theme: 'securite',
    statement:
      'Les mineurs de 16 ans ou plus qui commettent un délit grave devraient pouvoir être jugés plus souvent comme des adultes.',
    help: "Aujourd'hui, un mineur encourt en principe une peine réduite de moitié par rapport à un adulte : c'est l'« excuse de minorité ». La loi de 2025 sur la justice des mineurs permettait de l'écarter plus facilement à partir de 16 ans. Le Conseil constitutionnel a censuré cette mesure le 19 juin 2025, au nom d'un principe constitutionnel propre à la justice des mineurs.",
    axis: 'societal',
    direction: 1,
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
    statement:
      'Il faut alléger les règles environnementales que doivent respecter les agriculteurs.',
    help: "La loi Duplomb (2025) voulait notamment réautoriser l'acétamipride, un pesticide interdit. Cette mesure, contestée par une pétition de plus de 2 millions de signatures, a été censurée par le Conseil constitutionnel. La loi d'urgence agricole (2026) l'a réintroduite sous forme de dérogation encadrée, ce que le Conseil constitutionnel a validé.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q30-zfe',
    theme: 'ecologie',
    statement:
      'Il faut supprimer les zones à faibles émissions (ZFE), qui interdisent les voitures les plus polluantes dans certaines villes.',
    help: "Les ZFE limitent la circulation des véhicules les plus anciens dans les grandes agglomérations pour réduire la pollution de l'air. Le Parlement a voté leur suppression en avril 2026, mais le Conseil constitutionnel l'a censurée le 21 mai 2026 parce qu'elle n'avait pas sa place dans ce texte (« cavalier législatif »). Les ZFE restent donc en vigueur.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q15-medecins',
    theme: 'sante',
    statement:
      "L'État doit pouvoir refuser l'installation d'un médecin là où il y a déjà assez de médecins.",
    help: "Environ 6 millions de personnes n'ont pas de médecin traitant. Une proposition de loi qui conditionne l'installation dans les zones bien dotées a été adoptée par l'Assemblée en mai 2025. Le Sénat a commencé à l'examiner en juin 2026 : il a adopté un article 1er assoupli, mais n'a pas terminé l'examen. Les syndicats de médecins défendent la liberté d'installation.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q16-fin-de-vie',
    theme: 'sante',
    statement: "La loi de 2026 qui autorise l'aide à mourir doit être conservée.",
    help: "La loi créant un « droit à l'aide à mourir » a été adoptée définitivement le 15 juillet 2026 (291 voix contre 241), puis validée sous réserves par le Conseil constitutionnel le 14 août 2026. Elle s'adresse à des adultes atteints d'une maladie grave et incurable, sous des conditions strictes. Certains partis proposent de l'abroger ou de la restreindre.",
    axis: 'societal',
    direction: -1,
  },
  {
    id: 'q17-ecole-privee',
    theme: 'education',
    statement:
      "L'argent public versé aux écoles privées sous contrat devrait dépendre de la mixité sociale de leurs élèves.",
    help: "L'enseignement privé sous contrat scolarise environ 17,6 % des élèves, soit plus de 2 millions. L'État y paie notamment les enseignants. Les écoles privées accueillent en moyenne des élèves de milieux plus favorisés que les écoles publiques. Un protocole signé en 2023 avec l'enseignement catholique prévoit des efforts de mixité volontaires, sans sanction financière.",
    axis: 'economique',
    direction: -1,
  },
  {
    id: 'q18-ukraine',
    theme: 'europe',
    statement: "La France doit continuer à livrer des armes à l'Ukraine.",
    help: "La France livre des armes et forme des soldats ukrainiens depuis l'invasion russe de 2022. Elle participe à la « coalition des volontaires », qui prépare des garanties de sécurité en cas d'accord de paix. Les négociations de paix se poursuivent sans accord durable à ce jour.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q19-droit-europeen',
    theme: 'europe',
    statement:
      "Quand une loi française et une règle européenne se contredisent, la loi française doit l'emporter.",
    help: "Aujourd'hui, les traités et le droit européens priment sur les lois françaises, mais pas sur la Constitution, selon le Conseil d'État et le Conseil constitutionnel. Remettre en cause cette primauté supposerait de modifier la Constitution ou les traités.",
    axis: 'europe',
    direction: -1,
  },
  {
    id: 'q20-defense-europe',
    theme: 'europe',
    statement: "L'Union européenne doit emprunter en commun pour financer la défense européenne.",
    help: "L'Union européenne a emprunté en commun à grande échelle pour la première fois en 2020, pour son plan de relance après le Covid. Le programme SAFE, adopté en mai 2025, prévoit jusqu'à 150 milliards d'euros de prêts pour la défense, financés par un emprunt de l'UE. La France a signé en juin 2026 un prêt d'environ 15 milliards d'euros.",
    axis: 'europe',
    direction: 1,
  },
  {
    id: 'q32-ukraine-ue',
    theme: 'europe',
    statement: "L'Ukraine devrait pouvoir entrer dans l'Union européenne.",
    help: "L'Ukraine est officiellement candidate depuis juin 2022. Après la levée du veto hongrois en juin 2026, deux des six groupes de chapitres de négociation ont été ouverts, mais la Hongrie bloque de nouveau l'ouverture des suivants depuis septembre 2026. Toute adhésion doit être approuvée à l'unanimité par les États membres.",
    axis: 'europe',
    direction: 1,
  },
  {
    id: 'q33-veto-europeen',
    theme: 'europe',
    statement:
      "Chaque pays doit garder un droit de veto sur les grandes décisions de l'Union européenne.",
    help: "La plupart des décisions européennes se prennent à la « majorité qualifiée » : 55 % des États représentant 65 % de la population. Pour la politique étrangère, les impôts, l'élargissement ou le budget pluriannuel, l'unanimité reste obligatoire, ce qui donne un droit de veto à chaque pays. Plusieurs États, dont la France, ont proposé d'étendre la majorité qualifiée à la politique étrangère.",
    axis: 'europe',
    direction: -1,
  },
  {
    id: 'q23-referendum',
    theme: 'institutions',
    statement: "Il faut organiser un référendum sur l'immigration.",
    help: "Selon la majorité des constitutionnalistes, l'article 11 de la Constitution ne permet pas aujourd'hui d'organiser un référendum direct sur l'immigration. Ses partisans proposent donc de modifier d'abord la Constitution. Ses opposants y voient un risque pour les droits fondamentaux.",
    axis: 'societal',
    direction: 1,
  },
  {
    id: 'q24-proportionnelle',
    theme: 'institutions',
    statement: 'Il faut instaurer la proportionnelle aux élections législatives.',
    help: "Les députés sont élus au scrutin majoritaire à deux tours, par circonscription. La proportionnelle n'a été utilisée qu'une fois sous la Ve République, en 1986.",
    axis: null,
    direction: 1,
  },
  {
    id: 'q31-voile-sport',
    theme: 'institutions',
    statement: 'Une sportive doit pouvoir porter le voile pendant une compétition.',
    help: "La laïcité impose la neutralité religieuse aux agents publics, pas aux simples citoyens. Certaines fédérations sportives interdisent déjà les signes religieux en compétition. En février 2025, le Sénat a adopté (210 voix contre 81) une proposition de loi qui les interdit dans toutes les compétitions organisées par les fédérations. L'Assemblée nationale ne l'a pas adoptée à ce jour.",
    axis: 'societal',
    direction: -1,
  },
];
