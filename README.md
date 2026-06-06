# X-plorer — Landing page & Démo

Deux livrables marketing pour **X-plorer**, une application de bien-être intime (X-Score, bilan IA,
plan de soin, expériences). Les deux sont **statiques** (HTML/CSS/JS, zéro build) et reproduisent fidèlement
le design et la logique du prototype de l'app.

## 📁 [`Landing page/`](Landing%20page/)
Landing de **préinscription**. Hero, fonctionnalités, démo intégrée, récit du persona, confidentialité (RGPD)
et formulaire d'inscription branché sur **Supabase** (table `waitlist`).

## 📁 [`Démo/`](Démo/)
Démo interactive de l'app, pré-remplie avec le profil test **« Léa »** (femme en couple cherchant à mieux
comprendre son désir). Parcours complet : bilan → X-Score → plan → expériences. Le moteur de scoring est
transcrit du prototype : les résultats sont identiques.

## 🚀 Lancer en local
À servir en **HTTP** (l'iframe de la démo et Supabase ne fonctionnent pas en `file://`) :

```bash
npx serve .
```

Puis ouvrir `http://localhost:3000/Landing%20page/`.

## 🔒 Note
La clé Supabase présente dans `Landing page/preinscribe.js` est la clé **anon** (publiable, prévue pour le
navigateur). Les policies RLS n'autorisent que l'insertion anonyme dans `waitlist`. Aucune autre clé n'est exposée.
