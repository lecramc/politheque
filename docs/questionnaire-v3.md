# Questionnaire v3 : positions manquantes et nouvelles affirmations

Date : 8 novembre 2026. Ce document met en œuvre le volet « données » (R1) et le volet « affirmations » (§ 6.3) de
`docs/audit-questionnaire.md`. Il s'appuie sur la charte éditoriale, sur `docs/brief-codage-positions.md`, sur
`docs/brief-verification-codage.md` et sur une règle ajoutée par l'éditeur le 8 novembre 2026 (§ 1.2).

**Aucun fichier de `src/` n'a été modifié, et rien n'a été commité.** Livrables :

- `docs/codage/positions-manquantes.json` : les positions de q01 à q34 qui changent (volet 1) ;
- `docs/codage/nouvelles-questions.json` : les 7 affirmations instruites (volet 2), avec leur définition, les dix
  positions, l'historique de vérification et un statut (`retained`) ;
- le présent document.

---

## Résumé

1. **Volet 1 : 7 positions manquantes sur 29 instruites ont pu être documentées.** Il s'y ajoute 2 justifications
   `null` corrigées. Les 4 positions de q23 n'ont pas été instruites, puisque q23 devait sortir du questionnaire.
   Les 20 autres positions restent `null` faute de source explicite, conformément à la règle 4 de la charte.
   Positions connues : 267 → 274 sur 300. Nouvelle Énergie passe de 19 à 23 sur 30, Reconquête de 23 à 25 sur 30.
