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
