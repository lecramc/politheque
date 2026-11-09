# Polithèque

Site neutre et non partisan pour comprendre la politique française : les institutions, les dix
principaux partis (histoire, idées, programme 2027, positions), la présidentielle 2027, les grands
débats et un questionnaire de positionnement.

**En ligne : https://politheque.revaamp.com**

## Principes

- **Aucune affirmation sans source datée.** Chaque information du site renvoie à ses sources ; les
  règles sont dans la [charte éditoriale](docs/charte-editoriale.md).
- **Même traitement pour tous les partis**, vérifié par des tests automatiques
  ([`data-integrity.test.ts`](src/programmes/__tests__/data-integrity.test.ts)).
- **Corrections publiques** : chaque modification des données est inscrite au
  [journal des corrections](https://politheque.revaamp.com/corrections).
- **Aucune donnée personnelle** : site statique, sans compte ni serveur ; les réponses du
  questionnaire ne quittent jamais le navigateur et ne sont jamais enregistrées.

## Signaler une erreur

Une source qui ne dit pas ce qu'on lui fait dire, une position mal codée, un oubli : ouvrez une
[issue](../../issues) avec la page concernée et, si possible, une source datée. Voir
[CONTRIBUTING.md](CONTRIBUTING.md).

## Développement

Expo (React Native Web) avec export web statique, Redux Toolkit, tests Vitest.

```bash
npm install
npm run web          # serveur de développement
npm run test:run     # tests, dont l'intégrité éditoriale des données
npm run build:web    # export statique dans dist/
```

Les données sont dans [`src/programmes/data/`](src/programmes/data/) (JSON). La méthode de
recherche et de codage est dans [`docs/`](docs/) : briefs de recherche, codage des positions,
méthode du questionnaire.

Certains documents de travail ne sont pas publiés (brouillons sur les procédures judiciaires
avant relecture juridique, maquettes, notes internes). Sans eux, un test de comparaison avec les
brouillons judiciaires est simplement sauté.

## Licences

- **Code** : [GNU AGPL 3.0](LICENSE). Une version modifiée mise en ligne doit publier son code.
- **Contenus** (textes, fiches, positions, données de `src/programmes/data/` et `docs/`) :
  [CC BY-SA 4.0](LICENSE-CONTENU.md), avec mention « Polithèque » et lien vers le site.
- Les sources citées restent la propriété de leurs auteurs ; les polices ont leur propre licence
  ([`public/assets/fonts/`](public/assets/fonts/)).
