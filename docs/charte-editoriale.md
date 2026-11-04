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
5. **Affaires judiciaires.**
   - Dans `description` : au plus **une** phrase factuelle par personne concernée, et seulement
     pour le candidat 2027 (« X fait l'objet de… » / « X a été condamné en… ; voir le détail
     de la candidature »).
   - Le détail complet (juridiction, dates, peines, recours, réactions) figure **une seule
     fois**, dans `candidacies.presidentielle-2027.candidate` et/ou dans `history.timeline`,
     sans répétition. La biographie du candidat 2027 n'y revient pas.
   - Pour les figures historiques qui ne sont pas candidates, la biographie peut mentionner
     une condamnation en une ou deux phrases factuelles (infraction, juridiction, date, peine,
     caractère définitif ou non).
   - On écrit « peine d'inéligibilité » quand il s'agit d'inéligibilité, pour qu'aucune peine ne
     puisse être confondue avec de la prison.
   - Pas de mention en creux (« aucune procédure n'a été identifiée ») : on ne parle que des
     procédures qui existent.
   - Quand des réactions sont citées (avocats, parties), on cite les deux parties ou aucune.
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
