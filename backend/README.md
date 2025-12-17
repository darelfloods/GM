# API Gestion des Actes de Mariage

Backend AdonisJS pour la gestion des actes de mariage multi-mairies.

## 🚀 Installation

### Prérequis

- Node.js >= 20
- PostgreSQL >= 14
- npm ou yarn

### Configuration

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
```

Puis modifier le fichier `.env` avec vos paramètres de base de données :
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=gestion_mariage
```

3. **Générer la clé d'application**
```bash
node ace generate:key
```
Copier la clé générée dans le fichier `.env` sous `APP_KEY`.

4. **Créer la base de données**
```sql
CREATE DATABASE gestion_mariage;
```

5. **Exécuter les migrations**
```bash
node ace migration:run
```

6. **Exécuter le seeder (données de test)**
```bash
node ace db:seed
```

### Démarrage

```bash
npm run dev
```

L'API sera accessible sur `http://localhost:3333`

---

## 📚 Documentation API

### Base URL
```
http://localhost:3333/api
```

### Authentification

Toutes les routes (sauf login et forgot-password) nécessitent un token d'authentification.

**Header requis :**
```
Authorization: Bearer <token>
```

---

## 🔐 Endpoints d'Authentification

### POST `/api/auth/login`
Connexion d'un utilisateur.

**Body :**
```json
{
  "email": "superadmin@mariage.cm",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "fullName": "Super Administrateur",
      "email": "superadmin@mariage.cm",
      "role": "super_admin",
      "mairie": null
    },
    "token": "oat_xxx..."
  }
}
```

### POST `/api/auth/logout`
Déconnexion (requiert authentification).

### GET `/api/auth/me`
Récupérer l'utilisateur connecté (requiert authentification).

### POST `/api/auth/change-password`
Changer le mot de passe.

