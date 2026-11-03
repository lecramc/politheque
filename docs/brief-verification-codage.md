# Brief — vérification croisée des positions codées (questionnaire v2)

Tu n'as PAS codé ces positions. Lis `docs/brief-codage-positions.md` (règle de codage, identique
pour tous les partis), `docs/charte-editoriale.md`, `src/programmes/data/questions.ts` (énoncés qui
font foi — attention : q28 et q34 ont été reformulés après codage) et `docs/questionnaire-stats-v2.md`.

Pour chacune de tes questions, dans `docs/codage/<id>.json` :

1. Ouvre au moins une source de chaque position non nulle et vérifie que la valeur découle
   exactement de la source ET de l'énoncé actuel. Corrige la valeur, la justification ou la source.
2. Cohérence de la règle : même type de preuve → même valeur pour tous les partis (ex. un vote de
   groupe sans déclaration du candidat est codé de la même façon partout ; un candidat qui contredit
   son groupe l'emporte partout).
3. Positions nulles : cherche activement une source explicite (déclaration du candidat 2025-2026,
   vote, programme) ; remplis seulement si c'est explicite.
4. Justifications : phrases pour le lecteur, sans note de travail (« dans les sources consultées »,
   « par cohérence », « règle 4 »…), sans nommer Wikipédia ou un agrégateur, dates en toutes
   lettres.
5. Sources faibles (agrégateurs, sites peu connus) : remplace par une source de référence ou
   ajoute une 2e source ; si impossible et que la position n'est pas solide → null.
6. Signale dans `notes` toute erreur dans le texte `help` de la question.

Ne modifie que les fichiers docs/codage/ attribués (sauf mission spéciale ci-dessous). JSON valide.
Rapport final : par question, positions vérifiées, modifiées (avant → après), nouvelles positions
trouvées, et nombre de positions non nulles sur 10.
