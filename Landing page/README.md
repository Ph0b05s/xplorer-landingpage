# X-plorer — Landing page (préinscription)

Landing marketing dont l'objectif final est la **préinscription**. Le design est basé **uniquement sur le
prototype** `x-plorer-app` (tokens et classes `.landing-*` de `globals.css`, structure de `Landing.tsx`).
Elle intègre la **démo interactive** (`../Démo`) dans un mockup téléphone et raconte le parcours du profil **Léa**.

La capture d'email réutilise la plomberie Supabase de la « Lab landing page » : insertion dans la table
**`waitlist`** du projet Supabase existant. États gérés : succès, email invalide, « déjà inscrit » (doublon).

## Lancer

⚠️ À servir en **HTTP** (pas en `file://`) pour que l'iframe de la démo et Supabase fonctionnent. Depuis la
racine `Proto xplorer` (pour que `../Démo` soit accessible) :

```
npx serve .
```

puis ouvrir `http://localhost:3000/Landing%20page/` (ou le port affiché).

## Sections

Nav · Hero (aperçu X-Score de Léa) · Fonctionnalités · **Démo interactive** (iframe `../Démo`) ·
Récit du persona Léa · Confidentialité (RGPD) · **Préinscription** · Footer.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Page |
| `styles.css` | Design porté du prototype (`globals.css` `.landing-*`) |
| `icons.js` | Icônes SVG (mêmes que la démo) |
| `preinscribe.js` | Préinscription Supabase (`waitlist`) + hydratation des icônes |

## Supabase

- Projet : `ifzasupbzikcoyxmevec` (région EU). Table `waitlist(email unique, variant, consent_given, consent_version, created_at)`.
- Clé **anon** (publiable, prévue pour le navigateur) intégrée dans `preinscribe.js`. La policy RLS n'autorise
  que l'`INSERT` anonyme (pas de lecture des leads côté client).

> Ni `x-plorer-app/` ni `Lab landing page/` ne sont modifiés.
