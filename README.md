# TaskFlow — Gestionnaire de tâches

TaskFlow est une application web de gestion de tâches permettant à chaque utilisateur de créer un compte, de se connecter et d'organiser ses tâches dans un tableau Kanban.

Ce projet est développé dans le cadre de ma formation à l'EFREI, afin de mettre en pratique le développement d'une application full-stack.

## 1. Objectifs du projet

L'objectif principal est de développer une application simple, fonctionnelle et maintenable.

TaskFlow permet de :

- Créer un compte utilisateur.
- Se connecter et se déconnecter.
- Conserver une session utilisateur.
- Créer une tâche.
- Afficher ses tâches dans un tableau Kanban.
- Modifier le titre et le statut d'une tâche.
- Supprimer une tâche.
- Séparer les tâches de chaque utilisateur.

Le projet privilégie la compréhension du code, la qualité de l'architecture et le fonctionnement des fonctionnalités essentielles.

## 2. Technologies utilisées

| Partie           | Technologies | Rôle                                          |
| ---------------- | ------------ | --------------------------------------------- |
| Frontend         | React        | Construire l'interface utilisateur            |
| Frontend         | TypeScript   | Ajouter un typage au code JavaScript          |
| Frontend         | Vite         | Lancer et construire l'application            |
| Design           | CSS          | Styliser l'interface et gérer le responsive   |
| Backend          | Node.js      | Exécuter JavaScript côté serveur              |
| Backend          | Express      | Créer les routes de l'API REST                |
| Base de données  | MongoDB      | Stocker les utilisateurs et les tâches        |
| Base de données  | Mongoose     | Définir les modèles et interagir avec MongoDB |
| Authentification | JWT          | Vérifier l'identité des utilisateurs          |
| Sécurité         | bcryptjs     | Hacher les mots de passe                      |

## 3. Architecture générale

L'application repose sur trois parties.

**Frontend :** affiche l'interface et récupère les actions de l'utilisateur.

**Backend :** reçoit les requêtes HTTP, vérifie l'authentification et applique les règles métier.

**Base de données :** conserve les utilisateurs et leurs tâches.

Flux simplifié :

```text
Utilisateur
    |
    v
Frontend React
    |
    | Requête HTTP
    v
API Express
    |
    | Authentification et traitement
    v
MongoDB
    |
    | Données
    v
API Express
    |
    | Réponse JSON
    v
Frontend React
```

## 4. Organisation du projet

````text
taskflow/
|
|-- backend/
|   |-- middleware/
|   |    -- requireAuth.js
|   |
|   |-- models/
|   |   |-- Task.js
|   |    -- User.js
|   |
|   |-- routes/
|   |   |-- authRoutes.js
|   |   -- taskRoutes.js
|   |
|    -- app.js
|
|-- frontend/
|    -- src/
|       |-- components/
|       |   |-- LoginForm.tsx
|       |   |-- RegisterForm.tsx
|       |   |-- TaskForm.tsx
|       |   |-- TaskItem.tsx
|       |   `-- TaskList.tsx
|       |
|       |-- services/
|       |   `-- authService.ts
|       |
|       |-- types/
|       |   |-- Task.ts
|       |   `-- User.ts
|       |
|       |-- App.tsx
|       |-- App.css
|       |-- index.css
|       `-- main.tsx
|
  - README.md


Cette arborescence représente les principaux fichiers connus du projet. Elle pourra être complétée après vérification de la structure réelle.

## 5. Fonctionnement de l'authentification

Lorsqu'un utilisateur crée un compte :

1. Il remplit le formulaire d'inscription React.
2. Le frontend envoie ses informations au backend.
3. Le backend vérifie les informations.
4. Le mot de passe est haché avec bcryptjs.
5. L'utilisateur est enregistré dans MongoDB.

Lorsqu'un utilisateur se connecte :

1. Il saisit son adresse e-mail et son mot de passe.
2. Le frontend envoie une requête à l'API.
3. Le backend vérifie ses identifiants.
4. Un token JWT est généré.
5. Le token est envoyé dans un cookie HttpOnly.
6. Le frontend affiche le tableau de bord.

Au chargement de l'application, le frontend appelle l'API pour vérifier si une session valide existe.

Le cookie HttpOnly n'est pas directement accessible depuis JavaScript dans le navigateur.

## 6. Gestion des tâches

Chaque tâche appartient à un utilisateur.

Une tâche contient notamment :

| Champ       | Description |
|---------------------------------------------
| `_id`.      | Identifiant unique MongoDB    |
| `title.     | Titre de la tâche             |
| `description| Description facultative.      |
| `status`    | Statut de la tâche            |
| `dueDate`   | Date limite facultative       |
| `user`      | Identifiant du propriétaire   |
| `createdAt` | Date de création              |
| `updatedAt` | Date de dernière modification |

Les trois statuts possibles sont :

- `todo` : À faire.
- `doing` : En cours.
- `done` : Terminé.

Le tableau Kanban affiche les tâches dans la colonne correspondant à leur statut.

Actuellement, le formulaire de création utilise principalement le titre. Les autres champs pourront être exploités dans de futures évolutions.

## 7. API REST

### Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |
| GET  | `/api/auth/me` | Récupérer l'utilisateur connecté |
| POST | `/api/auth/logout` | Se déconnecter |

### Tâches

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Récupérer ses tâches |
| GET | `/api/tasks/:id` | Récupérer une tâche |
| POST | `/api/tasks` | Créer une tâche |
| PATCH | `/api/tasks/:id` | Modifier une tâche |
| DELETE | `/api/tasks/:id` | Supprimer une tâche |

Les routes de gestion des tâches nécessitent une authentification.

## 8. Sécurité

Les premières protections mises en place sont :

- Hachage des mots de passe avec bcryptjs.
- Authentification par JWT.
- Stockage du JWT dans un cookie HttpOnly.
- Vérification de l'authentification par middleware.
- Association des tâches à leur propriétaire.
- Restriction des opérations aux tâches de l'utilisateur connecté.
- Utilisation de variables d'environnement pour les secrets.

Ces protections constituent une base pour le développement local. Des améliorations restent nécessaires avant une mise en production, notamment la protection contre les attaques CSRF.

## 9. Installation locale

### Prérequis

- Node.js et npm.
- MongoDB accessible localement.
- Git.

### Backend

Depuis le dossier `backend` :

```bash
npm install
````

Créer un fichier `.env` :

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=remplacer_par_un_secret_aleatoire_robuste
```

Démarrer le serveur avec la commande définie dans `backend/package.json`.

### Frontend

Depuis le dossier `frontend` :

```bash
npm install
npm run dev
```

L'interface est normalement accessible sur :

`http://localhost:5173`

Le backend est configuré sur :

`http://localhost:3000`

## 10. Améliorations envisagées

Les prochaines évolutions pourront comprendre :

- Amélioration de l'organisation du code.
- Nettoyage des composants React.
- Centralisation des appels API.
- Ajout de tests automatisés.
- Amélioration de la gestion des erreurs.
- Renforcement de la sécurité.
- Ajout éventuel de nouvelles fonctionnalités de gestion des tâches.

Les nouvelles fonctionnalités seront étudiées uniquement après stabilisation et compréhension du code existant.

## 11. Conclusion

TaskFlow est un projet pédagogique full-stack qui met en pratique React, TypeScript, Express, MongoDB et l'authentification JWT.

Son objectif n'est pas de multiplier les fonctionnalités, mais de proposer une application cohérente, compréhensible et fonctionnelle.

Le projet servira également de support pour expliquer les échanges frontend/backend, la gestion des données, l'authentification et l'organisation du code.
