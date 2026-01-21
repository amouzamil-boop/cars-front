# TP – Développement Web Frontend 2024‑2025

## Création d'une interface web pour la gestion de voitures classiques

**Repository de départ :** [https://github.com/web-rest-api/cars-front](https://github.com/web-rest-api/cars-front)

---

## Mise en place du projet

* Forker le dépôt GitHub dans votre propre compte
* Cloner le dépôt en local :

  ```bash
  git clone <URL_DU_REPO>
  ```
* Travailler localement sur votre machine

⚠️ **Important :** vous devez utiliser **votre propre API REST** déployée sur **Render**. Les données présentes dans `mock-data.js` servent uniquement de référence pour comprendre la structure des données.

---

## Introduction

### Objectifs du TP

Ce TP a pour but de développer une interface web moderne consommant une API REST existante. Vous mettrez en pratique :

* la manipulation du DOM,
* les requêtes HTTP asynchrones,
* la navigation entre pages dynamiques.

### Prérequis

* API REST backend fonctionnelle et déployée
* Bases en HTML5, CSS3, JavaScript ES6+
* Connaissance de `async / await`
* Notions de Bootstrap

### Technologies utilisées

* HTML5
* Bootstrap 5
* JavaScript Vanilla
* Fetch API
* URLSearchParams

À la fin du TP, vous serez capable de :

* structurer une application frontend moderne,
* consommer une API REST,
* gérer les erreurs et états de chargement,
* déployer une application frontend.

---

## Présentation générale

### Contexte pédagogique

Ce projet constitue la partie frontend d’un projet full‑stack. Il permet de visualiser et manipuler des données de voitures classiques stockées dans une API backend.

### Architecture générale

```
Frontend (Client)          Backend (Serveur)
┌─────────────┐            ┌──────────────┐
│ index.html  │───GET──────>│ /api/cars    │
│             │<───JSON────│              │
└─────────────┘            └──────────────┘
       │
       ▼
┌─────────────┐            ┌──────────────┐
│ car.html    │───GET──────>│ /api/cars/:id│
│   ?id=1     │<───JSON────│              │
└─────────────┘            └──────────────┘
```

---

## Fonctionnalités à implémenter

### Page d’accueil – `index.html`

* Affichage de toutes les voitures sous forme de cartes
* Grille responsive Bootstrap
* Liens vers les pages de détail

### Page de détail – `car.html`

* Récupération de l’ID depuis l’URL
* Affichage complet des informations
* Galerie d’images
* Bouton retour à l’accueil

---

## 1 – Structure HTML et Bootstrap

### Architecture existante

* `index.html`
* `car.html`
* `js/script.js`
* `js/mock-data.js` (référence uniquement)

### Tâches

* Supprimer la carte statique existante
* Générer les cartes dynamiquement
* Comprendre la navigation via `?id=`
* Préparer le modal d’ajout de voiture

---

## 2 – Récupération des données avec Fetch API

### Stratégie

* `GET /cars` pour la liste
* `GET /cars/:id` pour le détail

### Configuration de l’API

```js
const API_CONFIG = {
  baseURL: 'VOTRE_URL_RENDER',
  endpoints: {
    cars: '/cars'
  }
};
```

### Fonctions à créer

* `fetchAllCars()`
* `fetchCarById(id)`

Gestion des erreurs :

* try / catch
* vérification de `response.ok`

---

## 3 – Manipulation du DOM

### Création dynamique des cartes

Chaque carte contient :

* image
* titre
* description
* bouton "See more"
* bouton "Supprimer"

### Fonctions principales

* `createCarCard(car)`
* `displayCars(cars)`
* `displayCarDetails(car)`

---

## 4 – Bonnes pratiques

* DRY (Don’t Repeat Yourself)
* Séparation logique API / DOM / utils
* Nommage clair

Structure recommandée :

```
js/
├── config.js
├── api.js
├── dom.js
├── utils.js
├── home.js
├── car-details.js
└── script.js
```

---

## 5 – Formulaire et ajout de voiture

### Modal Bootstrap

Champs requis :

* Brand
* Model
* Year
* Color
* Price
* Mileage

Champs optionnels :

* Description
* Image URL

### Validation

* Champs requis
* Types numériques
* Année valide
* URL valide

### Envoi à l’API (POST)

⚠️ **Header obligatoire**

```http
x-api-key: ma-super-cle-api-2025
```

---

## 6 – Suppression de voiture

* Bouton supprimer sur chaque carte
* Confirmation utilisateur
* Requête DELETE authentifiée
* Suppression visuelle après succès

---

## 7 – Déploiement

### Vérifications

* URL API correcte
* Pas de logs inutiles
* Code propre et indenté

### Hébergement recommandé

* GitHub Pages
* Netlify
* Vercel

---

## Conclusion

À l’issue de ce TP, vous maîtriserez :

* la consommation d’API REST
* la manipulation avancée du DOM
* la programmation asynchrone
* le déploiement frontend

---

## Ressources

* MDN Fetch API
* MDN URLSearchParams
* Documentation Bootstrap 5
