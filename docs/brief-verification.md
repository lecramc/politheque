# Brief — vérification indépendante (fact-checking) avant publication

Date : 2026-11-03. Objectif du client : « que le site soit le moins bullshit possible ; la
référence, l'endroit où il n'y a pas de média qui met en avant, la vérité ». Tu es le dernier
filet de sécurité avant publication. Tu n'as pas écrit ces données : ne présume rien.

Lis `docs/charte-editoriale.md`, `docs/a-verifier.md` et le modèle
`src/programmes/models/programme.model.ts`.

## Ce que tu vérifies, pour CHAQUE élément de tes fichiers

Éléments : `description`, `family`, `candidacies.*.candidate` et `programmeStatus`,
`history` (origins, ideals, timeline, whyCreated, figures, thought), chaque `measure`, chaque
`stance` non nulle (et la justification des nulles). Pour les fichiers guide/thèmes : chaque bloc,
chaque chiffre clé, chaque option de débat.

1. **Ouvre au moins une source** (WebFetch) et vérifie que le texte dit **exactement** ce que dit
   la source : chiffres, dates, noms, citations entre guillemets, sens de la position.
2. **Recoupement** : il faut au moins 2 sources de domaines différents dont 1 indépendante du
   parti (presse, institution, encyclopédie, scrutin public). Sinon cherche une 2e source ;
   si introuvable, laisse (le site affichera « Source unique ») sauf pour les faits sensibles
   (judiciaire, passé controversé, chiffres de résultats) : alors **retire** l'affirmation.
3. **Neutralité** : pas d'adjectif évaluatif, termes de parti entre guillemets, même exigence
   pour tous. Signale tout déséquilibre de traitement.
4. **Positions (`stance`)** : la valeur (-2…2) doit découler d'une source explicite (programme,
   vote, déclaration). Une déduction → `null` avec justification honnête.
5. **Liens** : si une URL est morte (404) ou ne contient pas l'information, remplace-la par une
   source valide ou retire-la. Les sites qui bloquent les robots (403, assemblee-nationale.fr qui
   ne répond pas) : vérifie l'information via une autre source qui la confirme.
6. Ne contourne aucune protection. Ne devine jamais.

## Sortie

- Corrige directement les fichiers attribués (JSON strictement valide, `lastVerified` =
  2026-11-03). Ne modifie aucun autre fichier.
- Lance `cd /Users/clementmarcel/Documents/Development/programmes-2027 && npx vitest run` et corrige
  ce qui concerne tes fichiers.
- Rapport final : nombre d'éléments vérifiés / total, nombre corrigés, retirés, passés en null,
  liste des corrections importantes (avant → après, source), points qu'un humain doit trancher.
