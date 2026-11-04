# Charte éditoriale — Travée

Objectif : permettre de comprendre les programmes des principales forces politiques
pour la présidentielle 2027, **sans désinformation et sans orienter le lecteur**.

## Règles

1. **Aucune affirmation sans source.** Chaque mesure, chaque position au questionnaire,
   chaque chiffre clé porte au moins une source (titre, URL, date ISO, nature).
2. **Hiérarchie des sources** (de la plus forte à la plus faible) :
   `programme` (document officiel) > `vote` (scrutin public de l'Assemblée) >
   `proposition-de-loi` > `declaration` (propos du candidat ou d'un porte-parole officiel) >
   `presse` (média de référence rapportant la position, à défaut de source primaire).
3. **Programme 2027 pas encore publié ?** On l'indique clairement dans `programmeStatus`
   et on s'appuie sur le dernier programme officiel (législatives 2024, présidentielle 2022,
   européennes 2024) + déclarations récentes. Toujours dater : une position de 2022 est
   présentée comme telle.
4. **Pas de position inventée.** Si la position n'est pas publique ou pas tranchée,
   `stance: null` et la justification le dit (« Pas de position publique identifiée »).
   Une position `null` ne compte pas dans le calcul de proximité.
5. **Neutralité du vocabulaire.** On reprend les termes du parti entre guillemets quand
   ils sont connotés (« préférence nationale », « planification écologique »).
   Pas d'adjectifs évaluatifs (« irréaliste », « ambitieux », « dangereux »).
   Les critiques et coûts ne sont mentionnés que sourcés (Cour des comptes, instituts
   de chiffrage, économistes nommés), et pour tous les partis de la même façon.
6. **Même traitement pour tous.** Même nombre de thèmes, même format, même exigence de
   source. Couleurs d'identification seulement, ordre d'affichage alphabétique ou aléatoire.
7. **Recoupement des sources.**
   - **Histoire et idéaux d'un parti** : au moins 2 sources indépendantes (domaines différents),
     dont idéalement 1 source académique ou encyclopédique de référence (Sciences Po / CEVIPOF,
     Fondation Jean-Jaurès, Fondapol, Encyclopædia Universalis, Larousse, Vie-publique,
     ouvrages de politistes) et le texte du parti lui-même (statuts, charte, site officiel) pour
     ce qu'il revendique. Distinguer « le parti se définit comme… » et « les politistes le
     classent comme… ».
   - **Mesures et positions** : au moins 1 source primaire (programme, vote, déclaration), et
     autant que possible une 2e source indépendante qui la confirme (presse de référence,
     fact-checking, institut de chiffrage).
   - Le site affiche pour chaque information un niveau : **Recoupée** (≥ 2 domaines différents, dont au moins une source indépendante du parti :
     presse, source officielle ou scrutin public — deux sites du même camp ne suffisent pas),
     **Source unique** ou **Non sourcée** (interdit en production). Calcul :
     `src/programmes/models/verification.service.ts`.
   - En cas de **contradiction entre sources**, on ne tranche pas en silence : on cite les deux
     versions et on l'indique.
8. **Traçabilité.** Chaque fiche parti porte `lastVerified`. Toute correction est
   versionnée dans git.
   **Toute modification de fond d'une fiche parti met à jour son `lastVerified`** : cette date
   alimente le `<lastmod>` du plan du site, le `dateModified` des données structurées et la
   mention « Fiche vérifiée le… » affichée sur la page. Ne jamais la modifier pour une simple
   correction de forme (orthographe, mise en page), et ne jamais l'inventer : sans date de
   vérification réelle, la page n'a pas de `lastmod` (c'est le cas du guide « Comprendre », des
   thèmes et de l'élection tant qu'une revue datée n'y est pas inscrite dans `lastVerified`).
   Seules les entrées de journal de type `correction` et `mise-a-jour`, qui changent un fait, imposent
   cette re-vérification : leur date ne peut pas dépasser le `lastVerified` de la fiche. Une entrée
   `ajout` ou `retrait` (nouveau champ d'affichage repris de textes déjà sourcés, retrait d'un
   élément) n'avance pas `lastVerified`, puisqu'aucun fait n'a été re-vérifié.
   **Toute modification de fond est inscrite au journal public des corrections (`/corrections`,
   `src/programmes/data/corrections.json`)** par le trailer `Correction-publique:` du message de
   commit, dont le hook `commit-msg` vérifie la présence dès qu'un fichier de `src/programmes/data/`
   est modifié :
   - Forme : `Correction-publique: <type> | <pages ou auto> | <résumé public>`, une ligne par
     correction ; types : `correction` (une information publiée était inexacte), `mise-a-jour`
     (juste, mais la réalité a changé), `ajout`, `retrait`. Pour un commit de forme (orthographe,
     typographie, mise en page, source qui confirme un texte inchangé) : `Correction-publique: aucune`.
   - Le journal est écrit **avant** le commit par `npm run corrections:add -- "<type> | <pages> | <résumé>"`
     (git ne relit pas l'index après le hook `commit-msg`) ; le hook refuse le commit si l'entrée
     annoncée dans le trailer n'y figure pas.
   - Écriture du résumé (20 à 300 caractères) : participe passé, factuel ; dit ce qui change et, pour
     une correction, ce qui était affiché avant ; aucun adjectif évaluatif, aucune note de travail,
     aucun nom de contributeur ; dates en toutes lettres. Les listes de termes interdits des données
     s'appliquent.
   - Les entrées sont immuables : une erreur dans le journal se corrige par une nouvelle entrée.
   - Le journal commence à la mise en ligne publique, le 3 novembre 2026.

## Échelle des positions au questionnaire

| Valeur | Sens                                                      |
| ------ | --------------------------------------------------------- |
| `2`    | Mesure explicitement portée / revendiquée                 |
| `1`    | Plutôt favorable, avec nuances ou conditions              |
| `0`    | Position intermédiaire ou explicitement ni pour ni contre |
| `-1`   | Plutôt défavorable                                        |
| `-2`   | Explicitement opposé / a voté contre                      |
| `null` | Pas de position publique identifiée, ou parti divisé      |

## Calcul de proximité (questionnaire)

- Réponse utilisateur : -2 à +2 (« Pas d'avis » = question ignorée).
- Par parti : accord = 1 − |u − p| / 4 sur chaque question où le parti a une position,
  moyenne pondérée par l'importance déclarée par l'utilisateur (×1 ou ×2).
- Axes : moyenne de `réponse × direction` sur les questions rattachées à l'axe.
- Le résultat est affiché comme une **proximité**, jamais comme une consigne de vote.

## Règles de rédaction des fiches

Ces règles s'appliquent de la même façon aux dix fiches partis (`src/programmes/data/parties/*.json`).
Elles complètent les règles ci-dessus et portent sur tous les champs texte affichés (`family`,
`description`, `history.*`, `candidacies.*`, `stances.*.justification`).

1. **Aucune note de travail visible.** Les textes affichés ne contiennent ni historique de
   codage (« ramenée à null », « précédemment déduite »), ni renvoi aux règles internes
   (« conformément à la règle 4 »), ni compte rendu de recherche (« accès bloqué », « à vérifier »,
   « dans les sources consultées », « à date »). Une position non identifiée est justifiée en une
   phrase écrite pour le lecteur, par exemple : « Pas de déclaration explicite du candidat ni de
   vote de son groupe sur ce point. » ou « Le groupe s'est divisé : X pour, Y contre. »
   Les doutes de vérification vont dans `docs/a-verifier.md`, pas dans les fiches.
2. **Dates en toutes lettres** dans les textes : « 21 septembre 2026 », « 1er mai 2026 »,
   jamais « 2026-09-21 » ni « 21/09/2026 ». Le format ISO est réservé aux champs `date`.
3. **Étiquette politique (`family`) : un seul gabarit pour les dix partis.**
   « Étiquette usuelle (qui l'emploie : presse de référence / politistes / nuancier du ministère
   de l'Intérieur s'il y a lieu ; position du parti sur cette étiquette si elle est connue) ».
   Le premier segment (avant la parenthèse) est celui qu'affiche la puce « Famille » ; il est
   court et sans qualificatif. Le nuancier cité est celui des municipales de 2026, documenté
   dans le guide « Comment on classe les partis » (`guide.json`), avec lequel la fiche doit
   rester cohérente. Quand un parti conteste publiquement son étiquette, on l'écrit ; quand
   aucune prise de position n'est connue, on l'écrit aussi, de la même façon pour tous.
4. **Statuts de candidature** (`status`, `statusLabel`, `candidate`) :
   - `declare` (« Candidat déclaré » / « Candidate déclarée ») : la personne a publiquement
     annoncé qu'elle est candidate ;
   - `annonce` (« Candidature annoncée ») : la personne a dit qu'elle serait candidate mais
     réserve une déclaration formelle annoncée pour une date ultérieure ;
   - `investi` (« Candidat investi » / « Candidate investie ») : désigné par un vote de son parti
     ou par une primaire ;
   - `designe` (« Candidat désigné » / « Candidate désignée ») : désigné par une instance du
     parti, un vote des adhérents restant à venir (la date du vote est indiquée).
     Les libellés sont accordés en genre. `candidate` commence par le nom du candidat et
     rédige le statut en phrases, dates en toutes lettres, sans parenthèses imbriquées.
     La biographie (`history.figures`) utilise le même mot que le statut.
5. **Procédures judiciaires.**
   - Le détail des procédures figure **une seule fois**, dans la section « Procédures judiciaires »
     de chaque fiche (`src/programmes/data/affaires/<id>.json`, généré depuis `docs/affaires/` par
     `scripts/promote-affaires.mjs`). Périmètre des personnes, statuts et garde-fous :
     `docs/brief-affaires-judiciaires.md`. Même périmètre, même gabarit et même tri pour les dix
     partis ; la section existe pour les dix ou pour aucun.
   - Chaque entrée porte un **statut juridique exact** pris dans une liste fermée, la fonction au
     moment des faits, la qualification pénale, la juridiction, les dates, la peine exacte, les
     recours en cours, la date de sa dernière vérification et **au moins deux sources
     indépendantes** de domaines différents (presse nationale ou décision de justice ; une source du
     parti ne compte pas).
   - **Présomption d'innocence** : tant qu'aucune condamnation définitive n'est prononcée, le rappel
     est affiché à côté du statut. Il est généré par le site et n'est jamais écrit dans les données.
   - Une issue favorable (relaxe, acquittement, non-lieu, classement) est **toujours** indiquée
     lorsque la procédure a été rendue publique. Aucune procédure n'est laissée sans son issue connue.
   - Une procédure dont une étape est annoncée porte cette échéance (`nextStep`). Elle est mise à jour
     dans les dix jours suivant l'échéance ; au-delà, les tests et le build échouent.
   - Ailleurs dans la fiche, **au plus une phrase factuelle**, sans peine détaillée, terminée par un
     renvoi à la section, et seulement dans trois cas :
     1. `description` : le candidat 2027, s'il fait l'objet d'une entrée ;
     2. `candidacies.presidentielle-2027.candidate` : une procédure qui affecte la candidature
        elle-même (éligibilité, calendrier judiciaire avant le scrutin) ;
     3. `history.timeline` : une décision visant le parti lui-même (personne morale).
        Les biographies (`history.figures`) ne mentionnent pas les procédures.
   - Termes juridiques exacts : « mis en examen » (jamais « inculpé »), « déclaré coupable »,
     « peine d'inéligibilité » (jamais « inéligibilité » seule). Aucun terme de la liste
     `FORBIDDEN_LEGAL_TERMS` (« scandale », « sulfureux », « blanchi »…).
   - Pas de réactions des parties dans les entrées. Pas de total ni de classement entre partis.
   - Une condamnation amnistiée ou effacée par la réhabilitation n'est pas publiée sans avis
     juridique écrit.
6. **Descriptions de longueur comparable** (environ 400 à 700 caractères), dans cet ordre :
   fondation, direction, poids électoral récent (dernier résultat présidentiel ou européen,
   nombre de députés daté), une phrase sur la situation actuelle. Le reste va dans l'histoire.
   La première phrase présente le parti (elle est affichée seule dans l'en-tête).
7. **Contre-expertises et chiffrages critiques** (Institut Montaigne, OFCE, etc.) : appliqués à
   tous les partis de la même façon, ou à aucun. Pour cette version : **aucun**.
8. **Sources faibles.** Le texte affiché ne nomme ni Wikipédia ni un agrégateur (MonVote2027,
   Parlons Politique, France-Vote…) comme autorité : les sources restent dans les pastilles.
   Un fait qui ne repose que sur Wikipédia est retiré s'il est sensible.
9. **Précision des chiffres.** Résultats électoraux officiels à deux décimales
   (« 31,37 % », « 9,89 % »), suivis de « des suffrages exprimés » pour la présidentielle ;
   pas de double chiffre « selon les sources » quand le résultat officiel est connu. Une
   citation entre guillemets reprend le texte exact de la source, à l'identique partout.
10. **Titres courts.** Chaque idée (`history.ideals[]`) et chaque courant de pensée
    (`history.thought[]`) porte un `title` rédigé de 60 caractères au plus : un groupe nominal qui
    nomme le sujet sans rien affirmer (« Ce que disent ses statuts », « Classement par les
    encyclopédies », « Gaullisme », « Rapport au RN »), sans adjectif évaluatif, dans le même
    registre pour les dix partis. Le texte (`text`) reste intégral et sourcé. Dans les idées,
    chaque fiche commence par ce que le parti dit de lui-même (« Ce que dit… ») et contient
    **une seule** entrée « Classement par … » ; le nuancier du ministère de l'Intérieur, quand une
    décision de justice le concerne, a sa propre entrée « Nuancier du ministère de l'Intérieur ».
11. **Idées clés** (`keyIdeas`, bloc « Ce qu'il propose » de l'onglet « En bref »). C'est le seul endroit
    d'une fiche où l'on choisit ; le choix est encadré par les règles suivantes, appliquées de la même
    façon aux dix partis.
    - **Même gabarit, même nombre, même règle** : exactement 4 idées par parti, dans 4 thèmes
      différents. Si une fiche n'a pas 4 idées valides, le bloc n'est affiché pour aucun parti (il
      existe pour les dix ou pour aucun).
    - **Matière** : uniquement des mesures déjà présentes dans `candidacies.presidentielle-2027.themes`
      (`measureRefs`). Aucune reformulation n'ajoute un chiffre, une date ou une mesure.
    - **Formulation dans les termes du parti** : titre de 60 caractères au plus, au verbe à
      l'infinitif ; texte d'une phrase de 200 caractères au plus, qui dit ce qui change concrètement ;
      les termes connotés du parti restent entre guillemets (« priorité nationale », « remigration »,
      « saut fédéral européen ») ; aucun adjectif évaluatif.
    - **Priorité**, dans l'ordre : ce que le parti ou le candidat présente lui-même comme prioritaire
      d'après la fiche (« premier acte », « question centrale », thèmes « mis en avant », titre du
      programme) ; sinon une mesure liée à une question où sa position est explicite (`±2`) ; à
      égalité, la source la plus forte (règle 2), puis la plus récente.
    - **Ordre** : les 4 idées sont toujours triées dans l'ordre fixe des thèmes du site
      (`themes.json`), identique pour tous les partis. Pas de numéro, pas de classement : l'ordre ne dit
      rien du parti.
    - **Sources** : au moins 2 sources de domaines enregistrables distincts, dont au moins une
      indépendante du parti (presse, statistique, vote, justice) : le niveau « Recoupée » de
      `verification.service.ts`. Les sources d'une idée sont celles de ses mesures et celles des
      positions de ses questions liées (`relatedQuestionIds`) pour ce parti, déjà vérifiées dans la
      fiche ; aucune source n'est ajoutée pour l'occasion. Une idée qui n'atteint pas ce seuil n'est
      pas publiée, et n'est pas remplacée sans décision de l'éditeur. Le test d'intégrité est bloquant.
    - **Datation visible** : l'origine affichée (« Programme, mars 2022 ») est générée à partir des
      sources des mesures (la plus forte, puis la plus récente). L'âge d'une source n'est jamais réécrit.
    - **Contrôle croisé** : les 40 idées sont relues côte à côte, à l'aveugle (sans le nom du parti).
      Si un relecteur devine le parti à partir du ton plutôt que du contenu, la formulation est revue.
    - **Grandes questions** (bloc « Pour ou contre ? ») : pas de choix éditorial. Pour chaque thème,
      dans l'ordre du questionnaire, la première question à laquelle les dix partis ont une position
      non nulle ; la même liste pour tous.
