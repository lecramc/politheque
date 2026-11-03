# Brief — histoire approfondie d'un parti

Date : 2026-11-03. Lire d'abord `docs/charte-editoriale.md` (règle 7 : recoupement) et le type
`PartyHistory` / `PartyFigure` dans `src/programmes/models/programme.model.ts`.

Dans `history` de chaque fiche `src/programmes/data/parties/<id>.json`, AJOUTER (sans retirer
l'existant, en corrigeant l'existant s'il est inexact) :

- `whyCreated` (SourcedText) : 3-5 phrases. Contexte de création (date, lieu, congrès),
  par qui, pourquoi (objectifs déclarés à l'époque), de quelles organisations il est issu
  (scission, fusion, refondation, changement de nom). Pour les partis à filiation longue
  (PS ← SFIO 1905 ; PCF ← SFIC 1920 ; LR ← UNR/UDR/RPR/UMP ; RN ← FN 1972 ; Écologistes ← Verts
  1984 / EELV 2010 ; LFI ← Parti de gauche 2008 / Front de gauche), retracer la lignée.
- `figures` (PartyFigure[]) : 4 à 7 personnes. Les fondateurs (TOUS les principaux, pas
  seulement le plus connu) puis les figures marquantes. Pour chacun : `role` (fonction et
  période), `background` : parcours et **bord politique d'origine** (de quel parti / mouvement
  il venait, engagements antérieurs, y compris les plus controversés s'ils sont établis par des
  historiens), en 2-3 phrases factuelles, sans qualificatif moral.
- `thought` (SourcedText[]) : 3 à 5 items. Les courants de pensée et références doctrinales
  (ex. socialisme démocratique, marxisme, gaullisme, libéralisme, démocratie chrétienne,
  écologie politique, souverainisme, nationalisme, populisme…), les auteurs ou textes de
  référence revendiqués, et les évolutions doctrinales dans le temps (ex. « dédiabolisation »,
  tournant de la rigueur, « ni gauche ni droite »). Toujours distinguer : « le parti revendique… »
  et « les historiens / politistes décrivent… ».

Exigences :

- **Même profondeur et même ton pour tous les partis**, de gauche comme de droite : si l'on
  mentionne le passé controversé d'un fondateur d'un côté, on applique le même niveau d'exigence
  partout (ex. passés de collaboration, d'OAS, de stalinisme, d'engagements trotskistes ou
  maoïstes, d'affaires judiciaires — uniquement s'ils sont établis par des sources de référence).
- CHAQUE élément : ≥ 2 sources de domaines différents, dont ≥ 1 indépendante du parti
  (kind presse ou statistique). Sources prioritaires : ouvrages et articles d'historiens et
  politistes (Cairn, Persée, OpenEdition), Encyclopædia Universalis, Larousse, Vie-publique,
  INA, Fondation Jean-Jaurès, Fondapol, CEVIPOF, Sciences Po, Le Monde, AFP ; Wikipédia
  seulement en 2e source ; site du parti pour ce qu'il revendique.
- Ne jamais deviner. Si une information n'est pas confirmée par deux sources, ne pas l'écrire.
- JSON strictement valide, `lastVerified` = 2026-11-03. Ne modifier que les fiches attribuées.
- Vérifier ensuite : `cd /Users/clementmarcel/Documents/Development/programmes-2027 && npx vitest run src/programmes/__tests__/data-integrity.test.ts`.

Rapport final : par parti, fondateurs retenus, points controversés traités et comment,
contradictions entre sources, éléments écartés faute de 2e source.
