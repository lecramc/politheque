# Questionnaire v2 : proposition de révision (2026-11-03)

Ce document propose une révision des 24 affirmations de `src/programmes/data/questions.ts`. Il s'appuie sur les
statistiques de `docs/questionnaire-stats-v1.md`, sur les vérifications de `docs/verification-questions.md`, sur la
charte éditoriale et sur le calcul de `matching.service.ts`. **Aucun fichier de code ou de données n'a été modifié.**
Toutes les positions de partis citées ici sont des **hypothèses de travail à coder et sourcer** selon la charte : elles
ne doivent pas être reprises telles quelles dans `parties/*.json`.

Résumé : **30 affirmations** (7 gardées, 13 reformulées, 10 nouvelles), 4 supprimées.

| Axe               | Questions | Accord = « pôle − » | Accord = « pôle + » |
| ----------------- | --------- | ------------------- | ------------------- |
| economique        | 10        | 5                   | 5                   |
| societal          | 9         | 4                   | 5                   |
| europe            | 5         | 2                   | 3                   |
| sans axe (`null`) | 6         | –                   | –                   |

---

## 1. Critères retenus

La littérature sur les outils d'aide au vote (VAA) montre que le choix des affirmations pèse plus sur le résultat que
la formule de calcul : avec d'autres affirmations, le parti « le plus proche » change pour une part importante des
utilisateurs (Walgrave, Nuytemans & Pepermans, _West European Politics_, 2009 ; Garzia & Marschall (dir.),
_Matching Voters with Parties and Candidates_, ECPR Press, 2014). Pour la v2, on retient sept critères.

1. **Discrimination entre partis.** Une affirmation n'est utile que si les partis y répondent différemment. Seuils
   visés, calculés après codage : **écart-type ≥ 1,0** sur l'échelle −2…+2, et au moins un parti de chaque côté de 0.
   q21 (Mercosur, écart-type 0,33) et q11 (police, 0,0) ne passent pas ce seuil. Les questions transversales, où des
   partis éloignés sont d'accord (ZFE, prix de l'énergie, installation des médecins), restent utiles pour le classement
   des partis (proximité). Elles ne doivent pas servir à placer l'utilisateur sur la carte : on les met en `axis: null`.
2. **Positions documentables : au moins 8 partis sur 10.** Avec `MIN_COMPARED = 5`, et puisqu'une position `null`
   sort du calcul, une question connue pour 3 partis seulement fausse le classement : les partis bien documentés sont
   comparés sur plus de questions. Gemenis (_Acta Politica_, 2013) montre que le codage des positions est la première
   source d'erreur des VAA. On privilégie donc les sujets qui ont fait l'objet d'un **scrutin public**
   (datan.fr / assemblee-nationale.fr, ou HowTheyVote.eu pour le Parlement européen), d'une mesure précise dans un
   programme, ou d'une déclaration claire.
3. **Couverture des enjeux de 2027 et des préoccupations des Français.**
   - _Fractures françaises_, 13e vague (Ipsos bva pour Le Monde, Fondation Jean-Jaurès, CEVIPOF, Institut Montaigne,
     terrain du 1er au 9 octobre 2025, 3 000 personnes) : pouvoir d'achat 36 %, délinquance 22 %, immigration 22 %,
     environnement 18 %, santé 18 %. Sources : https://www.sciencespo.fr/cevipof/fr/actualites/fractures-francaises-resultats-de-la-vague-13-octobre-2025/
     et https://www.jean-jaures.org/publication/fractures-francaises-2025-la-lassitude-de-la-societe-francaise/ .
     Aucune vague 2026 n'a été trouvée à la date de ce document.
   - Enquête électorale CEVIPOF / Fondation Jean-Jaurès / Ipsos bva / Le Monde (2-9 avril 2026, 10 962 inscrits) :
     les enjeux qui détermineront le vote sont d'abord la **santé**, puis le **pouvoir d'achat**. La sécurité arrive
     5e, l'immigration 8e. Cinq des sept premiers enjeux sont économiques et sociaux. Source :
     https://www.ipsos.com/fr-fr/presidentielle-2027-le-retour-du-vote-sur-enjeux
   - Elabe pour La Tribune Dimanche (avril 2026) : « si vous étiez président », pouvoir d'achat 44 %, sécurité 31 %,
     santé 30 %, dette 28 % (https://elabe.fr/fichier-pdf/13003-20260418_elabe_la-tribune-dimanche_les-francais-et-lela-presidente-ideale/).
     Elabe pour BFMTV (septembre 2026) : 70 % des Français s'attendent à une baisse de leur pouvoir d'achat, en raison
     notamment du prix des carburants (https://www.connaissancedesenergies.org/afp/pouvoir-dachat-7-francais-sur-10-sattendent-a-une-degradation-260916).
   - Ifop pour Hellio (mai 2026) : la lutte contre la hausse des factures d'énergie arrive en tête des priorités
     énergétiques (https://www.hellio.com/actualites/communiques/priorites-energetiques-fran%C3%A7ais-avant-presidentielle).

   Conséquence : la v2 renforce le **pouvoir d'achat** (prix de l'énergie, temps de travail, héritage) et la
   **sécurité** (mineurs délinquants, cannabis). La **santé** garde deux questions : les partis s'opposent peu sur
   l'hôpital, et des affirmations consensuelles ne départageraient personne.

4. **Compréhensibilité.** Phrase courte, vocabulaire de collège, pas de sigle non expliqué, pas de double négation,
   pas d'adjectif évaluatif, termes connotés entre guillemets ou expliqués dans `help` (charte, règle 5). Les détails
   techniques vont dans `help`, pas dans l'énoncé.
5. **Une seule idée par affirmation.** Une affirmation double, du type « ISF _ou_ impôt plancher », « chômage _et_
   RSA », « contrôle indépendant _et_ récépissé » ou « référendum _y compris_ en changeant la Constitution », mesure
   deux choses à la fois. La réponse et la position du parti deviennent alors impossibles à interpréter.
6. **Équilibre du sens des formulations.** Les répondants ont tendance à dire « d'accord » plus souvent que « pas
   d'accord » (biais d'acquiescence). Si l'accord pousse toujours vers le même pôle, la carte est décalée de façon
   systématique. On vise autant d'affirmations où l'accord tire vers chaque pôle, axe par axe (tableau ci-dessus). On
   le fait sans formulations négatives artificielles : on choisit des mesures dont la formulation naturelle tire vers
   le pôle voulu.
7. **Validité des axes.** Krouwel, Vitiello & Wall (_Int. J. Electronic Governance_, 2012) et Germann, Mendez,
   Wheatley & Serdült (_Acta Politica_, 2015) recommandent de rattacher à un axe seulement les questions qui
   mesurent la même dimension, puis de vérifier après coup que les réponses vont dans le même sens. Une carte placée à
   partir de 2 ou 3 questions peu documentées n'est pas fiable. On vise **au moins 5 questions par axe**, dont 4 au
   moins connues pour chaque parti. Louwerse & Rosema (_Acta Politica_, 2014) rappellent que la méthode de calcul
   change le résultat. La formule actuelle (accord = 1 − |écart|/4) est cohérente, mais elle rend d'autant plus
   important l'équilibre décrit au point 6.

**Contrôles à faire après le codage des positions** (non réalisés ici) : recalculer « connues » et l'écart-type pour
chaque question ; vérifier les corrélations entre les questions d'un même axe (inverser ou sortir de l'axe une
question qui va à contre-sens) ; faire un pré-test cognitif auprès de 10 à 15 personnes de profils variés (« que
comprenez-vous par… ? »).

