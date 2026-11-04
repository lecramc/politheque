# Brief — Affaires judiciaires et audit d'exhaustivité des fiches partis

Objectif de l'éditeur : que chaque lecteur puisse se faire son avis « le plus neutrement possible »
en ayant **tous** les faits documentés, y compris ceux qui dérangent, avec **la même règle pour
les 10 partis**. Ni normalisation (lisser ce qui gêne), ni acharnement (en rajouter pour un camp).

Ce brief complète `docs/charte-editoriale.md` (lire aussi la règle 5 « Affaires judiciaires »,
qui sera révisée à partir de ce travail) et `docs/brief-verification.md`.

## 1. Périmètre des personnes (identique pour tous les partis)

On recense les procédures visant :

- le **parti lui-même** (personne morale, micro-parti, association de financement) ;
- ses **fondateurs** et **présidents / secrétaires nationaux / porte-paroles nationaux** (actuels
  et passés) ;
- ses **candidats à l'élection présidentielle** (passés et 2027) ;
- ses **parlementaires** (députés, sénateurs, députés européens) **pour des faits commis pendant
  leur mandat ou liés à l'activité politique**, depuis la création du parti (ou son prédécesseur
  direct, signalé comme tel : FN → RN, UMP → LR, etc.) ;
- les **ministres** issus du parti.

**Règle de rattachement (décision de l'éditeur, 4 novembre 2026)** : une personne est rattachée
au parti **dont elle fait partie aujourd'hui**, quel que soit le parti dans lequel elle était au
moment des faits (ex. des faits commis au PS par une personne aujourd'hui à Renaissance vont dans
le dossier Renaissance). Personne décédée ou retirée de la vie politique : dernier parti
d'appartenance (ou son successeur direct : RPR/UMP → LR, FN → RN). Le parti au moment des faits
reste indiqué dans l'entrée (`partiAuMomentDesFaits`), pour l'exactitude. Les procédures visant
un parti en tant que personne morale restent attachées à ce parti (ou à son successeur).

**Règles communes pour les cas limites (adoptées le 4 novembre 2026, modifiables par l'éditeur)** :

1. **Mandat local** : inclus si la personne est dans le périmètre (§ 1), quel que soit le mandat
   au moment des faits, dès lors que les faits sont liés à une activité publique ou politique.
2. **Faits antérieurs à l'adhésion ou au mandat** : inclus si la personne est aujourd'hui dans le
   périmètre (cohérent avec la règle du parti actuel), avec la fonction au moment des faits.
3. **Ancienneté** : pas de date butoir, même règle pour tous les fondateurs et dirigeants ; seules
   les condamnations amnistiées ou réhabilitées sont écartées d'office et listées pour l'éditeur.
4. **Décisions civiles et administratives** visant le parti (personne morale) ou une personne du
   périmètre (diffamation au civil, CNIL, CNCCFP, contrefaçon) : incluses, catégorie distincte
   « décision civile ou administrative », jamais présentées comme pénales.
5. **Accusations sans procédure judiciaire** (témoignages de presse sans plainte ni enquête) :
   exclues.
6. **Enquête sans suite publique** : incluse seulement avec la date de la dernière information
   publique (« dernière information publique : mars 2022 ») ; jamais sans date.
7. **Action publique éteinte** (décès, prescription) : incluse telle quelle, libellé exact, sans
   suggérer de culpabilité ; on cite ce que la juridiction a dit, s'il y a lieu.
8. **Condamnation ensuite jugée contraire à la CEDH** : incluse avec l'arrêt de la CEDH à côté.
9. **Personne aujourd'hui dans un parti hors des 10 suivis** : non affichée (entrée conservée dans
   `aTransferer`).
10. **Une seule source** : jamais publiée ; reste « à recouper ».

Hors périmètre : militants et élus locaux sans fonction nationale (sauf affaire impliquant le
parti lui-même), vie privée sans lien avec l'activité politique (sauf condamnation pénale
définitive pour crime ou délit grave largement couverte par la presse nationale — à signaler en
« cas limite »).

## 2. Ce qu'on recense et comment on le qualifie

Chaque entrée a un **statut juridique exact**, jamais arrondi :

