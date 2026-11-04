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

## 7. Arbitrages de l'éditeur (4 novembre 2026, après la passe 2)

Affaires judiciaires :

1. Appel annoncé publiquement (par la personne ou son avocat) et rapporté par deux sources → `condamnation-non-definitive`.
2. Pourvoi signalé par le parquet général (communiqué officiel, même repris par une seule publication) → source officielle suffisante.
3. Mise en examen annulée sans non-lieu → statut `mise-en-examen-annulee`, libellé exact de la décision.
4. Ordonnance pénale requise, issue inconnue → non publiée tant que l'issue n'est pas connue (reste en `aRecouper`).
5. Extinction par décès sans décision qui la constate → « action publique éteinte par le décès » (art. 6 du code de procédure pénale), rien de plus.
6. Condamnations amnistiées (loi du 15 janvier 1990, faits de Jean-Marie Le Pen antérieurs à 1972) et réhabilitations → écartées, listées pour l'avis juridique.
7. Appartenance actuelle : une source de 2026 est requise ; à défaut, dernier parti établi par une source, et `casLimite: true`.
8. Faits sans lien avec l'activité publique ou politique (conduite en état d'ivresse, affaire Epstein pour Jack Lang…) → exclus. Ministres non adhérents au parti → exclus. Enquête contre X visant les comptes de campagne d'un parti → incluse, formulée « enquête contre X portant sur… ».

Propositions jugées contraires au droit supérieur (`<id>-propositions.md`) : 9. Un appel ou une déclaration du **bureau** d'une autorité (ex. CNCDH, 12 juin 2024) n'est pas un avis d'autorité ; l'entrée ne reste que si elle atteint le seuil « contesté par des juristes » (deux juristes nommés, deux sources nationales indépendantes). 10. La Commission européenne compte comme autorité, à condition de chercher ses observations avec la même profondeur pour tous les partis. 11. Voter une mesure ne suffit pas : seules comptent les mesures dont le parti est l'auteur ou le porteur déclaré. 12. Période commune : depuis le 1er janvier 2012 ; projets de loi rattachés au parti du président et de la majorité.

## 8. Agrégateurs (décision de l'éditeur, 4 novembre 2026)

Les sites qui recensent des affaires (casier-politique.fr, Wikipédia, poligraph.fr…) servent de **pistes**
pour repérer des procédures, jamais de source : chaque fait repéré doit être confirmé par au moins deux
sources indépendantes (décision de justice, communiqué du parquet, presse nationale), conformément au § 3.
Pour la symétrie, un agrégateur est exploité **pour les 10 partis de la même façon** ; si sa couverture
est inégale selon les partis, le signaler dans `SYNTHESE.md` et compenser par une recherche directe pour
les partis moins couverts.

## 9. Arbitrages de l'éditeur (4 novembre 2026, après la passe 3)

Affaires judiciaires :

1. Condamnation sans trace de recours → publiable avec le libellé factuel « condamné·e par [juridiction] le [date] ; nous n'avons pas trouvé trace d'un recours » (statut `condamnation-recours-non-documente`), jamais « définitive » sans preuve. Une exécution documentée de la peine vaut caractère définitif.
2. Réhabilitation de plein droit (art. 133-13 C. pén.) → toutes les condamnations concernées restent dans les dossiers, signalées pour l'avis juridique ; même traitement pour les 10 partis.
3. Amnistie de 1990 (Urba, Nucci, Gifco) → avis juridique.
4. Issue introuvable → dernier statut documenté, avec « dernière information publique : [mois année] ».
5. Rattachement : adhésion établie par une source ; à défaut, groupe parlementaire actuel ; personne retirée de toute activité partisane → dernier parti.
6. Ravier → hors périmètre.
7. Entrée « parti » pour un financement occulte seulement si une décision de justice établit que le parti en a bénéficié (même règle Urba / Gifco).
8. Sources : un communiqué de partie civile n'est pas une source indépendante ; deux titres d'un même groupe de presse = une seule source ; un site de presse spécialisé sérieux compte comme presse ; en cas de dates divergentes, la date de la décision fait foi.
9. Périmètre : activité professionnelle privée (ex. pharmacienne) → exclue ; actions militantes d'élus (fauchages OGM) → incluses ; faits commis comme maire → inclus ; candidats jamais élus sans fonction nationale → exclus ; décision visant un parti européen → exclue.
10. Une seule entrée par affaire (Baupin 2019 mentionné dans l'entrée de l'enquête).
11. Mamère : condamnation + arrêt CEDH côte à côte ; faits d'assistant avant le mandat et faits antérieurs à la fondation du parti → inclus.

Propositions jugées contraires au droit : 12. Le Comité européen des droits sociaux est une autorité ; recherche symétrique pour le PS 2012-2017. 13. Décret annulé par le Conseil d'État → inclus, rattaché au parti du gouvernement. 14. Gouvernements sans majorité depuis 2024 → rattachés au parti du Premier ministre (Barnier → LR, Lecornu → Renaissance ; Bayrou → MoDem, hors des 10). 15. The Connexion ne compte pas comme source nationale. 16. Cosigner une PPL dont le premier signataire est d'un autre parti ne fait pas du parti un auteur. 17. PS, entrée sur les copies de données (état d'urgence) : conservée (décision de censure). 18. Accord LFI-EELV de 2022 : texte cosigné → EELV co-auteur.
