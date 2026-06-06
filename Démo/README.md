# X-plorer — Démo interactive

Reproduction fidèle, en HTML/CSS/JS statique, du parcours de l'application **X-plorer**
(prototype `x-plorer-app`), pré-remplie avec le profil test **« Léa »** — une femme en couple qui
veut mieux comprendre son désir (voir [persona.md](persona.md)).

Parcours : **Welcome → Bilan (quiz pré-rempli) → Résultats X-Score → App** (Score · Plan · Expériences · Profil).
Le moteur de calcul (X-Score, recommandations, classement d'expériences) est **transcrit** depuis le prototype
(`engine.js`) : les sorties sont identiques. Profil Léa → **X-Score 60**, profil « À réveiller », insight
« Pourquoi ton désir baisse les soirs de semaine ». Tout est recalculé en direct si on change une réponse.

## Lancer

Ouvrir `index.html` (double-clic). Aucune dépendance, aucun appel réseau.
Pour un rendu identique à l'intégration dans la landing, servir le dossier en statique, ex. :

```
npx serve .
```

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page hôte |
| `styles.css` | Design system porté de `x-plorer-app/src/app/globals.css` |
| `icons.js` | Icônes SVG portées de `Icon.tsx` |
| `engine.js` | Scoring + recommandations + expériences (portés des `lib/*`) |
| `persona.js` | Données du profil test « Léa » |
| `app.js` | Écrans + navigation |
| `persona.md` | Fiche détaillée du persona |

> Le prototype `x-plorer-app` n'est **jamais** modifié : ce dossier en est une transcription autonome.