**Body :**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword456"
}
```

### POST `/api/auth/forgot-password`
Demande de réinitialisation du mot de passe.

**Body :**
```json
{
  "email": "user@example.com"
}
```

---

## 📊 Dashboard

### GET `/api/dashboard`
Récupère les statistiques adaptées au rôle de l'utilisateur.

### GET `/api/dashboard/stats`
Statistiques par période.

**Query params :**
- `periode` : jour, semaine, mois, annee
- `annee` : année à filtrer

---

## 👥 Utilisateurs

### GET `/api/users`
Liste des utilisateurs.

**Query params :**
- `page` : numéro de page
- `limit` : nombre par page
- `search` : recherche par nom ou email
- `role` : filtrer par rôle
- `is_active` : true/false
- `mairie_id` : filtrer par mairie (super admin)

### POST `/api/users`
Créer un utilisateur.

### GET `/api/users/:id`
Détails d'un utilisateur.

### PUT `/api/users/:id`
Modifier un utilisateur.

### DELETE `/api/users/:id`
Supprimer un utilisateur.

### POST `/api/users/:id/toggle-status`
Activer/Désactiver un utilisateur.

---

## 🏙️ Villes

### GET `/api/villes`
Liste des villes.

### POST `/api/villes`
Créer une ville (Super Admin).

### GET `/api/villes/:id`
Détails d'une ville.

### PUT `/api/villes/:id`
Modifier une ville (Super Admin).

### DELETE `/api/villes/:id`
Supprimer une ville (Super Admin).

---

## 🏘️ Arrondissements

### GET `/api/arrondissements`
Liste des arrondissements.

**Query params :**
- `ville_id` : filtrer par ville

### POST `/api/arrondissements`
Créer un arrondissement (Super Admin).

### GET `/api/arrondissements/:id`
Détails d'un arrondissement.

### PUT `/api/arrondissements/:id`
Modifier un arrondissement (Super Admin).

### DELETE `/api/arrondissements/:id`
Supprimer un arrondissement (Super Admin).

---

## 🏛️ Mairies

### GET `/api/mairies`
Liste des mairies.

### POST `/api/mairies`
Créer une mairie (Super Admin).

### GET `/api/mairies/:id`
Détails d'une mairie.

### PUT `/api/mairies/:id`
Modifier une mairie (Super Admin ou Admin Mairie).

### DELETE `/api/mairies/:id`
Supprimer une mairie (Super Admin).

### GET `/api/mairies/:id/stats`
Statistiques d'une mairie.

---

## 💍 Mariages

### GET `/api/mariages`
Liste des mariages.

**Query params :**
- `page`, `limit`
- `search` : recherche par nom des époux
- `statut` : brouillon, valide, annule
- `date_debut`, `date_fin`
- `mairie_id` (super admin)

### POST `/api/mariages`
Créer un mariage.

**Body :**
```json
{
  "epouxNom": "Dupont",
  "epouxPrenom": "Jean",
  "epouxDateNaissance": "1990-05-15",
  "epouxLieuNaissance": "Douala",
  "epouseNom": "Martin",
  "epousePrenom": "Marie",
  "epouseDateNaissance": "1992-08-20",
  "epouseLieuNaissance": "Yaoundé",
  "dateMariage": "2025-06-15",
  "heureMariage": "10:00",
  "regimeMatrimonial": "communauté réduite aux acquêts"
}
```

### GET `/api/mariages/:id`
Détails d'un mariage.

### PUT `/api/mariages/:id`
Modifier un mariage.

### DELETE `/api/mariages/:id`
Supprimer un mariage (Admin uniquement).

### POST `/api/mariages/:id/validate`
Valider un mariage (Admin uniquement).

---

## 📄 Actes de Mariage

### GET `/api/actes`
Liste des actes.

### POST `/api/actes/generate`
Générer un acte de mariage.

**Body :**
```json
{
  "mariageId": 1
}
```

### GET `/api/actes/:id`
Détails d'un acte.

### POST `/api/actes/:id/validate`
Valider un acte (Admin uniquement).

### POST `/api/actes/:id/print`
Marquer comme imprimé.

### POST `/api/actes/:id/cancel`
Annuler un acte (Super Admin uniquement).

---

## 🔑 Comptes de Test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Super Admin | superadmin@mariage.cm | password123 |
| Admin Mairie Douala 1er | admin.dla1@mariage.cm | password123 |
| Agent Mairie Douala 1er | agent.dla1@mariage.cm | password123 |
| Consultation Douala 1er | consult.dla1@mariage.cm | password123 |
| Admin Mairie Yaoundé 1er | admin.yde1@mariage.cm | password123 |
| Agent Mairie Yaoundé 1er | agent.yde1@mariage.cm | password123 |

---

## 📁 Structure du Projet

```
backend/
├── app/
│   ├── controllers/       # Contrôleurs API
│   │   ├── auth_controller.ts
│   │   ├── dashboard_controller.ts
│   │   ├── users_controller.ts
│   │   ├── villes_controller.ts
│   │   ├── arrondissements_controller.ts
│   │   ├── mairies_controller.ts
│   │   ├── mariages_controller.ts
│   │   └── actes_mariage_controller.ts
│   ├── models/            # Modèles Lucid ORM
│   │   ├── user.ts
│   │   ├── ville.ts
│   │   ├── arrondissement.ts
│   │   ├── mairie.ts
│   │   ├── mariage.ts
│   │   ├── acte_mariage.ts
│   │   └── audit_log.ts
│   ├── middleware/        # Middlewares
│   │   ├── role_middleware.ts
│   │   └── active_user_middleware.ts
│   └── validators/        # Validateurs
│       ├── auth_validator.ts
│       ├── user_validator.ts
│       └── mariage_validator.ts
├── database/
│   ├── migrations/        # Migrations de base de données
│   └── seeders/           # Données de test
├── start/
│   └── routes.ts          # Définition des routes
└── config/                # Configuration
```

---

## 🔒 Rôles et Permissions

| Fonctionnalité | Super Admin | Admin Mairie | Agent | Consultation |
|----------------|:-----------:|:------------:|:-----:|:------------:|
| Dashboard global | ✅ | ❌ | ❌ | ❌ |
| Dashboard mairie | ✅ | ✅ | ✅ | ✅ |
| Gérer les mairies | ✅ | ❌ | ❌ | ❌ |
| Gérer les villes/arrond. | ✅ | ❌ | ❌ | ❌ |
| Gérer les utilisateurs globaux | ✅ | ❌ | ❌ | ❌ |
| Gérer les utilisateurs de sa mairie | ✅ | ✅ | ❌ | ❌ |
| Voir les mariages | ✅ | ✅ | ✅ | ✅ |
| Créer/Modifier des mariages | ✅ | ✅ | ✅ | ❌ |
| Valider des mariages | ✅ | ✅ | ❌ | ❌ |
| Générer des actes | ✅ | ✅ | ✅ | ❌ |
| Valider des actes | ✅ | ✅ | ❌ | ❌ |
| Annuler des actes | ✅ | ❌ | ❌ | ❌ |
