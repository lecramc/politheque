# Brief de recherche — fiche parti (format JSON)

Date du jour : 2026-11-03. Lis d'abord `docs/charte-editoriale.md` (règles non négociables),
`src/programmes/models/programme.model.ts` (types) et `src/programmes/data/questions.ts`
(les 24 affirmations du questionnaire).

Pour chaque parti attribué, écris `src/programmes/data/parties/<id>.json` :

```json
{
  "id": "rn",
  "name": "Rassemblement national",
  "shortName": "RN",
  "candidate": "Prénom Nom (statut : déclaré le AAAA-MM-JJ / investi / pressenti)",
  "color": "#hex",
  "family": "Famille politique telle que qualifiée par la presse de référence / politistes",
  "description": "2-3 phrases neutres : fondation, dirigeants, poids électoral (score 2022, 2024 avec source).",
  "lastVerified": "2026-11-03",
  "programmeStatus": "Ex. : Programme présidentiel 2027 non publié à date ; fiche fondée sur le programme des législatives 2024 et les déclarations du candidat.",
  "themes": {
    "economie": { "summary": "...", "measures": [ { "text": "...", "sources": [ { "title": "...", "url": "https://...", "date": "2024-06", "kind": "programme" } ] } ] },
    "travail": {...}, "immigration": {...}, "securite": {...}, "ecologie": {...},
    "sante": {...}, "education": {...}, "europe": {...}, "institutions": {...}
  },
  "stances": {
    "q01-isf": { "stance": 2, "justification": "...", "sources": [ ... ] },
    ... les 24 ids de questions.ts, tous présents ...
  }
}
```

Exigences :

- 9 thèmes, chacun 3 à 5 mesures concrètes et vérifiables (chiffres quand le parti en donne).
- Les 24 `stances` présentes. `stance` ∈ {-2,-1,0,1,2} ou `null` si pas de position publique
  claire ou si le parti est divisé (le dire dans la justification). Ne devine JAMAIS.
- Chaque mesure et chaque stance non nulle : ≥ 1 source avec URL réelle que tu as ouverte
  (WebFetch) ou vue dans les résultats de recherche. Privilégie : site officiel du parti /
  du candidat, PDF de programme, scrutins sur assemblee-nationale.fr (ou datan.fr / nosdeputes),
  puis Le Monde, AFP, Libération, Le Figaro, Les Échos, franceinfo, Public Sénat, Vie-publique.
- Pour les votes : cite le scrutin (ex. « Scrutin n° 1234 du 27/05/2025, aide à mourir, vote
  majoritaire du groupe »). Si le groupe est divisé → `null` ou nuance, et dis-le.
- Positions récentes > anciennes. Si seule une position 2022 existe, dis-le dans le texte.
- Vérifie le statut actuel du candidat (déclaré ? date ? procédures judiciaires en cours
  pertinentes pour l'éligibilité, de façon factuelle et sourcée).
- Vocabulaire neutre, termes du parti entre guillemets. Pas d'évaluation.
- JSON strictement valide (vérifie avec `python3 -m json.tool fichier`).
- Couleurs : utiliser la couleur d'identification habituelle du parti.

À la fin, renvoie un court rapport : fichiers écrits, points incertains, stances laissées à null
et pourquoi, sources que tu n'as pas pu ouvrir.
