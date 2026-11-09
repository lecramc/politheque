# Brief de recherche — pages candidat (présidentielle 2027)

> Rédigé le 9 novembre 2026 (audit SEO v2, § 4.3 et C-8). Aucune page candidat n'est publiée :
> les données actuelles ne suffisent pas. Ce brief dit ce qu'il faut chercher, sous quel format, et
> à quelles conditions publier. Lire d'abord `docs/charte-editoriale.md` (règle n° 1, règles 6 et 8).

## 1. Pourquoi aucune page n'est publiée aujourd'hui

Pour chaque parti, `candidacies["presidentielle-2027"]` contient seulement :

- le nom du candidat ou de la candidate (`candidateName`) ;
- le statut et son libellé daté (`status`, `statusLabel`, `candidate`) ;
- l'état du programme et les mesures par thème.

Il n'y a **ni parcours, ni mandats, ni candidatures passées**. Une page candidat bâtie sur ces seules
données répéterait l'onglet Programme de la fiche parti : contenu mince, en double, sans intérêt pour le
lecteur ni pour les moteurs. La règle « toutes en même temps, même gabarit » interdit aussi de publier
seulement les candidats les mieux documentés.

## 2. Périmètre

Une page par candidature enregistrée sur le site pour la présidentielle 2027, **quel que soit son
statut** (`declare`, `investi`, `designe`, `annonce`, `pressenti`). Le statut est affiché, daté et
sourcé, tel qu'il figure déjà dans la fiche parti. Au 3 novembre 2026, cela fait 10 pages :

| Parti               | Candidat ou candidate | Statut au 3 novembre 2026 |
| ------------------- | --------------------- | ------------------------- |
| Horizons            | Édouard Philippe      | Candidat déclaré          |
| La France insoumise | Jean-Luc Mélenchon    | Candidat déclaré          |
| Les Écologistes     | Marine Tondelier      | Candidate désignée        |
| Les Républicains    | Bruno Retailleau      | Candidat investi          |
| Nouvelle Énergie    | David Lisnard         | Candidat déclaré          |
| PCF                 | Fabien Roussel        | Candidat investi          |
| PS – Place publique | Raphaël Glucksmann    | Candidat investi          |
| RN                  | Marine Le Pen         | Candidate déclarée        |
| Reconquête          | Éric Zemmour          | Candidature annoncée      |
| Renaissance         | Gabriel Attal         | Candidat déclaré          |

Pourquoi tous les statuts : exclure deux partis sur dix de cette rubrique créerait une asymétrie
visible sur les fiches. Le statut daté suffit à informer le lecteur.

Une candidature retirée garde sa page, avec le statut « retirée le … » daté et sourcé.

## 3. Ce qu'il faut chercher, par candidat

Même liste de champs pour les dix, dans le même ordre. Un champ sans source n'est pas publié ; si un
champ manque pour un candidat, il manque pour la page de ce candidat **et le lot n'est pas publié**
tant que le champ n'est pas trouvé ou déclaré « sans objet » avec une règle commune (voir § 5).

