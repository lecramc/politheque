# Brief — coder les positions des partis sur le questionnaire v2

Date : 2026-11-03. Lis `docs/charte-editoriale.md` (règle 4 : pas de position devinée ; règle 7 :
recoupement), `docs/questionnaire-v2.md` (§3 : énoncés, aides, sources probables) et
`src/programmes/data/questions.ts` (énoncés définitifs, ils font foi).

Partis (ids) : ecologistes, horizons, lfi, lr, nouvelle-energie, pcf, ps-place-publique,
reconquete, renaissance, rn. Leurs fiches actuelles sont dans `src/programmes/data/parties/` :
lis les `stances` existantes (anciennes formulations) et les mesures, elles contiennent souvent
déjà les sources utiles — mais l'énoncé v2 fait foi : recode, ne recopie pas.

## Règle de codage (identique pour tous les partis, c'est essentiel)

| Valeur | Sens                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------ |
| 2      | Mesure explicitement portée, ou vote du groupe très majoritairement pour                         |
| 1      | Plutôt favorable, avec conditions ou nuances explicites                                          |
| 0      | Position intermédiaire explicite, ou abstention du groupe sur le texte de référence              |
| -1     | Plutôt défavorable, explicite                                                                    |
| -2     | Explicitement opposé, ou vote très majoritairement contre                                        |
| null   | Rien d'explicite, parti divisé (groupe partagé à peu près également), ou seulement une déduction |

- Hiérarchie : programme 2027 du candidat > déclaration du candidat (2025-2026) > vote du groupe
  parlementaire (datan.fr, assemblee-nationale.fr, howtheyvote.eu pour le Parlement européen) >
  programme antérieur (2024, 2022) > porte-parole officiel. Dis toujours sur quoi tu te fondes et
  la date. Si le candidat contredit le vote de son groupe, privilégie le candidat et mentionne le vote.
- Même texte de référence pour tous les partis quand c'est possible (ex. le même scrutin).
- Justification : 1-2 phrases factuelles, neutres, avec citation exacte entre guillemets si besoin.
- Sources : ≥ 1 source ouverte pour toute valeur non nulle ; vise 2 domaines dont 1 indépendant.

## Sortie (un fichier par question, ne touche PAS aux fiches partis)

`docs/codage/<question-id>.json` :

```json
{
  "question": "q25-successions",
  "positions": {
    "rn": {
      "stance": 2,
      "justification": "...",
      "sources": [{ "title": "...", "url": "https://...", "date": "2026-10", "kind": "programme" }]
    },
    "...": "les 10 partis, tous présents"
  },
  "notes": "points incertains, contradictions"
}
```

`kind` ∈ programme | declaration | vote | proposition-de-loi | presse | statistique. JSON strictement
valide (python3 -m json.tool). Vérifie aussi le texte `help` de tes questions : s'il contient une
erreur, signale la correction exacte dans `notes` (ne modifie pas questions.ts).