---

## 2. Décision pour chacune des 24 questions actuelles

| Question v1          | Décision                               | Raison                                                                                                                                                                                                                                                                            |
| -------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| q01-isf              | **Reformuler**                         | L'énoncé est double (ISF _ou_ impôt plancher). On garde une seule mesure, l'impôt minimum sur les patrimoines de plus de 100 M€ (« taxe Zucman »), qui a fait l'objet de scrutins publics en 2025 et le 16/10/2026. On peut ainsi documenter 10 partis sur 10. L'id est conservé. |
| q02-depenses         | **Garder**                             | 9/10, écart-type 1,7, compréhensible. Seul le texte d'aide est mis à jour.                                                                                                                                                                                                        |
| q03-charges          | **Supprimer**                          | Elle donne presque le même profil que q02 (mêmes signes pour 9 partis) et n'apporte donc presque aucune information en plus. La fiscalité est déjà couverte par q01 et q25.                                                                                                       |
| q04-retraite         | **Reformuler**                         | « 62 ans ou moins » mélange deux propositions (62 ans et 60 ans). On écrit « ramené à 62 ans », puisque l'âge est gelé à 62 ans et 9 mois.                                                                                                                                        |
| q05-smic             | **Reformuler**                         | Seulement 5/10, et « au-delà de sa revalorisation automatique » est technique. On écrit « coup de pouce » avec une explication. Les partis qui y sont opposés (RE, HOR, LR, REC, NE) peuvent être documentés par leurs déclarations.                                              |
| q06-chomage          | **Reformuler**                         | Énoncé double (chômage _et_ RSA, durée _et_ contreparties). On ne garde que l'assurance chômage, sujet de la réforme de 2026.                                                                                                                                                     |
| q07-immigration      | **Garder**                             | 9/10, écart-type 1,83. Le texte d'aide est à jour (titres 2025).                                                                                                                                                                                                                  |
| q08-preference       | **Reformuler (léger)**                 | On écrit « passer avant » au lieu de « réservées en priorité ». On documente les partis qui y sont opposés (RE, HOR, LR, PS) par leurs déclarations sur la « préférence nationale », pour passer de 5 à 9 partis.                                                                 |
| q09-regularisation   | **Garder**                             | 8/10, écart-type 2,0. Texte d'aide à mettre à jour : l'expérimentation prend fin le 31/12/2026.                                                                                                                                                                                   |
| q10-peines-planchers | **Garder**                             | 10/10. Texte d'aide à mettre à jour (projet de loi « SURE »).                                                                                                                                                                                                                     |
| q11-police           | **Supprimer**                          | 3/10, écart-type 0. Énoncé double (contrôle indépendant _et_ récépissé). Seule la gauche s'est exprimée. La sécurité est couverte par q10, q29 et q34.                                                                                                                            |
| q12-nucleaire        | **Garder**                             | 10/10, `axis: null`.                                                                                                                                                                                                                                                              |
| q13-renouvelables    | **Garder**                             | 9/10. Elle sépare nettement le RN et LR de RE.                                                                                                                                                                                                                                    |
| q14-normes-agricoles | **Reformuler (léger)**                 | « imposées » est légèrement connoté. On écrit « que doivent respecter ». 10/10, écart-type 1,96.                                                                                                                                                                                  |
| q15-medecins         | **Reformuler + passer à `axis: null`** | « réguler » est abstrait. On décrit le mécanisme réel (refus d'installation en zone bien dotée). La question est transversale (LR +1 et RN −1 vont à contre-sens de l'axe économique), elle sort donc de l'axe.                                                                   |
| q16-fin-de-vie       | **Reformuler (léger)**                 | Phrase simplifiée. 10/10.                                                                                                                                                                                                                                                         |
| q17-ecole-privee     | **Reformuler**                         | Énoncé double (moins d'argent _ou_ plus de mixité). On garde la modulation du financement selon la mixité, mesure proposée par la gauche.                                                                                                                                         |
| q18-ukraine          | **Reformuler**                         | « Soutenir militairement » est vague, et 6/10 seulement. « Livrer des armes » est plus concret. Le scrutin du 12/03/2024 sur l'accord de sécurité, où LFI et le PCF ont voté contre et le RN s'est abstenu, permet d'atteindre 9/10.                                              |
| q19-droit-europeen   | **Reformuler**                         | Seulement 5/10, et seuls les partis favorables à la primauté du droit national ont été codés, d'où le faible écart-type. Phrase plus simple. Les partis pro-européens (RE, PS, Écologistes, HOR) doivent être codés à partir de leurs programmes européens 2024.                  |
| q20-defense-europe   | **Reformuler**                         | 1/10. Énoncé double (défense _et_ investissements). On ne garde que la défense, et on documente les partis par les votes au Parlement européen (ReArm Europe / livre blanc, 12/03/2025).                                                                                          |
| q21-libre-echange    | **Supprimer**                          | Quasi-consensus (écart-type 0,33) : presque tous les partis sont contre. Elle ne départage pas les partis.                                                                                                                                                                        |
| q22-vie-republique   | **Supprimer (en réserve)**             | 5/10. Notion abstraite pour le grand public. Le lien avec l'axe sociétal n'est pas valide (réduire les pouvoirs du président n'a pas de rapport direct avec « libertés vs autorité »). Elle peut revenir en remplacement si un parti en fait un marqueur de campagne.             |
| q23-referendum       | **Reformuler**                         | Énoncé double (« y compris en modifiant la Constitution »). L'aspect constitutionnel passe dans le texte d'aide.                                                                                                                                                                  |
| q24-proportionnelle  | **Garder**                             | 9/10, écart-type 1,59, `axis: null`.                                                                                                                                                                                                                                              |

Bilan : **7 gardées, 13 reformulées, 4 supprimées, 10 ajoutées.**

---

## 3. Liste finale proposée (30 affirmations)

Format : id, thème, axe et sens (`direction`), énoncé, texte d'aide (`help`), puis, pour les questions nouvelles ou
reformulées, les sources probables des positions et le nombre de partis documentables estimé (sur 10 : Écologistes,
HOR, LFI, LR, NE, PCF, PS-PP, REC, RE, RN). Les configurations de positions indiquées sont des hypothèses à vérifier.

### Économie, impôts (5)

**q01-isf** · `economie` · `economique` / `-1` · _reformulée_

- **statement** : Il faut créer un impôt minimum sur les plus grandes fortunes (plus de 100 millions d'euros).
- **help** : Cette « taxe Zucman » obligerait environ 1 800 foyers à payer chaque année au moins 2 % de leur patrimoine en impôts. Adoptée par l'Assemblée en février 2025 puis rejetée par le Sénat, elle a de nouveau été rejetée par les députés lors de l'examen des budgets 2026 (octobre 2025) et 2027 (16 octobre 2026). Depuis 2018, l'impôt sur la fortune (ISF) est remplacé par l'IFI, qui ne taxe que l'immobilier.
- Sources : https://datan.fr/votes/legislature-17/vote_8860 ; https://lcp.fr/actualites/budget-2026-la-taxe-zucman-rejetee-par-l-assemblee-nationale-413632 ; https://www.lagazettefrance.fr/article/budget-l-assemblee-rejette-la-taxe-zucman-sur-les-ultrariches
- Positions : scrutins datan (20/02/2025, 31/10/2025, 16/10/2026 : pour LFI, SOC, ECOS, GDR ; contre RN, EPR, DEM, DR, HOR) ; REC et NE par déclarations. **Estimation : 10/10.**

**q02-depenses** · `economie` · `economique` / `1` · _gardée_

- **statement** : La priorité budgétaire doit être de réduire les dépenses publiques pour faire baisser la dette.
- **help** : La dette publique atteint 119 % du PIB au 2e trimestre 2026, et le déficit public était de 5,1 % du PIB en 2025. Pour le réduire, on peut baisser les dépenses, augmenter les impôts ou compter sur la croissance.
- Sources : https://www.insee.fr/fr/statistiques/9053525 ; https://www.insee.fr/fr/statistiques/8956575

**q25-successions** · `economie` · `economique` / `1` · _nouvelle_

- **statement** : Il faut baisser les impôts sur l'héritage (droits de succession).
- **help** : Chaque enfant peut recevoir 100 000 € de chacun de ses parents sans payer d'impôt. Au-delà, le taux augmente par tranches, de 5 % à 45 %. Ce montant n'a pas été relevé depuis 2012. Le taux réellement payé est souvent bien plus bas que le taux maximal : environ 9 % pour un enfant qui hérite de 200 000 €, par exemple.
- Sources : https://www.lafinancepourtous.com/pratique/vie-perso/transmission-donation/montant-des-droits-de-succession/ ; https://www.moneyvox.fr/impot/actualites/110999/heritage-risquez-vous-vraiment-de-payer-des-droits-de-succession
- Positions : programmes (RN 2022 et 2024 : exonérations de transmission ; REC 2022 ; LR ; NE/Lisnard), propositions de la gauche de taxer davantage les gros héritages (LFI : héritage maximal ; PS ; Écologistes ; PCF), amendements aux budgets 2026 et 2027 sur datan. RE et HOR sont incertains. **Estimation : 8/10.** Sujet très discriminant et très parlant pour le public.

**q26-nationalisations** · `economie` · `economique` / `-1` · _nouvelle_

- **statement** : L'État devrait nationaliser les entreprises stratégiques menacées de fermeture, comme ArcelorMittal.
- **help** : Nationaliser, c'est faire passer une entreprise sous le contrôle de l'État. Une proposition de loi pour nationaliser ArcelorMittal France (sidérurgie) a été adoptée par l'Assemblée en novembre 2025, rejetée par le Sénat en février 2026, puis adoptée à nouveau par les députés le 11 juin 2026. Le gouvernement s'y oppose et le texte n'est pas en vigueur.
- Sources : https://datan.fr/votes/legislature-17/vote_4438 ; https://datan.fr/votes/legislature-17/vote_7380
- Positions : votes nominatifs (pour LFI, SOC, ECOS, GDR ; contre EPR, HOR, DR, DEM, UDR ; abstention du RN → 0). REC et NE par déclarations. **Estimation : 9/10.** Elle mesure le rôle de l'État dans l'économie plus directement que l'ancienne q03.

**q28-prix-energie** · `economie` · `null` / `1` · _nouvelle_

- **statement** : Il faut baisser la TVA sur l'électricité, le gaz et les carburants.
- **help** : Depuis le 1er août 2025, toute la facture d'électricité, abonnement compris, est soumise à une TVA de 20 %. L'abonnement était auparavant taxé à 5,5 %. Baisser la TVA sur l'énergie réduirait les factures, mais aussi les recettes de l'État. En septembre 2026, 70 % des Français s'attendaient à une baisse de leur pouvoir d'achat, en raison notamment du prix des carburants.
- Sources : https://selectra.info/energie/actualites/marche/alerte-facture-tva-abonnement-electricite-gaz-quadrupler-1er-aout-2025 ; https://www.connaissancedesenergies.org/afp/pouvoir-dachat-7-francais-sur-10-sattendent-a-une-degradation-260916
- Positions : programme RN (TVA à 5,5 % sur l'énergie), REC (baisse des taxes), programme NFP 2024 (blocage des prix de l'énergie : LFI, PCF, PS, Écologistes, à coder avec nuance), amendements aux budgets 2026 et 2027 (datan), RE et HOR (opposés pour des raisons budgétaires, par déclarations). **Estimation : 8/10.** Question transversale (RN et LFI proches), donc `axis: null`. Elle répond à la première préoccupation des Français.

### Travail, salaires, retraites (4)

**q04-retraite** · `travail` · `economique` / `-1` · _reformulée_

- **statement** : L'âge légal de départ à la retraite doit être ramené à 62 ans.
- **help** : La réforme de 2023 prévoyait de porter progressivement l'âge légal de 62 à 64 ans. La loi de financement de la Sécurité sociale pour 2026 a suspendu ce relèvement : l'âge légal reste fixé à 62 ans et 9 mois jusqu'au 1er janvier 2028.
- Sources : https://www.ofce.sciences-po.fr/blog2024/fr/2026/20260129_MD/20260129_MD.fr.pdf
- Positions : celles de la v1 (10/10) restent valables, mais celles qui portaient sur « ou moins » (60 ans) sont à recoder. **Estimation : 10/10.**

**q05-smic** · `travail` · `economique` / `-1` · _reformulée_

- **statement** : Le gouvernement doit augmenter le SMIC plus que ce que prévoit la loi (« coup de pouce »).
- **help** : Le SMIC augmente automatiquement selon l'inflation et les salaires. Il a été revalorisé de 2,41 % le 1er juin 2026. Un « coup de pouce » est une hausse supplémentaire décidée par le gouvernement. Ses partisans y voient un gain de pouvoir d'achat, ses opposants un risque pour l'emploi peu qualifié.
- Sources : https://www.info.gouv.fr/actualite/le-smic-revalorise-le-1er-juin-2026
- Positions : programmes NFP 2024 et 2027 (SMIC à 1 600 € net : LFI, PS, Écologistes, PCF) ; RN (préfère les exonérations sur les hausses de salaire) ; RE, HOR, LR, REC, NE (opposition au coup de pouce, par déclarations ou programmes 2022). **Estimation : 9/10.**

**q06-chomage** · `travail` · `economique` / `1` · _reformulée_

- **statement** : Il faut durcir les règles de l'assurance chômage.
- **help** : Les règles du chômage ont été resserrées plusieurs fois depuis 2019, en dernier lieu par une loi de juin 2026. Pour les ruptures conventionnelles conclues depuis le 1er septembre 2026, la durée maximale d'indemnisation est de 15 mois pour les moins de 55 ans (en métropole). Les partisans d'un durcissement veulent encourager la reprise d'emploi, ses opposants dénoncent une perte de protection.
- Sources : https://www.info.gouv.fr/actualite/assurance-chomage-un-projet-de-loi-pour-faire-evoluer-les-ruptures-conventionnelles ; https://tpeactu.fr/2026/08/06/rupture-conventionnelle-chomage-nouvelles-regles-septembre-2026/
- Positions : scrutin de la loi de juin 2026 sur datan ; programmes. Les positions de la v1 fondées uniquement sur le RSA sont à recoder. **Estimation : 9/10.**

**q27-temps-de-travail** · `travail` · `economique` / `1` · _nouvelle_

- **statement** : Il faut augmenter la durée légale du travail au-delà de 35 heures par semaine.
- **help** : La durée légale est de 35 heures par semaine depuis les lois Aubry (1998-2000). Au-delà, les heures sont payées en heures supplémentaires. Les salariés à temps complet travaillent en moyenne 36,2 heures (Dares). Certains proposent de relever ou d'annualiser cette durée, d'autres de la réduire, par exemple à 32 heures.
- Sources : https://www.publicsenat.fr/actualites/economie/fin-des-35-heures-proposee-par-darmanin-un-dispositif-souvent-attaque-mais-jamais-supprime ; https://www.publicsenat.fr/actualites/politique/la-fete-est-finie-bruno-retailleau-veut-supprimer-les-35-heures-inciter-a-la-reprise-dactivite-et-plafonner-les-aides-sociales-pour-relancer-lemploi
- Positions : LR/Retailleau (sortie des 35 h, juillet 2026), REC, NE/Lisnard (programme), RN (maintien des 35 h, par déclarations), LFI et Écologistes (32 h), PS et PCF (maintien ou réduction). RE et HOR à vérifier : déclarations de Darmanin, d'Attal, de Philippe. **Estimation : 8/10.**

### Immigration (3)

**q07-immigration** · `immigration` · `societal` / `1` · _gardée_

- **statement** : Il faut réduire fortement l'immigration légale (regroupement familial, titres de séjour).
- **help** : 384 230 premiers titres de séjour ont été délivrés en 2025 (+11 % sur un an) : environ 118 000 pour études, 92 600 pour motifs humanitaires, 51 200 pour motifs économiques, le reste principalement pour motifs familiaux.
- Sources : https://www.immigration.interieur.gouv.fr/documentation/etudes-et-statistiques/titres-de-sejour-en-2025-protections-subsidiaires-ont-plus-que-double.html

**q08-preference** · `immigration` · `societal` / `1` · _reformulée (léger)_

- **statement** : Les Français devraient passer avant les étrangers pour obtenir un logement social ou certaines aides sociales.
- **help** : C'est la « préférence nationale » (ou « priorité nationale »). Ses partisans proposent de l'inscrire dans la Constitution, notamment par référendum. Ses opposants estiment qu'elle est contraire au principe d'égalité inscrit dans la Constitution.
- Positions : programmes RN et REC (pour) ; déclarations ou programmes de RE, HOR, PS, LR. Attention, LR propose plutôt une condition de durée de résidence : à coder 0 ou −1 avec justification. **Estimation : 9/10.**

**q09-regularisation** · `immigration` · `societal` / `-1` · _gardée_

- **statement** : Il faut faciliter la régularisation des travailleurs sans papiers dans les métiers qui recrutent difficilement.
- **help** : Les « métiers en tension » (BTP, restauration, aide à domicile…) peinent à recruter. La loi immigration de janvier 2024 a créé, à titre expérimental jusqu'au 31 décembre 2026, une régularisation possible pour ces travailleurs. Aucune prolongation n'a été votée à ce jour. Une circulaire de janvier 2025 a durci les conditions de régularisation, et le nombre de régularisations a baissé en 2025.
- Sources : https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049040245 ; https://www.maire-info.com/immigration/ce-que-contient-la-circulaire-retailleau-sur-la-regularisation-des-etrangers-en-situation-irreguliere-article-29333 ; https://observalgerie.com/2026/05/28/immigration/travailleurs-sans-papiers-en-france-le-gouvernement-envisage-un-assouplissement-des-regularisations/ (source secondaire : à vérifier sur Légifrance avant publication si un texte est adopté d'ici fin 2026)

### Sécurité et justice (3)

**q10-peines-planchers** · `securite` · `societal` / `1` · _gardée_

- **statement** : Il faut rétablir des peines minimales obligatoires (peines planchers) pour certains délits.
- **help** : Des peines planchers ont existé de 2007 à 2014 pour les récidivistes. Elles limitent la liberté du juge pour fixer la peine. Le projet de loi « SURE » présenté en mars 2026 prévoit des peines minimales. Il a été adopté par le Sénat en avril 2026 et son examen n'est pas terminé.
- Sources : https://www.actu-juridique.fr/penal/projet-sure-correctifs-senatoriaux-amendements-du-cnb-et-sequence-de-concertation-institutionnelle/ (vérifier que les peines minimales figurent encore dans le texte avant publication)

**q29-cannabis** · `securite` · `societal` / `-1` · _nouvelle_

- **statement** : Il faut légaliser la vente et la consommation de cannabis, sous le contrôle de l'État.
- **help** : Consommer du cannabis est un délit en France. Les consommateurs peuvent recevoir une amende forfaitaire, portée de 200 à 500 € par la loi « RIPOST » adoptée en juillet 2026. Les partisans de la légalisation mettent en avant la lutte contre les trafics et la prévention, ses opposants les risques pour la santé, en particulier chez les jeunes.
- Sources : https://www.interieur.gouv.fr/actualites/actualites-du-ministere/loi-ripost-avancee-majeure-pour-securite-des-francais ; https://blog.landot-avocats.net/2026/08/21/que-retenir-de-la-loi-ripost/
- Positions : programmes LFI et Écologistes (pour la légalisation) ; PS (débat interne, à vérifier dans le projet 2027) ; PCF (Roussel opposé, par déclarations) ; RE, HOR, LR, RN, REC, NE (opposés : amendes, loi RIPOST, déclarations). Le vote sur RIPOST (351 voix contre 179) peut servir d'appoint, mais la loi porte sur bien d'autres sujets. **Estimation : 9/10.** La question sépare aussi les partis de gauche entre eux.

**q34-mineurs** · `securite` · `societal` / `1` · _nouvelle_

- **statement** : Un mineur de 16 ans ou plus qui commet un délit grave devrait être puni comme un adulte.
- **help** : Aujourd'hui, un mineur encourt en principe une peine réduite de moitié par rapport à un adulte : c'est l'« excuse de minorité ». La loi de 2025 sur la justice des mineurs permettait de l'écarter plus facilement à partir de 16 ans. Le Conseil constitutionnel a censuré cette mesure le 19 juin 2025, au nom d'un principe constitutionnel propre à la justice des mineurs.
- Sources : https://www.publicsenat.fr/actualites/politique/justice-des-mineurs-le-conseil-constitutionnel-censure-largement-le-texte-attal-notamment-la-derogation-de-lexcuse-de-minorite ; https://www.leclubdesjuristes.com/en-bref/justice-penale-des-mineurs-le-conseil-constitutionnel-censure-de-nombreuses-dispositions-de-la-proposition-de-loi-11161/
- Positions : scrutin final de la proposition de loi Attal (19 mai 2025, à retrouver sur datan.fr), proposition de loi constitutionnelle au Sénat (majorité pénale à 16 ans), programmes RN et REC, déclarations de Darmanin (RE). **Estimation : 9/10.** Elle remplace q11 pour couvrir la délinquance, citée par 22 % des Français dans _Fractures françaises_ 2025.

### Écologie et énergie (4)

**q12-nucleaire** · `ecologie` · `null` / `1` · _gardée_

- **statement** : La France doit construire de nouveaux réacteurs nucléaires.
- **help** : Le nucléaire a produit environ 68 % de l'électricité française en 2025. La programmation pluriannuelle de l'énergie adoptée en février 2026 prévoit six nouveaux réacteurs EPR2, dont le premier est attendu vers 2038.
- Sources : https://www.connaissancedesenergies.org/la-production-electrique-bas-carbone-de-la-france-atteint-un-maximum-historique-en-2025

**q13-renouvelables** · `ecologie` · `null` / `1` · _gardée_

- **statement** : Il faut accélérer le développement de l'éolien et du solaire.
- **help** : Les énergies renouvelables représentaient 23 % de la consommation finale d'énergie en 2024, pour un objectif légal de 33 % en 2030. L'éolien suscite des oppositions locales (paysage, bruit).
- Sources : https://www.statistiques.developpement-durable.gouv.fr/les-energies-renouvelables-en-france-en-2024-dans-le-cadre-du-suivi-de-la-directive-ue-20182001

**q14-normes-agricoles** · `ecologie` · `economique` / `1` · _reformulée (léger)_

- **statement** : Il faut alléger les règles environnementales que doivent respecter les agriculteurs.
- **help** : La loi Duplomb (2025) voulait notamment réautoriser l'acétamipride, un pesticide interdit. Cette mesure, contestée par une pétition de plus de 2 millions de signatures, a été censurée par le Conseil constitutionnel. La loi d'urgence agricole (2026) l'a réintroduite sous forme de dérogation encadrée, ce que le Conseil constitutionnel a validé.
- Sources : https://www.terre-net.fr/politique/article/902248/la-loi-d-urgence-agricole-validee-par-le-conseil-constitutionnel
- Positions : celles de la v1 (10/10) restent valables, le changement de formulation est minime.

**q30-zfe** · `ecologie` · `null` / `1` · _nouvelle_

- **statement** : Il faut supprimer les zones à faibles émissions (ZFE), qui interdisent les voitures les plus polluantes dans certaines villes.
- **help** : Les ZFE limitent la circulation des véhicules les plus anciens dans les grandes agglomérations pour réduire la pollution de l'air. Le Parlement a voté leur suppression en avril 2026, mais le Conseil constitutionnel l'a censurée le 21 mai 2026 parce qu'elle n'avait pas sa place dans ce texte (« cavalier législatif »). Les ZFE restent donc en vigueur.
- Sources : https://lcp.fr/actualites/zfe-le-conseil-constitutionnel-censure-la-suppression-des-zones-a-faibles-emissions ; https://blog.landot-avocats.net/2026/05/21/loi-de-simplification-de-la-vie-economique-le-conseil-constitutionnel-mitraille-les-cavaliers-legislatifs-dont-la-suppression-des-zfe/
- Positions : scrutins de l'amendement de suppression (28 mai 2025, 98 voix contre 51) et du texte final (14 avril 2026) sur datan. Pour la suppression : RN, LR ; contre : Écologistes ; EPR divisé (30 contre, 25 pour, 19 abstentions) → RE `null` ou 0 avec justification ; position nuancée de LFI (conditionner les ZFE aux alternatives). **Estimation : 8/10.** Sujet transversal et très concret, donc `axis: null`.

### Santé (2)

**q15-medecins** · `sante` · `null` / `1` (direction indicative) · _reformulée, l'axe change_

- **statement** : L'État doit pouvoir refuser l'installation d'un médecin là où il y a déjà assez de médecins.
- **help** : Environ 6 millions de personnes n'ont pas de médecin traitant. Une proposition de loi qui conditionne l'installation dans les zones bien dotées a été adoptée par l'Assemblée en mai 2025. Le Sénat en a voté une version assouplie en juin 2026 et la procédure n'est pas terminée. Les syndicats de médecins défendent la liberté d'installation.
- Sources : https://lcp.fr/actualites/deserts-medicaux-l-assemblee-adopte-la-proposition-de-loi-qui-prevoit-de-reguler-l ; https://www.caducee.net/actualite-medicale/16919/deserts-medicaux-le-senat-adopte-une-regulation-edulcoree-de-l-installation-mais-laisse-la-loi-garot-en-plan.html
- Positions : scrutin du 7 mai 2025 (PPL Garot, transpartisane) sur datan. Les votes par groupe donnent 9 groupes. **Estimation : 9/10** (contre 7/10 en v1).

**q16-fin-de-vie** · `sante` · `societal` / `-1` · _reformulée (léger)_

- **statement** : La loi de 2026 qui autorise l'aide à mourir doit être conservée.
- **help** : La loi créant un « droit à l'aide à mourir » a été adoptée définitivement le 15 juillet 2026 (291 voix contre 241), puis validée sous réserves par le Conseil constitutionnel le 14 août 2026. Elle s'adresse à des adultes atteints d'une maladie grave et incurable, sous des conditions strictes. Certains partis proposent de l'abroger ou de la restreindre.
- Sources : https://www.actu-juridique.fr/sante-droit-medical/bioethique/flash-la-loi-sur-le-droit-a-laide-a-mourir-adoptee-par-291-voix-contre-241/ ; https://www.info.gouv.fr/actualite/aide-a-mourir-ce-que-dit-la-loi
- Positions : vote final (liberté de vote : coder `null` si le groupe est divisé à peu près à parts égales), déclarations des candidats. **Estimation : 9/10.**

### Éducation (1)

**q17-ecole-privee** · `education` · `economique` / `-1` · _reformulée_

- **statement** : L'argent public versé aux écoles privées sous contrat devrait dépendre de la mixité sociale de leurs élèves.
- **help** : L'enseignement privé sous contrat scolarise environ 17,6 % des élèves, soit plus de 2 millions. L'État y paie notamment les enseignants. Les écoles privées accueillent en moyenne des élèves de milieux plus favorisés que les écoles publiques. Un protocole signé en 2023 avec l'enseignement catholique prévoit des efforts de mixité volontaires, sans sanction financière.
- Sources : https://www.education.gouv.fr/sites/default/files/document/3-les-eleves-du-premier-degrepdf-519282.pdf (le protocole de 2023 est à sourcer avant publication)
- Positions : propositions de loi de la gauche (PS, LFI) et rapport Vannier-Weissberg (2024) ; LR, RN et REC opposés au nom de la « liberté scolaire » (programmes) ; RE favorable au protocole volontaire, donc −1 probable. **Estimation : 8/10.**

### Europe, défense, international (5)

**q18-ukraine** · `europe` · `europe` / `1` · _reformulée_

- **statement** : La France doit continuer à livrer des armes à l'Ukraine.
- **help** : La France livre des armes et forme des soldats ukrainiens depuis l'invasion russe de 2022. Elle participe à la « coalition des volontaires », qui prépare des garanties de sécurité en cas d'accord de paix. Les négociations de paix se poursuivent sans accord durable à ce jour.
- Sources : https://lcp.fr/actualites/l-assemblee-nationale-soutient-largement-l-accord-avec-l-ukraine-sans-le-rn-qui-s ; https://www.elysee.fr/emmanuel-macron/2026/07/13/determines-a-accelerer-les-progres-vers-la-paix-declaration-des-copresidents-de-la-coalition-des-volontaires
- Positions : scrutin du 12/03/2024 (372 voix contre 99 : contre LFI et PCF, abstention du RN, pour les autres groupes) sur https://datan.fr/votes/legislature-16/vote_3461 ; déclarations plus récentes de chaque parti sur les armes à longue portée. **Estimation : 9/10.** Le lien avec l'axe européen (défense européenne contre souveraineté nationale) est plausible, mais à confirmer avec les corrélations calculées après codage.

**q19-droit-europeen** · `europe` · `europe` / `-1` · _reformulée_

- **statement** : Quand une loi française et une règle européenne se contredisent, la loi française doit l'emporter.
- **help** : Aujourd'hui, les traités et le droit européens priment sur les lois françaises, mais pas sur la Constitution, selon le Conseil d'État et le Conseil constitutionnel. Remettre en cause cette primauté supposerait de modifier la Constitution ou les traités.
- Positions : programmes RN, REC, LR (référendum sur la primauté), NE ; LFI et PCF (« désobéissance » aux traités : à coder +1 avec justification) ; programmes européens 2024 de RE, PS-PP, Écologistes et HOR, qui défendent la primauté et étaient absents en v1. **Estimation : 9/10.**

**q20-defense-europe** · `europe` · `europe` / `1` · _reformulée_

- **statement** : L'Union européenne doit emprunter en commun pour financer la défense européenne.
- **help** : L'Union européenne a emprunté en commun à grande échelle pour la première fois en 2020, pour son plan de relance après le Covid. Le programme SAFE, adopté en mai 2025, prévoit jusqu'à 150 milliards d'euros de prêts pour la défense, financés par un emprunt de l'UE. La France a signé en juin 2026 un prêt d'environ 15 milliards d'euros.
- Sources : https://www.consilium.europa.eu/fr/policies/safe/ ; https://lepetitjournal.com/expat-politique/actualites/defense-europeenne-la-france-signe-un-pret-de-151-milliards-deuros-safe-446718
- Positions : vote du Parlement européen sur la résolution du 12/03/2025 (livre blanc / ReArm Europe, P10_TA(2025)0034), vote nominatif par délégation française sur HowTheyVote.eu ; déclarations (Macron et RE favorables à l'emprunt commun ; RN, REC, LFI, PCF opposés). **Estimation : 8/10.**

**q32-ukraine-ue** · `europe` · `europe` / `1` · _nouvelle_

- **statement** : L'Ukraine devrait pouvoir entrer dans l'Union européenne.
- **help** : L'Ukraine est officiellement candidate depuis juin 2022. Après la levée du veto hongrois en juin 2026, deux des six chapitres de négociation ont été ouverts, mais la Hongrie bloque de nouveau l'ouverture des suivants depuis septembre 2026. Toute adhésion doit être approuvée à l'unanimité par les États membres.
- Sources : https://fr.euronews.com/my-europe/2026/06/03/apres-deux-ans-de-blocage-la-hongrie-leve-son-veto-au-processus-dadhesion-de-lukraine-a-lu ; https://fr.euronews.com/my-europe/2026/09/09/un-nouveau-veto-hongrois-ralentit-ladhesion-de-lukraine-a-lue
- Positions : déclarations et programmes européens 2024 (RN, REC, LR et LFI opposés ou très réservés ; RE, PS-PP et Écologistes favorables) ; votes du Parlement européen sur les résolutions concernant l'élargissement. PCF, HOR et NE à vérifier. **Estimation : 8/10.**

**q33-veto-europeen** · `europe` · `europe` / `-1` · _nouvelle_

- **statement** : Chaque pays doit garder un droit de veto sur les grandes décisions de l'Union européenne.
- **help** : La plupart des décisions européennes se prennent à la « majorité qualifiée » : 55 % des États représentant 65 % de la population. Pour la politique étrangère, les impôts, l'élargissement ou le budget pluriannuel, l'unanimité reste obligatoire, ce qui donne un droit de veto à chaque pays. Plusieurs États, dont la France, ont proposé d'étendre la majorité qualifiée à la politique étrangère.
- Sources : https://www.consilium.europa.eu/fr/council-eu/voting-system/qualified-majority/ ; https://www.euronews.com/2026/04/15/is-the-eu-ready-to-drop-unanimous-voting
- Positions : programmes européens 2024 (Écologistes et Renew/RE favorables à la majorité qualifiée ; RN, REC, LR, LFI et PCF attachés à l'unanimité) ; vote du Parlement européen du 22/11/2023 sur la révision des traités (à vérifier sur HowTheyVote.eu). PS-PP, HOR et NE à vérifier. **Estimation : 8/10.** Elle mesure l'intégration européenne au sens strict, ce qui stabilise l'axe.

### Institutions et démocratie (3)

**q23-referendum** · `institutions` · `societal` / `1` · _reformulée_

- **statement** : Il faut organiser un référendum sur l'immigration.
- **help** : Selon la majorité des constitutionnalistes, l'article 11 de la Constitution ne permet pas aujourd'hui d'organiser un référendum direct sur l'immigration. Ses partisans proposent donc de modifier d'abord la Constitution. Ses opposants y voient un risque pour les droits fondamentaux.
- Sources : https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006071194 (Constitution, art. 11)
- Positions : RN, REC, LR (programmes et déclarations, pour) ; LFI, PS, Écologistes, PCF (opposés, par déclarations) ; RE et HOR à documenter (Macron a évoqué des référendums sans retenir celui-ci). **Estimation : 8/10.**

**q24-proportionnelle** · `institutions` · `null` / `1` · _gardée_

- **statement** : Il faut instaurer la proportionnelle aux élections législatives.
- **help** : Les députés sont élus au scrutin majoritaire à deux tours, par circonscription. La proportionnelle n'a été utilisée qu'une fois sous la Ve République, en 1986.
- Sources : https://www.senat.fr/leg/ppl25-375.html

**q31-voile-sport** · `institutions` · `societal` / `-1` · _nouvelle_

- **statement** : Une sportive doit pouvoir porter le voile pendant une compétition.
- **help** : La laïcité impose la neutralité religieuse aux agents publics, pas aux simples citoyens. Certaines fédérations sportives interdisent déjà les signes religieux en compétition. En février 2025, le Sénat a adopté (210 voix contre 81) une proposition de loi qui les interdit dans toutes les compétitions organisées par les fédérations. L'Assemblée nationale ne l'a pas adoptée à ce jour.
- Sources : https://www.publicsenat.fr/actualites/parlementaire/laicite-le-senat-vote-linterdiction-du-port-de-signes-religieux-dans-les-competitions-sportives-et-les-piscines ; https://www.publicsenat.fr/actualites/politique/voile-dans-le-sport-le-gouvernement-promet-linscription-du-texte-du-senat-a-lordre-du-jour-de-lassemblee
- Positions : scrutin du Sénat (pour l'interdiction : LR et centristes ; contre : groupes de gauche), programmes RN et REC, déclarations (Attal et RE favorables à l'interdiction ; LFI et Écologistes opposés). PS et PCF à vérifier : désaccords internes possibles. **Estimation : 8/10.** Formulée dans le sens « liberté », pour équilibrer l'axe sociétal. Il faut vérifier que la mention de la laïcité dans `help` reste neutre. Thème : faute de thème « société / laïcité », elle est rangée dans `institutions`. Créer un thème `societe` serait plus juste.

---

## 4. Équilibre par axe (contrôle)

| Axe                                            | Accord → pôle −              | Accord → pôle +         | Total  |
| ---------------------------------------------- | ---------------------------- | ----------------------- | ------ |
| economique (−1 = redistribution ; +1 = marché) | q01, q04, q05, q17, q26      | q02, q06, q14, q25, q27 | **10** |
| societal (−1 = libertés ; +1 = autorité)       | q09, q16, q29, q31           | q07, q08, q10, q23, q34 | **9**  |
| europe (−1 = souveraineté ; +1 = intégration)  | q19, q33                     | q18, q20, q32           | **5**  |
| `null`                                         | q12, q13, q15, q24, q28, q30 |                         | **6**  |

- Économie : 10 questions dans 5 thèmes (fiscalité, budget, État actionnaire, salaires et temps de travail, école).
- Société : 4 questions liées à l'immigration sur 9 (q07, q08, q09, q23). L'immigration ne domine donc plus l'axe à
  elle seule. Sécurité, mœurs et laïcité complètent.
- Europe : 5 questions, contre 3 en v1, dont 2 presque vides. Trois portent sur l'UE au sens strict (q19, q20, q33),
  une sur l'élargissement (q32) et une sur la défense (q18). Si les corrélations montrent que q18 mesure autre chose,
  il faut la passer en `null` : il reste alors 4 questions, ce qui respecte le minimum demandé.
- Répartition par thème : economie 5, travail 4, immigration 3, securite 3, ecologie 4, sante 2, education 1,
  europe 5, institutions 3.

---

## 5. Sujets examinés et non retenus (banque de réserve)

| Sujet                                               | Décision            | Raison                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Encadrement des loyers (étendre aux grandes villes) | Réserve, priorité 1 | Sujet très actuel : l'expérimentation devait prendre fin le 24/11/2026, et le Sénat a voté le 21/10/2026, par 325 voix contre 17, sa prolongation de deux ans (https://www.journaldeleconomie.fr/?p=49938). Mais le vote presque unanime du Sénat brouille les positions (LR a voté pour la prolongation), et le RN n'a pas de position claire. À reprendre si le débat porte sur l'extension. |
| Commandement intégré de l'OTAN                      | Réserve             | Positions connues (LFI et PCF pour la sortie ; RN et REC ont varié depuis 2022). Ce n'est pas une question d'intégration européenne au sens strict.                                                                                                                                                                                                                                            |
| Reconnaissance faciale par caméras                  | Réserve             | La reconnaissance faciale reste interdite, et la vidéosurveillance algorithmique est prolongée jusqu'en 2030 par la loi RIPOST (https://www.leto.legal/news/loi-ripost-videoprotection-algorithmique-2030-conseil-constitutionnel-2026). Peu de scrutins portent directement dessus : environ 7/10.                                                                                            |
| Vote des étrangers aux élections locales, AME       | Réserve             | Très documentables, mais ils renforceraient encore le poids de l'immigration sur l'axe sociétal.                                                                                                                                                                                                                                                                                               |
| VIe République / RIC                                | Réserve             | Notions abstraites, et le lien avec un axe n'est pas valide (voir q22).                                                                                                                                                                                                                                                                                                                        |
| Sortie de l'UE ou de l'euro                         | Non retenu          | Aucun des 10 partis ne la propose : elle ne départage personne.                                                                                                                                                                                                                                                                                                                                |
| Budget de la défense                                | Non retenu          | Quasi-consensus sur la hausse.                                                                                                                                                                                                                                                                                                                                                                 |
| Service militaire obligatoire                       | Non retenu          | Pas de lien avec un axe : LFI (« conscription citoyenne ») et REC la soutiennent pour des raisons opposées. Le service volontaire de 10 mois a commencé en 2026.                                                                                                                                                                                                                               |
| Nouvelle-Calédonie                                  | Non retenu          | Sujet complexe (accord de Bougival, corps électoral) et peu connu du public. Les positions évoluent vite, et une affirmation simple risquerait d'être inexacte.                                                                                                                                                                                                                                |
| Dissolution / démission du président                | Non retenu          | Lié à l'actualité immédiate, sans mesure de programme.                                                                                                                                                                                                                                                                                                                                         |
| Mercosur / libre-échange                            | Supprimé            | Quasi-consensus (voir q21).                                                                                                                                                                                                                                                                                                                                                                    |

---

## 6. Points de vigilance pour la mise en œuvre

1. **Recoder les positions** des 13 questions reformulées et coder les 10 nouvelles, selon la charte (sources
   hiérarchisées, `null` si le parti est divisé ou silencieux). Les estimations « n/10 » ci-dessus sont des objectifs,
   pas des faits.
2. **Recalculer `questionnaire-stats`** : retirer ou remplacer toute question sous 8/10 ou dont l'écart-type est
   inférieur à 1,0.
3. **Carte** : n'afficher la position d'un parti sur un axe que si au moins 4 de ses positions sur cet axe sont
   connues. Aujourd'hui, `computeAxisPosition` fait la moyenne dès la première valeur.
4. **Ids** : on conserve les ids des questions dont l'idée ne change pas, pour garder la compatibilité des réponses
   enregistrées. q01-isf garde son id malgré son nom historique. Les ids supprimés (q03, q11, q21, q22) ne doivent pas
   être réutilisés.
5. **Faits à revérifier juste avant publication**, car ils peuvent changer d'ici la fin de 2026 : expérimentation
   de régularisation (q09), projet de loi « SURE » (q10), proposition de loi sur l'installation des médecins (q15),
   budget 2027 (q01, q28), négociations d'adhésion de l'Ukraine et cessez-le-feu (q18, q32), encadrement des loyers
   (réserve).
