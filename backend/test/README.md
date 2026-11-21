# Tests unitaires

Depuis la racine du projet :

```bash
npm --prefix backend test
```

Ces tests utilisent `node:test` (Node.js 22 recommandé) et les dépendances déjà
présentes dans le backend. Si nécessaire, installer celles-ci avec `npm ci`
depuis le dossier `backend`.

- `models.test.js` : champs obligatoires, normalisation, statuts, valeurs par
  défaut et dates des modèles Task et User.
- `requireAuth.test.js` : sessions valides, tokens absents/invalides/expirés,
  utilisateur introuvable et erreur de base de données.

Aucun serveur ni MongoDB n'est démarré. Les modèles sont validés en mémoire,
les recherches utilisateur sont simulées et restaurées après chaque test.
Le secret JWT est temporaire et réservé au processus de test ; aucun fichier
`.env` n'est chargé et aucune donnée existante n'est modifiée.

Ces tests ne couvrent pas encore les routes HTTP, les interactions React,
ni les contraintes propres à MongoDB (par exemple l'unicité des emails).