2. **Volet 2 : 2 affirmations sur 5 sont retenues.** N2 (« réduire le nombre de fonctionnaires », 10 partis sur 10)
   et N5 (« encadrement des loyers », 8 sur 10). N1 (chasse le dimanche, 7 sur 10), N3 (privatisation de
   l'audiovisuel public, 5 sur 10) et N4 (abaya, 7 sur 10) passent sous le seuil de 8 sur 10 après vérification.
   Deux variantes proches (holding de l'audiovisuel public, signes religieux des accompagnateurs scolaires)
   atteignent 9 sur 10. Elles ne départagent presque aucune paire de partis voisins : elles sont soumises à
   l'éditeur, sans recommandation de les retenir.
3. **Conséquence : q14 et q23 restent en place par défaut**, puisque leurs remplaçantes ne sont pas retenues. Le
   questionnaire passe de 30 à 32 affirmations.
4. **Neutralité : le biais des positions manquantes n'est presque pas corrigé.** En population réaliste,
   Nouvelle Énergie arrive en tête pour 20,5 % des profils (22,4 % avant) et LR pour 1,3 % (1,0 % avant). La
   corrélation entre le nombre de positions connues et la part de premières places reste à −0,80 (−0,78 avant).
   Au test du point milieu, LR ne bat toujours pas NE (1 cas sur 98). Le levier « données » est presque épuisé
   avec des sources admises. La suite relève d'une décision de l'éditeur (§ 7).
5. **Vérification croisée.** Chaque position non nulle a été rouverte par un agent différent de celui qui l'a
   codée, sauf deux positions d'une variante (§ 5). Sur 84 contrôles, 53 ont confirmé la position, 27 l'ont
   corrigée (valeur, source ou justification) et 4 l'ont rejetée.

---

## 1. Méthode

### 1.1 Organisation

| Étape               | Agents     | Recherches web         | Périmètre                                                                      |
| ------------------- | ---------- | ---------------------- | ------------------------------------------------------------------------------ |
| Codage, volet 1     | A1, A2, A3 | 16 + 10 + 16           | A1 : NE (11) ; A2 : REC (7) ; A3 : PS, RE, HOR, PCF, ECO, RN (11)              |
| Codage, volet 2     | B1 à B5    | 14 + 14 + 15 + 15 + 14 | une affirmation chacun, dix partis                                             |
| Variantes           | B4v, B3v   | 9 + 4                  | variantes de N4 et de N3                                                       |
| Vérification        | V1 à V5    | 14 + 10 + 12 + 7 + 10  | V1 : volet 1 ; V2 : N1 et N2 ; V3 : N4 ; V4 : N5 ; V5 : N3                     |
| Contre-vérification | V6, V7     | 5 + 6                  | V6 : positions trouvées par V1 ; V7 : valeurs changées par V2 et V4, variantes |
| **Total**           | 17         | **191 / ~200**         |                                                                                |

Le quota a été réparti à l'avance à égalité de profondeur : environ 1,5 recherche par position à instruire, et
15 par affirmation nouvelle, soit 1,5 par parti. Une « recherche » est un appel à l'outil de recherche web. Ouvrir
une source connue (scrutin, programme, article) n'est pas compté. Wikipédia, les agrégateurs et les comparateurs
de programmes n'ont servi que de pistes. Les consignes communes aux agents sont dans le dossier de notes partagé
de la session : `consignes-v3-codage.md`, `consignes-v3-nouvelles.md`, `consignes-v3-verification.md`.

### 1.2 Règle de l'éditeur du 8 novembre 2026

> Une position ne peut être attribuée à un parti que sur la parole d'une personne qui en fait **aujourd'hui**
> partie et qui y exerce une fonction nationale, ou sur un texte, un vote ou un programme du parti lui-même.

Elle a été appliquée à toutes les positions de ce travail et à tous les partis. Effets :

- N4 : la position de LR reposait sur Éric Ciotti (2023), qui a quitté LR en 2024. Elle passe à `null` ;
- N3 : PS (Sylvie Robert, sénatrice) et Horizons (Philippe Patrier-Leitus, député rapporteur) passent à `null`,
  faute de fonction nationale dans le parti ;
- N5 : une citation d'Emmanuel Grégoire, maire de Paris, est retirée. La position du PS ne change pas, car elle
  repose sur la proposition de loi et les votes du groupe ;
- N4 : une citation de Sandrine Rousseau est retirée. La position des Écologistes ne change pas, car elle repose sur
  Cyrielle Chatelain, présidente du groupe ;
- Reconquête q33 : la citation tirée de l'éditorial de Nicolas Bay, qui a quitté le parti, est remplacée par le
  texte non signé du programme.

La règle n'a pas été appliquée rétroactivement aux 267 positions déjà publiées. Une revue de ces positions selon
cette règle reste à faire (§ 7, décision 9).

---

## 2. Volet 1 : positions manquantes

### 2.1 Positions documentées (7) et justifications corrigées (2)

| Question             | Parti               | Avant  | Après  | Fondement                                                                                                                                                                                       | Codé / vérifié par           |
| -------------------- | ------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| q13-renouvelables    | Nouvelle Énergie    | `null` | **−1** | Programme : il veut « mettre un terme à cette gabegie » des projets renouvelables « dérogatoires ». Nuance du 27 octobre 2026 : « Sans s'opposer aux énergies renouvelables ».                  | A1 / V1                      |
| q18-ukraine          | Nouvelle Énergie    | `null` | **+2** | Page du parti du 16 octobre 2026 : David Lisnard « demande de produire et de livrer des armes ». Une seule source, issue du parti.                                                              | A1 / V1 (source corrigée)    |
| q24-proportionnelle  | Nouvelle Énergie    | `null` | **−1** | Chronique dans L'Opinion, reprise par le parti le 9 octobre 2025 : à ceux qui veulent « introduire la proportionnelle intégrale », il répond « C'est une erreur. »                              | V1 / V6                      |
| q31-voile-sport      | Nouvelle Énergie    | `null` | **−2** | Tribune au Figaro du 7 mars 2025, alors qu'il était LR (il est aujourd'hui président et candidat de NE) : il salue l'interdiction des signes religieux en compétition votée par le Sénat.       | A1 / V1                      |
| q15-medecins         | Reconquête          | `null` | **−2** | Entretien d'Éric Zemmour au Quotidien du médecin, 1er avril 2022 : « Il n'est pas question de remettre en cause la liberté d'installation ». Position de 2022, datée comme telle.               | A2 / V1                      |
| q33-veto-europeen    | Reconquête          | `null` | **+2** | Programme européen 2024, « Les 92 propositions de Reconquête! » : refus de « supprimer le principe de l'unanimité », « préservation du droit de véto de la France ».                            | V1 / V6 (source à remplacer) |
| q20-defense-europe   | PCF                 | `null` | **−1** | Cahier « Paix & défense nationale » voté le 9 mai 2026 : il dénonce les « 800 milliards de dépenses militaires supplémentaires » et le plan « Rearm EU », qui inclut les 150 Md€ de prêts SAFE. | V1 / V6                      |
| q07-immigration      | PS – Place publique | `null` | `null` | Justification datée (24 mai 2026 : convention citoyenne sur l'immigration, sans objectif chiffré).                                                                                              | A3 / V1                      |
| q27-temps-de-travail | RN                  | `null` | `null` | Justification réécrite : l'ancienne citait Jordan Bardella sans source. Seule source retrouvée : Marine Le Pen en 2017 (« maintenir les 35h »), avec des allongements négociés.                 | A3 / V1, V6                  |

Règle appliquée de la même façon que pour les autres partis :

- q18 NE à +2 : une déclaration de campagne explicite en faveur des livraisons vaut +2, comme pour le PS, Horizons
  et Renaissance ;
- q24 NE à −1 : LR et Horizons sont à −2 parce qu'ils refusent la proportionnelle elle-même ; Lisnard ne refuse
  explicitement que la proportionnelle intégrale ;
- q20 PCF à −1 : même type de preuve que LFI et Reconquête (−1), qui ont voté contre un texte d'ensemble demandant
  d'explorer des obligations européennes de défense ;
- q15 REC à −2 sur une seule déclaration de 2022 : même règle que q29 pour Reconquête.

### 2.2 Positions qui restent inconnues (20)

| Parti               | Questions                         | Ce qui a été cherché                                                                                                                                                                                                                                                                                                                                                                |
| ------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nouvelle Énergie    | q05, q20, q26, q28, q29, q32, q33 | Plans du site du parti (unenouvelleenergie.fr) lus en entier ; entretiens et tribunes 2024-2026 ; discours de Bayeux (17 juin 2026). Le discours de Saint-Raphaël n'a pas pu être ouvert (erreur 403). Rien d'explicite sur le coup de pouce au SMIC, l'emprunt de défense, ArcelorMittal, la TVA sur l'électricité, le cannabis, l'adhésion de l'Ukraine ou l'unanimité dans l'UE. |
| Reconquête          | q06, q17, q26, q27, q28           | Programme 2022, budget2027.fr (Sarah Knafo), votes de Sarah Knafo au Parlement européen. Seul le RSA est traité (pas l'assurance chômage). Rien sur le privé sous contrat, ArcelorMittal, les 35 heures ou la TVA.                                                                                                                                                                  |
| PS – Place publique | q02, q28                          | Aucune déclaration de Raphaël Glucksmann sur la priorité à la baisse des dépenses. q28 : groupe partagé sur les trois scrutins (20 novembre 2025, 2 novembre 2026).                                                                                                                                                                                                                 |
| Écologistes         | q28                               | Votes du groupe divergents sur les mêmes scrutins, rien de Marine Tondelier.                                                                                                                                                                                                                                                                                                        |
| Renaissance         | q09, q27                          | Rien de Gabriel Attal sur la régularisation des métiers en tension. Sa « Constitution du travail » renvoie la durée du travail à la négociation, sans parler des 35 heures.                                                                                                                                                                                                         |
| Horizons            | q09                               | Quotas et « verrou Schengen » seulement.                                                                                                                                                                                                                                                                                                                                            |
| PCF                 | q29, q33                          | Rien de Fabien Roussel sur le cannabis depuis 2022. Le texte du 40e congrès sur les « peuples… souverains » ne dit rien explicitement du veto.                                                                                                                                                                                                                                      |
| RN                  | q27                               | Voir § 2.1.                                                                                                                                                                                                                                                                                                                                                                         |

Ces positions ne sont pas dans `positions-manquantes.json` : la fusion laisse leur texte actuel en place. Deux
justifications actuelles citent des faits sans source et sont à reprendre (charte, règle 1) :

- PCF q29 : la position de Roussel en 2022 et le vote du groupe GDR en juillet 2026 ;
- Reconquête q33 : la mention « vote du 22 octobre 2025 » n'a pas été retrouvée. La nouvelle position (+2)
  remplace de toute façon cette justification.

### 2.3 Couverture après le volet 1

| Parti | LFI | PCF | ECO | PS  | RE  | HOR | LR  | NE     | RN  | REC    |
| ----- | --- | --- | --- | --- | --- | --- | --- | ------ | --- | ------ |
| Avant | 29  | 27  | 29  | 26  | 27  | 28  | 30  | **19** | 29  | **23** |
| Après | 29  | 28  | 29  | 26  | 27  | 28  | 30  | **23** | 29  | **25** |

Questions encore sous 8/10 : **q28** (6/10, inchangée), q23 (6/10, non instruite), q27 (7/10), q33 (7 → 8/10,
désormais au seuil). q33 atteint le seuil grâce à Reconquête.

---

## 3. Volet 2 : nouvelles affirmations

### 3.1 Bilan

| #   | Affirmation                                                                                            | Identifiant                     | Partis documentés (codage → vérifié) | Statut                                      |
| --- | ------------------------------------------------------------------------------------------------------ | ------------------------------- | ------------------------------------ | ------------------------------------------- |
| N1  | Il faut interdire la chasse le dimanche.                                                               | `q35-chasse-dimanche`           | 8 → **7**                            | Non retenue                                 |
| N2  | Il faut réduire le nombre de fonctionnaires.                                                           | `q36-fonctionnaires`            | 10 → **10**                          | **Retenue**                                 |
| N3  | Il faut privatiser France Télévisions et Radio France.                                                 | `q37-audiovisuel-public`        | 9 → **5**                            | Non retenue                                 |
| N4  | Il faut continuer d'interdire l'abaya à l'école publique.                                              | `q38-abaya`                     | 8 → **7**                            | Non retenue                                 |
| N5  | Il faut continuer d'encadrer les loyers dans les villes où se loger coûte le plus cher.                | `q39-encadrement-loyers`        | 8 → **8**                            | **Retenue**                                 |
| N3v | Il faut regrouper France Télévisions, Radio France et l'INA dans une seule entreprise publique.        | `q40-holding-audiovisuel`       | 9 → **9**                            | Variante soumise à l'éditeur, non fusionnée |
| N4v | Les parents qui accompagnent les sorties scolaires ne devraient pas pouvoir porter de signe religieux. | `q41-accompagnateurs-scolaires` | 9 → **9**                            | Variante soumise à l'éditeur, non fusionnée |

Identifiants : aucun identifiant supprimé (`q03-charges`, `q11-police`, `q21-libre-echange`, `q22-vie-republique`)
n'est réutilisé. Chaque identifiant de `q35` à `q41` correspond à un seul énoncé. **Ceux des affirmations non
retenues (q35, q37, q38) sont à considérer comme réservés et à ne pas réutiliser pour un autre énoncé** : à
ajouter au commentaire de `questions.ts` et à `REMOVED` dans le script de fusion si l'on veut l'imposer.

### 3.2 N2 — `q36-fonctionnaires` (retenue, 10/10)

- **statement** : Il faut réduire le nombre de fonctionnaires.
- **shortLabel** : Réduire le nombre de fonctionnaires
- **theme** : `economie` · **axis** : `economique` · **direction** : `1`
- **help** : Fin 2024, 5,9 millions de personnes travaillent dans la fonction publique : 2,6 millions pour l'État,
  2,0 millions dans les collectivités locales et 1,25 million dans les hôpitaux et établissements médico-sociaux
  publics. Le projet de budget 2027 du gouvernement, en discussion au Parlement, prévoit environ 8 000 postes de
  plus dans les ministères, surtout dans l'éducation, les armées, la police et la justice, et 1 200 postes de moins
  dans les agences de l'État. Les partisans d'une baisse veulent réduire la dépense publique, ses opposants
  craignent un recul des services publics.
- Sources de l'aide : Insee Première n° 2094 (10 février 2026) ; Acteurs publics (1er octobre 2026) pour le projet
  de budget 2027. Vérifiée par V2.
- Critères de `questionnaire-v2.md` : une idée, langage simple, aucun adjectif évaluatif.

| Parti               | Position | Fondement principal                                                                                                                                   | Vérification               |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| LFI                 | −2       | Orientations budgétaires 2027 (octobre 2026) : « reconstruction des effectifs de fonctionnaires »                                                     | V2 confirmée               |
| PCF                 | −2       | Programme Roussel 2022 : « l'embauche de 500 000 nouveaux agents »                                                                                    | V2 confirmée               |
| Écologistes         | −2       | Contrat NFP 2024 (« rattrapage des postes manquants ») ; plan de titularisation (Acteurs publics, 17 juillet 2026)                                    | V2 (date corrigée)         |
| PS – Place publique | −2       | Contrat NFP 2024 seulement                                                                                                                            | V2 confirmée, fragile      |
| Renaissance         | +2       | Gabriel Attal, « 100 000 postes supprimés » (Acteurs publics, 3 juillet 2026)                                                                         | V2 confirmée               |
| Horizons            | +2       | Programme d'Édouard Philippe : non-remplacement d'un tiers des départs, « plus de 250 000 postes »                                                    | V2 confirmée               |
| LR                  | +2       | Bruno Retailleau au débat du Medef, « de 250 à 300 000 fonctionnaires » (Public Sénat, 27 août 2026)                                                  | V2 confirmée               |
| Nouvelle Énergie    | +2       | David Lisnard : « ne plus remplacer l'ensemble des 500 000 agents qui quittent chaque année la fonction publique » (Acteurs publics, 29 octobre 2026) | V2 (+1 → +2), V7 confirmée |
| RN                  | +2       | Plan budgétaire de la candidate (6 octobre 2026) : effectifs des collectivités et agences « réduits d'au moins 200.000 postes »                       | V2 confirmée               |
| Reconquête          | +2       | Plan « Budget 2027 » de Sarah Knafo, vice-présidente du parti : « non-remplacement de 800 000 départs administratifs »                                | V2 (justification)         |

Points d'attention :

- **RN à +2, contre −1 supposé par l'audit** : le plan budgétaire du 6 octobre 2026 contredit l'hypothèse.
- **Information apportée** : la question sépare RN et REC de la gauche, mais ne départage aucune paire voisine.
  Les dix partis ont le même signe que sur q02, et sa corrélation avec le score économique des autres questions est
  de 0,99. Elle renforce l'axe économique plus qu'elle ne départage. Elle reste utile pour l'équilibre des thèmes
  (fonction publique, sujet de campagne).
- PS (−2) repose sur le seul contrat NFP 2024. Il passera à −1 si le programme 2027 de Raphaël Glucksmann propose un
  redéploiement plutôt qu'une hausse.
- Reconquête : le site budget2027.fr porte la signature de Sarah Knafo, sans mention du parti ni date. Le titre
  « vice-présidente » est confirmé par Paris Match (18 février 2026) ; « vice-présidente exécutive » ne l'est pas.

### 3.3 N5 — `q39-encadrement-loyers` (retenue, 8/10)

- **statement** : Il faut continuer d'encadrer les loyers dans les villes où se loger coûte le plus cher.
  - Énoncé de l'audit : « … dans les grandes villes ».
  - Le codeur et le vérificateur recommandent tous deux la nouvelle formulation, plus exacte. Le dispositif couvre
    des communes volontaires en zone tendue, pas Marseille, Toulouse ni Nice.
  - Les positions codées portent sur le même dispositif et restent valables.
- **shortLabel** : Continuer d'encadrer les loyers dans les villes chères
- **theme** : `economie`. Un thème « logement » serait plus juste (décision 6).
- **axis** : `economique` · **direction** : `-1`
- **help** : Depuis 2019 à Paris, puis dans d'autres territoires (Lille, Lyon et Villeurbanne, Bordeaux,
  Montpellier, Grenoble, Plaine Commune, Est Ensemble, Pays basque), environ 70 communes plafonnent les loyers du
  parc privé, ce qui concerne 1,2 million de locataires selon la Cour des comptes. Cette expérimentation prend fin le
  24 novembre 2026 : le Sénat a voté le 21 octobre 2026, par 325 voix contre 17, sa prolongation de deux ans sans
  nouvelles villes, et l'Assemblée doit se prononcer le 18 novembre. Un rapport remis au gouvernement en mai 2026
  estime la baisse des loyers à 2 à 4 % dans les villes les plus tendues ; les opposants estiment que le
  plafonnement réduit le nombre de logements proposés à la location.
- Sources de l'aide : scrutin n° 25 du Sénat, dossier législatif de l'Assemblée, AFP, Banque des Territoires
  (Localtis). Vérifiée par V4. **À mettre à jour après le vote de l'Assemblée du 18 novembre 2026.**

| Parti               | Position | Fondement principal                                                                                                                                                                                                                 | Vérification                       |
| ------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| LFI                 | +2       | Assemblée, scrutin n° 4745 (11 décembre 2025, pérennisation et extension) : 30 pour                                                                                                                                                 | V4 confirmée                       |
| PCF                 | +2       | Scrutin n° 4745 (GDR) ; Sénat, scrutin n° 25 (21 octobre 2026, CRCE-K 18 pour)                                                                                                                                                      | V4 confirmée                       |
| Écologistes         | +2       | Scrutins n° 4745 (17 pour) et n° 25 (15 pour)                                                                                                                                                                                       | V4 confirmée                       |
| PS – Place publique | +2       | Auteur de la proposition de loi (Iñaki Echaniz) ; scrutins n° 4745 et n° 25                                                                                                                                                         | V4 (citation retirée, § 1.2)       |
| Renaissance         | 0        | Députés EPR contre la pérennisation (scrutin n° 4745), sénateurs RDPI pour la prolongation (scrutin n° 25). L'oratrice demande d'évaluer d'abord. Deux textes différents, chaque groupe uni : position intermédiaire, pas division. | V4 confirmée                       |
| Horizons            | −1       | Édouard Philippe au congrès de la FNAIM (décembre 2025) : « vous créez des problèmes » ; 6 contre au scrutin n° 4745                                                                                                                | V4 confirmée, source faible        |
| LR                  | −2       | Programme logement « Se loger mieux et moins cher ! » (mai 2026) : « Nous supprimerons l'encadrement des loyers ». Le candidat l'emporte sur le vote des sénateurs LR (119 pour la prolongation).                                   | V4 (+1 → −2), V7 (source primaire) |
| Nouvelle Énergie    | `null`   | Rien trouvé (3 recherches au total)                                                                                                                                                                                                 | V4 confirmée                       |
| RN                  | −2       | Scrutin n° 4745 : 28 contre ; seul groupe contre au Sénat (15 contre)                                                                                                                                                               | V4 confirmée                       |
| Reconquête          | `null`   | Rien trouvé (4 recherches au total)                                                                                                                                                                                                 | V4 confirmée                       |

Points d'attention :

- Renaissance passe de +1 (hypothèse de l'audit) à 0, Horizons de « 0 ? » à −1, LR de +1 à −2. L'audit supposait −2
  pour NE et REC : rien ne permet de les coder.
- La question sépare RE et HOR (0 et −1), LR et HOR (−2 et −1), et la gauche du centre.
- Horizons : aucun média national ne reprend les propos d'Édouard Philippe au congrès de la FNAIM. La seule source
  est Empruntis (site spécialisé). À remplacer si possible.

### 3.4 Affirmations non retenues

**N1 — chasse le dimanche (7/10).** Le texte de référence est le compte rendu n° 54 de la commission du
développement durable de l'Assemblée (29 mars 2023), sur la proposition de loi écologiste n° 886.

- Codage : LFI +2, Écologistes +2, PS +1, Renaissance −2, Horizons −2, LR −2, RN −2.
- Le PCF passe de −1 à `null` (V2) : la phrase de Fabien Roussel (22 mars 2022) ne vise ni le dimanche ni un jour
  sans chasse, et l'orateur communiste parlait « à titre personnel », le groupe GDR étant divisé.
- NE et Reconquête : rien d'explicite.
- Sans le PCF, la question perd sa raison d'être : départager LFI et le PCF.
- Le texte d'aide vérifié est dans le livrable : 92 accidents, dont 4 mortels, sur la saison 2025-2026 selon l'OFB.

**N3 — privatisation de France Télévisions et Radio France (5/10).**

- Confirmées : RN +2 (amendement CF1633 du 6 janvier 2026, cosigné par Marine Le Pen) et Reconquête +2 (plan de
  Sarah Knafo).
- Gauche : LFI −2 (amendement n° 105, juin 2025 : « transférer le service public de l'audiovisuel vers le domaine
  privé ») et Écologistes −2 (amendement AC782, capital incessible). Le PCF est ramené à −1.
- Le contrat NFP 2024 (« garantir la pérennité d'un service public de l'audiovisuel ») ne nomme pas la privatisation.
  Pris seul, c'est une déduction : il est resté en appui sans fonder de valeur.
- Passent à `null` : PS, LR, Renaissance et Horizons (règle de l'éditeur, § 1.2), ainsi que NE.
- LR : la seule source est une phrase de la rédaction de Public Sénat (« La privatisation, LR s'y est toujours
  refusé »). Elle relève de la presse qui rapporte une position (charte, règle 2). Le vérificateur l'a écartée en
  appliquant la règle du 8 novembre (décision 3).

**N4 — abaya à l'école publique (7/10).**

- Codage : LFI −2 (Mathilde Panot, 6 septembre 2026), PCF +2 (Roussel : « J'approuve cette décision », 2023),
  Écologistes −1 (Cyrielle Chatelain), Renaissance +2, Horizons +2, RN +2, Reconquête +2.
- LR passe à `null` (§ 1.2). Le programme école de LR (septembre 2026, p. 32) prévoit une laïcité « sans
  accommodement » et l'extension de la neutralité aux accompagnateurs, sans nommer l'abaya.
- PS et NE : rien.
- C'est l'affirmation qui départageait le mieux LFI et le PCF (−2 et +2). Elle reviendrait à 8/10 si l'éditeur juge
  le passage du programme LR explicite (décision 4).

### 3.5 Variantes (non fusionnées)

**N3v — `q40-holding-audiovisuel` (9/10).**

- Scrutin de référence : Assemblée, scrutin n° 2873 du 30 juin 2025, motion de rejet préalable de la proposition
  de loi créant la holding « France Médias », adoptée par 94 voix contre 38.
- Contre la holding (−2) : LFI, PCF, Écologistes, PS, RN et Reconquête (Sarah Knafo).
- Pour (+2) : Renaissance, Horizons et LR. NE : `null`.
- V7 a confirmé les 8 votes de groupe.
- La variante ne départage que LR et le RN, et le vote du RN est présenté par la presse comme tactique. Le RN reste
  à −2 : son groupe a voté uni, et son orateur a dit en séance « Cette réforme, ce n'est pas notre projet ».
- La source de Reconquête est un relais (Presse Agence) d'un entretien dont l'original n'a pas été retrouvé.
- Texte d'aide non vérifié par un second agent.

**N4v — `q41-accompagnateurs-scolaires` (9/10).**

- Scrutin de référence : Sénat, scrutin n° 98 du 30 mars 2021 (amendement Brisson), adopté par 177 voix contre 141.
- Pour l'interdiction (+2) : LR (programme de septembre 2026 et vote), NE (page laïcité du parti), RN (Marine Le
  Pen, 16 septembre 2026) et Reconquête.
- Contre (−2) : PS, Écologistes, PCF et Renaissance (vote de 2021). Horizons −1 (Édouard Philippe, 15 octobre
  2019). LFI : `null`.
- Reconquête à +2 repose sur une interdiction du voile « dans l'espace public », sans mention des sorties
  scolaires. C'est la même règle d'inclusion qu'en q31 ; sans elle, la variante reste à 8/10.
- **NE et RN n'ont pas été contre-vérifiés** (quota épuisé). Texte d'aide non vérifié par un second agent.
- La variante ne départage aucune paire voisine visée par l'audit : LR–NE et RN–REC sont tous à +2, ECO–PS à −2,
  et LFI est inconnu.

Les simulations (§ 6, S5) montrent que les deux variantes ne réduisent pas le biais. NE resterait en tête pour
21,2 % des profils.

---

## 4. Conséquences pour le site

1. **Questionnaire : 30 → 32 affirmations.** q36 et q39 s'ajoutent. q14 et q23 restent par défaut (décision 2).
   - Axe économique : 9 → 11 questions. Accord vers le pôle « Marché » : 4 + 1 (q36) ; vers le pôle
     « Redistribution » : 5 + 1 (q39).
   - L'équilibre reste donc le même : un écart d'une question, 5 contre 6.
2. **Lien personnel de résultats (`answer-link.service.ts`, code `v1`).** La liste `ANSWER_CODE_V1_IDS` est figée.
   Ajouter des questions impose un code `v2`, comme le prévoit le commentaire du fichier. Le test
   `answer-link.test.ts › should cover every question of the questionnaire in v1` échoue sans ce passage.
3. **Grille « Pour ou contre ? » : 7 → 8 questions, et 2 changent.** Elle est choisie automatiquement
   (`glanceQuestionIds`) : pour chaque thème, la première question où les dix partis ont une position.

   | Thème        | Avant                | Après                   | Raison                      |
   | ------------ | -------------------- | ----------------------- | --------------------------- |
   | economie     | q01-isf              | q01-isf                 | –                           |
   | travail      | q04-retraite         | q04-retraite            | –                           |
   | immigration  | q08-preference       | q08-preference          | –                           |
   | securite     | q10-peines-planchers | q10-peines-planchers    | –                           |
   | ecologie     | q12-nucleaire        | q12-nucleaire           | –                           |
   | sante        | q16-fin-de-vie       | **q15-medecins**        | REC désormais connu sur q15 |
   | europe       | q19-droit-europeen   | **q18-ukraine**         | NE désormais connu sur q18  |
   | institutions | –                    | **q24-proportionnelle** | NE désormais connu sur q24  |
   | education    | –                    | –                       | q17 : REC toujours inconnu  |

   Deux tests codent la liste en dur : `data-integrity.test.ts › should expose the same 7 great questions` et
   `key-ideas-neutrality.test.ts › should ask the same 7 questions of every party`. Ils sont à mettre à jour, ainsi
   que tout texte qui annonce « 7 questions ». q15 et q18 sont des questions transversales (`axis: null`) : à
   relire pour l'équilibre du bloc (décision 7).

4. **Idées clés (`keyIdeas`).** LR (« Réduire l'immigration par référendum ») et RN (« Instaurer la « priorité
   nationale » ») citent q23 dans `relatedQuestionIds`. Ils ne sont pas touchés tant que q23 reste. Si l'éditeur
   retire q23, il faut retirer `q23-referendum` de ces deux listes et revérifier le niveau « Recoupée » des deux
   idées, qui s'appuie aussi sur les sources des questions liées. Aucune idée clé ne cite q14. Aucune ne cite une
   question modifiée par le volet 1.
5. **Carte des positions.** q36 et q39 sont rattachées à l'axe économique. Leurs corrélations avec le score
   économique des autres questions valent 0,99 et 0,93 : elles vont dans le bon sens et aucune inversion n'est
   nécessaire.
6. **Journal des corrections.** Le volet 1 change des positions publiées. Entrées à prévoir : 7 `ajout` (une par
   position documentée) et 2 `correction` (justifications de PS q07 et RN q27). Le volet 2 demande 2 `ajout`. Les
   types sont donnés à titre indicatif : la session principale rédige les entrées.

---

## 5. Vérification croisée

| Vérificateur | Périmètre                                | Contrôles | Confirmées | Modifiées | Rejetées | Recherches |
| ------------ | ---------------------------------------- | --------- | ---------- | --------- | -------- | ---------- |
| V1           | volet 1 (A1, A2, A3) et pistes laissées  | 12        | 7          | 5         | 0        | 14         |
| V2           | N1, N2                                   | 20        | 15         | 5         | 0        | 10         |
| V3           | N4                                       | 10        | 3          | 7         | 0        | 12         |
| V4           | N5                                       | 10        | 8          | 2         | 0        | 7          |
| V5           | N3                                       | 10        | 2          | 4         | 4        | 10         |
| V6           | positions trouvées par V1                | 4         | 2          | 2         | 0        | 5          |
| V7           | valeurs changées par V2 et V4, variantes | 18        | 16         | 2         | 0        | 6          |

« Modifiée » couvre aussi les changements de source ou de justification à valeur constante.

Changements de valeur :

| Question | Parti | Avant | Après  |
| -------- | ----- | ----- | ------ |
| q35      | PCF   | −1    | `null` |
| q36      | NE    | +1    | +2     |
| q37      | PCF   | −2    | −1     |
| q37      | PS    | −2    | `null` |
| q37      | RE    | −2    | `null` |
| q37      | HOR   | −1    | `null` |
| q37      | LR    | −2    | `null` |
| q38      | LR    | +2    | `null` |
| q39      | LR    | +1    | −2     |

Chaque position non nulle de `positions-manquantes.json` et des deux questions retenues a été rouverte par au moins
un agent qui ne l'avait pas codée. Les nouvelles valeurs trouvées par un vérificateur ont été contre-vérifiées par
un troisième agent (V6, V7). **Exception : q41, positions de NE et du RN, non contre-vérifiées.**

Sources faibles qui restent, à remplacer si possible :

- Reconquête q33 : PDF du programme 2024 hébergé seulement par ojim.fr ;
- Horizons q39 : Empruntis ;
- Reconquête q36 et q37 : budget2027.fr, sans mention du parti ;
- q38, non retenue : TSA Algérie et Arab News.

Plusieurs pages n'ont pas pu être ouvertes (erreur 403 : PAP.fr, Europe 1, Le Figaro, VL Média). Aucune position ne
repose uniquement sur une page fermée.

---

## 6. Simulations de neutralité

Scripts : ceux de l'audit (`load.py`, `core.py`, `engine.py`, `profiles.py`), repris sans modification, plus
`v3.py`. Mêmes graines, mêmes populations : 40 000 profils réalistes (modèle à deux facteurs) ou uniformes. Les
réponses des profils types aux nouvelles questions sont celles de l'audit (`a7.py`, `a9.py`), plus deux pour les
variantes. Le scénario S0 reproduit exactement les chiffres de l'audit.

| Scénario                                                             | Questions |
| -------------------------------------------------------------------- | --------- |
| S0 : avant (état actuel)                                             | 30        |
| S1 : volet 1 seul                                                    | 30        |
| **S2 : volet 1 + N2 + N5 (proposition de ce document)**              | **32**    |
| S3 : S2 sans q23                                                     | 31        |
| S4 : S2 + retrait vers 50 % (k0 = 3) et tri sur le score non arrondi | 32        |
| S5 : S2 − q23 + les deux variantes                                   | 33        |
| S6 : plan de l'audit avec les positions vérifiées                    | 33        |

### 6.1 Part des premières places (population réaliste, %)

| Scénario | LFI | PCF  | ECO | PS   | RE   | HOR  | LR  | NE       | RN  | REC  | Écart < 3 pts | Égalité exacte |
| -------- | --- | ---- | --- | ---- | ---- | ---- | --- | -------- | --- | ---- | ------------- | -------------- |
| S0       | 7,8 | 13,0 | 6,5 | 15,6 | 9,0  | 10,9 | 1,0 | **22,4** | 6,2 | 7,5  | 48 %          | 11 %           |
| S1       | 7,7 | 13,2 | 6,5 | 14,9 | 8,9  | 10,8 | 1,7 | 19,8     | 7,7 | 8,7  | 49 %          | 11 %           |
| **S2**   | 7,8 | 13,0 | 6,5 | 15,2 | 9,8  | 10,3 | 1,3 | **20,5** | 6,7 | 9,1  | 50 %          | 11 %           |
| S3       | 6,1 | 14,9 | 7,3 | 14,4 | 9,8  | 10,3 | 1,5 | 19,6     | 6,6 | 9,3  | 49 %          | 11 %           |
| S4       | 6,8 | 13,6 | 6,4 | 15,3 | 11,2 | 9,4  | 1,9 | 17,8     | 7,1 | 10,5 | 66 %          | 1 %            |
| S5       | 7,7 | 13,7 | 7,3 | 13,7 | 8,7  | 11,5 | 1,4 | 21,2     | 6,5 | 8,2  | 51 %          | 12 %           |
| S6       | 5,5 | 16,2 | 6,9 | 14,9 | 9,7  | 10,5 | 1,7 | 19,6     | 5,9 | 9,0  | 46 %          | 10 %           |

Critère de l'audit : aucun parti ne gagne plus de 2,5 points, sauf correction d'un biais déjà mesuré.

- **Respecté par S1, S2, S3 et S5.** De S0 à S2, la plus forte hausse est celle de Reconquête (+1,6), la plus forte
  baisse celle de NE (−1,9), qui est la correction attendue.
- **Dépassé par S4** (Reconquête +3,0, Renaissance +2,2) : le retrait vers 50 % favorise les partis voisins des
  partis peu documentés.
- **Dépassé par S6** (PCF +3,2) : avec N1 et N4, LFI perd l'avantage que lui donnait son silence sur q23, et le PCF
  en profite.

### 6.2 Corrélation entre positions connues et premières places

| Scénario | Réaliste  | Uniforme |
| -------- | --------- | -------- |
| S0       | −0,78     | −0,36    |
| S1       | −0,80     | −0,25    |
| **S2**   | **−0,80** | −0,19    |
| S3       | −0,73     | −0,23    |
| S4       | −0,80     | −0,23    |
| S5       | −0,74     | −0,17    |

En population uniforme, l'effet des silences s'atténue nettement (−0,36 → −0,19). En population réaliste, il reste
entier, parce qu'il se concentre sur deux paires très proches, LR–NE et RN–REC. Dans 59 % des cas, le premier est
toujours comparé sur moins de questions que le deuxième.

### 6.3 Partis voisins

Questions qui séparent la paire d'au moins 2 points / questions comparables, et test du point milieu
(A gagne / B gagne, sur 100 ; un calcul neutre donnerait 50/50) :

| Paire     | S0 : séparatrices | S2 : séparatrices | S0 : point milieu | S2 : point milieu |
| --------- | ----------------- | ----------------- | ----------------- | ----------------- |
| LFI–PCF   | 2 / 26            | 2 / 29            | 28 / 61           | 35 / 53           |
| ECO–PS    | 2 / 26            | 2 / 28            | 12 / 81           | 12 / 82           |
| RE–HOR    | 2 / 27            | 2 / 29            | 49 / 39           | 52 / 37           |
| HOR–LR    | 8 / 28            | 8 / 30            | 64 / 29           | 63 / 28           |
| **LR–NE** | **1 / 19**        | **1 / 24**        | **0 / 100**       | **1 / 98**        |
| RN–REC    | 2 / 23            | 2 / 26            | 4 / 94            | 6 / 90            |
| RN–NE     | 2 / 18            | 4 / 23            | 1 / 98            | 6 / 91            |
| REC–NE    | 1 / 15            | 3 / 21            | 19 / 76           | 34 / 58           |
| LR–REC    | 3 / 23            | 4 / 26            | 3 / 95            | 4 / 94            |
| LR–RN     | 8 / 29            | 8 / 31            | 37 / 54           | 35 / 55           |

- Progrès : REC–NE et RN–NE, où les positions nouvelles de NE et de Reconquête créent des questions séparatrices.
  LFI–PCF se rapproche de l'équilibre au point milieu.
- Pas de progrès sur **LR–NE**. Une seule question les sépare sur 24 comparables (q15, installation des médecins).
  Les positions connues de NE sont presque toutes celles de LR. NE gagne donc par ses 8 silences restants (q05,
  q20, q26, q28, q29, q32, q33, q39).
- RN–REC et ECO–PS restent nettement déséquilibrés au point milieu, pour la même raison : REC a 5 inconnues de plus
  que le RN, le PS 3 de plus que les Écologistes.

### 6.4 Profils types et récupération

- Les dix profils restent dans le bloc attendu dans tous les scénarios.
- En S2, « droite conservatrice » donne toujours NE devant LR (+1). En S1 et S4, les deux sont à égalité.
- « Mixte populaire » passe de RN +1 à RN +2, et « droite libérale » de HOR +1 à HOR +2.
- Récupération du parti d'origine (sympathisant bruité) : minimum LR 88 % en S2 (87 % avant), les autres de 97 à
  99 %.

### 6.5 Corrections par le calcul (S2, pour éclairer la décision 1)

| Traitement des positions inconnues | LR   | NE   | Écart < 3 pts | Point milieu LR–NE | Point milieu RN–REC | Corrélation (réaliste) |
| ---------------------------------- | ---- | ---- | ------------- | ------------------ | ------------------- | ---------------------- |
| Ignorées (actuel)                  | 1,3  | 20,5 | 50 %          | 1 / 98             | 6 / 90              | −0,80                  |
| Retrait k0 = 3, sans arrondi       | 1,9  | 17,8 | 66 %          | 3 / 97             | 11 / 89             | −0,80                  |
| Retrait k0 = 6, sans arrondi       | 3,2  | 16,0 | 71 %          | 5 / 95             | 14 / 86             | −0,76                  |
| Comptées comme 50 % d'accord       | 18,5 | 1,2  | 55 %          | 63 / 30            | 59 / 32             | +0,90                  |

Le retrait léger (k0 = 3), recommandé par l'audit en filet de sécurité (R10), corrige peu. Il tasse les écarts :
66 % des utilisateurs ont alors moins de 3 points entre les deux premiers. Compter une position inconnue comme
50 % d'accord inverse le biais : Nouvelle Énergie tombe à 1,2 %. Comme l'audit, ces résultats montrent qu'aucune
formule ne corrige proprement le biais. Il relève de la présentation (R4 groupe de tête, R5 seuil relatif, R6
« ce qui les départage ») plus que du calcul.

---

## 7. Décisions restantes pour l'éditeur

1. **Le biais des silences subsiste** : NE à 20,5 %, LR à 1,3 %. Trois options :
   - (a) traiter la présentation en priorité (R3 à R6 de l'audit) ;
   - (b) appliquer en plus le retrait k0 = 3 (R10), annoncé dans la méthodologie ;
   - (c) n'afficher un parti dans le classement que s'il est comparé sur au moins 80 % des réponses de l'utilisateur.

   Recommandation : (a). R10 se déclenche de toute façon : NE reste sous 24 positions connues sur 30 (23 après le
   volet 1).

2. **q14 et q23.** Leurs remplaçantes ne sont pas retenues. Options :
   - garder les deux (choix par défaut de ce document) ;
   - retirer q23 seule, qui est sous le seuil (6/10) et redondante (S3). LFI baisse alors de 1,7 point, le PCF
     monte de 1,9 : c'est la fin d'un avantage du silence ;
   - retirer q23 et la remplacer par la variante holding (S5).

   q14 est redondante mais complète (10/10) : la garder ne crée pas de biais.

3. **N3, position de LR.** Admettre ou non la phrase de la rédaction de Public Sénat (« La privatisation, LR s'y est
   toujours refusé »). La charte (règle 2) admet la presse qui rapporte une position ; la règle du 8 novembre exige la
   parole d'un membre ou un texte du parti. Même l'admettre ne suffit pas : N3 passerait à 6/10.
4. **N4, position de LR.** Admettre ou non le programme école de LR (laïcité « sans accommodement », sans le mot
   « abaya ») comme une position explicite. Si oui, N4 revient à 8/10 et peut être retenue. C'est l'affirmation qui
   départage le mieux LFI et le PCF.
5. **Variantes q40 et q41** : à retenir ou non. Elles ne départagent presque aucune paire voisine. Recommandation :
   ne pas les retenir. q41 : admettre ou non Reconquête à +2 sur une interdiction du voile « dans l'espace public ».
6. **Thème de q39** : `economie` ou un nouveau thème « logement ». Un nouveau thème changerait la grille « Pour ou
   contre ? », les filtres et l'ordre des thèmes (`themes.json`).
7. **Grille « Pour ou contre ? »** : accepter qu'elle passe à 8 questions, avec q15 et q18 à la place de q16 et q19,
   ou figer la liste.
8. **Énoncé de q39** : « dans les villes où se loger coûte le plus cher » (recommandé) ou « dans les grandes
   villes » (audit).
9. **Règle du 8 novembre sur les positions déjà publiées.** Elle n'a été appliquée qu'aux positions de ce travail.
   Une revue des 267 positions existantes permettrait de l'appliquer partout de la même façon (charte, règle 6). Elle
   demanderait un quota de recherche propre.
10. **Sources faibles** (§ 5) à remplacer avant publication, et **texte d'aide de q39** à mettre à jour après le
    vote de l'Assemblée du 18 novembre 2026.

---

## 8. Intégration (pour la session principale)

**Ne pas lancer `scripts/merge-codage.mjs` tel quel.** Il relit tous les fichiers de `docs/codage/`, et plusieurs
d'entre eux sont en retard sur les fiches : LFI q04, q05, q19 et Écologistes q04, mis à jour au commit `409f6c2`. Les
réappliquer annulerait ces mises à jour. Il échouerait d'ailleurs sur les deux nouveaux fichiers, dont le format
diffère :

- tableau de questions ;
- `partial: true` dans `positions-manquantes.json`, où seuls les partis présents sont écrits ;
- champ `retained` dans `nouvelles-questions.json`.

Un script dédié, qui n'applique que ces deux fichiers, a été écrit et testé :
`/private/tmp/claude-501/-Users-clementmarcel-Documents-Development-programmes-2027/b758f72e-ca71-4a39-abcf-cbaf7b106ae5/scratchpad/merge-v3.mjs`
(`node merge-v3.mjs <racine du dépôt>`). Il écrit les 9 positions du volet 1 et les 10 positions des questions
`retained: true`, puis ignore les champs de travail (`verification`, `definition`, `notes`). À copier dans
`scripts/` si on le garde. Il faut aussi :

1. ajouter `q36-fonctionnaires` et `q39-encadrement-loyers` à `questions.ts`, à partir de `definition` dans
   `nouvelles-questions.json`. Dans le test, elles ont été placées en fin de bloc économie, avant q04 ;
2. passer le lien de résultats en `v2` (§ 4.2) ;
3. mettre à jour les deux tests de la grille (§ 4.3) ;
4. rédiger les entrées du journal des corrections (§ 4.6).

**Essai sur une copie du dépôt** (hors dépôt, avec les données fusionnées et les deux questions ajoutées) :
`npx vitest run` donne 748 tests réussis et 3 en échec, tous attendus. Ce sont `answer-link` v1 (§ 4.2) et les deux
tests de la grille de 7 questions (§ 4.3). Les tests de la charte (`data-integrity`) passent pour tout le reste :
sources, termes interdits, dates, format.

Les 2 tests de `results-presentation.test.ts` qui échouent aujourd'hui dans le dépôt de travail échouent sans
aucune donnée de ce volet. Ils viennent du travail en cours non commité sur la présentation des résultats.

Fichiers de travail (hors dépôt), dans
`/private/tmp/claude-501/-Users-clementmarcel-Documents-Development-programmes-2027/b758f72e-ca71-4a39-abcf-cbaf7b106ae5/scratchpad/` :

- `codage/` : sorties brutes des codeurs, avec les passages cités (`evidence`) et les requêtes (`searched`) ;
- `verif/` : rapports des vérificateurs ;
- `assemble.py` : construit les livrables ;
- `sim/v3.py` et `sim-final.txt` : simulations et résultats complets ;
- `final/restent-null.json` : les 20 positions toujours inconnues, avec leur justification proposée.
