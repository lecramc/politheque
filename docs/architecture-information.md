# Architecture de l'information

Le site explique **la politique française** dans la durée. La présidentielle 2027 est une
rubrique d'actualité, pas le sujet du site.

## Rubriques

| Rubrique   | Route                                | Contenu                                                                                                                                                                             |
| ---------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accueil    | `/`                                  | Parcours citoyen en six étapes + bandeau d'actualité (présidentielle 2027, J-n)                                                                                                     |
| Étape      | `/parcours/[etape]`                  | Contenus d'une étape, état de lecture, suite conseillée (jamais verrouillée)                                                                                                        |
| Passeport  | `/passeport`                         | Tampons d'étape, détail partis et débats ; `noindex`, progression locale à l'appareil                                                                                               |
| Comprendre | `/comprendre`, `/comprendre/[id]`    | Guide pédagogique : institutions, pouvoirs du président, élections, voter, gauche/droite, UE, budget, désinformation (à étendre : collectivités, lexique, histoire des Républiques) |
| Partis     | `/partis`, `/partis/[id]`            | Fiches permanentes : histoire, idées, positions sur les grands débats, + candidature à l'élection en cours                                                                          |
| Élections  | `/elections`, `/elections/[id]`      | Une page par scrutin : dates, règles, candidatures et programmes. Aujourd'hui `presidentielle-2027` ; demain législatives, municipales, européennes                                 |
| Débats     | `/debats`, `/debats/[id]`            | Les grands débats (ex-« thèmes ») : enjeux, chiffres officiels, options, qui propose quoi                                                                                           |
| Me situer  | `/me-situer`, `/me-situer/resultats` | Questionnaire de positionnement : positions **des partis** (pas d'un scrutin)                                                                                                       |
| Méthode    | `/methodologie`                      | Charte, calculs, corrections                                                                                                                                                        |

## Modèle de données

```
Party            (permanent)  id, name, family, color, description, history, stances
Election         (par scrutin) id, type, title, rounds[], status, summary, sources
Candidacy        (parti × élection) candidate, candidacyStatus, programmeStatus, themes (mesures sourcées)
Theme (= débat)  (permanent)  context, keyFigures, debates
Question         (permanent)  affirmation du questionnaire, rattachée à un débat
GuideSection     (permanent)  pédagogie
```

- Une fiche parti JSON garde un seul fichier par parti (`data/parties/<id>.json`) :
  les candidatures y sont rangées sous `candidacies["presidentielle-2027"]`.
- Les métadonnées d'un scrutin sont dans `data/elections/<id>.json`.
- Les positions (`stances`) appartiennent au parti, pas au scrutin : elles décrivent ce que
  le parti défend, prouvé par programme, votes et déclarations.

## Extensions prévues

1. **Plus de partis** : tous les partis représentés au Parlement ou ayant présenté un candidat
   à la dernière présidentielle (MoDem, UDI, LO, NPA, Debout la France, UDR, Générations,
   PRG, Les Patriotes…), avec un niveau de détail adapté.
2. **Lexique** : 49.3, cohabitation, motion de censure, scrutin proportionnel…
3. **Élections passées** : résultats officiels sourcés (Conseil constitutionnel, ministère de l'Intérieur).
4. **Vie parlementaire** : grands votes de l'Assemblée et ce qu'ont voté les groupes.
