# Contribuer à Polithèque

Merci de vouloir améliorer le site. Polithèque doit rester neutre : chaque contribution est jugée
sur ses sources, jamais sur l'opinion qu'elle sert.

## Signaler une erreur (le plus utile)

Ouvrez une issue avec :

1. la page concernée (adresse complète) ;
2. ce qui est inexact, incomplet ou déséquilibré ;
3. au moins une source datée (presse nationale, document officiel, programme ou déclaration du
   parti). Wikipédia et les agrégateurs servent de pistes, pas de preuves.

Toute correction retenue est inscrite au
[journal public des corrections](https://politheque.revaamp.com/corrections).

## Proposer une modification

Lisez d'abord la [charte éditoriale](docs/charte-editoriale.md) et, pour une fiche de parti, le
[brief de recherche](docs/brief-recherche-parti.md). En résumé :

- deux à trois sources pour une idée clé ou une affirmation importante ;
- une position vient d'une source primaire ou de presse, émise par le parti ou un membre actuel ;
  si le parti est divisé ou si le doute subsiste, la position reste « inconnue » ;
- même traitement pour tous les partis ;
- les procédures judiciaires ne sont pas ouvertes aux contributions directes : signalez-les par
  une issue, elles passent par une relecture éditoriale et juridique.

Avant d'ouvrir une pull request :

```bash
npm run test:run   # doit passer, y compris les tests d'intégrité des données
npx tsc --noEmit
```

Messages de commit : `feat:`, `fix:`, `build:` ou `refactor:` (voir `CLAUDE.md`). Un commit qui
touche `src/programmes/data/` porte un trailer `Correction-publique:` et une entrée du journal
(`npm run corrections:add`).

## Licence des contributions

En contribuant, vous acceptez que votre code soit publié sous [AGPL 3.0](LICENSE) et vos contenus
sous [CC BY-SA 4.0](LICENSE-CONTENU.md).
