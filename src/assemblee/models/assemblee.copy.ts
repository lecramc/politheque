import { PERIMETER_RULES } from '@/src/assemblee/models/extraction/perimeter';
import type { ScrutinCategory, ScrutinType } from '@/src/assemblee/models/scrutin.model';

/**
 * Tous les textes du domaine « Assemblée » : le site est en français uniquement, les textes sont
 * des constantes ou des fonctions typées (testées), jamais des clés à résoudre.
 *
 * Vocabulaire : « vote » partout ; « scrutin n° » ne sert que de référence. Pas de jargon sans
 * explication : le test des textes liste les termes à ne pas laisser dans les libellés visibles.
 */

/** Français : 0 et 1 au singulier. */
export const pluralize = (count: number, one: string, other: string): string =>
  count <= 1 ? one : other;

export const COPY = {
  common: {
    back: 'Comprendre',
    backToList: 'Tous les votes',
    source: (licence: string, date: string) =>
      `Source : Assemblée nationale, open data, ${licence}. Données extraites le ${date}.`,
    sourceDetail: (dernier: string, sha: string) =>
      `Dernier scrutin retenu : ${dernier}. Empreinte SHA-256 du fichier des scrutins : ${sha}…`,
    officialListLink: "Tous les votes sur le site de l'Assemblée nationale",
  },
  category: {
    texte: 'Texte entier',
    'article-unique': 'Texte à un seul article',
    censure: 'Censure du Gouvernement',
    declaration: 'Déclaration du Gouvernement',
    resolution: 'Résolution',
    confiance: 'Vote de confiance',
    'rejet-prealable': 'Rejet préalable',
    'partie-budget': 'Budget : une partie',
    cite: 'Vote cité sur une fiche parti',
  } satisfies Record<ScrutinCategory, string>,
  /** Une ligne d'aide par catégorie (feuille de filtres). */
  categoryHelp: {
    texte: 'Vote final sur une loi ou une résolution, tous articles réunis.',
    'article-unique': "Le texte ne compte qu'un article : le vote porte sur cet article.",
    censure: 'Les députés votent pour renverser le Gouvernement.',
    declaration: 'Le Gouvernement présente sa politique, les députés votent ensuite.',
    resolution: "Texte où l'Assemblée donne un avis, sans valeur de loi.",
    confiance:
      "Le Premier ministre présente sa politique générale et demande la confiance de l'Assemblée.",
    'rejet-prealable':
      "Une motion adoptée écarte le texte : l'Assemblée le rejette sans l'examiner article par article.",
    'partie-budget':
      "Vote sur une partie du budget de l'État ou de la Sécurité sociale (recettes, dépenses ou équilibre).",
    cite: "Vote cité comme source sur la fiche d'un parti : un amendement, un article ou un autre vote.",
  } satisfies Record<ScrutinCategory, string>,
  voteType: {
    SPO: 'Vote public',
    SPS: 'Vote solennel',
    MOC: 'Motion de censure',
  } satisfies Record<ScrutinType, string>,
  voteTypeDetail: {
    SPO: 'Vote public : le choix de chaque député est publié',
    SPS: "Vote solennel : annoncé à l'avance, sur un texte important",
    MOC: 'Motion de censure',
  } satisfies Record<ScrutinType, string>,
  requesterGloss: {
    'Conférence des Présidents': "(réunion qui organise les travaux de l'Assemblée)",
  } as Record<string, string>,
  result: {
    adopte: 'Adopté',
    rejete: 'Rejeté',
    adoptee: 'Adoptée',
    rejetee: 'Rejetée',
  },
  vote: {
    P: 'Pour',
    C: 'Contre',
    A: 'Abstention',
    N: 'Ne prend pas part au vote',
    none: "N'a pas voté",
    vacant: 'Siège vacant',
    censureNone: "N'a pas voté la motion",
    delegation: 'vote confié à un collègue',
    miseAuPoint: (souhait: string) =>
      `Correction après le vote : souhaitait ${souhait}. Le résultat ne change pas.`,
    souhait: {
      P: 'voter pour',
      C: 'voter contre',
      A: "s'abstenir",
      N: 'ne pas prendre part au vote',
    },
    nonVotantCause: (cause: string) => `Ne prend pas part au vote (${cause})`,
    cause: {
      PAN: "présidence de l'Assemblée",
      PSE: 'présidence de séance',
      MG: 'membre du Gouvernement',
    } as Record<string, string>,
  },
  list: {
    title: "Les votes de l'Assemblée",
    lead: 'Comment les députés ont voté sur les lois, le budget et les motions de censure depuis 2024. Pour chaque vote : le résultat, et le choix de chaque groupe et de chaque député.',
    warning:
      "Les votes à main levée ne sont pas enregistrés nom par nom : ils n'apparaissent pas ici.",
    criteriaTitle: 'Quels votes figurent ici ?',
    methodLink: "Lire la méthode : votes de l'Assemblée",
    filters: {
      title: 'Filtrer les votes',
      button: (active: number) => (active > 0 ? `Filtrer · ${active}` : 'Filtrer'),
      category: 'Type de vote',
      allCategories: 'Tous les types',
      result: 'Résultat',
      allResults: 'Tous',
      period: 'Période',
      allPeriods: 'Depuis 2024',
      search: 'Rechercher un vote',
      searchPlaceholder: 'Un mot du titre',
      reset: 'Effacer les filtres',
    },
    count: (count: number, total: number) =>
      count === total
        ? `${total} ${pluralize(total, 'vote', 'votes')}`
        : `${count} ${pluralize(count, 'vote', 'votes')} sur ${total}`,
    more: (count: number) => `Voir ${count} ${pluralize(count, 'vote', 'votes')} de plus`,
    empty: 'Aucun vote ne correspond à ces filtres.',
    counts: (pour: number, contre: number, abstentions: string) =>
      `${pour} pour · ${contre} contre · ${abstentions}`,
    countsCensure: (count: number, requis: number) =>
      `${count} pour · ${requis} ${pluralize(requis, 'nécessaire', 'nécessaires')}`,
    criteriaLead:
      'La liste suit une règle fixe, appliquée par programme à tous les scrutins publics de la législature. Est repris tout scrutin qui relève de l’un de ces cas :',
    criteriaExcluded:
      'Les votes sur les amendements et sur les articles isolés, les motions de rejet rejetées et les autres motions de procédure ne sont pas repris.',
    abstentions: (count: number) => `${count} ${pluralize(count, 'abstention', 'abstentions')}`,
  },
  /** « Les mots à connaître » : une phrase par mot, et l'entrée du lexique qui le développe. */
  words: {
    title: 'Les mots à connaître',
    more: 'Lire la suite dans le lexique',
    terms: [
      {
        term: 'Scrutin',
        definition:
          "Un scrutin est un vote ; à l'Assemblée, chaque vote public est enregistré député par député.",
        lexiconId: 'scrutin-public',
      },
      {
        term: 'Pour, contre, abstention',
        definition:
          'Un député peut approuver le texte (pour), le rejeter (contre) ou voter sans prendre parti (abstention).',
        lexiconId: 'abstention',
      },
      {
        term: 'Majorité absolue',
        definition:
          "C'est plus de la moitié des voix : 289 sièges sur 577 à l'Assemblée nationale.",
        lexiconId: 'majorite-absolue',
      },
      {
        term: 'Groupe',
        definition:
          'Un groupe réunit au moins 15 députés selon leurs affinités politiques, et ses membres votent souvent ensemble.',
        lexiconId: 'groupe-parlementaire',
      },
    ],
  },
  verdict: {
    threshold: (requis: number) => `Il fallait ${requis} voix pour l'adopter.`,
    censureHeadline: (adopte: boolean) =>
      adopte
        ? 'Motion adoptée : le Gouvernement est renversé.'
        : 'Motion rejetée : le Gouvernement reste en place.',
    censureDetail: (pour: number, requis: number) =>
      `${pour} ${pluralize(pour, "député l'a votée", "députés l'ont votée")}. Il en fallait ${requis} (la majorité des membres de l'Assemblée) pour renverser le Gouvernement.`,
    censureNote:
      "Seuls les votes « pour » sont comptés. Ne pas voter la motion n'est pas voter contre.",
  },
  scrutin: {
    pageTitle: (numero: number, date: string) => `Scrutin n° ${numero} du ${date}`,
    reference: (numero: number) => `Scrutin n° ${numero}`,
    titleNote: (reference: string) =>
      `${reference}. Titre officiel de l'Assemblée nationale ; seule la première lettre est mise en majuscule.`,
    header: (date: string, type: string) => `${date} · ${type}`,
  },
  details: {
    title: 'Détails du vote',
    type: 'Type de vote',
    requestedBy: 'Scrutin demandé par',
    votants: 'Ont voté',
    exprimes: 'Votes pour ou contre (sans les abstentions)',
    requis: 'Voix nécessaires pour adopter',
    nonVotants: 'Ne prennent pas part au vote (par exemple la présidence de séance)',
    nonVotantsVolontaires: 'Ont choisi de ne pas prendre part au vote',
    delegations: 'Votes confiés à un collègue',
    misesAuPoint: 'Corrections après le vote',
    glossaryDelegation:
      'Vote confié à un collègue : le député absent a chargé un collègue de voter pour lui.',
    glossaryMiseAuPoint:
      "Correction après le vote : le député indique qu'il voulait voter autrement ; le résultat ne change pas.",
  },
  groups: {
    lineTitle: (name: string, members: number) =>
      `${name} · ${members} ${pluralize(members, 'député', 'députés')}`,
    nonInscrits: 'Non-inscrits : députés sans groupe',
    said: {
      pour: (n: number) => `${n} pour`,
      contre: (n: number) => `${n} contre`,
      abstention: (n: number) => `${n} ${pluralize(n, 'abstention', 'abstentions')}`,
      nonVotant: (n: number) =>
        `${n} ${pluralize(n, 'ne prend pas part au vote', 'ne prennent pas part au vote')}`,
      none: (n: number) => `${n} ${pluralize(n, "n'a pas voté", "n'ont pas voté")}`,
      censureVoted: (n: number) => `${n} ${pluralize(n, 'a', 'ont')} voté la motion`,
      censureNot: (n: number) => `${n} ${pluralize(n, "ne l'a pas votée", "ne l'ont pas votée")}`,
    },
    title: 'Vote de chaque groupe',
    tableToggle: 'Voir le tableau chiffré',
    caption: "Vote de chaque groupe au jour du vote, selon les décomptes de l'Assemblée nationale.",
    group: 'Groupe',
    members: 'Membres',
    pour: 'Pour',
    contre: 'Contre',
    abstention: 'Abstentions',
    nonVotant: 'Ne prennent pas part au vote',
    noVote: "N'ont pas voté",
    censureVoted: 'Ont voté la motion',
    censureNot: "N'ont pas voté la motion",
    sortPlaces: "Ordre de l'hémicycle",
    sortAlpha: 'Ordre alphabétique',
    sortLabel: 'Ordre des groupes',
    note: "Un groupe n'est pas un parti : ses députés ne sont pas tous du même parti.",
    select: (groupe: string) => `Mettre en évidence les sièges du groupe ${groupe} sur le schéma`,
    selectedHint: 'Sièges en évidence sur le schéma, plus bas.',
  },
  hemicycle: {
    title: "L'hémicycle",
    loading: 'Chargement du détail par député',
    error: "Le détail par député n'a pas pu être chargé.",
    errorLink: "Voir ce vote sur le site de l'Assemblée nationale",
    retry: 'Réessayer',
    label: (numero: number, resume: string) =>
      `Hémicycle de l'Assemblée nationale au scrutin n° ${numero} : ${resume}.`,
    mention:
      "Schéma simplifié : les groupes sont rangés dans l'ordre du plan officiel de l'Assemblée, sans reproduire la place exacte de chaque député. Non-inscrits (NI) : places dispersées dans la salle, regroupés ici à droite du schéma.",
    labelsWide: 'Le sigle de chaque groupe est écrit autour du schéma.',
    labelsSmall:
      'Sur un petit écran, les sigles ne sont pas écrits sur le schéma : la liste des groupes, sous le schéma, donne le sigle et la couleur de chacun.',
    hintTouch: 'Touchez un groupe pour voir ses sièges.',
    hintHover: 'Survolez un siège pour voir le député.',
    clearHighlight: 'Retirer la mise en évidence',
    highlighted: (groupe: string) => `Sièges du groupe ${groupe} en évidence.`,
    unseatedTitle: 'Députés sans siège identifiable ce jour-là',
    unseatedNote:
      "L'open data ne permet pas de savoir quel siège ces députés occupaient ce jour-là : leur position est listée ici, sans être placée sur le schéma.",
    tooltip: (nom: string, groupe: string, position: string) => `${nom}, ${groupe} : ${position}`,
  },
  legend: {
    title: 'Légende',
    groupColors:
      "Trait extérieur : la couleur officielle de chaque groupe à l'Assemblée nationale.",
  },
  deputies: {
    title: 'Chercher un député',
    search: 'Nom ou prénom',
    searchPlaceholder: 'Par exemple : Martin',
    showAll: (count: number) => `Afficher les ${count} députés`,
    hideAll: 'Masquer la liste',
    filterButton: (active: number) => (active > 0 ? `Filtrer · ${active}` : 'Filtrer'),
    filterTitle: 'Filtrer les députés',
    filterGroup: 'Groupe',
    filterPosition: 'Position',
    allGroups: 'Tous les groupes',
    allPositions: 'Toutes les positions',
    reset: 'Effacer les filtres',
    none: 'Aucun député ne correspond à ces critères.',
    notInVote: "Ce député ne siégeait pas à l'Assemblée lors de ce vote.",
    count: (count: number) => `${count} ${pluralize(count, 'député', 'députés')}`,
    listLabel: 'Vote de chaque député, par ordre alphabétique',
  },
  constituency: {
    open: 'Trouver mon député par département',
    loading: 'Chargement de la liste des députés',
    close: 'Fermer',
    title: 'Mon député par département',
    search: 'Département (nom ou numéro)',
    searchPlaceholder: 'Par exemple : Nord, 59, 2A',
    showAll: (count: number) => `Afficher les ${count} départements`,
    none: 'Aucun département ne correspond. Essayez le nom ou le numéro, par exemple « 2A » ou « Réunion ».',
    listLabel: 'Départements',
    change: 'Changer de département',
    label: (nom: string, code: string) => `${nom} (${code})`,
    circonscription: (numero: number) => `${numero}${numero === 1 ? 're' : 'e'} circonscription`,
    vacant: 'Pas de député en exercice dans les données',
    help: 'Vous ne connaissez pas votre circonscription ?',
    helpLink: "La trouver sur le site de l'Assemblée nationale",
    helpUrl: 'https://www.assemblee-nationale.fr/dyn/vos-deputes',
    privacy: "Rien n'est envoyé : la recherche se fait dans cette page, sans adresse.",
  },
  others: {
    title: 'Autres votes sur ce texte',
    lead: 'Autres votes de la liste portant sur le même texte.',
    dossier: "Toutes les étapes de ce texte, sur le site de l'Assemblée nationale",
  },
  cited: {
    title: 'Ce vote est cité dans',
    item: (partie: string, onglet: string) => `${partie}, onglet ${onglet}`,
    note: 'Fiches de Polithèque dont les sources citent ce vote.',
  },
  source: {
    title: 'Source et licence',
    official: "Page officielle de ce vote sur le site de l'Assemblée nationale",
    licenceLine: (licence: string) =>
      `Données de l'Assemblée nationale réutilisées sous ${licence}.`,
  },
  seo: {
    listTitle: "Les votes de l'Assemblée nationale",
    listDescription: (count: number) =>
      `${count} votes depuis les élections de 2024, retenus par une règle fixe : textes de loi, motions de censure, avec le vote de chaque groupe et de chaque député.`,
    scrutinTitle: (numero: number, date: string, titre: string) =>
      `Scrutin n° ${numero} du ${date} : ${titre}`,
    scrutinDescriptionAdopted: (numero: number, decompte: string) =>
      `Scrutin n° ${numero}. Adopté : ${decompte}. Vote de chaque groupe et de chaque député.`,
    scrutinDescriptionRejected: (numero: number, decompte: string) =>
      `Scrutin n° ${numero}. Rejeté : ${decompte}. Vote de chaque groupe et de chaque député.`,
    scrutinDescriptionCensureAdopted: (numero: number, pour: number, requis: number) =>
      `Scrutin n° ${numero}. Motion adoptée : ${pour} voix pour, ${requis} requises. Vote de chaque groupe et de chaque député.`,
    scrutinDescriptionCensureRejected: (numero: number, pour: number, requis: number) =>
      `Scrutin n° ${numero}. Motion rejetée : ${pour} voix pour, ${requis} requises. Vote de chaque groupe et de chaque député.`,
  },
  overview: {
    sitting: {
      title: "Qui siège aujourd'hui",
      lead: (date: string) =>
        `Les députés en exercice au ${date}, groupe par groupe, de la gauche à la droite de l'hémicycle, selon le plan officiel de l'Assemblée.`,
      majority: (seats: number) => `Majorité absolue : ${seats} sièges`,
      noMajority: (seats: number) =>
        `Aucun groupe n'a la majorité absolue ; le plus grand compte ${seats} ${pluralize(seats, 'siège', 'sièges')}.`,
      hasMajority: (name: string, seats: number) =>
        `Le groupe ${name} a la majorité absolue, avec ${seats} sièges.`,
      vacant: (count: number) =>
        `${count} ${pluralize(count, 'siège vacant', 'sièges vacants')} dans les données`,
      seats: (count: number) => `${count} ${pluralize(count, 'siège', 'sièges')}`,
      chartLabel: (total: number, groups: number) =>
        `Hémicycle : ${total} députés en exercice répartis en ${groups} groupes, détaillés dans la liste sous le schéma.`,
      note: "Schéma simplifié : les sièges sont regroupés par groupe, sans reproduire le plan exact de la salle. Chaque groupe porte sa couleur officielle à l'Assemblée. Non-inscrits (NI) : places dispersées dans la salle. Un groupe n'est pas un parti.",
      listLabel: 'Effectif de chaque groupe',
    },
    grid: {
      title: 'Qui vote quoi sur les grands votes',
      lead: (count: number) =>
        `Les ${count} derniers votes sur un texte entier, une motion de censure, une confiance ou une déclaration du Gouvernement. Pour chaque vote, la position de chaque groupe.`,
      note: 'Position majoritaire du groupe ; la règle exacte est ci-dessous, le détail député par député est dans chaque vote.',
      shared:
        "Partagé : pour un vote ordinaire, aucune position n'atteint la moitié des députés du groupe qui ont voté (pour, contre ou abstention). Pour une motion de censure, seuls les votes « pour » existent : le groupe est « pour » si au moins la moitié de ses membres l'ont votée, « partagé » sinon ; ne pas voter la motion n'est pas voter contre.",
      group: 'Groupe',
      open: (title: string) => `Voir le vote : ${title}`,
      cell: (group: string, position: string) => `${group} : ${position}`,
      position: {
        pour: 'Pour',
        contre: 'Contre',
        abstention: 'Abstention',
        partage: 'Partagé',
        absent: 'Absent',
        motionNon: "N'a pas voté la motion",
        sansDepute: 'Sans député',
      },
      caption: 'Position majoritaire de chaque groupe sur les derniers grands votes.',
    },
    law: {
      title: 'Comment une loi est votée',
      text: "Du dépôt du texte au vote final : les étapes, et le rôle de l'Assemblée et du Sénat.",
      cta: 'Lire : comment une loi est votée',
    },
    allVotes: {
      title: 'Tous les votes',
    },
  },
  /** Encart « À l'Assemblée » d'une fiche parti : le même pour les dix partis. */
  partyPanel: {
    title: "À l'Assemblée",
    none: "Pas de groupe à l'Assemblée nationale",
    count: (count: number) => `${count} ${pluralize(count, 'député', 'députés')}`,
    updated: (date: string) => `Effectif officiel au ${date}, selon l'Assemblée nationale.`,
    note: 'Un groupe peut réunir des élus de plusieurs partis.',
    votesTitle: 'Qui vote quoi sur les grands votes',
    votesLabel: (group: string) =>
      `Position majoritaire du groupe ${group} sur les derniers grands votes`,
    all: "Tous les votes de l'Assemblée",
  },
  /** Sous chaque position d'un parti (onglet Positions) : le vote de son groupe sur les scrutins cités. */
  stanceVotes: {
    title: "À l'Assemblée",
    note: "Votes du groupe à l'Assemblée, tirés des données officielles. Un groupe peut réunir des élus de plusieurs partis ; la position retenue est celle de la majorité des membres qui ont voté.",
    listLabel: (group: string) => `Vote du groupe ${group}`,
  },
  /** Sur un débat : ce qu'a voté l'Assemblée sur les scrutins cités par les fiches des partis. */
  themeVotes: {
    title: "Ce qu'a voté l'Assemblée sur ce sujet",
    method:
      'Les votes cités en source sur les fiches des partis pour ce débat. Dans chaque case, la position de la majorité des membres du groupe qui ont voté.',
    caption: 'Position majoritaire de chaque groupe sur les votes cités pour ce débat.',
    all: "Tous les votes de l'Assemblée",
  },
  comprendre: {
    cardTitle: "L'Assemblée : qui vote quoi",
    cardText:
      "Qui siège aujourd'hui, la position de chaque groupe sur les grands votes, puis tous les votes : le résultat, le vote de chaque groupe et de chaque député.",
    cardMeta: (count: number) => `${count} votes`,
  },
  method: {
    title: "Votes de l'Assemblée",
    intro:
      "La page « Les votes de l'Assemblée » reprend, sans résumer ni réécrire les titres officiels, les scrutins publics de la 17e législature publiés en open data par l'Assemblée nationale. Seuls les noms des catégories et les phrases de résultat sont rédigés par Polithèque.",
    criteriaTitle: 'Quels scrutins sont publiés',
    criteriaLead:
      'La liste suit une règle fixe, appliquée par programme à tous les scrutins publics, sans exception manuelle. Est repris tout scrutin qui relève de l’un de ces cas :',
    rules: PERIMETER_RULES,
    sourceTitle: 'Source et licence',
    source:
      "Les données viennent des fichiers « Scrutins » et « Acteurs, mandats et organes » de l'open data de l'Assemblée nationale (data.assemblee-nationale.fr). Elles sont publiées sous Licence Ouverte / Open Licence (Etalab) : source citée sur chaque page, avec la date d'extraction. Chaque page de scrutin renvoie à la page officielle de l'Assemblée.",
    limitsTitle: 'Limites à connaître',
    limitHand:
      "À main levée : seuls les votes par scrutin public sont enregistrés nominativement. Un texte adopté à main levée n'apparaît pas.",
    limitSchema:
      "Schéma : les groupes sont rangés d'un seul tenant dans l'ordre du plan officiel de l'Assemblée ; c'est un schéma simplifié, pas le plan exact de la salle (consultable sur le site de l'Assemblée).",
    limitCensure:
      "Motions de censure : l'Assemblée ne recense que les voix pour ; les autres députés n'ont pas voté la motion, ce qui n'est pas un vote contre.",
    limitDelegation:
      "Délégations : un député peut voter par délégation d'un collègue ; la page l'indique sans l'interpréter.",
    limitPoint:
      "Mises au point : un député peut publier après coup qu'il souhaitait voter autrement. Elle est affichée comme telle, et ne modifie ni le résultat ni les décomptes.",
    limitGroups:
      "Groupes : un groupe parlementaire n'est pas un parti. Le groupe affiché est celui du jour du scrutin.",
    orderTitle: "D'où vient cet ordre",
    order:
      "Les groupes sont rangés de la gauche à la droite de l'hémicycle selon le plan officiel de l'Assemblée nationale (assemblee-nationale.fr/dyn/vos-deputes/hemicycle, consulté le 18 novembre 2026) : LFI-NFP, GDR, ECOS, SOC, LIOT, DEM, EPR, HOR, DR, UDR, RN. Les non-inscrits (NI) viennent toujours en dernier, avec la mention « places dispersées dans la salle ». Les numéros de place de l'open data ne suivent pas cette disposition : ils ne servent pas à ordonner les groupes.",
    colors:
      "Couleurs : chaque groupe est dessiné de la couleur officielle que lui donne l'Assemblée nationale (plan de l'hémicycle, assemblee-nationale.fr/dyn/vos-deputes/hemicycle, consulté le 18 novembre 2026), la même règle pour tous. La couleur n'est jamais la seule information : le sigle de chaque groupe est écrit autour du schéma sur grand écran, et dans la liste des groupes sous le schéma sur petit écran.",
    neutrality:
      "Aucun taux de présence, de loyauté ou de cohésion, aucun classement, aucun score : la page montre les votes, pas un jugement sur les députés ou les groupes. Les couleurs sont celles de l'institution, pas un choix de Polithèque.",
    link: "Voir les votes de l'Assemblée",
    criteriaExcluded:
      'Les votes sur les amendements et sur les articles isolés, les motions de rejet rejetées et les autres motions de procédure ne sont pas repris.',
    limit493:
      "Article 49, alinéa 3 : un texte adopté par cette procédure n'est pas voté (il est considéré comme adopté, sauf si une motion de censure est adoptée) ; seules les motions de censure déposées en réponse apparaissent. Cette note est rappelée sur les motions de l'alinéa 3 et sur les votes sur une partie d'une loi de finances.",
    limitNonVoters:
      'Non-votants : quand la source en donne la cause (présidence de séance, membre du Gouvernement), elle est affichée dans la liste des députés.',
  },
  notes: {
    article493:
      "Quand le Gouvernement engage sa responsabilité sur un texte (article 49, alinéa 3), ce texte est considéré comme adopté sans vote, sauf si une motion de censure est adoptée. Un texte adopté ainsi n'a pas de vote final : seules les motions de censure déposées en réponse sont votées. Les autres votes sur un texte (une partie, un article) ont lieu normalement.",
    article493Source: 'Constitution du 4 octobre 1958, article 49 (texte en vigueur)',
    budgetMotions: 'Motions de censure déposées sur ce texte (article 49, alinéa 3)',
    budgetMotionItem: (numero: number, resultat: string) => `n° ${numero} : ${resultat}`,
  },
};
