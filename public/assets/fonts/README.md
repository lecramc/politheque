# Polices web (WOFF2)

Servies par les `@font-face` statiques de `app/+html.tsx` (`font-display: swap`, 2 préchargements).
L'application native garde les TTF de `@expo-google-fonts` via `useFonts` (`app/_layout.tsx`).

Les fichiers sont convertis **sans sous-ensemble** (tous les glyphes du TTF), donc sans changement visuel.
Le suffixe du nom est l'empreinte SHA-256 (10 caractères) du fichier : `/assets/*` est servi avec un cache
immuable d'un an (`vercel.json`), un fichier régénéré doit donc changer de nom.

Régénérer (outil hors projet, aucune dépendance ajoutée) :

```bash
python3 -m venv /tmp/fonts-venv && /tmp/fonts-venv/bin/pip install fonttools brotli
/tmp/fonts-venv/bin/python3 -c "
from fontTools.ttLib import TTFont; import sys
f = TTFont(sys.argv[1]); f.flavor = 'woff2'; f.save(sys.argv[2])" \
  node_modules/@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf out.woff2
shasum -a 256 out.woff2 | cut -c1-10
```

Puis renommer en `<Famille>.<empreinte>.woff2` et mettre à jour `FONT_FILES` dans `app/+html.tsx`.

Licences : SIL Open Font License 1.1 (`OFL-*.txt`).
