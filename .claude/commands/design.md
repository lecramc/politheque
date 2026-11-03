Produis une spec UI complète pour la feature décrite, puis écris-la dans `.claude/design-spec.md`.

## Lecture obligatoire avant de commencer

1. `CLAUDE.md` — composants disponibles, système de thème
2. `components/ui/` — inventaire exhaustif des composants existants
3. `components/ThemeContext.tsx` — tokens colors/effects/fonts
4. Les screens existants du domaine concerné — patterns établis

**Règle absolue : chercher dans `components/ui/` et `ThemeContext` avant de proposer quoi que ce soit de nouveau.**

---

## Output — écrire `.claude/design-spec.md`

```markdown
## Design Spec — [Nom de la feature]

### Écrans concernés

- [route Expo Router + screen src/]

### Composants DS utilisés

| Composant | Import | Props clés | Rôle dans l'écran |
| --------- | ------ | ---------- | ----------------- |

### Nouveaux composants à créer

Si un besoin ne peut pas être couvert par l'existant :
| Composant | Fichier | Props | Ce qu'il rend |
|-----------|---------|-------|---------------|
⚠️ Justifier pourquoi l'existant ne suffit pas.

### Tokens thème

- Backgrounds : colors.background.\*
- Surfaces : colors.surface.\*
- Textes : colors.text._, effects.sizes.text._
- Espacements : effects.spacing.\*
- Radius : effects.borderRadius.\*
- Typographie : fonts.\*

### i18n

| Clé | FR  | EN  |
| --- | --- | --- |

Fichiers : locales/fr/translation.json + locales/en/translation.json

### États UI

- **Loading** : [description]
- **Empty** : [description]
- **Error** : [description]
- **Populated** : [description]

### Accessibilité

- Rôles (accessibilityRole)
- Labels (accessibilityLabel)
- hitSlop sur les éléments < 44pt
- États désactivés (accessibilityState)

### Interdictions strictes

- Pas de couleurs hex hardcodées
- Pas de valeurs de spacing sans token
- Pas de logique métier dans les composants
- [autres contraintes spécifiques à la feature]
```

---

## Ce que tu NE fais PAS

- Tu n'écris pas de code de composant
- Tu ne touches pas aux fichiers store/, usecases/, gateways/
- Tu ne prends pas de décisions d'architecture (domaine, gateway, slice)

Une fois `.claude/design-spec.md` écrit : **"Design spec prête — lancer /archi pour continuer."**