- `condamnation-definitive` (tous recours épuisés ou expirés) ;
- `condamnation-non-definitive` (appel ou pourvoi en cours) — présomption d'innocence rappelée ;
- `mise-en-examen` / `renvoi-devant-tribunal` / `proces-en-cours` ;
- `enquete` (préliminaire ou information judiciaire visant la personne nommément) ;
- `relaxe` / `acquittement` / `non-lieu` / `classement` : **toujours** mentionnés quand la
  procédure a été rendue publique (sinon on laisse un soupçon sans issue).

Champs : personne, fonction au moment des faits, nature précise de l'infraction (termes du code
pénal), juridiction, dates (faits, décision), peine exacte (« peine d'inéligibilité », amende,
prison avec ou sans sursis, aménagement), recours, statut, sources.

Catégories (pour comparer à faits comparables) : probité (détournement, emplois fictifs,
financement illégal, corruption, prise illégale d'intérêts, fraude fiscale) ; propos et
discrimination (provocation à la haine ou à la discrimination raciale/religieuse, diffamation et
injure à caractère racial, contestation de crime contre l'humanité) ; violences (y compris
sexuelles et sexistes) ; autres.

## 3. Garde-fous juridiques (à respecter strictement)

- **Présomption d'innocence** : une mise en examen n'est jamais présentée comme une culpabilité.
- **Diffamation** : uniquement des faits établis par des décisions de justice ou rapportés par au
  moins deux sources de presse nationales indépendantes (AFP, Le Monde, Libération, Le Figaro,
  Mediapart, France Info, Public Sénat…) ; décision de justice citée quand elle est publique
  (Légifrance, Cour de cassation, communiqué du parquet).
- **Amnistie, réhabilitation, effacement** : une condamnation amnistiée ou réhabilitée est
  signalée en **« cas limite à valider par un humain »**, sans l'intégrer d'office.
- Pas de qualificatif évaluatif (« scandale », « sulfureux »). On écrit ce que la justice a dit.
- Réactions : les deux parties ou aucune.

## 4. Audit d'exhaustivité de la fiche (au-delà de la justice)

Pour chaque parti, vérifier que la fiche actuelle (`src/programmes/data/parties/<id>.json`)
contient, sourcés, les faits documentés majeurs suivants, et lister ce qui manque :

- **classements officiels** et position du parti sur sa propre étiquette ;
- **origines** : fondateurs, leur parcours politique antérieur (y compris passés
  collaborationnistes, OAS, groupuscules violents, ou au contraire organisations révolutionnaires,
  staliniennes, etc. — même exigence partout) ;
- **propositions jugées contraires à la Constitution, au droit européen ou aux engagements
  internationaux** par des juridictions ou des autorités (Conseil constitutionnel, Conseil d'État,
  Défenseur des droits, CNCDH) ou par un consensus documenté de juristes — avec la réponse du parti ;
- **controverses majeures documentées** (antisémitisme, racisme, complaisance envers des régimes
  autoritaires, violences, financement par une puissance étrangère, etc.) traitées à faits
  comparables entre les partis.

Pour chaque manque : le fait, pourquoi il est majeur (couverture nationale, conséquence
juridique ou politique), 2 sources datées, et où l'intégrer dans la fiche.

## 5. Test de symétrie

À la fin, comparer : nombre et gravité des faits recensés vs place qu'ils occupent aujourd'hui
dans chaque fiche. Signaler toute fiche **plus lisse** ou **plus dure** que les autres à faits
comparables. Ne jamais ajouter un fait pour « équilibrer » sans qu'il atteigne le seuil du § 1-3.

## 6. Livrables (par agent)

- `docs/affaires/<id>.json` : tableau d'entrées (schéma § 2) avec `sources: [{title, url, date,
kind}]` (`kind` : `presse`, `justice` pour une décision de justice, `statistique` pour une autre source officielle).
- `docs/affaires/<id>-audit.md` : manques d'exhaustivité (§ 4), cas limites (§ 3), et une phrase
  de synthèse factuelle.
- Ne modifier **aucun** fichier de `src/`. Rien n'est publié avant vérification croisée
  indépendante puis validation humaine.
- Si une information n'est pas vérifiable avec deux sources solides : la mettre dans
  « non retenu », avec la raison. Ne jamais inventer une date, une peine ou une juridiction.
