# Architecture de l'information

> **Simplification v2 :** trois rubriques (Comprendre, Partis, Me situer) ; Débats et Comparer sont dans Partis, Élections est la pastille « 2027 ». Fiche parti à 4 onglets (Programme, Positions, Histoire, Procédures). Voir `docs/ux/spec-simplification-v2.md`.

Le site explique **la politique française** dans la durée. La présidentielle 2027 est une
rubrique d'actualité, pas le sujet du site.

## Rubriques

| Rubrique   | Route                                        | Contenu                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accueil    | `/`                                          | Quatre tâches, les dix partis en accès direct, carte « Le parcours » ; pastille « 2027 · J-n » dans l'en-tête                                                                                                                                                                  |
| (retirée)  | `/parcours/[etape]`                          | Redirigée vers `/comprendre#…`, `/partis`, `/partis#debats` ou `/me-situer` (301)                                                                                                                                                                                              |
| Passeport  | `/passeport`                                 | Tampons d'étape, détail partis et débats ; `noindex`, progression locale à l'appareil                                                                                                                                                                                          |
| Comprendre | `/comprendre`, `/comprendre/[id]`            | Guide pédagogique : institutions, pouvoirs du président, élections, voter, gauche/droite, UE, budget, désinformation (à étendre : collectivités, lexique, histoire des Républiques)                                                                                            |
| Assemblée  | `/assemblee`, `/assemblee/scrutins/[numero]` | **Rattachée à Comprendre** (carte d'entrée sur `/comprendre`, rubrique Comprendre allumée) : les grands votes de la 17e législature (open data de l'Assemblée nationale), du plus récent au plus ancien, avec le vote de chaque groupe et de chaque député. Pas de 4e rubrique |
| Partis     | `/partis`, `/partis/[id]`                    | Fiches permanentes : histoire, idées, positions sur les grands débats, + candidature à l'élection en cours                                                                                                                                                                     |
| Élections  | `/elections`, `/elections/[id]`              | Une page par scrutin : dates, règles, candidatures et programmes. Aujourd'hui `presidentielle-2027` ; demain législatives, municipales, européennes                                                                                                                            |
| Débats     | `/debats`, `/debats/[id]`                    | Les grands débats (ex-« thèmes ») : enjeux, chiffres officiels, options, qui propose quoi                                                                                                                                                                                      |
| Me situer  | `/me-situer`, `/me-situer/resultats`         | Questionnaire de positionnement : positions **des partis** (pas d'un scrutin)                                                                                                                                                                                                  |
| Méthode    | `/methodologie`                              | Charte, calculs, corrections                                                                                                                                                                                                                                                   |

## Modèle de données

```
Party            (permanent)  id, name, family, color, description, history, stances
Election         (par scrutin) id, type, title, rounds[], status, summary, sources
Candidacy        (parti × élection) candidate, candidacyStatus, programmeStatus, themes (mesures sourcées)
Theme (= débat)  (permanent)  context, keyFigures, debates
Question         (permanent)  affirmation du questionnaire, rattachée à un débat
GuideSection     (permanent)  pédagogie
Scrutin          (open data AN, généré)  numéro, date, titre officiel, catégorie, résultat, décompte par groupe ;
                 détail nominatif (un fichier par scrutin) et annuaire des députés chargés côté client
```

- Une fiche parti JSON garde un seul fichier par parti (`data/parties/<id>.json`) :
  les candidatures y sont rangées sous `candidacies["presidentielle-2027"]`.
- Les métadonnées d'un scrutin sont dans `data/elections/<id>.json`.
- Les positions (`stances`) appartiennent au parti, pas au scrutin : elles décrivent ce que
  le parti défend, prouvé par programme, votes et déclarations.
- Les scrutins de l'Assemblée (`src/assemblee/data/`, `public/donnees/assemblee/v1/`) sont
  **générés** par `scripts/assemblee-scrutins.mjs` depuis l'open data de l'Assemblée nationale
  (Licence Ouverte) et jamais édités à la main. On vote par **groupe** et par député, jamais par
  parti : aucun lien automatique avec les fiches des partis en v1. Un scrutin cité dans les sources
  d'une fiche affiche « Ce vote est cité dans : fiche X » (lecture seule du catalogue).

## Extensions prévues

1. **Plus de partis** : tous les partis représentés au Parlement ou ayant présenté un candidat
   à la dernière présidentielle (MoDem, UDI, LO, NPA, Debout la France, UDR, Générations,
   PRG, Les Patriotes…), avec un niveau de détail adapté.
2. **Lexique** : 49.3, cohabitation, motion de censure, scrutin proportionnel…
3. **Élections passées** : résultats officiels sourcés (Conseil constitutionnel, ministère de l'Intérieur).
4. **Vie parlementaire** : grands votes de l'Assemblée et ce qu'ont voté les groupes.
   **v1 livrée** : votes sur l'ensemble d'un texte, sur l'article unique d'un projet ou d'une
   proposition de loi, scrutins solennels et motions de censure (≈ 286 scrutins de la 17e
   législature). Hors v1 : amendements et articles isolés, pages par député, table groupe ↔ parti
   (v1.1), bloc « votes de son groupe » sur les fiches partis (v2, après la refonte des fiches).