1. **Identité** : nom d'usage, année de naissance (jamais la date complète ni le lieu, inutiles ici).
2. **Mandats et fonctions publiques**, du plus récent au plus ancien : intitulé exact, collectivité ou
   circonscription, date de début, date de fin (ou « en cours »). Seulement les mandats électifs
   nationaux et locaux exécutifs (maire, président d'exécutif local), les fonctions gouvernementales et
   les mandats européens. Pas de fonctions partisanes ici : elles vont au point 3.
3. **Responsabilités dans le parti** : intitulé, dates.
4. **Candidatures présidentielles passées** : année, résultat au premier tour (pourcentage des
   suffrages exprimés), qualification ou non au second tour, résultat du second tour le cas échéant.
5. **Parcours avant la politique** : formation et métier, en une phrase factuelle, seulement si une
   source primaire ou de référence le donne.
6. **Candidature 2027** : reprise exacte de `candidacies[...].candidate` (pas de nouveau texte).

Interdits : tout qualificatif (« charismatique », « clivant », « favori »…), les sondages, la vie
privée, les patrimoines (renvoyer seulement vers la déclaration HATVP si elle existe), les affaires
judiciaires (elles restent sur `/partis/[id]/procedures-judiciaires`, la page candidat y renvoie par un
lien identique pour tous).

## 4. Sources

Ordre de préférence, la première disponible l'emporte :

| Donnée                      | Source primaire                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Mandat de député            | fiche du député sur `assemblee-nationale.fr` (et `data.assemblee-nationale.fr` pour les anciens)            |
| Mandat de sénateur          | fiche sur `senat.fr`                                                                                        |
| Mandat européen             | fiche sur `europarl.europa.eu`                                                                              |
| Fonction gouvernementale    | décret de nomination et de fin de fonctions au Journal officiel (`legifrance.gouv.fr`)                      |
| Maire, exécutif local       | Répertoire national des élus (`data.gouv.fr`) ou site de la collectivité                                    |
| Résultat présidentiel passé | proclamation du Conseil constitutionnel (`conseil-constitutionnel.fr`) ; à défaut, ministère de l'Intérieur |
| Fonction partisane          | site du parti (date de la page), puis presse de référence                                                   |
| Déclarations HATVP          | `hatvp.fr` (lien seulement)                                                                                 |
| Parcours, formation         | biographie officielle (Assemblée, Sénat, Parlement européen, gouvernement), puis presse de référence        |

Wikipédia, Wikidata et les agrégateurs (`src/programmes/models/aggregators.ts`) servent de pistes,
jamais de source finale. L'identifiant Wikidata (`Q…`) est seulement relevé pour le `sameAs` du JSON-LD.

## 5. Format attendu

Un fichier par candidat : `docs/candidats/<slug>.json`, puis promotion vers
`src/programmes/data/candidats/` après revue (même circuit que les affaires).

```json
{
  "slug": "marine-le-pen",
  "partyId": "rn",
  "electionId": "presidentielle-2027",
  "name": "Marine Le Pen",
  "birthYear": 1968,
  "wikidata": "Q12927",
  "mandates": [
    {
      "label": "Députée du Pas-de-Calais (11e circonscription)",
      "start": "2017-06-21",
      "end": null,
      "sources": [
        {
          "title": "…",
          "url": "https://www.assemblee-nationale.fr/…",
          "date": "2026-11-…",
          "kind": "statistique"
        }
      ]
    }
  ],
  "partyRoles": [{ "label": "…", "start": "…", "end": "…", "sources": [] }],
  "pastPresidential": [
    { "year": 2022, "firstRound": 23.15, "qualified": true, "secondRound": 41.45, "sources": [] }
  ],
  "background": { "text": "…", "sources": [] },
  "lastVerified": "2026-11-…"
}
```

Les valeurs ci-dessus sont des exemples de forme, **à vérifier** : rien n'est à recopier sans source.

Règles communes, à écrire avant la recherche pour que tous les candidats soient traités pareil :

- **Mandats retenus** : depuis l'an 2000, ou tous si le candidat en a moins de cinq.
- **« Sans objet »** : un champ vide est permis s'il est vide pour une raison factuelle (aucune
  candidature présidentielle passée), jamais faute de source.
- **Dates** : ISO 8601 ; le mois seul (`AAAA-MM`) si la source ne donne pas le jour.

## 6. Page à construire ensuite (pour l'agent de code)

- Adresse : `/elections/presidentielle-2027/candidats/[slug]`, liée depuis la page de l'élection et
  depuis l'onglet Programme de la fiche parti (même libellé pour tous).
- Ordre : phrase de résumé datée (même gabarit que `page-summary.service.ts`), candidature 2027, mandats,
  responsabilités dans le parti, candidatures passées, parcours, liens (fiche parti, programme,
  procédures, HATVP), sources.
- JSON-LD : `Person` (`name`, `birthDate` limité à l'année, `memberOf` → `@id` du `PoliticalParty`,
  `sameAs` → Wikidata), aucun qualificatif.
- Tests à ajouter : mêmes champs pour les dix fichiers (`data-integrity`), gabarit identique et absence de
  mot évaluatif (comme `page-summary.test.ts`), chaque mandat sourcé et daté, sitemap et `lastmod`.
- Publication : **les dix pages dans le même commit**, avec l'entrée du journal des corrections
  (`npm run corrections:add`) et le trailer `Correction-publique:`.

## 7. Estimation

Environ 10 à 15 sources par candidat, soit une passe de recherche (modèle Opus) par lot de trois ou
quatre candidats, suivie d'une vérification croisée par un autre agent avant promotion.
